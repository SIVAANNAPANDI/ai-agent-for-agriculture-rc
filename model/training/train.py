import os
import json
import shutil
from pathlib import Path
import tensorflow as tf

from tensorflow.keras import layers, models
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.callbacks import (
    EarlyStopping,
    ModelCheckpoint,
    ReduceLROnPlateau
)

# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent
WORKSPACE_DIR = BASE_DIR.parent

IMAGE_SIZE = (224, 224)
BATCH_SIZE = int(os.environ.get("BATCH_SIZE", 32))
EPOCHS_PHASE1 = int(os.environ.get("EPOCHS_PHASE1", 4))
EPOCHS_PHASE2 = int(os.environ.get("EPOCHS_PHASE2", 2))
STEPS_PER_EPOCH = int(os.environ.get("STEPS_PER_EPOCH", 0))
VAL_STEPS = int(os.environ.get("VAL_STEPS", 0))

TRAIN_DIR = str(BASE_DIR / "data" / "processed" / "train")
VALIDATION_DIR = str(BASE_DIR / "data" / "processed" / "validation")
MODEL_DIR = str(BASE_DIR / "models")
APP_ML_DIR = str(WORKSPACE_DIR / "ml" / "models")

BEST_MODEL_PATH = os.path.join(MODEL_DIR, "best_leaf_disease_model.keras")
FINAL_MODEL_PATH = os.path.join(MODEL_DIR, "leaf_disease_model.keras")
CLASS_NAMES_PATH = os.path.join(MODEL_DIR, "class_names.json")

SEED = 42

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(APP_ML_DIR, exist_ok=True)

# ============================================================
# CHECK DATASET
# ============================================================

if not os.path.exists(TRAIN_DIR):
    raise FileNotFoundError(f"Training dataset not found: {TRAIN_DIR}")

if not os.path.exists(VALIDATION_DIR):
    raise FileNotFoundError(f"Validation dataset not found: {VALIDATION_DIR}")

# ============================================================
# LOAD DATASETS
# ============================================================

print("\n" + "=" * 60)
print("AGRIASSIST PLANT DISEASE DEEP LEARNING MODEL TRAINING")
print("=" * 60)
print(f"Loading training dataset from: {TRAIN_DIR}")

train_dataset = tf.keras.utils.image_dataset_from_directory(
    TRAIN_DIR,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True,
    seed=SEED,
    label_mode="int"
)

print(f"Loading validation dataset from: {VALIDATION_DIR}")

validation_dataset = tf.keras.utils.image_dataset_from_directory(
    VALIDATION_DIR,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False,
    seed=SEED,
    label_mode="int"
)

# Filter out any non-class directory
class_names = [c for c in train_dataset.class_names if c != "PlantVillage"]
NUM_CLASSES = len(class_names)

print(f"\nNumber of valid plant disease classes: {NUM_CLASSES}")
for idx, name in enumerate(class_names, 1):
    print(f"  {idx:2d}. {name}")

# Save class names JSON to both model/models and ml/models
with open(CLASS_NAMES_PATH, "w", encoding="utf-8") as f:
    json.dump(class_names, f, indent=4, ensure_ascii=False)

app_class_names_path = os.path.join(APP_ML_DIR, "class_names.json")
with open(app_class_names_path, "w", encoding="utf-8") as f:
    json.dump(class_names, f, indent=4, ensure_ascii=False)

print(f"\nClass names saved to:\n  - {CLASS_NAMES_PATH}\n  - {app_class_names_path}")

# ============================================================
# DATA PIPELINE OPTIMIZATION
# ============================================================

AUTOTUNE = tf.data.AUTOTUNE
train_dataset = train_dataset.prefetch(AUTOTUNE)
validation_dataset = validation_dataset.prefetch(AUTOTUNE)

# ============================================================
# DATA AUGMENTATION & MODEL ARCHITECTURE
# ============================================================

data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.15),
    layers.RandomZoom(0.15),
    layers.RandomContrast(0.10),
], name="data_augmentation")

