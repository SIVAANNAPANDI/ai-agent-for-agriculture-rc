import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

FARMER_LAB_A = "lab_farmer_a@agriassist.com"
FARMER_LAB_B = "lab_farmer_b@agriassist.com"
PASSWORD = "Password@123"


def get_token(email: str, phone: str, name: str) -> str:
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
    login_res = client.post("/api/auth/login", json={
        "email_or_username": email,
        "password": PASSWORD
    })
    if login_res.status_code == 200:
        return login_res.json()["access_token"]
    raise RuntimeError(f"Auth failed: {signup_res.text} | {login_res.text}")


def test_labour_create_and_browse():
    token_a = get_token(FARMER_LAB_A, "9876544401", "Labour Farmer A")
    token_b = get_token(FARMER_LAB_B, "9876544402", "Labour Farmer B")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 1. Farmer A creates worker profile
    payload_a = {
        "worker_name": "Murugan & Team (5 Members)",
        "phone": "9876544401",
        "skills": ["Harvesting", "Spraying", "Weeding"],
        "experience_years": 8,
        "daily_wage": 700.0,
        "location_name": "Kumbakonam, Thanjavur",
        "latitude": 10.9602,
        "longitude": 79.3845,
        "description": "Experienced paddy transplanting and harvesting crew with own sickle tools."
    }
    res_a = client.post("/api/labours", json=payload_a, headers=headers_a)
    assert res_a.status_code == 201
    lab_a = res_a.json()
    assert lab_a["worker_name"] == payload_a["worker_name"]
    assert lab_a["daily_wage"] == 700.0
    assert lab_a["availability_status"] == "AVAILABLE"
    assert lab_a["is_owner"] is True
    lab_a_id = lab_a["id"]

    # 2. Farmer B creates a tractor operator profile
    payload_b = {
        "worker_name": "Selvam Tractor Works",
        "phone": "9876544402",
        "skills": ["Ploughing", "Machinery"],
        "experience_years": 12,
        "daily_wage": 1200.0,
        "location_name": "Papanasam, Thanjavur",
        "latitude": 10.9254,
        "longitude": 79.2741,
        "description": "45HP tractor operator with rotavator and disc plough attachment."
    }
    res_b = client.post("/api/labours", json=payload_b, headers=headers_b)
    assert res_b.status_code == 201

    # 3. Farmer B browses labour market
    browse_res = client.get("/api/labours", headers=headers_b)
    assert browse_res.status_code == 200
    labours = browse_res.json()
    lab_ids = [l["id"] for l in labours]
    assert lab_a_id in lab_ids

    # For Farmer B, is_owner is False on Farmer A's worker
    worker_from_b = next(l for l in labours if l["id"] == lab_a_id)
    assert worker_from_b["is_owner"] is False

    # 4. Filter by skill: Harvesting
    skill_res = client.get("/api/labours?skill=Harvesting", headers=headers_b)
    assert skill_res.status_code == 200
    skill_results = skill_res.json()
    assert any("Murugan" in l["worker_name"] for l in skill_results)
    assert not any("Selvam" in l["worker_name"] for l in skill_results)


def test_labour_availability_and_ownership():
    token_a = get_token(FARMER_LAB_A, "9876544401", "Labour Farmer A")
    token_b = get_token(FARMER_LAB_B, "9876544402", "Labour Farmer B")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 1. Farmer A creates worker listing
    res_create = client.post("/api/labours", json={
        "worker_name": "Ramu Irrigation Specialist",
        "phone": "9876544401",
        "skills": ["Irrigation", "Planting"],
        "experience_years": 5,
        "daily_wage": 600.0,
        "location_name": "Thanjavur"
    }, headers=headers_a)
    assert res_create.status_code == 201
    lab_id = res_create.json()["id"]

    # 2. Farmer B tries to edit -> 403 Forbidden
    edit_res = client.put(f"/api/labours/{lab_id}", json={
        "daily_wage": 200.0
    }, headers=headers_b)
    assert edit_res.status_code == 403
    assert edit_res.json()["error"]["code"] == "FORBIDDEN"

    # 3. Farmer B tries to toggle availability -> 403 Forbidden
    status_res = client.patch(f"/api/labours/{lab_id}/availability", json={
        "availability_status": "BUSY"
    }, headers=headers_b)
    assert status_res.status_code == 403
    assert status_res.json()["error"]["code"] == "FORBIDDEN"

    # 4. Farmer B tries to delete -> 403 Forbidden
    del_res = client.delete(f"/api/labours/{lab_id}", headers=headers_b)
    assert del_res.status_code == 403
    assert del_res.json()["error"]["code"] == "FORBIDDEN"

    # 5. Farmer A marks worker as BUSY -> 200 OK
    mark_busy_res = client.patch(f"/api/labours/{lab_id}/availability", json={
        "availability_status": "BUSY"
    }, headers=headers_a)
    assert mark_busy_res.status_code == 200
    assert mark_busy_res.json()["availability_status"] == "BUSY"

    # 6. Excluded from default browse (AVAILABLE only)
    browse_avail = client.get("/api/labours", headers=headers_b)
    avail_ids = [l["id"] for l in browse_avail.json()]
    assert lab_id not in avail_ids

    # 7. Farmer A deletes their own worker listing -> 204 No Content
    owner_del_res = client.delete(f"/api/labours/{lab_id}", headers=headers_a)
    assert owner_del_res.status_code == 204
