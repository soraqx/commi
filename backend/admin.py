"""
Admin authentication and fleet management endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional, List
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
import json

# JWT Configuration
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Hardcoded admin credentials (for prototype only)
ADMIN_CREDENTIALS = {
    "admin": "admin123",
    "fleet_manager": "fleet2024"
}

# Mock fleet data (in production, this would come from a database)
MOCK_FLEET_DATA = [
    {
        "device_id": "JEEP-001",
        "latitude": 14.5995,
        "longitude": 120.9842,
        "last_updated": "2024-03-29T14:30:00Z",
        "status": "Online",
        "passenger_count": 12,
        "capacity": 20
    },
    {
        "device_id": "JEEP-002",
        "latitude": 14.6042,
        "longitude": 120.9876,
        "last_updated": "2024-03-29T14:28:00Z",
        "status": "Online",
        "passenger_count": 18,
        "capacity": 20
    },
    {
        "device_id": "JEEP-003",
        "latitude": 14.5958,
        "longitude": 120.9819,
        "last_updated": "2024-03-29T14:25:00Z",
        "status": "Offline",
        "passenger_count": 0,
        "capacity": 20
    },
    {
        "device_id": "JEEP-004",
        "latitude": 14.6015,
        "longitude": 120.9901,
        "last_updated": "2024-03-29T14:32:00Z",
        "status": "Online",
        "passenger_count": 8,
        "capacity": 20
    },
    {
        "device_id": "JEEP-005",
        "latitude": 14.5978,
        "longitude": 120.9835,
        "last_updated": "2024-03-29T14:29:00Z",
        "status": "Online",
        "passenger_count": 15,
        "capacity": 20
    }
]

router = APIRouter(prefix="/api/admin", tags=["Admin"])


class LoginRequest(BaseModel):
    """Login request model."""
    username: str
    password: str


class LoginResponse(BaseModel):
    """Login response model."""
    success: bool
    token: Optional[str] = None
    message: str


class FleetDevice(BaseModel):
    """Fleet device model."""
    device_id: str
    latitude: float
    longitude: float
    last_updated: str
    status: str
    passenger_count: int
    capacity: int


class FleetStatusResponse(BaseModel):
    """Fleet status response model."""
    success: bool
    data: List[FleetDevice]
    total_devices: int
    online_devices: int
    total_passengers: int


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(authorization: Optional[str] = Header(None)):
    """Verify JWT token from Authorization header."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        # Extract token from "Bearer <token>" format
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        
        # Decode and verify token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return username
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/login", response_model=LoginResponse)
async def admin_login(login_data: LoginRequest):
    """
    Authenticate admin user and return JWT token.
    
    Args:
        login_data: Username and password credentials.
    
    Returns:
        LoginResponse: Success status and JWT token if authentication succeeds.
    """
    username = login_data.username
    password = login_data.password
    
    # Check credentials
    if username in ADMIN_CREDENTIALS and ADMIN_CREDENTIALS[username] == password:
        # Create access token
        access_token = create_access_token(data={"sub": username})
        return LoginResponse(
            success=True,
            token=access_token,
            message="Login successful"
        )
    else:
        return LoginResponse(
            success=False,
            token=None,
            message="Invalid username or password"
        )


@router.get("/fleet-status", response_model=FleetStatusResponse)
async def get_fleet_status(username: str = Depends(verify_token)):
    """
    Get status of all GPS devices in the fleet.
    
    Args:
        username: Verified username from JWT token.
    
    Returns:
        FleetStatusResponse: List of all devices with their status and passenger counts.
    """
    # Calculate fleet statistics
    online_devices = sum(1 for device in MOCK_FLEET_DATA if device["status"] == "Online")
    total_passengers = sum(device["passenger_count"] for device in MOCK_FLEET_DATA)
    
    return FleetStatusResponse(
        success=True,
        data=MOCK_FLEET_DATA,
        total_devices=len(MOCK_FLEET_DATA),
        online_devices=online_devices,
        total_passengers=total_passengers
    )