print("\nInitializing EfficientNetB0 backbone (pre-trained on ImageNet)...")
base_model = EfficientNetB0(
    include_top=False,
    weights="imagenet",
    input_shape=(IMAGE_SIZE[0], IMAGE_SIZE[1], 3)
)

# Phase 1: Freeze base model
base_model.trainable = False

inputs = layers.Input(shape=(IMAGE_SIZE[0], IMAGE_SIZE[1], 3), name="leaf_image")
x = data_augmentation(inputs)
x = base_model(x, training=False)
x = layers.GlobalAveragePooling2D(name="avg_pool")(x)
x = layers.BatchNormalization()(x)
x = layers.Dropout(0.35, name="top_dropout")(x)
outputs = layers.Dense(NUM_CLASSES, activation="softmax", name="disease_prediction")(x)

model = models.Model(inputs=inputs, outputs=outputs, name="AgriAssist_EfficientNetB0_PlantVillage")

# ============================================================
# PHASE 1: FEATURE EXTRACTION TRAINING
# ============================================================

print("\n" + "=" * 60)
print("PHASE 1 - TRAINING CLASSIFICATION HEAD")
print("=" * 60)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

phase1_callbacks = [
    ModelCheckpoint(
        BEST_MODEL_PATH,
        monitor="val_accuracy",
        mode="max",
        save_best_only=True,
        verbose=1
    ),
    EarlyStopping(
        monitor="val_loss",
        patience=3,
        restore_best_weights=True,
        verbose=1
    ),
    ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.2,
        patience=2,
        min_lr=1e-6,
        verbose=1
    )
]

history_phase1 = model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=EPOCHS_PHASE1,
    steps_per_epoch=STEPS_PER_EPOCH if STEPS_PER_EPOCH > 0 else None,
    validation_steps=VAL_STEPS if VAL_STEPS > 0 else None,
    callbacks=phase1_callbacks
)

# ============================================================
# PHASE 2: SELECTIVE FINE-TUNING
# ============================================================

print("\n" + "=" * 60)
print("PHASE 2 - FINE-TUNING TOP CONVOLUTIONAL LAYERS")
print("=" * 60)

if EPOCHS_PHASE2 > 0:
    base_model.trainable = True
    # Freeze early layers, keep last 25 layers trainable
    for layer in base_model.layers[:-25]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    phase2_callbacks = [
        ModelCheckpoint(
            BEST_MODEL_PATH,
            monitor="val_accuracy",
            mode="max",
            save_best_only=True,
            verbose=1
        ),
        EarlyStopping(
            monitor="val_loss",
            patience=2,
            restore_best_weights=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.2,
            patience=1,
            min_lr=1e-7,
            verbose=1
        )
    ]

    history_phase2 = model.fit(
        train_dataset,
        validation_data=validation_dataset,
        epochs=EPOCHS_PHASE2,
        steps_per_epoch=STEPS_PER_EPOCH if STEPS_PER_EPOCH > 0 else None,
        validation_steps=VAL_STEPS if VAL_STEPS > 0 else None,
        callbacks=phase2_callbacks
    )
else:
    print("Phase 2 fine-tuning skipped (EPOCHS_PHASE2=0).")

# ============================================================
# SAVE BEST MODEL & EXPORT TO WEB APP
# ============================================================

print("\n" + "=" * 60)
print("EXPORTING TRAINED MODEL TO WEB APP")
print("=" * 60)

if os.path.exists(BEST_MODEL_PATH):
    best_model = tf.keras.models.load_model(BEST_MODEL_PATH)
else:
    best_model = model
    best_model.save(BEST_MODEL_PATH)

best_model.save(FINAL_MODEL_PATH)

# Copy trained model to web app backend ml directory
app_model_path = os.path.join(APP_ML_DIR, "best_leaf_disease_model.keras")
shutil.copy2(BEST_MODEL_PATH, app_model_path)

print(f"\n[OK] Model successfully trained and exported:")
print(f"  - Model directory best:  {BEST_MODEL_PATH}")
print(f"  - Model directory final: {FINAL_MODEL_PATH}")
print(f"  - App Dashboard model:   {app_model_path}")
print(f"\nReady for live inference on the web dashboard!")