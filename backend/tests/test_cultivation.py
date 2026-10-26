import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

FARMER_C_EMAIL = "cultivation_farmer@agriassist.com"
FARMER_D_EMAIL = "other_farmer@agriassist.com"
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
    return login_res.json()["access_token"]


def test_get_cultivation_crops():
    res = client.get("/api/cultivation/crops")
    assert res.status_code == 200
    crops = res.json()
    assert len(crops) >= 5
    crop_names = [c["name"] for c in crops]
    assert "Tomato" in crop_names
    assert any("paddy" in name.lower() for name in crop_names)


def test_cultivation_cycle_and_tasks_lifecycle():
    token_c = get_token(FARMER_C_EMAIL, "9876599901", "Farmer C")
    token_d = get_token(FARMER_D_EMAIL, "9876599902", "Farmer D")

    headers_c = {"Authorization": f"Bearer {token_c}"}
    headers_d = {"Authorization": f"Bearer {token_d}"}

    # 1. Farmer C creates a farm
    farm_res = client.post("/api/farms", json={
        "name": "Cauvery Delta Agri Farm",
        "land_area": 3.0,
        "area_unit": "acres",
        "location_name": "Kumbakonam, Thanjavur",
        "latitude": 10.9602,
        "longitude": 79.3845,
        "water_source": "Canal",
        "irrigation_method": "Drip"
    }, headers=headers_c)
    assert farm_res.status_code == 201
    farm_id = farm_res.json()["id"]

    # 2. Get Tomato crop id
    crops = client.get("/api/cultivation/crops").json()
    tomato = next(c for c in crops if c["name"] == "Tomato")
    tomato_id = tomato["id"]

    # 3. Farmer C starts a Cultivation Cycle for Tomato
    start_d = str(date.today() - timedelta(days=25))
    cycle_res = client.post("/api/cultivation/cycles", json={
        "farm_id": farm_id,
        "crop_id": tomato_id,
        "start_date": start_d,
        "estimated_yield": "18 - 22 Tonnes/acre",
        "notes": "Hybrid Co-3 tomato planted under drip fertigation"
    }, headers=headers_c)
    assert cycle_res.status_code == 201
    cycle_data = cycle_res.json()
    cycle_id = cycle_data["id"]

    assert cycle_data["crop_name"] == "Tomato"
    assert cycle_data["days_total"] >= 80
    assert cycle_data["days_elapsed"] >= 20
    assert cycle_data["progress_pct"] > 0
    assert cycle_data["tasks_count"] >= 8
    assert len(cycle_data["tasks"]) >= 8

    # 4. Farmer C lists cycles
    list_res = client.get("/api/cultivation/cycles", headers=headers_c)
    assert list_res.status_code == 200
    assert any(c["id"] == cycle_id for c in list_res.json())

    # 5. Farmer C views cycle details
    get_res = client.get(f"/api/cultivation/cycles/{cycle_id}", headers=headers_c)
    assert get_res.status_code == 200
    task_to_complete = get_res.json()["tasks"][0]
    task_id = task_to_complete["id"]

    # 6. Strict Ownership Isolation: Farmer D tries to access Farmer C's cycle -> 403 Forbidden
    forbidden_get = client.get(f"/api/cultivation/cycles/{cycle_id}", headers=headers_d)
    assert forbidden_get.status_code == 403

    # 7. Strict Ownership Isolation: Farmer D tries to modify task -> 403 Forbidden
    forbidden_task = client.put(f"/api/cultivation/tasks/{task_id}", json={"status": "COMPLETED"}, headers=headers_d)
    assert forbidden_task.status_code == 403

    # 8. Farmer C marks task as COMPLETED
    task_res = client.put(f"/api/cultivation/tasks/{task_id}", json={"status": "COMPLETED"}, headers=headers_c)
    assert task_res.status_code == 200
    assert task_res.json()["status"] == "COMPLETED"
    assert task_res.json()["completed_at"] is not None

    # 9. Farmer C adds a custom task
    custom_task_res = client.post(f"/api/cultivation/cycles/{cycle_id}/tasks", json={
        "stage_name": "Weeding",
        "title": "Install yellow sticky traps for whitefly management",
        "due_date": str(date.today() + timedelta(days=5)),
        "description": "Place 10 yellow traps per acre to monitor early pest density."
    }, headers=headers_c)
    assert custom_task_res.status_code == 201
    assert "yellow sticky traps" in custom_task_res.json()["title"]

    # 10. Farmer C updates cycle status to HARVESTED
    update_res = client.put(f"/api/cultivation/cycles/{cycle_id}", json={
        "status": "HARVESTED",
        "actual_harvest_date": str(date.today())
    }, headers=headers_c)
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "HARVESTED"

    # 11. Farmer C deletes cycle
    del_res = client.delete(f"/api/cultivation/cycles/{cycle_id}", headers=headers_c)
    assert del_res.status_code == 204

    # 12. Verified 404
    not_found = client.get(f"/api/cultivation/cycles/{cycle_id}", headers=headers_c)
    assert not_found.status_code == 404
