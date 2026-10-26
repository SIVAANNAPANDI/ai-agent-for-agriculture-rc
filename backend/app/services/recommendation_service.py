from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.crop import Crop, CropRequirement
from app.repositories.farm_repo import FarmRepository
from app.schemas.recommendation import CropRecommendationItem, CropRecommendationResponse
from app.core.exceptions import NotFoundException, ForbiddenException


class RecommendationService:
    @classmethod
    def get_recommendations_for_farm(
        cls,
        db: Session,
        farm_id: int,
        user: User
    ) -> CropRecommendationResponse:
        farm = FarmRepository.get_by_id(db, farm_id)
        if not farm:
            raise NotFoundException(f"Farm with id {farm_id} does not exist.")

        if farm.user_id != user.id:
            raise ForbiddenException("You do not have permission to view recommendations for this farm.")

        soil = farm.soil
        soil_type = (soil.soil_type if soil and soil.soil_type else "unknown").lower().strip()
        ph = float(soil.ph) if (soil and soil.ph is not None) else None
        irrigation_method = (farm.irrigation_method or "Drip").strip()
        water_source = (farm.water_source or "Borewell").strip()

        # Query all master crops
        crops = db.query(Crop).all()
        recommendation_items: List[CropRecommendationItem] = []

        for crop in crops:
            req = crop.requirement
            if not req:
                continue

            suitable_soils = [s.lower().strip() for s in (req.suitable_soil_types or [])]
            min_ph = float(req.min_ph) if req.min_ph is not None else 5.5
            max_ph = float(req.max_ph) if req.max_ph is not None else 7.5
            min_temp = float(req.min_temp_c) if req.min_temp_c is not None else 18.0
            max_temp = float(req.max_temp_c) if req.max_temp_c is not None else 35.0
            ideal_season = req.ideal_season or "Year-round"
            water_need = crop.water_requirement_level.lower()

            # 1. Soil Compatibility (30% weight)
            if soil_type == "unknown":
                soil_score = 23
                soil_compatible = True
                soil_msg = "Regional average soil texture assumed"
            elif any(s in soil_type for s in suitable_soils) or any(soil_type in s for s in suitable_soils):
                soil_score = 30
                soil_compatible = True
                soil_msg = f"{soil_type.title()} soil provides optimal root development and moisture aeration"
            else:
                soil_score = 12
                soil_compatible = False
                soil_msg = f"{soil_type.title()} soil requires organic matter amendment for {crop.name}"

            # 2. pH Compatibility (20% weight)
            if ph is None:
                ph_score = 16
                ph_compatible = True
                ph_msg = "pH unmeasured; regional 6.5 assumed"
            elif min_ph <= ph <= max_ph:
                ph_score = 20
                ph_compatible = True
                ph_msg = f"Soil pH {ph:.1f} is right in the ideal {min_ph:.1f} - {max_ph:.1f} range"
            elif (min_ph - 0.5) <= ph <= (max_ph + 0.5):
                ph_score = 13
                ph_compatible = True
                ph_msg = f"Soil pH {ph:.1f} is marginally near the target {min_ph:.1f} - {max_ph:.1f} range"
            else:
                ph_score = 6
                ph_compatible = False
                ph_msg = f"Soil pH {ph:.1f} deviates from required {min_ph:.1f} - {max_ph:.1f} range"

            # 3. Water & Irrigation Compatibility (25% weight)
            irrig_lower = irrigation_method.lower()
            water_src_lower = water_source.lower()
            if water_need == "high":
                if "rainfed" in irrig_lower and "rainfed" in water_src_lower:
                    water_score = 8
                    water_compatible = False
                    water_msg = f"{crop.name} requires high water volume; rainfed irrigation poses high drought risk"
                elif any(w in irrig_lower for w in ["flood", "drip", "sprinkler"]) or any(w in water_src_lower for w in ["canal", "borewell", "river"]):
                    water_score = 25
                    water_compatible = True
                    water_msg = f"{irrigation_method} with {water_source} guarantees consistent water supply for {crop.name}"
                else:
                    water_score = 18
                    water_compatible = True
                    water_msg = "Water supply is adequate with disciplined irrigation scheduling"
            elif water_need == "moderate":
                if "drip" in irrig_lower or "sprinkler" in irrig_lower or "borewell" in water_src_lower:
                    water_score = 25
                    water_compatible = True
                    water_msg = f"{irrigation_method} enables precision fertigation and water economy"
                else:
                    water_score = 20
                    water_compatible = True
                    water_msg = "Irrigation is compatible with moderate water requirements"
            else:  # low
                water_score = 25
                water_compatible = True
                water_msg = f"{crop.name} has low water requirements; highly resilient under {irrigation_method}"

            # 4. Climate / Season Score (25% weight)
            climate_score = 23

            total_score = min(100, max(15, soil_score + ph_score + water_score + climate_score))

            # Synthesize 4 Pillars of Explainable Reasoning
            what_summary = (
                f"{crop.name} ({crop.tamil_name}) achieves a {total_score}% suitability rating "
                f"for your {farm.land_area} {farm.area_unit} parcel."
            )

            why_reason = f"{soil_msg}. {ph_msg}. {water_msg}."

            when_window = f"Ideal planting window is {ideal_season}. Suitable thermal range: {min_temp:.0f}°C - {max_temp:.0f}°C."

            crop_lower = crop.name.lower()
            if "tomato" in crop_lower:
                next_steps = "Procure certified wilt-resistant hybrid seeds (e.g. Arka Rakshak). Treat with Trichoderma (10g/kg), prepare raised nursery beds, and test drip emitter discharge."
            elif "paddy" in crop_lower or "rice" in crop_lower:
                next_steps = "Acquire certified short-duration seeds (e.g. CO-51 / ADT-45). Treat with Azospirillum, prepare wet nursery bed, and level main field puddle."
            elif "turmeric" in crop_lower:
                next_steps = "Procure healthy, pathogen-free mother rhizomes (BSR-2 or Pragati). Treat with Pseudomonas fluorescens (10g/L), prepare 120cm raised ridges with drip laterals."
            elif "potato" in crop_lower:
                next_steps = "Obtain certified seed tubers from recognized seed source. Store in cool shade, treat against fungal rots, and prepare deep, well-aerated ridges."
            elif "cotton" in crop_lower:
                next_steps = "Select approved Bt-cotton hybrid suited for your district. Prepare deep tilth, space 90x60cm, and apply pre-emergence pendimethalin for weed control."
            elif "maize" in crop_lower:
                next_steps = "Select high-yielding single-cross hybrid. Space 60x20cm, apply basal DAP + Potash, and scout early for Fall Armyworm egg masses."
            elif "pepper" in crop_lower:
                next_steps = "Prepare raised beds under shade-net nursery. Drench seedlings with bio-fungicide, install drip lines, and stake early vines."
            else:
                next_steps = f"Acquire certified {crop.name} seeds, apply basal FYM (5 tonnes/acre), and ensure clean field boundaries."

            recommendation_items.append(
                CropRecommendationItem(
                    crop_id=crop.id,
                    crop_name=crop.name,
                    crop_tamil_name=crop.tamil_name,
                    category=crop.category,
                    suitability_score=total_score,
                    duration_days=crop.typical_duration_days,
                    water_need=crop.water_requirement_level,
                    input_cost_per_acre=float(req.estimated_input_cost_per_acre) if req.estimated_input_cost_per_acre is not None else None,
                    yield_potential=req.yield_potential_per_acre,
                    risk_level=req.risk_level,
                    icon_url=crop.icon_url,
                    what_summary=what_summary,
                    why_reason=why_reason,
                    when_window=when_window,
                    next_steps=next_steps,
                    soil_compatible=soil_compatible,
                    ph_compatible=ph_compatible,
                    water_compatible=water_compatible
                )
            )

        # Sort in descending order of suitability score
        recommendation_items.sort(key=lambda x: x.suitability_score, reverse=True)

        return CropRecommendationResponse(
            farm_id=farm.id,
            farm_name=farm.name,
            soil_type=farm.soil.soil_type if farm.soil else "unknown",
            ph=float(farm.soil.ph) if (farm.soil and farm.soil.ph is not None) else None,
            water_source=farm.water_source,
            irrigation_method=farm.irrigation_method,
            generated_at=datetime.utcnow(),
            recommendations=recommendation_items
        )
