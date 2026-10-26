import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

TEST_USER_EMAIL = "testfarmer@agriassist.com"
TEST_USER_PHONE = "9876500001"
TEST_USER_PASS = "FarmSecret@123"


def test_signup_success():
    payload = {
        "name": "Test Farmer",
        "email": TEST_USER_EMAIL,
        "phone": TEST_USER_PHONE,
        "password": TEST_USER_PASS,
        "confirm_password": TEST_USER_PASS,
        "location": "Erode, Tamil Nadu",
        "preferred_language": "ta"
    }
    response = client.post("/api/auth/signup", json=payload)
    # If already exists from previous test run, clean up or expect 201
    if response.status_code == 400 and "already exists" in response.text:
        # User already created, proceed
        return
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == TEST_USER_EMAIL
    assert data["user"]["preferred_language"] == "ta"


def test_signup_duplicate_email():
    payload = {
        "name": "Duplicate Farmer",
        "email": TEST_USER_EMAIL,
        "phone": "9876500099",
        "password": TEST_USER_PASS,
        "confirm_password": TEST_USER_PASS,
        "location": "Salem, Tamil Nadu",
        "preferred_language": "en"
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["error"]["code"] == "EMAIL_ALREADY_EXISTS"


def test_signup_password_mismatch():
    payload = {
        "name": "Mismatch Farmer",
        "email": "mismatch@agriassist.com",
        "phone": "9876500088",
        "password": "Password123",
        "confirm_password": "DifferentPassword123",
        "location": "Salem, Tamil Nadu",
        "preferred_language": "en"
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 422


def test_login_success_with_email():
    payload = {
        "email_or_username": TEST_USER_EMAIL,
        "password": TEST_USER_PASS,
        "remember_me": True
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == TEST_USER_EMAIL


def test_login_success_with_phone():
    payload = {
        "email_or_username": TEST_USER_PHONE,
        "password": TEST_USER_PASS,
        "remember_me": False
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["phone"] == TEST_USER_PHONE


def test_login_invalid_password():
    payload = {
        "email_or_username": TEST_USER_EMAIL,
        "password": "WrongPassword!456"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "UNAUTHORIZED"


def test_get_current_user_profile():
    # Login first
    login_res = client.post("/api/auth/login", json={
        "email_or_username": TEST_USER_EMAIL,
        "password": TEST_USER_PASS
    })
    token = login_res.json()["access_token"]

    # Request profile
    response = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == TEST_USER_EMAIL
    assert data["profile"] is not None
    assert data["settings"] is not None


def test_get_profile_unauthorized():
    response = client.get("/api/users/me", headers={"Authorization": "Bearer invalid_token_xyz"})
    assert response.status_code == 401
