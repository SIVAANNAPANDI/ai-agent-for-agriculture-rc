import os
import json
import numpy as np
import tensorflow as tf

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score
)

import matplotlib.pyplot as plt


# ============================================================
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32

TEST_DIR = str(BASE_DIR / "data" / "processed" / "test")
MODEL_PATH = str(BASE_DIR / "models" / "best_leaf_disease_model.keras")
CLASS_NAMES_PATH = str(BASE_DIR / "models" / "class_names.json")
RESULTS_DIR = str(BASE_DIR / "models" / "evaluation")

SEED = 42

os.makedirs(RESULTS_DIR, exist_ok=True)


# ============================================================
# CHECK FILES
# ============================================================

if not os.path.exists(TEST_DIR):

    raise FileNotFoundError(
        f"Test dataset not found:\n{TEST_DIR}"
    )


if not os.path.exists(MODEL_PATH):

    raise FileNotFoundError(
        f"Trained model not found:\n{MODEL_PATH}\n\n"
        "Run train.py first."
    )


if not os.path.exists(CLASS_NAMES_PATH):

    raise FileNotFoundError(
        f"Class names file not found:\n"
        f"{CLASS_NAMES_PATH}"
    )


# ============================================================
# LOAD CLASS NAMES
# ============================================================

with open(
    CLASS_NAMES_PATH,
    "r",
    encoding="utf-8"
) as file:

    class_names = json.load(file)


NUM_CLASSES = len(
    class_names
)


# ============================================================
# LOAD TEST DATASET
# ============================================================

print("\nLoading test dataset...")

test_dataset = tf.keras.utils.image_dataset_from_directory(

    TEST_DIR,

    image_size=IMAGE_SIZE,

    batch_size=BATCH_SIZE,

    shuffle=False,

    label_mode="int",

    seed=SEED

)


# ============================================================
# LOAD MODEL
# ============================================================

print("\nLoading trained model...")

model = tf.keras.models.load_model(
    MODEL_PATH
)


# ============================================================
# BASIC MODEL EVALUATION
# ============================================================

print("\n" + "=" * 60)
print("MODEL EVALUATION")
print("=" * 60)


test_loss, test_accuracy = model.evaluate(

    test_dataset,

    verbose=1

)


print(
    f"\nTest Loss     : {test_loss:.4f}"
)

print(
    f"Test Accuracy : {test_accuracy * 100:.2f}%"
)


# ============================================================
# GET TRUE LABELS
# ============================================================

print("\nGenerating predictions...")

true_labels = []

predicted_labels = []


for images, labels in test_dataset:

    predictions = model.predict(
        images,
        verbose=0
    )

    predicted_classes = np.argmax(
        predictions,
        axis=1
    )

    true_labels.extend(
        labels.numpy()
    )

    predicted_labels.extend(
        predicted_classes
    )


true_labels = np.array(
    true_labels
)

predicted_labels = np.array(
    predicted_labels
)


# ============================================================
# ACCURACY CHECK
# ============================================================

accuracy = accuracy_score(

    true_labels,

    predicted_labels

)


print(
    f"\nCalculated Accuracy: "
    f"{accuracy * 100:.2f}%"
)


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print("\n")
print("=" * 60)
print("CLASSIFICATION REPORT")
print("=" * 60)


report = classification_report(

    true_labels,

    predicted_labels,

    target_names=class_names,

    digits=4,

    zero_division=0

)


print(
    report
)


# ============================================================
# SAVE CLASSIFICATION REPORT
# ============================================================

report_path = os.path.join(

    RESULTS_DIR,

    "classification_report.txt"

)


with open(

    report_path,

    "w",

    encoding="utf-8"

) as file:

    file.write(
        "LEAF DISEASE MODEL EVALUATION\n"
    )

    file.write(
        "=" * 60 + "\n\n"
    )

    file.write(
        f"Test Loss: {test_loss:.4f}\n"
    )

    file.write(
        f"Test Accuracy: "
        f"{test_accuracy * 100:.2f}%\n\n"
    )

    file.write(
        report
    )


# ============================================================
# CONFUSION MATRIX
# ============================================================

print("\nGenerating confusion matrix...")


cm = confusion_matrix(

    true_labels,

    predicted_labels

)


# ============================================================
# PLOT CONFUSION MATRIX
# ============================================================

plt.figure(

    figsize=(
        16,
        14
    )

)


plt.imshow(
    cm
)


plt.title(
    "Leaf Disease Classification - Confusion Matrix"
)


plt.colorbar()


plt.xticks(

    range(NUM_CLASSES),

    class_names,

    rotation=90

)


plt.yticks(

    range(NUM_CLASSES),

    class_names

)


plt.xlabel(
    "Predicted Class"
)


plt.ylabel(
    "True Class"
)


# Add numbers inside cells

for i in range(NUM_CLASSES):

    for j in range(NUM_CLASSES):

        plt.text(

            j,

            i,

            cm[i, j],

            ha="center",

            va="center"

        )


plt.tight_layout()


confusion_matrix_path = os.path.join(

    RESULTS_DIR,

    "confusion_matrix.png"

)


plt.savefig(

    confusion_matrix_path,

    dpi=200,

    bbox_inches="tight"

)


plt.close()


# ============================================================
# PER-CLASS ACCURACY
# ============================================================

print("\n")
print("=" * 60)
print("PER-CLASS ACCURACY")
print("=" * 60)


for index, class_name in enumerate(
    class_names
):

    class_total = np.sum(
        true_labels == index
    )

    class_correct = np.sum(

        (true_labels == index)
        &
        (predicted_labels == index)

    )


    if class_total > 0:

        class_accuracy = (
            class_correct /
            class_total
        )

    else:

        class_accuracy = 0


    print(

        f"{class_name:<55} "
        f"{class_accuracy * 100:6.2f}%"

    )


# ============================================================
# FINAL OUTPUT
# ============================================================

print("\n")
print("=" * 60)
print("EVALUATION COMPLETED")
print("=" * 60)

print(
    f"\nClassification report:"
    f"\n{report_path}"
)

print(
    f"\nConfusion matrix:"
    f"\n{confusion_matrix_path}"
)

print("\nYour model is ready for inference.")