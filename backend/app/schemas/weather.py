from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class AgriculturalAdvisoryResponse(BaseModel):
    actionable_summary: str = Field(..., description="Top summary for farmer home card")
    irrigation_advisory: str = Field(..., description="Actionable recommendation on watering")
    spray_advisory: str = Field(..., description="Recommendation on pesticide/foliar spray safety")
    fieldwork_advisory: str = Field(..., description="Guidance on harvesting, sowing, or weeding")
    humidity_task: str = Field(default="Normal humidity. Ideal for weeding and field tasks.", description="Actionable task for current humidity")
    wind_task: str = Field(default="Safe wind conditions for spraying.", description="Actionable task for current wind speed")
    rain_task: str = Field(default="Routine irrigation cycle active.", description="Actionable task for current rain risk")
    humidity_task_ta: Optional[str] = Field(default=None, description="Tamil translation for humidity task")
    wind_task_ta: Optional[str] = Field(default=None, description="Tamil translation for wind task")
    rain_task_ta: Optional[str] = Field(default=None, description="Tamil translation for rain task")
    risk_level: str = Field("low", description="low, moderate, high, extreme")


class WeatherCurrentResponse(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    temperature: float
    feels_like: float
    temp_min: float
    temp_max: float
    humidity: int
    pressure: int
    wind_speed: float
    wind_deg: Optional[int] = 0
    condition: str
    description: str
    icon: str
    rain_1h: float = 0.0
    rain_risk_pct: int
    cloudiness_pct: int
    advisory: AgriculturalAdvisoryResponse
    source: str = Field("live_openweather", description="live_openweather, cached_openweather, simulation")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ForecastPeriod(BaseModel):
    time: str
    temperature: float
    feels_like: float
    condition: str
    description: str
    icon: str
    humidity: int
    wind_speed: float
    rain_prob_pct: int


class ForecastDay(BaseModel):
    date: str
    day_name: str
    temp_min: float
    temp_max: float
    condition: str
    description: str
    icon: str
    humidity_avg: int
    rain_prob_pct: int
    advisory: str


class WeatherForecastResponse(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    current: WeatherCurrentResponse
    daily: List[ForecastDay]
    hourly: List[ForecastPeriod]
    source: str = "live_openweather"
