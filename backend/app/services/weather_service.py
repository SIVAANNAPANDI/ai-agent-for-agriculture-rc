import time
import httpx
from datetime import datetime, timezone
from typing import Dict, Any, Tuple, Optional, List
from app.core.config import settings
from app.schemas.weather import (
    WeatherCurrentResponse,
    WeatherForecastResponse,
    ForecastPeriod,
    ForecastDay,
    AgriculturalAdvisoryResponse,
)

# 30-minute in-memory cache
# Key: (round(lat, 2), round(lon, 2)) -> (timestamp, data)
_CURRENT_CACHE: Dict[Tuple[float, float], Tuple[float, WeatherCurrentResponse]] = {}
_FORECAST_CACHE: Dict[Tuple[float, float], Tuple[float, WeatherForecastResponse]] = {}
CACHE_TTL_SECONDS = 1800  # 30 minutes

TAMIL_NADU_DISTRICTS: Dict[str, Tuple[float, float]] = {
    "erode": (11.3410, 77.7172),
    "coimbatore": (11.0168, 76.9558),
    "tirupur": (11.1085, 77.3411),
    "salem": (11.6643, 78.1460),
    "namakkal": (11.2189, 78.1674),
    "karur": (10.9601, 78.0766),
    "dindigul": (10.3673, 77.9803),
    "madurai": (9.9252, 78.1198),
    "theni": (10.0104, 77.4768),
    "tiruchirappalli": (10.7905, 78.7047),
    "trichy": (10.7905, 78.7047),
    "thanjavur": (10.7870, 79.1378),
    "tiruvarur": (10.7725, 79.6365),
    "nagapattinam": (10.7672, 79.8424),
    "pudukkottai": (10.3797, 78.8208),
    "dharmapuri": (12.1211, 78.1582),
    "krishnagiri": (12.5186, 78.2137),
    "vellore": (12.9165, 79.1325),
    "ranipet": (12.9272, 79.3330),
    "tirupathur": (12.4925, 78.5678),
    "tiruvannamalai": (12.2253, 79.0747),
    "villupuram": (11.9401, 79.4861),
    "kallakurichi": (11.7384, 78.9639),
    "cuddalore": (11.7480, 79.7714),
    "perambalur": (11.2342, 78.8820),
    "ariyalur": (11.1401, 79.0786),
    "sivaganga": (9.8433, 78.4809),
    "ramanathapuram": (9.3639, 78.8395),
    "virudhunagar": (9.5872, 77.9514),
    "thoothukudi": (8.7642, 78.1348),
    "tuticorin": (8.7642, 78.1348),
    "tirunelveli": (8.7139, 77.7567),
    "tenkasi": (8.9594, 77.3152),
    "kanyakumari": (8.0883, 77.5385),
    "chennai": (13.0827, 80.2707),
    "kancheepuram": (12.8342, 79.7036),
    "chengalpattu": (12.6819, 79.9888),
    "tiruvallur": (13.1432, 79.9079),
    "nilgiris": (11.4102, 76.6950),
    "ooty": (11.4102, 76.6950),
    "pollachi": (10.6609, 77.0048),
    "gobichettipalayam": (11.4542, 77.4373),
    "perundurai": (11.2758, 77.5833),
    "bhavani": (11.4489, 77.6833),
    "sathyamangalam": (11.5036, 77.2344),
    "nagercoil": (8.1833, 77.4119),
    "kanyakumari": (8.0883, 77.5385),
    "kanya kumari": (8.0883, 77.5385),
    "tiruppur": (11.1085, 77.3411),
    "tirupur": (11.1085, 77.3411),
}


