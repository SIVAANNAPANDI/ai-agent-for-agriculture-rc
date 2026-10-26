import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

FARMER_REC_A = "rec_farmer_a@agriassist.com"
FARMER_REC_B = "rec_farmer_b@agriassist.com"
PASSWORD = "Password@123"


def get_token(email: str, phone: str, name: str) -> str:
    signup_res = client.post("/api/auth/signup", json={
        "name": name,
        "email": email,
        "phone": phone,
        "password": PASSWORD,
        "confirm_password": PASSWORD,
        "location": "Salem, Tamil Nadu",
        "preferred_language": "ta"
    })
    if signup_res.status_code == 201:
        return signup_res.json()["access_token"]
    login_res = client.post("/api/auth/login", json={
        "email_or_username": email,
        "password": PASSWORD
    })
    return login_res.json()["access_token"]


def test_crop_recommendation_and_reasoning():
    token_a = get_token(FARMER_REC_A, "9876588801", "Rec Farmer A")
    token_b = get_token(FARMER_REC_B, "9876588802", "Rec Farmer B")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 1. Farmer A creates Loamy Soil Farm with Drip Irrigation
    farm_res = client.post("/api/farms", json={
        "name": "Loamy Fertile Acreage",
        "land_area": 2.5,
        "area_unit": "acres",
        "location_name": "Salem, Tamil Nadu",
        "latitude": 11.6643,
        "longitude": 78.1460,
        "water_source": "Borewell",
        "irrigation_method": "Drip",
        "soil": {
            "soil_type": "Loamy",
            "ph": 6.8,
            "nitrogen_n": 290.0,
            "phosphorus_p": 19.0,
            "potassium_k": 220.0
        }
    }, headers=headers_a)
    assert farm_res.status_code == 201
    farm_id = farm_res.json()["id"]

    # 2. Get recommendations
    rec_res = client.get(f"/api/recommendations/farm/{farm_id}", headers=headers_a)
    assert rec_res.status_code == 200
    data = rec_res.json()

    assert data["farm_id"] == farm_id
    assert len(data["recommendations"]) >= 5

    # Check top recommendation has high score
    top_crop = data["recommendations"][0]
    assert top_crop["suitability_score"] >= 80

    # Verify all 4 Pillars of Explainable Agronomic Reasoning exist
    for item in data["recommendations"]:
        assert item["what_summary"] is not None and len(item["what_summary"]) > 5
        assert item["why_reason"] is not None and len(item["why_reason"]) > 5
        assert item["when_window"] is not None and len(item["when_window"]) > 5
        assert item["next_steps"] is not None and len(item["next_steps"]) > 5
        assert isinstance(item["soil_compatible"], bool)
        assert isinstance(item["ph_compatible"], bool)
        assert isinstance(item["water_compatible"], bool)

    # 3. Ownership Isolation: Farmer B tries to access Farmer A's recommendations -> 403 Forbidden
    forbidden = client.get(f"/api/recommendations/farm/{farm_id}", headers=headers_b)
    assert forbidden.status_code == 403


def test_clay_soil_paddy_preference():
    token_a = get_token(FARMER_REC_A, "9876588801", "Rec Farmer A")
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Clay soil farm with Canal flood irrigation (Classic delta rice ecosystem)
    farm_res = client.post("/api/farms", json={
        "name": "Delta Clay Wetland",
        "land_area": 5.0,
        "area_unit": "acres",
        "location_name": "Nagapattinam, Tamil Nadu",
        "latitude": 10.7672,
        "longitude": 79.8424,
        "water_source": "Canal",
        "irrigation_method": "Flood",
        "soil": {
            "soil_type": "Clay",
            "ph": 6.5
        }
    }, headers=headers_a)
    assert farm_res.status_code == 201
    farm_id = farm_res.json()["id"]

    rec_res = client.get(f"/api/recommendations/farm/{farm_id}", headers=headers_a)
    assert rec_res.status_code == 200
    data = rec_res.json()

    # Find Paddy / Rice
    paddy = next((c for c in data["recommendations"] if "paddy" in c["crop_name"].lower()), None)
    assert paddy is not None
    assert paddy["suitability_score"] >= 85
    assert paddy["soil_compatible"] is True
    assert paddy["water_compatible"] is True
