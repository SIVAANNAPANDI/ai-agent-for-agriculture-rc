import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

USER_NOTIF_A = "notif_farmer_a@agriassist.com"
USER_NOTIF_B = "notif_farmer_b@agriassist.com"
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
            "location": "Tiruppur, Tamil Nadu",
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


from app.database.session import SessionLocal
from app.repositories.user_repo import UserRepository
from app.repositories.notification_repo import notification_repo
from app.schemas.notification import NotificationCreate


def test_notifications_lifecycle_and_ownership():
    token_a = get_token(USER_NOTIF_A, "9876522201", "Farmer Notification A")
    token_b = get_token(USER_NOTIF_B, "9876522202", "Farmer Notification B")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Ensure User A has a fresh unread notification for repeatable tests
    db = SessionLocal()
    user_a = UserRepository.get_by_email(db, USER_NOTIF_A)
    notif = notification_repo.create(
        db,
        NotificationCreate(
            user_id=user_a.id,
            type="weather",
            title="Heavy Rain Warning ⛈️",
            message="Storm alert in your microclimate.",
            action_url="/weather",
        ),
    )
    db.close()
    notif_id = notif.id

    # 1. User A lists notifications
    res_list = client.get("/api/notifications", headers=headers_a)
    assert res_list.status_code == 200
    data = res_list.json()
    assert len(data["items"]) >= 1
    assert data["unread_count"] >= 1

    # 2. Check unread count endpoint
    res_count = client.get("/api/notifications/unread-count", headers=headers_a)
    assert res_count.status_code == 200
    assert res_count.json()["unread_count"] == data["unread_count"]

    # 3. User B tries to mark User A's notification as read -> MUST FAIL with 403 Forbidden
    res_illegal_read = client.patch(
        f"/api/notifications/{notif_id}/read",
        headers=headers_b,
    )
    assert res_illegal_read.status_code == 403

    # 4. User B tries to delete User A's notification -> MUST FAIL with 403 Forbidden
    res_illegal_delete = client.delete(
        f"/api/notifications/{notif_id}",
        headers=headers_b,
    )
    assert res_illegal_delete.status_code == 403

    # 5. User A legally marks the notification as read
    res_read = client.patch(f"/api/notifications/{notif_id}/read", headers=headers_a)
    assert res_read.status_code == 200
    assert res_read.json()["is_read"] is True

    # 6. User A marks all as read
    res_read_all = client.post("/api/notifications/read-all", headers=headers_a)
    assert res_read_all.status_code == 200
    assert "marked_count" in res_read_all.json()

    # Verify unread count is now 0
    res_count_zero = client.get("/api/notifications/unread-count", headers=headers_a)
    assert res_count_zero.status_code == 200
    assert res_count_zero.json()["unread_count"] == 0

    # 7. User A deletes the notification
    res_del = client.delete(f"/api/notifications/{notif_id}", headers=headers_a)
    assert res_del.status_code == 204


def test_user_settings_and_profile_updates():
    token_a = get_token(USER_NOTIF_A, "9876522201", "Farmer Notification A")
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 1. Get Settings
    res_settings = client.get("/api/users/settings", headers=headers_a)
    assert res_settings.status_code == 200
    settings = res_settings.json()
    assert "language" in settings
    assert "weather_alerts_enabled" in settings

    # 2. Update Settings
    res_update_settings = client.put(
        "/api/users/settings",
        json={
            "language": "ta",
            "weather_alerts_enabled": True,
            "task_reminders_enabled": False,
            "market_alerts_enabled": True,
            "theme_mode": "dark",
        },
        headers=headers_a,
    )
    assert res_update_settings.status_code == 200
    updated_settings = res_update_settings.json()
    assert updated_settings["language"] == "ta"
    assert updated_settings["task_reminders_enabled"] is False
    assert updated_settings["theme_mode"] == "dark"

    # 3. Update Farmer Profile
    res_update_profile = client.put(
        "/api/users/profile",
        json={
            "name": "Kandasamy Farmer",
            "phone": "9876522201",
            "location_name": "Kangeyam, Tiruppur",
            "preferred_language": "ta",
            "experience_years": 12,
            "primary_crop_type": "Turmeric & Coconut",
        },
        headers=headers_a,
    )
    assert res_update_profile.status_code == 200
    user_data = res_update_profile.json()
    assert user_data["name"] == "Kandasamy Farmer"
    assert user_data["profile"]["experience_years"] == 12
    assert user_data["profile"]["primary_crop_type"] == "Turmeric & Coconut"

    # 4. Password Change - Incorrect Current Password
    res_bad_pwd = client.put(
        "/api/users/password",
        json={
            "current_password": "WrongPassword@123",
            "new_password": "NewSecretPassword@123",
            "confirm_new_password": "NewSecretPassword@123",
        },
        headers=headers_a,
    )
    assert res_bad_pwd.status_code == 401

    # 5. Password Change - Mismatched Confirmation
    res_mismatch = client.put(
        "/api/users/password",
        json={
            "current_password": PASSWORD,
            "new_password": "NewSecretPassword@123",
            "confirm_new_password": "DifferentPassword@123",
        },
        headers=headers_a,
    )
    assert res_mismatch.status_code == 400

    # 6. Password Change - Successful
    res_success_pwd = client.put(
        "/api/users/password",
        json={
            "current_password": PASSWORD,
            "new_password": "NewSecretPassword@123",
            "confirm_new_password": "NewSecretPassword@123",
        },
        headers=headers_a,
    )
    assert res_success_pwd.status_code == 200

    # Revert password back so subsequent test runs stay deterministic
    client.put(
        "/api/users/password",
        json={
            "current_password": "NewSecretPassword@123",
            "new_password": PASSWORD,
            "confirm_new_password": PASSWORD,
        },
        headers=headers_a,
    )
