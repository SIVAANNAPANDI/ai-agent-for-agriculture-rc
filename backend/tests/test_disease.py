import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

DISEASE_USER_A = "disease_farmer_a@agriassist.com"
DISEASE_USER_B = "disease_farmer_b@agriassist.com"
PASSWORD = "Password@123"


def get_token(email: str, phone: str, name: str) -> str:
    signup_res = client.post("/api/auth/signup", json={
        "name": name,
        "email": email,
        "phone": phone,
        "password": PASSWORD,
        "confirm_password": PASSWORD,
        "location": "Theni, Tamil Nadu",
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
    raise RuntimeError(f"Auth failed. Signup: {signup_res.status_code} {signup_res.text} | Login: {login_res.status_code} {login_res.text}")


def create_dummy_image_bytes() -> bytes:
    img = Image.new("RGB", (250, 250), color=(80, 140, 70))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_disease_predict_valid_image():
    token = get_token(DISEASE_USER_A, "9876566601", "Disease Farmer A")
    headers = {"Authorization": f"Bearer {token}"}

    img_bytes = create_dummy_image_bytes()
    files = {"file": ("test_leaf.jpg", img_bytes, "image/jpeg")}

    res = client.post("/api/disease/predict?language=en", files=files, headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "id" in data
    assert "predicted_class" in data
    assert "crop_name" in data
    assert "disease_name" in data
    assert "confidence" in data
    assert 0.0 <= data["confidence"] <= 1.0
    assert "severity" in data
    assert isinstance(data["symptoms"], list)
    assert isinstance(data["organic_treatment"], list)
    assert isinstance(data["chemical_treatment"], list)
    assert isinstance(data["preventive_measures"], list)
    assert len(data["top_candidates"]) > 0


def test_disease_predict_invalid_extension():
    token = get_token(DISEASE_USER_A, "9876566601", "Disease Farmer A")
    headers = {"Authorization": f"Bearer {token}"}

    files = {"file": ("malicious.exe", b"MZ executable content", "application/octet-stream")}
    res = client.post("/api/disease/predict", files=files, headers=headers)
    assert res.status_code == 400


def test_disease_history_and_ownership():
    token_a = get_token(DISEASE_USER_A, "9876566601", "Disease Farmer A")
    token_b = get_token(DISEASE_USER_B, "9876566602", "Disease Farmer B")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 1. User A scans leaf
    img_bytes = create_dummy_image_bytes()
    scan_res = client.post(
        "/api/disease/predict?language=en",
        files={"file": ("leaf_scan.jpg", img_bytes, "image/jpeg")},
        headers=headers_a
    )
    assert scan_res.status_code == 200
    scan_id = scan_res.json()["id"]

    # 2. User A can view in history
    hist_a = client.get("/api/disease/history", headers=headers_a)
    assert hist_a.status_code == 200
    hist_ids_a = [item["id"] for item in hist_a.json()]
    assert scan_id in hist_ids_a

    # 3. User B cannot see User A's scan in history
    hist_b = client.get("/api/disease/history", headers=headers_b)
    assert hist_b.status_code == 200
    hist_ids_b = [item["id"] for item in hist_b.json()]
    assert scan_id not in hist_ids_b

    # 4. User B cannot directly access User A's scan detail (ownership enforcement)
    detail_res = client.get(f"/api/disease/{scan_id}", headers=headers_b)
    assert detail_res.status_code == 403
