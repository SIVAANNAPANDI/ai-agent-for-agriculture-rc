from typing import List
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.farm import Farm
from app.repositories.farm_repo import FarmRepository
from app.schemas.farm import FarmCreate, FarmUpdate, FarmResponse, SoilResponse, SoilCreateOrUpdate
from app.core.exceptions import NotFoundException, ForbiddenException


class FarmService:
    @staticmethod
    def _to_response(farm: Farm) -> FarmResponse:
        soil_res = None
        if farm.soil:
            soil_res = SoilResponse(
                id=farm.soil.id,
                soil_type=farm.soil.soil_type,
                ph=float(farm.soil.ph) if farm.soil.ph is not None else None,
                organic_matter_pct=float(farm.soil.organic_matter_pct) if farm.soil.organic_matter_pct is not None else None,
                nitrogen_n=float(farm.soil.nitrogen_n) if farm.soil.nitrogen_n is not None else None,
                phosphorus_p=float(farm.soil.phosphorus_p) if farm.soil.phosphorus_p is not None else None,
                potassium_k=float(farm.soil.potassium_k) if farm.soil.potassium_k is not None else None,
                ec=float(farm.soil.ec) if farm.soil.ec is not None else None,
                tested_at=farm.soil.tested_at
            )

        current_crop = None
        if farm.cultivation_cycles:
            for cycle in farm.cultivation_cycles:
                if cycle.status in ["IN_PROGRESS", "PLANNED"]:
                    current_crop = cycle.crop.name if cycle.crop else None
                    break

        return FarmResponse(
            id=farm.id,
            user_id=farm.user_id,
            name=farm.name,
            land_area=float(farm.land_area),
            area_unit=farm.area_unit,
            location_name=farm.location_name,
            latitude=float(farm.latitude),
            longitude=float(farm.longitude),
            water_source=farm.water_source,
            irrigation_method=farm.irrigation_method,
            soil=soil_res,
            current_crop=current_crop,
            created_at=farm.created_at,
            updated_at=farm.updated_at
        )

    @classmethod
    def list_farms(cls, db: Session, user: User) -> List[FarmResponse]:
        farms = FarmRepository.get_by_user(db, user.id)
        return [cls._to_response(f) for f in farms]

    @classmethod
    def get_farm(cls, db: Session, farm_id: int, user: User) -> FarmResponse:
        farm = FarmRepository.get_by_id(db, farm_id)
        if not farm:
            raise NotFoundException(f"Farm with id {farm_id} does not exist.")

        # Strict ownership check
        if farm.user_id != user.id:
            raise ForbiddenException("You do not have permission to access this farm.")

        return cls._to_response(farm)

    @classmethod
    def create_farm(cls, db: Session, user: User, data: FarmCreate) -> FarmResponse:
        farm = FarmRepository.create_farm(db, user.id, data)
        return cls._to_response(farm)

    @classmethod
    def update_farm(cls, db: Session, farm_id: int, user: User, data: FarmUpdate) -> FarmResponse:
        farm = FarmRepository.get_by_id(db, farm_id)
        if not farm:
            raise NotFoundException(f"Farm with id {farm_id} does not exist.")

        if farm.user_id != user.id:
            raise ForbiddenException("You do not have permission to modify this farm.")

        updated = FarmRepository.update_farm(db, farm, data)
        return cls._to_response(updated)

    @classmethod
    def update_soil(cls, db: Session, farm_id: int, user: User, data: SoilCreateOrUpdate) -> SoilResponse:
        farm = FarmRepository.get_by_id(db, farm_id)
        if not farm:
            raise NotFoundException(f"Farm with id {farm_id} does not exist.")

        if farm.user_id != user.id:
            raise ForbiddenException("You do not have permission to update soil for this farm.")

        soil = FarmRepository.update_soil(db, farm, data)
        return SoilResponse(
            id=soil.id,
            soil_type=soil.soil_type,
            ph=float(soil.ph) if soil.ph is not None else None,
            organic_matter_pct=float(soil.organic_matter_pct) if soil.organic_matter_pct is not None else None,
            nitrogen_n=float(soil.nitrogen_n) if soil.nitrogen_n is not None else None,
            phosphorus_p=float(soil.phosphorus_p) if soil.phosphorus_p is not None else None,
            potassium_k=float(soil.potassium_k) if soil.potassium_k is not None else None,
            ec=float(soil.ec) if soil.ec is not None else None,
            tested_at=soil.tested_at
        )

    @classmethod
    def delete_farm(cls, db: Session, farm_id: int, user: User) -> None:
        farm = FarmRepository.get_by_id(db, farm_id)
        if not farm:
            raise NotFoundException(f"Farm with id {farm_id} does not exist.")

        if farm.user_id != user.id:
            raise ForbiddenException("You do not have permission to delete this farm.")

        FarmRepository.delete_farm(db, farm)
