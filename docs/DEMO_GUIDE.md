# AGRIASSIST — Professional Demonstration & Presentation Guide

> **Tagline:** *"Your Farm. Your Data. Smarter Decisions."*  
> **Platform:** Mobile-First Agricultural Decision Intelligence Platform  
> **Stack:** React 18 + Vite + TypeScript + Tailwind CSS | FastAPI + MySQL 8.0 + SQLAlchemy 2.0 + Alembic | EfficientNetB0 + OpenRouter AI + Web Speech STT/TTS

---

## 1. Executive Summary for Evaluators & Reviewers

AgriAssist is designed to solve the fragmentation of agricultural information facing smallholder and commercial farmers. Instead of disconnected apps for weather, disease diagnosis, and trading, AgriAssist unifies **Farmer Identity**, **Geospatial Farm Parcels**, **Soil Chemistry**, **Hyperlocal Weather Rules**, **Phenological Crop Calendars**, **Deep Learning Leaf Diagnostics**, **Bilingual Voice Reasoning AI**, and **Three Local Marketplaces** into an integrated decision engine.

---

## 2. Quick Demonstration Preparation (Pre-Flight Checklist)

1. **Database:** Ensure MySQL 8.0 is running on Port 3307 (`agriassist_db`).
2. **Backend:**
   ```bash
   cd backend
   # In Python 3.10 virtual environment:
   uvicorn app.main:app --reload --port 8000
   ```
   *Swagger Docs available at:* `http://localhost:8000/docs`
3. **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   *Application available at:* `http://localhost:5173`

---

## 3. Step-by-Step Presentation Script & Feature Walkthrough

### Act I: Farmer Onboarding & Geospatial Parcel Setup
- **Action:** Open `http://localhost:5173/signup`.
- **Narration:** *"We onboard the farmer with essential identity attributes: full name, phone number, village location, and language preference (English or தமிழ்)."*
- **Action:** Log in and navigate to **My Farm** (`/farm`).
- **Narration:** *"A farm is not just an address; it is a geospatial entity with unique soil and irrigation constraints."*
- **Highlight:**
  - Click **"Add Farm Parcel"**.
  - Drop a pin on the interactive **Leaflet OpenStreetMap** (`MapPicker.tsx`) or click **"Locate Me"** for GPS coordinates.
  - Set land area (e.g. 5.5 Acres), soil type (e.g. Loamy Soil), and water source (Borewell + Drip Irrigation).
  - Inspect the **Soil Health Card** with real-time evaluation of NPK (Nitrogen, Phosphorus, Potassium) and pH (6.5 - Ideal neutral).

---

### Act II: Real-Time Microclimate Intelligence & Agronomic Rules
- **Action:** Navigate to **Home** (`/`) or inspect the **Weather Card**.
- **Narration:** *"Generic weather forecasts tell you if it's 30°C. AgriAssist converts weather data into agronomic action rules."*
- **Highlight:**
  - Dynamic time-of-day greeting (e.g. *காலை வணக்கம், விவசாயி!* or *Good morning, Farmer!*).
  - Microclimate indicators: Temperature, Humidity, Wind Speed, Rain Probability.
  - **4 Agronomic Decision Rules:**
    1. *Spraying Restrictions:* If wind speed exceeds 15 km/h, the system advises delaying foliar sprays to prevent chemical drift.
    2. *Irrigation Scheduling:* If rain risk exceeds 60%, irrigation is postponed to conserve ground water and electricity.
    3. *Heat Stress Advisory:* If temperature exceeds 36°C, warnings are issued for moisture conservation.
    4. *Fungal Disease Alert:* High humidity (>80%) triggers preventive fungicide recommendations.

---

### Act III: 4 Pillars of Explainable Agronomy & Cultivation Calendar
- **Action:** Navigate to **Crop Recommendations** (`/recommendations`) and **Calendar** (`/calendar`).
- **Narration:** *"Farmers distrust black-box AI. AgriAssist provides Explainable Agronomy with 4 distinct pillars:"*
  1. **WHAT:** The specific high-yield variety (e.g., *Paddy - CR 1009 Sub 1* or *Turmeric - BSR 2*).
  2. **WHY:** Soil match score, microclimate suitability, water availability alignment, and market demand forecast.
  3. **WHEN:** Precise planting window based on seasonal monsoon onset.
  4. **NEXT STEPS:** Certified seed sourcing, basal fertilizer dosing, and nursery bed preparation.
- **Cultivation Phenology Timeline:**
  - Launch an active cultivation cycle.
  - Show automated stage task generation across: *Nursery Bed → Vegetative Growth → Panicle Initiation → Flowering → Grain Filling → Harvest*.
  - Mark a scheduled task as completed with 1-click.

---

