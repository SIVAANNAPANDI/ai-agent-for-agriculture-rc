import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

RENTAL_OWNER_A = "rental_owner_a@agriassist.com"
RENTAL_TENANT_B = "rental_tenant_b@agriassist.com"
PASSWORD = "Password@123"


def get_token(email: str, phone: str, name: str) -> str:
    signup_res = client.post(
        "/api/auth/signup",
        json={
            "name": name,
            "email": email,
            "phone": phone,
            "password": PASSWORD,
            "confirm_password": PASSWORD,
            "location": "Erode, Tamil Nadu",
            "preferred_language": "ta",
        },
    )
    if signup_res.status_code == 201:
        return signup_res.json()["access_token"]
    login_res = client.post(
        "/api/auth/login",
        json={"email_or_username": email, "password": PASSWORD},
    )
    if login_res.status_code == 200:
        return login_res.json()["access_token"]
    raise RuntimeError(f"Auth failed: {signup_res.text} | {login_res.text}")


def test_rental_lifecycle_and_ownership():
    # 1. Register & Authenticate Landowner A and Tenant B
    token_a = get_token(RENTAL_OWNER_A, "9876533301", "Velusamy Gounder")
    token_b = get_token(RENTAL_TENANT_B, "9876533302", "Murugan Shanmugam")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 2. Create a Rental Property by Landowner A
    create_payload = {
        "title": "5 Acres Fertile Land with 7.5HP Borewell",
        "owner_name": "Velusamy Gounder",
        "phone": "9876533301",
        "land_area": 5.0,
        "area_unit": "acres",
        "monthly_rent": 15000.0,
        "location_name": "Sathyamangalam, Erode",
        "latitude": 11.5034,
        "longitude": 77.2441,
        "available_from": "2026-10-01",
        "water_source": "Borewell",
        "soil_type": "Red Soil",
        "description": "Fenced land with active 7.5HP submersible pump, 3-phase free EB power, suitable for turmeric or banana.",
        "images": [],
    }

    res_create = client.post("/api/rentals", json=create_payload, headers=headers_a)
    assert res_create.status_code == 201
    rental_data = res_create.json()
    rental_id = rental_data["id"]
    assert rental_data["title"] == create_payload["title"]
    assert rental_data["land_area"] == 5.0
    assert rental_data["monthly_rent"] == 15000.0
    assert rental_data["status"] == "AVAILABLE"
    assert rental_data["is_owner"] is True

    # 3. Browse rentals by Tenant B (Public Search & Filter)
    res_list = client.get(
        "/api/rentals?search=Sathyamangalam&water_source=Borewell",
        headers=headers_b,
    )
    assert res_list.status_code == 200
    rentals = res_list.json()
    assert len(rentals) >= 1
    found = next((r for r in rentals if r["id"] == rental_id), None)
    assert found is not None
    assert found["is_owner"] is False

    # 4. List My Rentals by Landowner A
    res_my = client.get("/api/rentals/my-rentals", headers=headers_a)
    assert res_my.status_code == 200
    my_rentals = res_my.json()
    assert any(r["id"] == rental_id for r in my_rentals)

    # 5. Tenant B tries to update Landowner A's listing -> MUST FAIL with 403 Forbidden
    res_illegal_update = client.put(
        f"/api/rentals/{rental_id}",
        json={"monthly_rent": 25000.0},
        headers=headers_b,
    )
    assert res_illegal_update.status_code == 403

    # 6. Tenant B tries to change status -> MUST FAIL with 403 Forbidden
    res_illegal_status = client.patch(
        f"/api/rentals/{rental_id}/status",
        json={"status": "RENTED"},
        headers=headers_b,
    )
    assert res_illegal_status.status_code == 403

    # 7. Tenant B tries to delete Landowner A's listing -> MUST FAIL with 403 Forbidden
    res_illegal_delete = client.delete(
        f"/api/rentals/{rental_id}",
        headers=headers_b,
    )
    assert res_illegal_delete.status_code == 403

    # 8. Landowner A legally updates status to RENTED
    res_status = client.patch(
        f"/api/rentals/{rental_id}/status",
        json={"status": "RENTED"},
        headers=headers_a,
    )
    assert res_status.status_code == 200
    assert res_status.json()["status"] == "RENTED"

    # 9. Landowner A deletes the listing
    res_delete = client.delete(f"/api/rentals/{rental_id}", headers=headers_a)
    assert res_delete.status_code == 204

    # 10. Verify it's gone
    res_get = client.get(f"/api/rentals/{rental_id}", headers=headers_a)
    assert res_get.status_code == 404
