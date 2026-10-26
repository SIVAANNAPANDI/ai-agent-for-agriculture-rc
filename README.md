# AGRIASSIST

> *"Your Farm. Your Data. Smarter Decisions."*

AgriAssist is a mobile-first, enterprise-grade agricultural decision intelligence platform engineered for modern farmers, agricultural officers, and agribusinesses. Rather than isolating individual features into disconnected tools, AgriAssist unifies **Farmer Profiles**, **Geospatial Farm Parcels**, **Soil Chemistry Diagnostics**, **Live Microclimate Weather Intelligence**, **Explainable Crop Recommendations (4 Pillars)**, **Phenological Cultivation Calendars**, **Deep Learning Leaf Disease Detection (EfficientNetB0)**, **OpenRouter AI Agriculture Reasoning Agent with Tool Calling**, **Bilingual Voice Assistant (Tamil + English)**, and **Three Hyperlocal Community Marketplaces** (Produce Shop, Farm Labour, Land/Property Rentals).

---

## 🌟 Key Capabilities & Feature Modules

1. **Farmer Profile & Geospatial Farm Parcels:**
   - Interactive Leaflet OpenStreetMap coordinate picker with browser GPS geolocation.
   - Farm specs: Acreage, land boundaries, water sources (Borewell, Canal, Rainfed), and irrigation methods (Drip, Sprinkler, Flood).
   - Multi-farm switcher with strict ownership isolation (HTTP 403 Forbidden on cross-user access).

2. **Soil Health Diagnostics:**
   - Soil profile management across 8 soil classifications (Clay, Sandy, Loamy, Silty, Red, Black, Laterite).
   - NPK (Nitrogen, Phosphorus, Potassium) metric gauges with color-coded status evaluation.
   - Soil pH evaluation (Acidic, Neutral, Alkaline) and organic matter diagnostics.

3. **Hyperlocal Weather Decision Intelligence:**
   - 5-day / 3-hour microclimate forecast powered by OpenWeatherMap with in-memory 30-minute caching.
   - 4 Actionable Agronomic Rules:
     - *Spraying Wind Restrictions:* Delay foliar sprays when wind exceeds 15 km/h.
     - *Irrigation Delay:* Postpone irrigation when rain probability exceeds 60%.
     - *Heat Stress Warnings:* Extreme heat alerts (>36°C) for moisture conservation.
     - *Fungal Disease Advisories:* High relative humidity (>80%) triggers preventive fungicide recommendations.

4. **Explainable Crop Recommendation Engine:**
   - Dynamic suitability scoring matching soil pH, NPK, temperature, rainfall, and season.
   - **4 Pillars of Explainable Agronomy:**
     - **WHAT:** Recommended crop variety and expected yield potential.
     - **WHY:** Agronomic score breakdown (Soil pH match, NPK suitability, water availability).
     - **WHEN:** Precise sowing window aligned with regional monsoon patterns.
     - **NEXT STEPS:** Seed treatment protocols, basal fertilizer dosage, and seedbed preparation.

5. **Phenological Cultivation Calendar:**
   - Crop lifecycle tracking across key phenological stages (Nursery, Vegetative, Flowering, Grain Filling, Maturity).
   - Automated stage task scheduler generating timeline-based activities (Weeding, Top Dressing, Pest Scouting, Irrigation).
   - Task progression tracking with 1-click status completion.

6. **Deep Learning Leaf Disease Scanner:**
   - Convolutional Neural Network (EfficientNetB0) trained on 16 PlantVillage leaf classes.
   - Raw binary magic bytes verification (`\xff\xd8\xff`, `\x89PNG`, `RIFF...WEBP`) rejecting scripts or executables.
   - Immediate diagnosis with confidence scoring, pathogen etiology, and bilingual treatment protocols (organic remedies & chemical controls).
   - Automatic scan archiving into user diagnostic history.

7. **AI Agriculture Reasoning Agent with Multi-Tool Calling:**
   - Powered by OpenRouter (`nvidia/nemotron-3-ultra-550b-a55b:free` or fallback reasoning engine).
   - Agricultural guardrail enforcing strict domain relevance (politely declines non-agricultural inquiries).
   - Function calling tools: `get_weather_data`, `get_soil_recommendations`, `calculate_fertilizer_dosage`.
   - Multi-turn conversation persistence in MySQL.

8. **Bilingual Voice Assistant (Tamil + English):**
   - Browser-native Web Speech API Speech-to-Text (STT) supporting `ta-IN` and `en-IN`.
   - Text-to-Speech (TTS) engine reading aloud agricultural responses in Tamil or English.
   - Animated floating voice interaction modal accessible from any screen.

9. **Three Hyperlocal Community Marketplaces:**
   - **Produce Marketplace:** Direct farm-to-consumer/buyer sales with quantity, price/unit, harvest date, and direct WhatsApp buyer messaging.
   - **Farm Labour Marketplace:** Skilled agricultural labour crew directory (Transplanting, Harvesting, Weeding, Spraying) with daily wage rates and direct phone contact.
   - **Farmland & Equipment Rentals:** Agricultural land leases and tractor/borewell rentals with water availability, soil type, and exact Leaflet GPS map pins.

