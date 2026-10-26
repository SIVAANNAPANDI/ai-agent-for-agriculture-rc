import { api } from "./api";

export interface AgriculturalAdvisory {
  actionable_summary: string;
  irrigation_advisory: string;
  spray_advisory: string;
  fieldwork_advisory: string;
  humidity_task?: string;
  wind_task?: string;
  rain_task?: string;
  humidity_task_ta?: string;
  wind_task_ta?: string;
  rain_task_ta?: string;
  risk_level: "low" | "moderate" | "high" | "extreme";
}

export interface WeatherCurrent {
  location_name: string;
  latitude: number;
  longitude: number;
  temperature: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  condition: string;
  description: string;
  icon: string;
  rain_1h: number;
  rain_risk_pct: number;
  cloudiness_pct: number;
  advisory: AgriculturalAdvisory;
  source: "live_openweather" | "cached_openweather" | "microclimate_simulation";
  timestamp: string;
}

export interface ForecastPeriod {
  time: string;
  temperature: number;
  feels_like: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  wind_speed: number;
  rain_prob_pct: number;
}

export interface ForecastDay {
  date: string;
  day_name: string;
  temp_min: number;
  temp_max: number;
  condition: string;
  description: string;
  icon: string;
  humidity_avg: number;
  rain_prob_pct: number;
  advisory: string;
}

export interface WeatherForecast {
  location_name: string;
  latitude: number;
  longitude: number;
  current: WeatherCurrent;
  daily: ForecastDay[];
  hourly: ForecastPeriod[];
  source: string;
}

export const weatherService = {
  async getCurrentWeather(
    lat?: number,
    lon?: number,
    locationName?: string
  ): Promise<WeatherCurrent> {
    const res = await api.get<WeatherCurrent>("/api/weather/current", {
      params: { lat, lon, location_name: locationName },
    });
    return res.data;
  },

  async getForecast(
    lat?: number,
    lon?: number,
    locationName?: string
  ): Promise<WeatherForecast> {
    const res = await api.get<WeatherForecast>("/api/weather/forecast", {
      params: { lat, lon, location_name: locationName },
    });
    return res.data;
  },

  async getFarmWeather(farmId: number): Promise<WeatherForecast> {
    const res = await api.get<WeatherForecast>(`/api/weather/farm/${farmId}`);
    return res.data;
  },
};
