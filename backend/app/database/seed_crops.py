import sys
import os

# Append backend root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.database.session import SessionLocal
from app.models.crop import Crop, CropRequirement


MASTER_CROPS = [
    {
        "name": "Tomato",
        "tamil_name": "தக்காளி (Thakkali)",
        "scientific_name": "Solanum lycopersicum",
        "category": "vegetable",
        "typical_duration_days": 90,
        "water_requirement_level": "moderate",
        "icon_url": "🍅",
        "requirement": {
            "suitable_soil_types": ["loamy", "red", "sandy", "black"],
            "min_ph": 6.0,
            "max_ph": 7.5,
            "min_temp_c": 18.0,
            "max_temp_c": 32.0,
            "ideal_season": "Year-round",
            "estimated_input_cost_per_acre": 35000.00,
            "risk_level": "medium",
            "yield_potential_per_acre": "18 - 25 Tons",
        },
    },
    {
        "name": "Potato",
        "tamil_name": "உருளைக்கிழங்கு (Urulaikilangu)",
        "scientific_name": "Solanum tuberosum",
        "category": "vegetable",
        "typical_duration_days": 100,
        "water_requirement_level": "moderate",
        "icon_url": "🥔",
        "requirement": {
            "suitable_soil_types": ["loamy", "sandy", "silty"],
            "min_ph": 5.2,
            "max_ph": 6.8,
            "min_temp_c": 15.0,
            "max_temp_c": 25.0,
            "ideal_season": "Rabi",
            "estimated_input_cost_per_acre": 40000.00,
            "risk_level": "medium",
            "yield_potential_per_acre": "12 - 16 Tons",
        },
    },
    {
        "name": "Pepper Bell",
        "tamil_name": "குடைமிளகாய் (Kudai Milagai)",
        "scientific_name": "Capsicum annuum",
        "category": "vegetable",
        "typical_duration_days": 110,
        "water_requirement_level": "moderate",
        "icon_url": "🫑",
        "requirement": {
            "suitable_soil_types": ["loamy", "red", "black"],
            "min_ph": 6.0,
            "max_ph": 7.0,
            "min_temp_c": 20.0,
            "max_temp_c": 30.0,
            "ideal_season": "Year-round",
            "estimated_input_cost_per_acre": 45000.00,
            "risk_level": "medium",
            "yield_potential_per_acre": "8 - 12 Tons",
        },
    },
    {
        "name": "Paddy / Rice",
        "tamil_name": "நெல் (Nel)",
        "scientific_name": "Oryza sativa",
        "category": "cereal",
        "typical_duration_days": 125,
        "water_requirement_level": "high",
        "icon_url": "🌾",
        "requirement": {
            "suitable_soil_types": ["clay", "loamy", "silty"],
            "min_ph": 5.5,
            "max_ph": 7.2,
            "min_temp_c": 22.0,
            "max_temp_c": 35.0,
            "ideal_season": "Kharif / Samba",
            "estimated_input_cost_per_acre": 28000.00,
            "risk_level": "low",
            "yield_potential_per_acre": "2.5 - 3.2 Tons",
        },
    },
    {
        "name": "Turmeric",
        "tamil_name": "மஞ்சள் (Manjal)",
        "scientific_name": "Curcuma longa",
        "category": "spice",
        "typical_duration_days": 270,
        "water_requirement_level": "moderate",
        "icon_url": "🌱",
        "requirement": {
            "suitable_soil_types": ["loamy", "red", "clay"],
            "min_ph": 6.0,
            "max_ph": 7.5,
            "min_temp_c": 20.0,
            "max_temp_c": 35.0,
            "ideal_season": "Kharif",
            "estimated_input_cost_per_acre": 60000.00,
            "risk_level": "low",
            "yield_potential_per_acre": "8 - 10 Tons (Fresh)",
        },
    },
    {
        "name": "Cotton",
        "tamil_name": "பருத்தி (Paruthi)",
        "scientific_name": "Gossypium hirsutum",
        "category": "cash_crop",
        "typical_duration_days": 160,
        "water_requirement_level": "moderate",
        "icon_url": "☁️",
        "requirement": {
            "suitable_soil_types": ["black", "loamy", "alluvial"],
            "min_ph": 6.5,
            "max_ph": 8.0,
            "min_temp_c": 21.0,
            "max_temp_c": 35.0,
            "ideal_season": "Kharif",
            "estimated_input_cost_per_acre": 32000.00,
            "risk_level": "medium",
            "yield_potential_per_acre": "1.2 - 1.8 Tons",
        },
    },
    {
        "name": "Maize",
        "tamil_name": "மக்காச்சோளம் (Makkacholam)",
        "scientific_name": "Zea mays",
        "category": "cereal",
        "typical_duration_days": 105,
        "water_requirement_level": "moderate",
        "icon_url": "🌽",
        "requirement": {
            "suitable_soil_types": ["loamy", "red", "sandy"],
            "min_ph": 5.8,
            "max_ph": 7.5,
            "min_temp_c": 18.0,
            "max_temp_c": 34.0,
            "ideal_season": "Kharif / Rabi",
            "estimated_input_cost_per_acre": 22000.00,
            "risk_level": "low",
            "yield_potential_per_acre": "3.0 - 4.5 Tons",
        },
    },
]


def seed_crops():
    db = SessionLocal()
    try:
        count = 0
        for item in MASTER_CROPS:
            req_data = item.pop("requirement")
            existing = db.query(Crop).filter(Crop.name == item["name"]).first()
            if not existing:
                crop = Crop(**item)
                db.add(crop)
                db.flush()
                req = CropRequirement(crop_id=crop.id, **req_data)
                db.add(req)
                count += 1
        db.commit()
        print(f"Master crops seeding complete. Added {count} new crops.")
    except Exception as e:
        db.rollback()
        print("Error seeding crops:", e)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_crops()
