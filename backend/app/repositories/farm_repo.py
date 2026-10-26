from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.farm import Farm, FarmSoil
from app.schemas.farm import FarmCreate, FarmUpdate, SoilCreateOrUpdate


class FarmRepository:
    @staticmethod
    def get_by_id(db: Session, farm_id: int) -> Optional[Farm]:
        return db.query(Farm).filter(Farm.id == farm_id).first()

    @staticmethod
    def get_by_user(db: Session, user_id: int) -> List[Farm]:
        return db.query(Farm).filter(Farm.user_id == user_id).order_by(Farm.created_at.desc()).all()

    @staticmethod
    def create_farm(db: Session, user_id: int, data: FarmCreate) -> Farm:
        farm = Farm(
            user_id=user_id,
            name=data.name.strip(),
            land_area=data.land_area,
            area_unit=data.area_unit,
            location_name=data.location_name.strip(),
            latitude=data.latitude,
            longitude=data.longitude,
            water_source=data.water_source,
            irrigation_method=data.irrigation_method
        )
        db.add(farm)
        db.flush()

        # Initialize soil record
        soil_data = data.soil or SoilCreateOrUpdate()
        soil = FarmSoil(
            farm_id=farm.id,
            soil_type=soil_data.soil_type or "unknown",
            ph=soil_data.ph,
            organic_matter_pct=soil_data.organic_matter_pct,
            nitrogen_n=soil_data.nitrogen_n,
            phosphorus_p=soil_data.phosphorus_p,
            potassium_k=soil_data.potassium_k,
            ec=soil_data.ec,
            tested_at=soil_data.tested_at
        )
        db.add(soil)
        db.commit()
        db.refresh(farm)
        return farm

    @staticmethod
    def update_farm(db: Session, farm: Farm, data: FarmUpdate) -> Farm:
        if data.name is not None:
            farm.name = data.name.strip()
        if data.land_area is not None:
            farm.land_area = data.land_area
        if data.area_unit is not None:
            farm.area_unit = data.area_unit
        if data.location_name is not None:
            farm.location_name = data.location_name.strip()
        if data.latitude is not None:
            farm.latitude = data.latitude
        if data.longitude is not None:
            farm.longitude = data.longitude
        if data.water_source is not None:
            farm.water_source = data.water_source
        if data.irrigation_method is not None:
            farm.irrigation_method = data.irrigation_method

        db.commit()
        db.refresh(farm)
        return farm

    @staticmethod
    def update_soil(db: Session, farm: Farm, data: SoilCreateOrUpdate) -> FarmSoil:
        soil = farm.soil
        if not soil:
            soil = FarmSoil(farm_id=farm.id)
            db.add(soil)

        if data.soil_type is not None:
            soil.soil_type = data.soil_type
        if data.ph is not None:
            soil.ph = data.ph
        if data.organic_matter_pct is not None:
            soil.organic_matter_pct = data.organic_matter_pct
        if data.nitrogen_n is not None:
            soil.nitrogen_n = data.nitrogen_n
        if data.phosphorus_p is not None:
            soil.phosphorus_p = data.phosphorus_p
        if data.potassium_k is not None:
            soil.potassium_k = data.potassium_k
        if data.ec is not None:
            soil.ec = data.ec
        if data.tested_at is not None:
            soil.tested_at = data.tested_at

        db.commit()
        db.refresh(soil)
        return soil

    @staticmethod
    def delete_farm(db: Session, farm: Farm) -> None:
        db.delete(farm)
        db.commit()
