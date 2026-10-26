import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.weather_service import WeatherService

client = TestClient(app)

TEST_USER_EMAIL = "weather_farmer@agriassist.com"
TEST_USER_PHONE = "9876543210"
PASSWORD = "Password@123"


def get_token() -> str:
    signup_res = client.post("/api/auth/signup", json={
        "name": "Weather Farmer",
        "email": TEST_USER_EMAIL,
        "phone": TEST_USER_PHONE,
        "password": PASSWORD,
        "confirm_password": PASSWORD,
        "location": "Erode, Tamil Nadu",
        "preferred_language": "ta"
    })
    if signup_res.status_code == 201:
        return signup_res.json()["access_token"]
    login_res = client.post("/api/auth/login", json={
        "email_or_username": TEST_USER_EMAIL,
        "password": PASSWORD
    })
    return login_res.json()["access_token"]


def test_get_current_weather():
    # Erode, Tamil Nadu coordinates
    response = client.get("/api/weather/current?lat=11.3410&lon=77.7172&location_name=Erode")
    assert response.status_code == 200
    data = response.json()
    assert "temperature" in data
    assert "humidity" in data
    assert "wind_speed" in data
    assert "advisory" in data
    advisory = data["advisory"]
    assert "actionable_summary" in advisory
    assert "irrigation_advisory" in advisory
    assert "spray_advisory" in advisory
    assert "fieldwork_advisory" in advisory
    assert advisory["risk_level"] in ["low", "moderate", "high", "extreme"]


def test_get_weather_forecast():
    response = client.get("/api/weather/forecast?lat=11.3410&lon=77.7172")
    assert response.status_code == 200
    data = response.json()
    assert "current" in data
    assert "daily" in data
    assert "hourly" in data
    assert len(data["daily"]) > 0
    assert len(data["hourly"]) > 0


def test_farm_specific_weather_and_ownership():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Create farm
    farm_res = client.post("/api/farms", json={
        "name": "Weather Test Farm",
        "land_area": 4.0,
        "area_unit": "acres",
        "location_name": "Pollachi, Coimbatore",
        "latitude": 10.6609,
        "longitude": 77.0048,
        "water_source": "Borewell",
        "irrigation_method": "Drip"
    }, headers=headers)
    assert farm_res.status_code == 201
    farm_id = farm_res.json()["id"]

    # Get weather for this farm
    weather_res = client.get(f"/api/weather/farm/{farm_id}", headers=headers)
    assert weather_res.status_code == 200
    w_data = weather_res.json()
    assert w_data["location_name"] == "Pollachi, Coimbatore"
    assert w_data["latitude"] == 10.6609

    # Unauthorized access check without token -> 401
    unauth_res = client.get(f"/api/weather/farm/{farm_id}")
    assert unauth_res.status_code == 401


def test_agricultural_advisory_rules():
    # 1. High Rain Rule
    adv_rain = WeatherService.generate_advisory(temperature=28.0, humidity=85, wind_speed=2.0, rain_risk_pct=75)
    assert "Defer scheduled" in adv_rain.irrigation_advisory or "Rain expected" in adv_rain.actionable_summary

    # 2. High Wind Rule
    adv_wind = WeatherService.generate_advisory(temperature=29.0, humidity=60, wind_speed=7.2, rain_risk_pct=10)
    assert "Postpone" in adv_wind.spray_advisory or "wind" in adv_wind.actionable_summary.lower()

    # 3. Extreme Heat Rule
    adv_heat = WeatherService.generate_advisory(temperature=38.5, humidity=40, wind_speed=3.0, rain_risk_pct=5)
    assert adv_heat.risk_level == "extreme"
    assert "heat" in adv_heat.fieldwork_advisory.lower() or "heat" in adv_heat.actionable_summary.lower()

    # 4. Favorable Conditions
    adv_calm = WeatherService.generate_advisory(temperature=27.0, humidity=65, wind_speed=2.5, rain_risk_pct=15)
    assert adv_calm.risk_level == "low"
    assert "routine" in adv_calm.irrigation_advisory.lower()
