from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    DB_HOST: str = "localhost"
    DB_PORT: int = 3307
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "agriassist_db"

    # AI Engine
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "nvidia/nemotron-3-ultra-550b-a55b:free"

    # Weather API
    OPENWEATHER_API_KEY: str = ""
    OPENWEATHER_BASE_URL: str = "https://api.openweathermap.org/data/2.5"

    # Security & Auth
    JWT_SECRET: str = "agriassist_jwt_secret_key_smarter_decisions_for_every_acre_2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # ML
    DISEASE_MODEL_PATH: str = "../ml/models/best_leaf_disease_model.keras"
    CLASS_NAMES_PATH: str = "../ml/models/class_names.json"

    # Application
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def database_url(self) -> str:
        # PyMySQL connection string with URL-encoded password
        import urllib.parse
        pwd = f":{urllib.parse.quote_plus(self.DB_PASSWORD)}" if self.DB_PASSWORD else ""
        return f"mysql+pymysql://{self.DB_USER}{pwd}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
