# gps_reader.py
# Reads serial JSON output from the Arduino UNO R4 WiFi + NEO-6M GPS,
# validates the data, and forwards it to Convex via convex_sender.py.
#
# Expected serial line from Arduino:
# {"deviceId":"JEEP-001","latitude":14.123,"longitude":121.456,"satellites":6,"timestamp":"2026-04-16T10:30:00Z","source":"hardware"}

import serial
import json
import time
from datetime import datetime, timezone

from config import SERIAL_PORT, BAUD_RATE, DEVICE_ID, GPS_SEND_INTERVAL
from convex_sender import send_hardware_data


def parse_serial_line(raw_line: str) -> dict | None:
    """
    Parse a raw serial line from the Arduino.
    Returns a dict on success, None if the line is malformed.
    """
    line = raw_line.strip()
    if not line:
        return None

    try:
        data = json.loads(line)
    except json.JSONDecodeError:
        print(f"[gps_reader] Skipping malformed line: {line!r}")
        return None

    # Require at least deviceId and timestamp
    if "deviceId" not in data or "timestamp" not in data:
        print(f"[gps_reader] Missing required fields in: {data}")
        return None

    return data


def run():
    """
    Open the serial port and continuously read GPS data from the Arduino.
    Sends valid readings to Convex every GPS_SEND_INTERVAL seconds.
    """
    print(f"[gps_reader] Opening serial port {SERIAL_PORT} at {BAUD_RATE} baud...")

    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=2)
    except serial.SerialException as e:
        print(f"[gps_reader] Could not open serial port: {e}")
        print(f"[gps_reader] Check that the Arduino is connected and the port is correct in config.py")
        return

    print(f"[gps_reader] Serial port open. Waiting for Arduino data...")
    time.sleep(2)  # Give Arduino time to reset after serial connection

    last_sent = 0.0

    try:
        while True:
            try:
                raw = ser.readline().decode("utf-8", errors="ignore")
            except serial.SerialException as e:
                print(f"[gps_reader] Serial read error: {e}")
                time.sleep(1)
                continue

            data = parse_serial_line(raw)
            if data is None:
                continue

            print(f"[gps_reader] Received: {data}")

            # Rate-limit sends to Convex
            now = time.time()
            if now - last_sent >= GPS_SEND_INTERVAL:
                success = send_hardware_data(
                    device_id=data.get("deviceId", DEVICE_ID),
                    latitude=data.get("latitude"),
                    longitude=data.get("longitude"),
                    satellites=data.get("satellites"),
                    timestamp=data.get("timestamp"),
                )
                if success:
                    last_sent = now

    except KeyboardInterrupt:
        print("\n[gps_reader] Stopped by user.")
    finally:
        ser.close()
        print("[gps_reader] Serial port closed.")


if __name__ == "__main__":
    run()
