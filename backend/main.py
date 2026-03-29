"""
FastAPI application entry point for GPS tracking and passenger count backend.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional
import uvicorn

from models import GpsPayload, PassengerData
from ai_service import get_passenger_count
from admin import router as admin_router


# Initialize FastAPI application
app = FastAPI(
    title="GPS Tracking & Passenger Count API",
    description="Backend API for tracking live GPS data from NEO-6M module and processing passenger counts using AI",
    version="1.0.0"
)

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include admin router
app.include_router(admin_router)

# In-memory storage for latest GPS data
class AppState:
    def __init__(self):
        self.latest_gps_data: Optional[GpsPayload] = None
    
    def update_gps_data(self, data: GpsPayload) -> None:
        self.latest_gps_data = data
    
    def get_gps_data(self) -> Optional[GpsPayload]:
        return self.latest_gps_data

app_state = AppState()


@app.get("/", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "GPS Tracking & Passenger Count API"}


@app.post("/api/location", response_model=dict, tags=["GPS"])
async def receive_gps_data(payload: GpsPayload):
    """
    Receive and store GPS data from NEO-6M module.
    
    Args:
        payload: GPS data containing latitude, longitude, and timestamp.
    
    Returns:
        dict: Confirmation message with received data.
    """
    # Store the latest GPS data
    app_state.update_gps_data(payload)
    
    return {
        "status": "success",
        "message": "GPS data received successfully",
        "data": {
            "latitude": payload.latitude,
            "longitude": payload.longitude,
            "timestamp": payload.timestamp.isoformat()
        }
    }


@app.get("/api/dashboard-data", response_model=dict, tags=["Dashboard"])
async def get_dashboard_data():
    """
    Retrieve the latest GPS location and AI-processed passenger count.
    
    Returns:
        dict: Latest GPS data and current passenger count.
    """
    # Get passenger count from AI service
    passenger_data = await get_passenger_count()
    
    # Prepare response with latest GPS data (if available)
    gps_info = None
    latest_gps = app_state.get_gps_data()
    if latest_gps:
        gps_info = {
            "latitude": latest_gps.latitude,
            "longitude": latest_gps.longitude,
            "timestamp": latest_gps.timestamp.isoformat()
        }
    
    return {
        "success": True,
        "data": {
            "gps": gps_info,
            "passengers": {
                "count": passenger_data.current_count
            }
        }
    }


if __name__ == "__main__":
    # Run the application with uvicorn ASGI server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
