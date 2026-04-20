# convex_sender.py
# All Convex HTTP communication is centralised here.
# gps_reader.py and people_counter.py both call functions from this file.

import requests
import json
from datetime import datetime, timezone
from config import CONVEX_SITE_URL


def _post(path: str, payload: dict) -> bool:
    """
    Generic POST helper.
    Returns True on success, False on any error.
    """
    url = f"{CONVEX_SITE_URL}{path}"
    try:
        response = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            data=json.dumps(payload),
            timeout=10,
        )
        if response.status_code == 200:
            return True
        else:
            print(f"[convex_sender] ERROR {response.status_code} from {path}: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"[convex_sender] Cannot connect to Convex at {url}. Is the internet available?")
        return False
    except requests.exceptions.Timeout:
        print(f"[convex_sender] Request to {path} timed out.")
        return False
    except Exception as e:
        print(f"[convex_sender] Unexpected error: {e}")
        return False


def send_hardware_data(
    device_id: str,
    latitude: float | None,
    longitude: float | None,
    satellites: int | None,
    timestamp: str | None = None,
) -> bool:
    """
    Send a GPS/hardware reading from the Arduino to Convex.

    Example payload:
    {
        "deviceId": "JEEP-001",
        "latitude": 14.123456,
        "longitude": 121.123456,
        "satellites": 6,
        "timestamp": "2026-04-16T10:30:00Z",
        "source": "hardware"
    }
    """
    if timestamp is None:
        timestamp = datetime.now(timezone.utc).isoformat()

    payload = {
        "deviceId": device_id,
        "latitude": latitude,
        "longitude": longitude,
        "satellites": satellites,
        "timestamp": timestamp,
        "source": "hardware",
    }

    print(f"[convex_sender] Sending hardware data: {payload}")
    return _post("/ingest-hardware", payload)


def send_people_event(
    camera_id: str,
    event_type: str,       # "entry" or "exit"
    count: int,
    total_people: int,
    timestamp: str | None = None,
) -> bool:
    """
    Send a people counter entry/exit event to Convex.

    Example payload:
    {
        "cameraId": "JEEP-001",
        "eventType": "entry",
        "count": 1,
        "totalPeople": 5,
        "timestamp": "2026-04-16T10:31:00Z",
        "source": "people_counter"
    }
    """
    if timestamp is None:
        timestamp = datetime.now(timezone.utc).isoformat()

    if event_type not in ("entry", "exit"):
        print(f"[convex_sender] Invalid event_type '{event_type}'. Must be 'entry' or 'exit'.")
        return False

    payload = {
        "cameraId": camera_id,
        "eventType": event_type,
        "count": count,
        "totalPeople": total_people,
        "timestamp": timestamp,
        "source": "people_counter",
    }

    print(f"[convex_sender] Sending people event: {payload}")
    return _post("/ingest-people-event", payload)