class WeatherService:
    @staticmethod
    def _cache_key(lat: float, lon: float, location_name: Optional[str] = None) -> Tuple[float, float, str]:
        clean_loc = "".join(ch for ch in (location_name or "").lower() if ch.isalnum())
        return (round(lat, 2), round(lon, 2), clean_loc)

    @classmethod
    def resolve_location(
        cls,
        lat: Optional[float],
        lon: Optional[float],
        location_name: Optional[str]
    ) -> Tuple[float, float, str]:
        """Resolves target location and coordinates using explicit GPS coordinates if present, or normalized district lookup."""
        # 1. If explicit farm or custom coordinates are provided, prioritize GPS coordinates
        if lat is not None and lon is not None and not (lat == 11.1271 and lon == 78.6569):
            display_name = location_name.strip().title() if location_name and location_name.strip() else f"{lat:.2f}°, {lon:.2f}°"
            return lat, lon, display_name

        # 2. If location name is provided, resolve via normalized Tamil Nadu district lookup
        if location_name and location_name.strip():
            clean = location_name.strip().lower()
            clean_alnum = "".join(ch for ch in clean if ch.isalnum())

            for district, (d_lat, d_lon) in TAMIL_NADU_DISTRICTS.items():
                dist_alnum = "".join(ch for ch in district if ch.isalnum())
                if dist_alnum in clean_alnum or clean_alnum in dist_alnum:
                    display_name = location_name.strip().title()
                    return d_lat, d_lon, display_name

            # Default to Erode coordinates if location is specified but unknown
            return 11.3410, 77.7172, location_name.strip().title()

        if lat is not None and lon is not None:
            return lat, lon, f"{lat:.2f}°, {lon:.2f}°"

        # Default fallback to Erode (11.3410, 77.7172)
        return 11.3410, 77.7172, "Erode"

    @staticmethod
    def generate_advisory(
        temperature: float,
        humidity: int,
        wind_speed: float,
        rain_risk_pct: int,
        rain_1h: float = 0.0
    ) -> AgriculturalAdvisoryResponse:
        """Core agronomic rule engine translating raw weather into agricultural action items."""
        risk_level = "low"

        # 1. Dedicated Humidity Task (Fungal Spore, Evapotranspiration, Crop Canopy)
        if humidity >= 80:
            humidity_task = f"High fungal blight risk ({humidity}% RH). Inspect lower crop foliage for powdery/downy mildew, improve furrow aeration, and hold dense foliar watering."
            humidity_task_ta = f"அதிக பூஞ்சை நோய் ஆபத்து ({humidity}% RH). இலைகளின் அடிப்பகுதியில் பூஞ்சை தாக்குதலை சோதிக்கவும், காற்றோட்டத்தை அதிகரிக்கவும்."
            risk_level = "moderate"
        elif humidity < 45 and temperature > 32:
            humidity_task = f"Dry microclimate ({humidity}% RH at {temperature:.1f}°C). Accelerated soil moisture loss. Mulch crop beds and schedule evening drip watering to prevent heat wilting."
            humidity_task_ta = f"வறண்ட காற்று சூழல் ({humidity}% RH). மண்ணின் ஈரப்பதம் வேகமாக குறையும். நிலப்போர்வை (Mulch) இட்டு மாலையில் நீர் பாய்ச்சவும்."
            risk_level = "moderate"
        else:
            humidity_task = f"Balanced relative humidity ({humidity}% RH). Optimal transpiration rate. Ideal for intercultural weeding, soil aerating, and manual field operations."
            humidity_task_ta = f"சீரான ஈரப்பதம் ({humidity}% RH). பயிர் வளர்ச்சிக்கு உகந்தது. களையெடுத்தல் மற்றும் நில வேலைகளை தாராளமாக செய்யலாம்."

        # 2. Dedicated Wind Task (Spray Drift Hazard, Lodging, Drone Safety)
        if wind_speed >= 5.5:
            wind_task = f"Unsafe for spraying ({wind_speed:.1f} m/s exceeds 5.5 m/s drift limit). Postpone chemical pesticides, micronutrient sprays, and drone flights to avoid drift loss."
            wind_task_ta = f"வேகமான காற்று ({wind_speed:.1f} m/s). மருந்து காற்றில் வீணாகும் என்பதால் இலைவழி தெளித்தல் மற்றும் பூச்சிக்கொல்லி தெளிப்பதை தவிர்க்கவும்."
            risk_level = "high" if risk_level != "extreme" else risk_level
        elif wind_speed < 2.5:
            wind_task = f"Optimal spray window ({wind_speed:.1f} m/s calm breeze). Excellent conditions for foliar bio-fertilizer, micronutrient foliar spray, and pest management."
            wind_task_ta = f"சிறந்த தெளிப்பு நேரம் ({wind_speed:.1f} m/s மிதமான காற்று). இலைவழி உரம் மற்றும் பூச்சிக்கொல்லி மருந்து தெளிக்க மிகவும் சாதகமானது."
        else:
            wind_task = f"Moderate breeze ({wind_speed:.1f} m/s). Suitable for ground tractor boom spraying with drift-reducing nozzles. Avoid fine misting."
            wind_task_ta = f"மிதமான காற்று ({wind_speed:.1f} m/s). தரைமட்ட தெளிப்பான்களை கொண்டு குறைந்த அழுத்தத்தில் தெளிக்கலாம்."

        # 3. Dedicated Rain Task (Irrigation Shutdown, Trench Drainage, Soil Compaction)
        if rain_risk_pct >= 50 or rain_1h > 1.0:
            rain_task = f"Irrigation shutdown & drainage alert ({rain_risk_pct}% rain probability). Turn off automated drip/flood irrigation and clear field drainage channels to prevent root rot."
            rain_task_ta = f"மழை எச்சரிக்கை ({rain_risk_pct}% வாய்ப்பு). சொட்டுநீர் பாசனத்தை நிறுத்தி, வயலில் தேங்கும் நீரை வெளியேற்ற வடிகால் வசதியை சரிபார்க்கவும்."
            risk_level = "moderate"
        elif rain_risk_pct >= 25:
            rain_task = f"Cautious irrigation ({rain_risk_pct}% rain chance). Reduce scheduled irrigation runtime by 40-50% and probe root zone soil moisture before next watering."
            rain_task_ta = f"லேசான மழை வாய்ப்பு ({rain_risk_pct}%). வழக்கமான நீர் பாய்ச்சும் அளவை 50% குறைத்து, மண்ணின் ஈரப்பதத்தை சோதித்து நீர் பாய்ச்சவும்."
        else:
            rain_task = f"Routine irrigation active ({rain_risk_pct}% low rain risk). Soil moisture demand is normal. Continue scheduled drip fertigation and routine crop maintenance."
            rain_task_ta = f"வழக்கமான பாசனம் தொடரலாம் ({rain_risk_pct}% குறைந்த மழை வாய்ப்பு). திட்டமிட்ட சொட்டுநீர் மற்றும் உர பாசனத்தை தொடரவும்."

        # Standard composite advisories
        if rain_risk_pct >= 50 or rain_1h > 1.0:
            irrigation = "Rain expected today. Defer scheduled drip or flood irrigation to prevent root zone waterlogging."
        elif humidity < 40 and temperature > 34:
            irrigation = "High evapotranspiration rate. Increase irrigation duration or schedule evening pulse watering."
        else:
            irrigation = "Soil moisture demand is normal. Continue routine irrigation cycle."

        if wind_speed >= 5.5:
            spray = f"Breezy conditions (wind {wind_speed:.1f} m/s). Postpone chemical or fertilizer foliar spraying to prevent spray drift."
        elif rain_risk_pct >= 60:
            spray = "Rain probability is high (>60%). Delay spraying as rainfall will wash off applied treatments."
        else:
            spray = "Wind and precipitation parameters are optimal for foliar nutrient and pest protection spraying."

        if temperature >= 37.0:
            fieldwork = f"Extreme heat alert ({temperature:.1f}°C). Restrict intense outdoor labour to early morning (before 10 AM) or after 4 PM. Maintain mulch coverage."
            risk_level = "extreme"
        elif temperature >= 35.0:
            fieldwork = f"Elevated temperature ({temperature:.1f}°C). Monitor vegetable nurseries and tender transplants for heat wilting."
            risk_level = "moderate" if risk_level == "low" else risk_level
        elif rain_risk_pct >= 70:
            fieldwork = "High probability of rain. Avoid running heavy machinery on wet fields to minimize soil compaction."
        else:
            fieldwork = "Favorable agricultural conditions for intercultural weeding, ploughing, and crop inspection."

        # 4. Actionable Top Summary
        if risk_level == "extreme":
            summary = "Extreme heat alert: Protect seedlings with mulch and irrigate early morning."
        elif wind_speed >= 5.5:
            summary = "High wind speed detected: Postpone foliar spraying until winds calm."
        elif rain_risk_pct >= 50:
            summary = "Rain expected: Check field moisture before turning on irrigation."
        elif humidity >= 80:
            summary = "High humidity detected: Monitor crop canopy for fungal diseases."
        else:
            summary = "Weather conditions are optimal for general crop maintenance and field tasks."

        return AgriculturalAdvisoryResponse(
            actionable_summary=summary,
            irrigation_advisory=irrigation,
            spray_advisory=spray,
            fieldwork_advisory=fieldwork,
            humidity_task=humidity_task,
            wind_task=wind_task,
            rain_task=rain_task,
            humidity_task_ta=humidity_task_ta,
            wind_task_ta=wind_task_ta,
            rain_task_ta=rain_task_ta,
            risk_level=risk_level
        )

    @classmethod
    def _fallback_current(cls, lat: float, lon: float, location_name: str = "Cauvery Delta Field") -> WeatherCurrentResponse:
        """Realistic tropical agricultural microclimate simulation when network is offline."""
        temp = 29.5
        humidity = 68
        wind = 3.6
        rain_risk = 25
        advisory = cls.generate_advisory(temp, humidity, wind, rain_risk)

        return WeatherCurrentResponse(
            location_name=location_name,
            latitude=lat,
            longitude=lon,
            temperature=temp,
            feels_like=32.0,
            temp_min=24.0,
            temp_max=32.5,
            humidity=humidity,
            pressure=1010,
            wind_speed=wind,
            wind_deg=120,
            condition="Partly Cloudy",
            description="scattered clouds with warm breeze",
            icon="03d",
            rain_1h=0.0,
            rain_risk_pct=rain_risk,
            cloudiness_pct=40,
            advisory=advisory,
            source="microclimate_simulation"
        )

    @classmethod
    async def get_current_weather(
        cls,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        location_name: Optional[str] = None
    ) -> WeatherCurrentResponse:
        resolved_lat, resolved_lon, resolved_name = cls.resolve_location(lat, lon, location_name)
        key = cls._cache_key(resolved_lat, resolved_lon, resolved_name)
        now = time.time()

        # Check Cache
        if key in _CURRENT_CACHE:
            cached_time, cached_res = _CURRENT_CACHE[key]
            if now - cached_time < CACHE_TTL_SECONDS:
                res = cached_res.model_copy()
                res.location_name = resolved_name
                res.source = "cached_openweather"
                return res

        api_key = settings.OPENWEATHER_API_KEY
        if not api_key:
            return cls._fallback_current(resolved_lat, resolved_lon, resolved_name)

        # Live OpenWeather Query: try city name first for exact regional targeting
        url = f"{settings.OPENWEATHER_BASE_URL}/weather"
        clean_q = resolved_name.split(",")[0].strip()
        params = {
            "q": f"{clean_q},IN",
            "appid": api_key,
            "units": "metric"
        }

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url, params=params)

            # Fallback to coordinates if city query failed
            if resp.status_code != 200:
                params = {
                    "lat": resolved_lat,
                    "lon": resolved_lon,
                    "appid": api_key,
                    "units": "metric"
                }
                async with httpx.AsyncClient(timeout=5.0) as client:
                    resp = await client.get(url, params=params)

            if resp.status_code == 200:
                data = resp.json()
                temp = float(data["main"]["temp"])
                feels_like = float(data["main"]["feels_like"])
                temp_min = float(data["main"]["temp_min"])
                temp_max = float(data["main"]["temp_max"])
                humidity = int(data["main"]["humidity"])
                pressure = int(data["main"]["pressure"])
                wind_speed = float(data["wind"]["speed"])
                wind_deg = int(data["wind"].get("deg", 0))
                clouds = int(data["clouds"].get("all", 0))

                weather_item = data["weather"][0] if data.get("weather") else {}
                condition = weather_item.get("main", "Clear")
                description = weather_item.get("description", "clear sky")
                icon = weather_item.get("icon", "01d")

                rain_1h = float(data.get("rain", {}).get("1h", 0.0))
                if rain_1h > 2.0 or condition.lower() in ["thunderstorm", "rain"]:
                    rain_risk = min(80 + int(rain_1h * 5), 100)
                elif condition.lower() in ["drizzle"]:
                    rain_risk = 60
                elif clouds > 70:
                    rain_risk = 45
                elif clouds > 40:
                    rain_risk = 25
                else:
                    rain_risk = 10

                loc_name = resolved_name
                advisory = cls.generate_advisory(temp, humidity, wind_speed, rain_risk, rain_1h)

                result = WeatherCurrentResponse(
                    location_name=loc_name,
                    latitude=resolved_lat,
                    longitude=resolved_lon,
                    temperature=temp,
                    feels_like=feels_like,
                    temp_min=temp_min,
                    temp_max=temp_max,
                    humidity=humidity,
                    pressure=pressure,
                    wind_speed=wind_speed,
                    wind_deg=wind_deg,
                    condition=condition,
                    description=description,
                    icon=icon,
                    rain_1h=rain_1h,
                    rain_risk_pct=rain_risk,
                    cloudiness_pct=clouds,
                    advisory=advisory,
                    source="live_openweather"
                )

                _CURRENT_CACHE[key] = (now, result)
                return result
            else:
                return cls._fallback_current(resolved_lat, resolved_lon, resolved_name)

        except Exception as e:
            return cls._fallback_current(resolved_lat, resolved_lon, resolved_name)

    @classmethod
    async def get_forecast(
        cls,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        location_name: Optional[str] = None
    ) -> WeatherForecastResponse:
        resolved_lat, resolved_lon, resolved_name = cls.resolve_location(lat, lon, location_name)
        key = cls._cache_key(resolved_lat, resolved_lon, resolved_name)
        now = time.time()

        if key in _FORECAST_CACHE:
            cached_time, cached_res = _FORECAST_CACHE[key]
            if now - cached_time < CACHE_TTL_SECONDS:
                res = cached_res.model_copy()
                res.location_name = resolved_name
                res.current.location_name = resolved_name
                return res

        current_res = await cls.get_current_weather(resolved_lat, resolved_lon, resolved_name)
        api_key = settings.OPENWEATHER_API_KEY

        hourly_list: List[ForecastPeriod] = []
        daily_list: List[ForecastDay] = []

        if api_key:
            url = f"{settings.OPENWEATHER_BASE_URL}/forecast"
            clean_q = resolved_name.split(",")[0].strip()
            params = {
                "q": f"{clean_q},IN",
                "appid": api_key,
                "units": "metric"
            }
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    resp = await client.get(url, params=params)

                # Fallback to coordinates if city query failed
                if resp.status_code != 200:
                    params = {
                        "lat": resolved_lat,
                        "lon": resolved_lon,
                        "appid": api_key,
                        "units": "metric"
                    }
                    async with httpx.AsyncClient(timeout=5.0) as client:
                        resp = await client.get(url, params=params)

                if resp.status_code == 200:
                    data = resp.json()
                    raw_items = data.get("list", [])

                    # Parse next 8 periods (~24 hours) for hourly
                    for item in raw_items[:8]:
                        dt_txt = item.get("dt_txt", "")
                        time_part = dt_txt.split(" ")[1][:5] if " " in dt_txt else ""
                        w = item.get("weather", [{}])[0]
                        pop = int(float(item.get("pop", 0.0)) * 100)

                        hourly_list.append(ForecastPeriod(
                            time=time_part,
                            temperature=float(item["main"]["temp"]),
                            feels_like=float(item["main"]["feels_like"]),
                            condition=w.get("main", "Clear"),
                            description=w.get("description", ""),
                            icon=w.get("icon", "01d"),
                            humidity=int(item["main"]["humidity"]),
                            wind_speed=float(item["wind"]["speed"]),
                            rain_prob_pct=pop
                        ))

                    # Aggregate by day for daily forecast (5 days)
                    days_map: Dict[str, List[Dict[str, Any]]] = {}
                    for item in raw_items:
                        day_str = item.get("dt_txt", "").split(" ")[0]
                        if day_str not in days_map:
                            days_map[day_str] = []
                        days_map[day_str].append(item)

                    for day_str, items in list(days_map.items())[:5]:
                        temps = [float(it["main"]["temp"]) for it in items]
                        hums = [int(it["main"]["humidity"]) for it in items]
                        pops = [int(float(it.get("pop", 0.0)) * 100) for it in items]
                        winds = [float(it["wind"]["speed"]) for it in items]

                        mid_item = items[len(items) // 2]
                        w = mid_item.get("weather", [{}])[0]
                        avg_rain_prob = max(pops) if pops else 0
                        avg_wind = max(winds) if winds else 3.0

                        try:
                            day_dt = datetime.strptime(day_str, "%Y-%m-%d")
                            day_name = day_dt.strftime("%a")
                        except Exception:
                            day_name = day_str

                        day_advisory = "Good day for routine operations"
                        if avg_rain_prob >= 50:
                            day_advisory = "Rain expected - check irrigation needs"
                        elif avg_wind >= 6.0:
                            day_advisory = "Windy - avoid pesticide spraying"
                        elif max(temps) >= 36:
                            day_advisory = "High heat - ensure mulch protection"

                        daily_list.append(ForecastDay(
                            date=day_str,
                            day_name=day_name,
                            temp_min=min(temps),
                            temp_max=max(temps),
                            condition=w.get("main", "Clear"),
                            description=w.get("description", ""),
                            icon=w.get("icon", "01d"),
                            humidity_avg=int(sum(hums) / len(hums)) if hums else 60,
                            rain_prob_pct=avg_rain_prob,
                            advisory=day_advisory
                        ))
            except Exception:
                pass

        # Fallback daily and hourly if empty
        if not hourly_list:
            base_temp = current_res.temperature
            for i, h in enumerate(["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"]):
                hourly_list.append(ForecastPeriod(
                    time=h,
                    temperature=round(base_temp + (i % 3) - 1, 1),
                    feels_like=round(base_temp + (i % 3) + 1, 1),
                    condition="Partly Cloudy",
                    description="scattered clouds",
                    icon="02d",
                    humidity=65 + (i * 2),
                    wind_speed=3.5,
                    rain_prob_pct=20 + (i * 5)
                ))

        if not daily_list:
            for day_offset in range(5):
                daily_list.append(ForecastDay(
                    date=f"Day +{day_offset+1}",
                    day_name=["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day_offset % 7],
                    temp_min=23.0,
                    temp_max=32.0,
                    condition="Partly Cloudy",
                    description="scattered clouds",
                    icon="02d",
                    humidity_avg=65,
                    rain_prob_pct=30,
                    advisory="Favorable for general field maintenance"
                ))

        result = WeatherForecastResponse(
            location_name=resolved_name,
            latitude=resolved_lat,
            longitude=resolved_lon,
            current=current_res,
            daily=daily_list,
            hourly=hourly_list,
            source=current_res.source
        )

        _FORECAST_CACHE[key] = (now, result)
        return result