10. **In-App Notification Center & User Settings:**
    - Live unread notification counter badge in the header.
    - Category filtering across Weather warnings, Cultivation milestones, and Marketplace inquiries.
    - Full bilingual toggle (`English` / `தமிழ்`) updating the entire interface in real-time.
    - Account security management with password change verification.

---

## 🏛️ System Architecture

```
agriassist/
├── frontend/                        # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/              # Atomic UI components, Layout, Modals, MapPicker, Weather, Voice
│   │   ├── contexts/                # AuthContext, LanguageContext
│   │   ├── pages/                   # Lazy-loaded pages (Home, Farm, Calendar, AI, Disease, Market, Labour, Rental, Settings)
│   │   ├── services/                # Axios API services (auth, farm, weather, cultivation, ai, disease, market, rental)
│   │   ├── hooks/                   # Custom hooks (useAuth, useLanguage, useSpeechRecognition, useSpeechSynthesis)
│   │   └── types/                   # TypeScript interfaces and domain schemas
│   └── vite.config.ts               # Rollup code-splitting & manual chunks configuration
│
├── backend/                         # FastAPI + SQLAlchemy 2.0 + Alembic + MySQL 8.0
│   ├── app/
│   │   ├── core/                    # Security, JWT tokens, bcrypt, configuration settings, exceptions
│   │   ├── database/                # SQLAlchemy sessionmaker, declarative base
│   │   ├── middleware/              # SecurityHeadersMiddleware, image binary magic byte validation
│   │   ├── models/                  # 18 normalized SQLAlchemy models (users, farms, soils, crops, cultivation, etc.)
│   │   ├── repositories/            # Data access layer with strict ownership isolation
│   │   ├── routers/                 # Domain API routers (auth, users, farms, weather, crops, cultivation, ai, disease, market, labour, rental, notifications)
│   │   ├── schemas/                 # Pydantic v2 request/response validation models
│   │   └── services/                # Business logic engines (weather, recommendations, cultivation, ai, disease, rental)
│   ├── alembic/                     # Database migrations
│   └── tests/                       # 14 Pytest test suites covering 29 unit and integration tests
│
├── ml/                              # PlantVillage Deep Learning Leaf Diagnostics
│   ├── models/                      # EfficientNetB0 Keras model (best_leaf_disease_model.keras)
│   └── inference/                   # Singleton model loader, image preprocessing, bilingual treatment advisory
│
└── docs/                            # Comprehensive documentation
    ├── ARCHITECTURE.md              # Complete system architecture and entity-relationship diagrams
    └── DEMO_GUIDE.md                # Demonstration script and presentation walkthrough
```

---

## 🚀 Getting Started

### Prerequisites
- **Python:** 3.10.x
- **Node.js:** v18+ (verified on v24.14.0) & npm
- **Database:** MySQL 8.0 running on Port 3307 (or configured port)

### 1. Database Setup
Ensure MySQL is running, then create the database:
```sql
CREATE DATABASE IF NOT EXISTS agriassist_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Installation & Run
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # On Windows
# source venv/bin/activate     # On Linux / macOS

pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
- API Base: `http://localhost:8000`
- Swagger Interactive Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 3. Frontend Installation & Run
```bash
cd frontend
npm install

# Start Vite development server
npm run dev
```
- Application Web Interface: `http://localhost:5173`

---

## 🧪 Testing & Verification

### Backend Automated Test Suite
The backend contains 14 comprehensive test suites covering authentication, farm CRUD, weather rules, cultivation workflows, recommendation engine, deep learning inference, all 3 marketplaces, security headers, magic bytes validation, and cross-user ownership isolation:
```bash
cd backend
pytest -v tests/
```
**Test Results:** 29 passed in ~30s (100% pass rate).

### Frontend Production Build
```bash
cd frontend
npm run build
```
**Build Performance:**
- Code-splitting with `React.lazy` and Rollup `manualChunks`.
- Main index bundle: **56.45 kB** (down from 687 kB, >92% reduction).
- Zero TypeScript or linting errors.

---

## 📖 Presentation & Demonstration Guide
For evaluators, instructors, and presentation audiences, refer to [`docs/DEMO_GUIDE.md`](./docs/DEMO_GUIDE.md) for a structured 7-act presentation walkthrough covering:
- Geospatial Map Pin Dropping
- Live Microclimate Rules & Heat Stress Alerts
- 4 Pillars of Explainable Agronomy
- Leaf Disease Diagnosis with EfficientNetB0
- Bilingual Tamil + English Voice Assistant with Multi-Tool Calling
- Three Hyperlocal Community Marketplaces

---

## 🔒 Security Architecture
- **JWT Authentication:** Stateful salted bcrypt passwords, stateless HS256 tokens.
- **Strict Ownership Isolation:** All queries verify current authenticated user ID against resource ownership; unauthorized mutations return HTTP 403 Forbidden.
- **Binary Magic Byte Verification:** Uploaded leaf images are verified for raw binary signatures (`JPEG`, `PNG`, `WebP`), preventing malicious script execution.
- **HTTP Security Headers:** Automated injection of `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and `Referrer-Policy`.