### Act IV: Deep Learning Leaf Disease Detection (EfficientNetB0)
- **Action:** Navigate to **Disease Analysis** (`/disease`).
- **Narration:** *"Early disease identification prevents crop failure. We deployed an EfficientNetB0 convolutional neural network trained on 16 PlantVillage leaf classes."*
- **Highlight:**
  - Drag-and-drop or upload a leaf image (Tomato Early Blight, Potato Late Blight, Bell Pepper Bacterial Spot, or Healthy Leaf).
  - Binary header verification: Raw magic bytes (`\xff\xd8\xff`, `\x89PNG`, `RIFF...WEBP`) are validated on the backend to reject scripts or malicious payloads.
  - Instant classification output showing:
    - **Disease Name & Confidence Score** (e.g., 96.8% Tomato Early Blight).
    - **Pathogen Etiology:** Fungal pathogen *Alternaria solani*.
    - **Bilingual Treatment Protocol:** Organic neem extract options and chemical remedies (Mancozeb / Copper Oxychloride) with dosage and safety withholding periods.
    - Historical scan record saved to user's diagnostics history.

---

### Act V: AI Agricultural Reasoning Agent & Bilingual Voice Assistant
- **Action:** Open **AI Agent** (`/ai-agent`) or click the **Voice Assistant** mic button in the top header.
- **Narration:** *"AgriAssist features a conversational agent powered by OpenRouter Nemotron-3 ultra with agricultural function calling and Tamil + English speech recognition."*
- **Highlight:**
  - **Agricultural Guardrail:** Ask a non-farming question (e.g. *"Who won the cricket match?"* or *"Write a Python sorting algorithm"*). The agent politely declines, reinforcing domain trust.
  - **Tool Calling:** Ask *"What is the weather on my farm and should I spray pesticide today?"*
  - Watch the agent execute the `get_weather_data` tool, inspect wind speed and rain probability, and synthesize a grounded agronomic recommendation.
  - **Voice Interaction:** Tap the microphone, speak in Tamil (*"என் நெல் பயிரில் இலை சுருட்டு புழு தாக்குதல் உள்ளது, என்ன மருந்து தெளிக்க வேண்டும்?"*), observe speech recognition, receive localized agronomic advice, and listen to spoken audio playback via Web Speech TTS.

---

### Act VI: Three Hyperlocal Community Marketplaces
- **Action:** Navigate to **Shop** (`/market`), **Labours** (`/labours`), and **Rentals** (`/rentals`).
- **Narration:** *"Farmers require three distinct economic networks to succeed: selling produce, hiring seasonal labour crews, and leasing machinery/land."*
- **Highlight:**
  1. **Produce Marketplace:** Farmers list harvested crops (Paddy, Turmeric, Coconuts, Tomatoes) with quantity, price per kg/bag, harvest date, and direct WhatsApp buyer chat.
  2. **Farm Labour Marketplace:** Skilled agricultural workers and crew leaders list availability (Paddy Transplanting, Weed Control, Coconut Climbing, Harvester Operators) with daily wage rates and phone calling.
  3. **Farmland & Equipment Rentals:** Landowners list agricultural plots and tractors with water availability, soil type, and exact Leaflet GPS coordinates.
  4. **Security & Ownership:** Strict 403 Forbidden enforcement prevents unauthorized farmers from editing or deleting other users' listings.

---

### Act VII: Notifications, Settings & Bilingual Localization
- **Action:** Navigate to **Notifications** (`/notifications`) and **Settings** (`/settings`).
- **Highlight:**
  - Dynamic unread notification counter badge in the header.
  - Filter alerts by Weather, Cultivation, and Market categories.
  - Toggle between **English** and **தமிழ் (Tamil)**: The entire application instantly updates labels, navigation, and greetings without page refresh.
  - Security management: Update password and toggle SMS/push notification preferences.

---

## 4. Technical Architecture Verification

| Component | Implementation | Verification Status |
|---|---|---|
| **Backend REST API** | FastAPI + Pydantic v2 | 29 Automated Tests Passing (100%) |
| **Relational Database** | MySQL 8.0 (18+ Normalized Tables) | Alembic Migrations Up-to-date |
| **Frontend Framework** | React 18 + Vite + TypeScript | Production build clean (0 errors) |
| **Code Splitting** | `React.lazy` + Rollup `manualChunks` | Entry bundle reduced from 687kB to 56kB |
| **Security Headers** | `SecurityHeadersMiddleware` | HSTS, X-Frame-Options, CSP, nosniff |
| **File Upload Security** | Magic Byte Binary Signature Check | Executables & polyglots rejected (400) |
| **Ownership Isolation** | `ForbiddenException` (HTTP 403) | Cross-user data mutation strictly blocked |
