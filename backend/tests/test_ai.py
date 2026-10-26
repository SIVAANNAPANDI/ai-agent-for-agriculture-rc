import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

FARMER_AI_A = "ai_farmer_a@agriassist.com"
FARMER_AI_B = "ai_farmer_b@agriassist.com"
PASSWORD = "Password@123"


def get_token(email: str, phone: str, name: str) -> str:
    signup_res = client.post("/api/auth/signup", json={
        "name": name,
        "email": email,
        "phone": phone,
        "password": PASSWORD,
        "confirm_password": PASSWORD,
        "location": "Dharmapuri, Tamil Nadu",
        "preferred_language": "ta"
    })
    if signup_res.status_code == 201:
        return signup_res.json()["access_token"]
    login_res = client.post("/api/auth/login", json={
        "email_or_username": email,
        "password": PASSWORD
    })
    return login_res.json()["access_token"]


def test_ai_agricultural_query():
    token = get_token(FARMER_AI_A, "9876577701", "AI Farmer A")
    headers = {"Authorization": f"Bearer {token}"}

    # Ask agricultural question
    req = {
        "message": "What foliar fertilizer should I apply for tomato plants during flowering stage?",
        "language": "en"
    }
    res = client.post("/api/ai/chat", json=req, headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["is_guardrail_triggered"] is False
    assert "conversation_id" in data
    assert "message" in data
    assert data["message"]["sender"] == "ai"
    assert len(data["message"]["content"]) > 20


def test_ai_strict_guardrail_rejection():
    token = get_token(FARMER_AI_A, "9876577701", "AI Farmer A")
    headers = {"Authorization": f"Bearer {token}"}

    # Non-agricultural questions
    non_agri_queries = [
        "Who won the cricket world cup?",
        "Tell me a movie review of Avengers and actor salaries",
        "What is the latest bitcoin crypto price?"
    ]

    for q in non_agri_queries:
        res = client.post("/api/ai/chat", json={"message": q, "language": "en"}, headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["is_guardrail_triggered"] is True
        assert "AgriAssist" in data["message"]["content"]
        assert "farming" in data["message"]["content"].lower() or "agricultural" in data["message"]["content"].lower()


def test_ai_tamil_guardrail():
    token = get_token(FARMER_AI_A, "9876577701", "AI Farmer A")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/api/ai/chat", json={"message": "latest cinema movie news", "language": "ta"}, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["is_guardrail_triggered"] is True
    # Verify Tamil guardrail response
    assert "விவசாய" in data["message"]["content"]


def test_ai_conversations_and_ownership():
    token_a = get_token(FARMER_AI_A, "9876577701", "AI Farmer A")
    token_b = get_token(FARMER_AI_B, "9876577702", "AI Farmer B")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 1. Farmer A sends message
    chat_res = client.post("/api/ai/chat", json={
        "message": "How do I identify and manage blast disease in paddy rice?",
        "language": "en"
    }, headers=headers_a)
    assert chat_res.status_code == 200
    conv_id = chat_res.json()["conversation_id"]

    # 2. Farmer A lists conversations
    list_res = client.get("/api/ai/conversations", headers=headers_a)
    assert list_res.status_code == 200
    assert any(c["id"] == conv_id for c in list_res.json())

    # 3. Farmer A gets conversation history
    get_res = client.get(f"/api/ai/conversations/{conv_id}", headers=headers_a)
    assert get_res.status_code == 200
    assert len(get_res.json()["messages"]) >= 2

    # 4. Strict Ownership Isolation: Farmer B tries to access Farmer A's thread -> 403 Forbidden
    forbidden = client.get(f"/api/ai/conversations/{conv_id}", headers=headers_b)
    assert forbidden.status_code == 403

    # 5. Farmer A deletes conversation
    del_res = client.delete(f"/api/ai/conversations/{conv_id}", headers=headers_a)
    assert del_res.status_code == 204
