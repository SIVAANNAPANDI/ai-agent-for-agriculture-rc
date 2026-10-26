import pytest
from sqlalchemy import text
from app.database.session import engine, SessionLocal
from app.models import (
    Base,
    User,
    FarmerProfile,
    UserSettings,
    Farm,
    FarmSoil,
    Crop,
    CropRequirement,
)


def test_database_connection():
    """Verify live connectivity to MySQL 8.0 on port 3307."""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1")).scalar()
        assert result == 1


def test_tables_created():
    """Verify all 20 required tables are present in the database."""
    with engine.connect() as conn:
        result = conn.execute(text("SHOW TABLES;"))
        tables = [row[0] for row in result.fetchall()]

    expected_tables = [
        "users",
        "farmer_profiles",
        "user_settings",
        "farms",
        "farm_soils",
        "crops",
        "crop_requirements",
        "cultivation_cycles",
        "cultivation_tasks",
        "weather_records",
        "crop_recommendations",
        "ai_conversations",
        "ai_messages",
        "disease_predictions",
        "market_products",
        "product_images",
        "product_locations",
        "labours",
        "rental_properties",
        "notifications",
        "alembic_version",
    ]

    for table in expected_tables:
        assert table in tables, f"Expected table '{table}' missing from database"


def test_master_crops_seeded():
    """Verify master crops and requirements were seeded accurately."""
    db = SessionLocal()
    try:
        crops = db.query(Crop).all()
        assert len(crops) >= 7
        tomato = db.query(Crop).filter(Crop.name == "Tomato").first()
        assert tomato is not None
        assert "தக்காளி" in tomato.tamil_name
        assert tomato.requirement is not None
        assert "loamy" in tomato.requirement.suitable_soil_types
    finally:
        db.close()
