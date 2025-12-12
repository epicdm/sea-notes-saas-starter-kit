"""
Phone Number Manager - Stub for PhoneNumberPool
This is a stub module to fix import errors in agent_api.py
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from database import Base

class PhoneNumberPool(Base):
    """Phone Number Pool Model - stub for now"""
    __tablename__ = 'phone_number_pool'

    id = Column(String, primary_key=True)
    phone_number = Column(String)
    assigned_to_agent_id = Column(String, ForeignKey('agent_configs.id'), nullable=True)
    is_assigned = Column(Boolean, default=False)
    created_at = Column(DateTime)
