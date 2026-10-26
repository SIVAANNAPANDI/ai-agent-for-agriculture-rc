import asyncio
from app.services.weather_service import WeatherService

async def test():
    for loc in ['Erode', 'Coimbatore', 'Kanyakumari', 'Kanya kumari', 'Salem', 'Chennai']:
        w = await WeatherService.get_current_weather(location_name=loc)
        print("="*60)
        print(f"Location: {loc} -> resolved: {w.location_name} ({w.latitude}, {w.longitude})")
        print(f"  Metrics: {w.temperature}°C | Humidity: {w.humidity}% | Wind: {w.wind_speed} m/s | Rain Risk: {w.rain_risk_pct}%")
        print(f"  Humidity Task: {w.advisory.humidity_task}")
        print(f"  Wind Task:     {w.advisory.wind_task}")
        print(f"  Rain Task:     {w.advisory.rain_task}")

if __name__ == '__main__':
    asyncio.run(test())
