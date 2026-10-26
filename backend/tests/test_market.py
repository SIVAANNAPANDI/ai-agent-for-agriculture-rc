import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

FARMER_MKT_A = "mkt_farmer_a@agriassist.com"
FARMER_MKT_B = "mkt_farmer_b@agriassist.com"
PASSWORD = "Password@123"


def get_token(email: str, phone: str, name: str) -> str:
    signup_res = client.post("/api/auth/signup", json={
        "name": name,
        "email": email,
        "phone": phone,
        "password": PASSWORD,
        "confirm_password": PASSWORD,
        "location": "Dindigul, Tamil Nadu",
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


def test_market_create_and_browse():
    token_a = get_token(FARMER_MKT_A, "9876555501", "Market Farmer A")
    token_b = get_token(FARMER_MKT_B, "9876555502", "Market Farmer B")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 1. Farmer A lists Fresh Organic Tomatoes
    payload_a = {
        "name": "Fresh Country Tomatoes (நாட்டு தக்காளி)",
        "category": "Vegetables",
        "quantity": 500.0,
        "unit": "kg",
        "price_per_unit": 28.0,
        "description": "Naturally farmed farm-fresh country tomatoes harvested this morning. Firm texture.",
        "seller_phone": "9876555501",
        "location_name": "Ottanchathiram Market, Dindigul",
        "latitude": 10.5148,
        "longitude": 77.7473,
    }
    res_a = client.post("/api/market/products", json=payload_a, headers=headers_a)
    assert res_a.status_code == 201
    prod_a = res_a.json()
    assert prod_a["name"] == payload_a["name"]
    assert prod_a["total_value"] == 14000.0
    assert prod_a["status"] == "AVAILABLE"
    assert prod_a["is_owner"] is True
    prod_id = prod_a["id"]

    # 2. Farmer B lists Kufri Jyoti Potatoes
    payload_b = {
        "name": "Kufri Jyoti Seed Potatoes",
        "category": "Grains & Cereals",
        "quantity": 100.0,
        "unit": "bag",
        "price_per_unit": 850.0,
        "description": "Certified grade-A seed potatoes, cold-storage stored.",
        "seller_phone": "9876555502",
        "location_name": "Kodaikanal Foothills",
        "latitude": 10.2381,
        "longitude": 77.4892,
    }
    res_b = client.post("/api/market/products", json=payload_b, headers=headers_b)
    assert res_b.status_code == 201

    # 3. Farmer B browses marketplace - can see Farmer A's product
    browse_res = client.get("/api/market/products", headers=headers_b)
    assert browse_res.status_code == 200
    products = browse_res.json()
    product_ids = [p["id"] for p in products]
    assert prod_id in product_ids

    # For Farmer B, is_owner should be False on Farmer A's product
    farmer_a_prod_from_b = next(p for p in products if p["id"] == prod_id)
    assert farmer_a_prod_from_b["is_owner"] is False
    assert farmer_a_prod_from_b["seller_phone"] == "9876555501"

    # 4. Search filter test
    search_res = client.get("/api/market/products?search=Tomatoes", headers=headers_b)
    assert search_res.status_code == 200
    search_results = search_res.json()
    assert any("Tomatoes" in p["name"] for p in search_results)
    assert not any("Potatoes" in p["name"] for p in search_results)


def test_market_status_and_ownership_security():
    token_a = get_token(FARMER_MKT_A, "9876555501", "Market Farmer A")
    token_b = get_token(FARMER_MKT_B, "9876555502", "Market Farmer B")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 1. Farmer A creates product
    create_res = client.post("/api/market/products", json={
        "name": "Cavendish Banana Bunches",
        "category": "Fruits",
        "quantity": 50.0,
        "unit": "bunch",
        "price_per_unit": 220.0,
        "seller_phone": "9876555501",
        "location_name": "Dindigul"
    }, headers=headers_a)
    assert create_res.status_code == 201
    prod_id = create_res.json()["id"]

    # 2. Farmer B tries to edit Farmer A's product -> 403 Forbidden
    edit_res = client.put(f"/api/market/products/{prod_id}", json={
        "price_per_unit": 10.0
    }, headers=headers_b)
    assert edit_res.status_code == 403
    assert edit_res.json()["error"]["code"] == "FORBIDDEN"

    # 3. Farmer B tries to mark Farmer A's product as SOLD -> 403 Forbidden
    status_res = client.patch(f"/api/market/products/{prod_id}/status", json={
        "status": "SOLD"
    }, headers=headers_b)
    assert status_res.status_code == 403
    assert status_res.json()["error"]["code"] == "FORBIDDEN"

    # 4. Farmer B tries to delete Farmer A's product -> 403 Forbidden
    del_res = client.delete(f"/api/market/products/{prod_id}", headers=headers_b)
    assert del_res.status_code == 403
    assert del_res.json()["error"]["code"] == "FORBIDDEN"

    # 5. Farmer A marks their own product as SOLD -> 200 OK
    mark_sold_res = client.patch(f"/api/market/products/{prod_id}/status", json={
        "status": "SOLD"
    }, headers=headers_a)
    assert mark_sold_res.status_code == 200
    assert mark_sold_res.json()["status"] == "SOLD"

    # 6. Verify excluded from default browse (AVAILABLE only)
    browse_avail = client.get("/api/market/products", headers=headers_b)
    avail_ids = [p["id"] for p in browse_avail.json()]
    assert prod_id not in avail_ids

    # 7. Farmer A deletes their own product -> 204 No Content
    owner_del_res = client.delete(f"/api/market/products/{prod_id}", headers=headers_a)
    assert owner_del_res.status_code == 204
