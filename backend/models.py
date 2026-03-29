"""
Pydantic models for GPS tracking and passenger count data.
"""

from pydantic import BaseModel, Field
from datetime import datetime


class GpsPayload(BaseModel):
    """Model for GPS location data from NEO-6M module."""
    
    latitude: float = Field(
        ...,
        description="Latitude coordinate in decimal degrees",
        ge=-90.0,
        le=90.0
    )
    longitude: float = Field(
        ...,
        description="Longitude coordinate in decimal degrees",
        ge=-180.0,
        le=180.0
    )
    timestamp: datetime = Field(
        ...,
        description="Timestamp when the GPS data was recorded"
    )


class PassengerData(BaseModel):
    """Model for AI-processed passenger count data."""
    
    current_count: int = Field(
        ...,
        description="Current passenger count from AI processing",
        ge=0
    )
