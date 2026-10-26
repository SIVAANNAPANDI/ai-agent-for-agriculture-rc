import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

SEC_USER_A = "sec_farmer_a@agriassist.com"
SEC_USER_B = "sec_farmer_b@agriassist.com"
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
            "location": "Salem, Tamil Nadu",
            "preferred_language": "en",
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


def test_security_headers_middleware():
    """Verify production security headers on HTTP responses."""
    response = client.get("/api/health")
    assert response.status_code == 200
    headers = response.headers

    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert headers.get("X-XSS-Protection") == "1; mode=block"
    assert "max-age=31536000" in headers.get("Strict-Transport-Security", "")
    assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"


def test_file_upload_security_and_magic_bytes():
    """Verify MIME and magic byte enforcement for uploaded files."""
    token = get_token(SEC_USER_A, "9876511101", "Security Farmer A")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Reject invalid file extension (.sh)
    fake_script = io.BytesIO(b"#!/bin/bash\necho 'malicious'")
    res_ext = client.post(
        "/api/disease/predict",
        files={"file": ("exploit.sh", fake_script, "image/jpeg")},
        headers=headers,
    )
    assert res_ext.status_code == 400

    # 2. Reject disguised binary with fake MIME header (Polyglot/Malicious file)
    disguised_file = io.BytesIO(b"MZ\x90\x00\x03\x00\x00\x00FAKE_EXECUTABLE_BYTES" * 30)
    res_magic = client.post(
        "/api/disease/predict",
        files={"file": ("leaf.png", disguised_file, "image/png")},
        headers=headers,
    )
    assert res_magic.status_code == 400

    # 3. Reject empty/too-small file
    tiny_file = io.BytesIO(b"tiny")
    res_tiny = client.post(
        "/api/disease/predict",
        files={"file": ("leaf.jpg", tiny_file, "image/jpeg")},
        headers=headers,
    )
    assert res_tiny.status_code == 400

    # 4. Accept genuine JPEG file with valid magic bytes
    img = Image.new("RGB", (200, 200), color=(60, 120, 60))
    valid_buf = io.BytesIO()
    img.save(valid_buf, format="JPEG")
    valid_bytes = valid_buf.getvalue()

    res_valid = client.post(
        "/api/disease/predict",
        files={"file": ("healthy_leaf.jpg", valid_bytes, "image/jpeg")},
        headers=headers,
    )
    assert res_valid.status_code == 200


def test_cross_user_ownership_enforcement_audit():
    """Verify 403 Forbidden across all sensitive user resources."""
    token_a = get_token(SEC_USER_A, "9876511101", "Security Farmer A")
    token_b = get_token(SEC_USER_B, "9876511102", "Security Farmer B")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 1. Farm Ownership Check
    farm_res = client.post(
        "/api/farms",
        json={
            "name": "User A Secure Farm",
            "land_area": 3.0,
            "area_unit": "acres",
            "location_name": "Salem",
            "latitude": 11.6643,
            "longitude": 78.1460,
            "water_source": "Borewell",
            "irrigation_method": "Drip",
            "soil": {
                "soil_type": "Clay",
                "ph": 6.8,
                "nitrogen_n": 240.0,
                "phosphorus_p": 18.5,
                "potassium_k": 210.0,
            },
        },
        headers=headers_a,
    )
    assert farm_res.status_code == 201
    farm_id = farm_res.json()["id"]

    # User B tries to update User A's farm -> 403 Forbidden
    res_farm_update = client.put(
        f"/api/farms/{farm_id}",
        json={"name": "Hacked Farm"},
        headers=headers_b,
    )
    assert res_farm_update.status_code == 403

    # User B tries to update User A's farm soil -> 403 Forbidden
    res_soil_update = client.put(
        f"/api/farms/{farm_id}/soil",
        json={"ph": 5.0},
        headers=headers_b,
    )
    assert res_soil_update.status_code == 403

    # User B tries to delete User A's farm -> 403 Forbidden
    res_farm_delete = client.delete(f"/api/farms/{farm_id}", headers=headers_b)
    assert res_farm_delete.status_code == 403

    # 2. Market Produce Ownership Check
    prod_res = client.post(
        "/api/market/products",
        json={
            "name": "User A Turmeric",
            "category": "Organic Inputs / Seeds",
            "quantity": 100.0,
            "unit": "kg",
            "price_per_unit": 120.0,
            "seller_phone": "9876511101",
            "location_name": "Salem",
        },
        headers=headers_a,
    )
    assert prod_res.status_code == 201
    prod_id = prod_res.json()["id"]

    # User B tries to delete User A's product -> 403 Forbidden
    res_prod_del = client.delete(f"/api/market/products/{prod_id}", headers=headers_b)
    assert res_prod_del.status_code == 403

    # 3. Labour Profile Ownership Check
    labour_res = client.post(
        "/api/labours",
        json={
            "worker_name": "User A Worker Crew",
            "phone": "9876511101",
            "skills": ["Planting", "Weeding"],
            "experience_years": 5,
            "daily_wage": 700.0,
            "location_name": "Salem",
        },
        headers=headers_a,
    )
    assert labour_res.status_code == 201
    labour_id = labour_res.json()["id"]

    # User B tries to delete User A's labour profile -> 403 Forbidden
    res_lab_del = client.delete(f"/api/labours/{labour_id}", headers=headers_b)
    assert res_lab_del.status_code == 403

    # 4. Farmland Rental Ownership Check
    rental_res = client.post(
        "/api/rentals",
        json={
            "title": "User A Land Lease",
            "owner_name": "User A",
            "phone": "9876511101",
            "land_area": 4.0,
            "area_unit": "acres",
            "monthly_rent": 12000.0,
            "location_name": "Salem",
            "available_from": "2026-11-01",
        },
        headers=headers_a,
    )
    assert rental_res.status_code == 201
    rental_id = rental_res.json()["id"]

    # User B tries to delete User A's rental -> 403 Forbidden
    res_rent_del = client.delete(f"/api/rentals/{rental_id}", headers=headers_b)
    assert res_rent_del.status_code == 403

    # Clean up User A's created resources legally
    client.delete(f"/api/farms/{farm_id}", headers=headers_a)
    client.delete(f"/api/market/products/{prod_id}", headers=headers_a)
    client.delete(f"/api/labours/{labour_id}", headers=headers_a)
    client.delete(f"/api/rentals/{rental_id}", headers=headers_a)
