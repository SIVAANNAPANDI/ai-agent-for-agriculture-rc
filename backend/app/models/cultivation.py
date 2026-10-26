from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from app.database.base import Base


class CultivationCycle(Base):
    __tablename__ = "cultivation_cycles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), index=True, nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="RESTRICT"), index=True, nullable=False)
    start_date = Column(Date, nullable=False)
    expected_harvest_date = Column(Date, nullable=False)
    actual_harvest_date = Column(Date, nullable=True)
    status = Column(String(30), default="IN_PROGRESS", index=True, nullable=False)  # PLANNED, IN_PROGRESS, HARVESTED, CANCELLED
    estimated_yield = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    farm = relationship("Farm", back_populates="cultivation_cycles")
    crop = relationship("Crop", back_populates="cultivation_cycles")
    tasks = relationship("CultivationTask", back_populates="cycle", cascade="all, delete-orphan", order_by="CultivationTask.due_date")


class CultivationTask(Base):
    __tablename__ = "cultivation_tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cycle_id = Column(Integer, ForeignKey("cultivation_cycles.id", ondelete="CASCADE"), index=True, nullable=False)
    stage_name = Column(String(100), nullable=False)  # Land preparation, Sowing, Transplanting, Irrigation, Fertilization, Weeding, Pest monitoring, Flowering, Harvest
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(Date, index=True, nullable=False)
    status = Column(String(30), default="PLANNED", index=True, nullable=False)  # PLANNED, IN_PROGRESS, COMPLETED, OVERDUE
    weather_note = Column(String(255), nullable=True)  # Dynamic advisory (e.g. rain forecasted)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship
    cycle = relationship("CultivationCycle", back_populates="tasks")
