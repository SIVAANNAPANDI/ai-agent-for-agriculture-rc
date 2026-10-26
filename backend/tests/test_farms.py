import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

FARMER_A_EMAIL = "farmer_a@agriassist.com"
FARMER_A_PHONE = "9876511111"
FARMER_B_EMAIL = "farmer_b@agriassist.com"
FARMER_B_PHONE = "9876522222"
PASSWORD = "Password@123"


def get_token(email: str, phone: str, name: str) -> str:
    # Try signup first
    signup_res = client.post("/api/auth/signup", json={
        "name": name,
        "email": email,
        "phone": phone,
        "password": PASSWORD,
        "confirm_password": PASSWORD,
        "location": "Thanjavur, Tamil Nadu",
        "preferred_language": "ta"
    })
    if signup_res.status_code == 201:
        return signup_res.json()["access_token"]
    
    # Otherwise login
    login_res = client.post("/api/auth/login", json={
        "email_or_username": email,
        "password": PASSWORD
    })
    return login_res.json()["access_token"]


def test_farm_lifecycle_and_ownership():
    token_a = get_token(FARMER_A_EMAIL, FARMER_A_PHONE, "Farmer A")
    token_b = get_token(FARMER_B_EMAIL, FARMER_B_PHONE, "Farmer B")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 1. Farmer A creates a farm
    farm_payload = {
        "name": "Cauvery Delta Green Field",
        "land_area": 3.5,
        "area_unit": "acres",
        "location_name": "Thanjavur, Tamil Nadu",
        "latitude": 10.7870,
        "longitude": 79.1378,
        "water_source": "Canal",
        "irrigation_method": "Flood",
        "soil": {
            "soil_type": "Clay",
            "ph": 6.8,
            "organic_matter_pct": 1.4,
            "nitrogen_n": 240.0,
            "phosphorus_p": 18.5,
            "potassium_k": 210.0,
            "ec": 0.45
        }
    }
    create_res = client.post("/api/farms", json=farm_payload, headers=headers_a)
    assert create_res.status_code == 201
    farm_data = create_res.json()
    farm_id = farm_data["id"]
    assert farm_data["name"] == "Cauvery Delta Green Field"
    assert farm_data["land_area"] == 3.5
    assert farm_data["latitude"] == 10.7870
    assert farm_data["soil"] is not None
    assert farm_data["soil"]["soil_type"] == "Clay"
    assert farm_data["soil"]["ph"] == 6.8

    # 2. Farmer A lists farms
    list_res = client.get("/api/farms", headers=headers_a)
    assert list_res.status_code == 200
    farms_list = list_res.json()
    assert any(f["id"] == farm_id for f in farms_list)

    # 3. Farmer A gets specific farm
    get_res = client.get(f"/api/farms/{farm_id}", headers=headers_a)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == farm_id

    # 4. Strict Ownership Check: Farmer B tries to view Farmer A's farm -> 403 Forbidden
    forbidden_get = client.get(f"/api/farms/{farm_id}", headers=headers_b)
    assert forbidden_get.status_code == 403
    assert forbidden_get.json()["error"]["code"] == "FORBIDDEN"

    # 5. Strict Ownership Check: Farmer B tries to update Farmer A's farm -> 403 Forbidden
    forbidden_put = client.put(f"/api/farms/{farm_id}", json={"name": "Hacked Farm"}, headers=headers_b)
    assert forbidden_put.status_code == 403

    # 6. Strict Ownership Check: Farmer B tries to update soil on Farmer A's farm -> 403 Forbidden
    forbidden_soil = client.put(f"/api/farms/{farm_id}/soil", json={"ph": 5.0}, headers=headers_b)
    assert forbidden_soil.status_code == 403

    # 7. Strict Ownership Check: Farmer B tries to delete Farmer A's farm -> 403 Forbidden
    forbidden_del = client.delete(f"/api/farms/{farm_id}", headers=headers_b)
    assert forbidden_del.status_code == 403

    # 8. Farmer A updates their own farm
    update_res = client.put(
        f"/api/farms/{farm_id}",
        json={"name": "Cauvery Delta Organic Field", "irrigation_method": "Drip"},
        headers=headers_a
    )
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Cauvery Delta Organic Field"
    assert update_res.json()["irrigation_method"] == "Drip"

    # 9. Farmer A updates soil parameters
    soil_res = client.put(
        f"/api/farms/{farm_id}/soil",
        json={"soil_type": "Loamy", "ph": 7.1, "nitrogen_n": 260.0},
        headers=headers_a
    )
    assert soil_res.status_code == 200
    assert soil_res.json()["soil_type"] == "Loamy"
    assert soil_res.json()["ph"] == 7.1
    assert soil_res.json()["nitrogen_n"] == 260.0

    # 10. Farmer A deletes their farm
    del_res = client.delete(f"/api/farms/{farm_id}", headers=headers_a)
    assert del_res.status_code == 204

    # 11. Farm should now be 404
    not_found_res = client.get(f"/api/farms/{farm_id}", headers=headers_a)
    assert not_found_res.status_code == 404
