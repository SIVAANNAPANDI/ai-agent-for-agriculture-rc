import os
import shutil
import random


# ============================================================
# CONFIGURATION
# ============================================================

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
SOURCE_DIR = str(BASE_DIR / "PlantVillage")
OUTPUT_DIR = str(BASE_DIR / "data" / "processed")

TRAIN_RATIO = 0.80
VALIDATION_RATIO = 0.10
TEST_RATIO = 0.10

RANDOM_SEED = 42

IMAGE_EXTENSIONS = (
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp"
)


# ============================================================
# CHECK RATIOS
# ============================================================

if TRAIN_RATIO + VALIDATION_RATIO + TEST_RATIO != 1.0:
    raise ValueError(
        "Train + Validation + Test ratios must equal 1.0"
    )


# ============================================================
# RANDOM SEED
# ============================================================

random.seed(RANDOM_SEED)


# ============================================================
# CREATE OUTPUT DIRECTORIES
# ============================================================

for split in ["train", "validation", "test"]:

    os.makedirs(
        os.path.join(OUTPUT_DIR, split),
        exist_ok=True
    )


# ============================================================
# CHECK SOURCE DATASET
# ============================================================

if not os.path.exists(SOURCE_DIR):

    raise FileNotFoundError(
        f"Dataset folder not found: {SOURCE_DIR}"
    )


# ============================================================
# GET CLASS FOLDERS (Filter out any folder without images)
# ============================================================

classes = sorted([
    folder
    for folder in os.listdir(SOURCE_DIR)
    if os.path.isdir(os.path.join(SOURCE_DIR, folder))
    and any(f.lower().endswith(IMAGE_EXTENSIONS) for f in os.listdir(os.path.join(SOURCE_DIR, folder)))
])


print("=" * 60)
print("PLANT DISEASE DATASET SPLITTER")
print("=" * 60)

print(f"\nDataset location : {SOURCE_DIR}")
print(f"Number of classes: {len(classes)}")

print("\nClasses found:")

for index, class_name in enumerate(classes, start=1):

    print(f"{index:2}. {class_name}")


# ============================================================
# SPLIT EACH CLASS
# ============================================================

total_images = 0
total_train = 0
total_validation = 0
total_test = 0


for class_name in classes:

    source_class_dir = os.path.join(
        SOURCE_DIR,
        class_name
    )

    # --------------------------------------------------------
    # GET IMAGES
    # --------------------------------------------------------

    images = [
        filename
        for filename in os.listdir(source_class_dir)
        if filename.lower().endswith(IMAGE_EXTENSIONS)
    ]

    # --------------------------------------------------------
    # SHUFFLE
    # --------------------------------------------------------

    random.shuffle(images)

    total = len(images)

    # --------------------------------------------------------
    # CALCULATE SPLIT
    # --------------------------------------------------------

    train_count = int(
        total * TRAIN_RATIO
    )

    validation_count = int(
        total * VALIDATION_RATIO
    )

    train_images = images[
        :train_count
    ]

    validation_images = images[
        train_count:
        train_count + validation_count
    ]

    test_images = images[
        train_count + validation_count:
    ]

    # --------------------------------------------------------
    # CREATE CLASS DIRECTORIES
    # --------------------------------------------------------

    train_dir = os.path.join(
        OUTPUT_DIR,
        "train",
        class_name
    )

    validation_dir = os.path.join(
        OUTPUT_DIR,
        "validation",
        class_name
    )

    test_dir = os.path.join(
        OUTPUT_DIR,
        "test",
        class_name
    )

    os.makedirs(
        train_dir,
        exist_ok=True
    )

    os.makedirs(
        validation_dir,
        exist_ok=True
    )

    os.makedirs(
        test_dir,
        exist_ok=True
    )

    # --------------------------------------------------------
    # COPY TRAIN IMAGES
    # --------------------------------------------------------

    for image in train_images:

        source = os.path.join(
            source_class_dir,
            image
        )

        destination = os.path.join(
            train_dir,
            image
        )

        shutil.copy2(
            source,
            destination
        )

    # --------------------------------------------------------
    # COPY VALIDATION IMAGES
    # --------------------------------------------------------

    for image in validation_images:

        source = os.path.join(
            source_class_dir,
            image
        )

        destination = os.path.join(
            validation_dir,
            image
        )

        shutil.copy2(
            source,
            destination
        )

    # --------------------------------------------------------
    # COPY TEST IMAGES
    # --------------------------------------------------------

    for image in test_images:

        source = os.path.join(
            source_class_dir,
            image
        )

        destination = os.path.join(
            test_dir,
            image
        )

        shutil.copy2(
            source,
            destination
        )

    # --------------------------------------------------------
    # UPDATE TOTALS
    # --------------------------------------------------------

    total_images += total
    total_train += len(train_images)
    total_validation += len(validation_images)
    total_test += len(test_images)

    # --------------------------------------------------------
    # PRINT RESULT
    # --------------------------------------------------------

    print(
        f"\n{class_name}"
    )

    print(
        f"  Total      : {total}"
    )

    print(
        f"  Train      : {len(train_images)}"
    )

    print(
        f"  Validation : {len(validation_images)}"
    )

    print(
        f"  Test       : {len(test_images)}"
    )


# ============================================================
# FINAL SUMMARY
# ============================================================

print("\n")
print("=" * 60)
print("SPLIT COMPLETED")
print("=" * 60)

print(
    f"\nTotal images      : {total_images}"
)

print(
    f"Training images   : {total_train}"
)

print(
    f"Validation images : {total_validation}"
)

print(
    f"Test images       : {total_test}"
)

print("\nOutput:")

print(
    "data/processed/train/"
)

print(
    "data/processed/validation/"
)

print(
    "data/processed/test/"
)

print("\nDone! 🚀")