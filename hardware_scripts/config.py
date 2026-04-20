# config.py
# Central configuration file for all hardware scripts.
# UPDATE the values here before running any script.

import os
from dotenv import load_dotenv

load_dotenv()  # Optional: load from a .env file if you prefer

# ─── Convex ───────────────────────────────────────────────────────────────────
# Your Convex HTTP Actions site URL (ends in .convex.site)
CONVEX_SITE_URL = os.getenv(
    "CONVEX_SITE_URL",
    "https://expert-pony-749.convex.site"
)

# ─── Arduino / Serial ─────────────────────────────────────────────────────────
# Windows: usually "COM3", "COM4", etc.
# Linux/Mac: usually "/dev/ttyUSB0" or "/dev/ttyACM0"
SERIAL_PORT = os.getenv("SERIAL_PORT", "COM5")
BAUD_RATE = int(os.getenv("BAUD_RATE", "9600"))

# Device identifier sent to Convex — must match a vehicleId in your vehicles table
DEVICE_ID = os.getenv("DEVICE_ID", "JEEP-001")

# ─── YOLO / People Counter ────────────────────────────────────────────────────
# Path to your trained YOLO model (.pt file)
MODEL_PATH = os.getenv("MODEL_PATH", "model/best_chatcom.pt")

# Camera index (0 = default webcam, 1 = second camera, or use a video file path)
CAMERA_INDEX = int(os.getenv("CAMERA_INDEX", "1"))

# Camera identifier sent to Convex — should match DEVICE_ID if on the same jeepney
CAMERA_ID = os.getenv("CAMERA_ID", "JEEP-001")

# YOLO confidence threshold (0.0 – 1.0)
YOLO_CONFIDENCE = float(os.getenv("YOLO_CONFIDENCE", "0.5"))

# Inference device: "cuda" = NVIDIA GPU (RTX 3050), "cpu" = fallback
YOLO_DEVICE = os.getenv("YOLO_DEVICE", "cuda")

# ─── Behaviour ────────────────────────────────────────────────────────────────
# How long (seconds) to wait between GPS readings sent to Convex
GPS_SEND_INTERVAL = float(os.getenv("GPS_SEND_INTERVAL", "5.0"))

# Show the YOLO detection window (set to False on headless/Raspberry Pi servers)
SHOW_DETECTION_WINDOW = os.getenv("SHOW_DETECTION_WINDOW", "true").lower() == "true"
