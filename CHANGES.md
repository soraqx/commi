# Chatcommiot — Changes Documentation (Branch: Dave)

## Overview
This branch integrates the full hardware pipeline into the Chatcommiot thesis project.
Data now flows from physical hardware devices into the Convex database and is displayed
live on the web dashboard.

---

## Data Flow

```
Arduino UNO R4 WiFi + NEO-6M GPS
  → Serial JSON (USB, COM5)
    → Python gps_reader.py
      → Convex /ingest-hardware
        → React Dashboard (Hardware tab)

Webcam
  → Python people_counter.py (YOLOv11 + CUDA)
    → Convex /ingest-people-event
      → React Dashboard (Hardware tab)
```

---

## Files Changed

### Convex Backend (`web/convex/`)

#### `schema.ts` — MODIFIED
Added two new database tables:

- **`hardwareReadings`** — stores GPS data from Arduino
  - `deviceId` (string)
  - `latitude` (optional number)
  - `longitude` (optional number)
  - `satellites` (optional number)
  - `timestamp` (string ISO-8601)
  - `source` (string — "hardware")

- **`peopleEvents`** — stores entry/exit events from YOLO
  - `cameraId` (string)
  - `eventType` ("entry" | "exit")
  - `count` (number)
  - `totalPeople` (number)
  - `timestamp` (string ISO-8601)
  - `source` (string — "people_counter")

---

#### `http.ts` — MODIFIED
Added two new HTTP Action endpoints callable by Python scripts:

- **`POST /ingest-hardware`**
  - Accepts GPS JSON from `gps_reader.py`
  - Inserts into `hardwareReadings` table
  - Also syncs `latitude`, `longitude`, `status` on the matching `vehicles` record

- **`POST /ingest-people-event`**
  - Accepts entry/exit JSON from `people_counter.py`
  - Inserts into `peopleEvents` table
  - Also syncs `passengerCount` on the matching `vehicles` record

Fixed existing `/ingest-telemetry` route to use `ctx.runMutation` instead of `ctx.db`
(HTTP Actions are action contexts — they cannot access `ctx.db` directly).

---

#### `hardware.ts` — CREATED
New Convex query/mutation file for GPS hardware data:

- `insertReading` (internalMutation) — inserts a hardware reading + syncs vehicle
- `getLatestReading` (query) — returns the most recent GPS reading
- `getRecentReadings` (query) — returns last 50 GPS readings

---

#### `people.ts` — CREATED
New Convex query/mutation file for people counter data:

- `insertEvent` (internalMutation) — inserts a people event + syncs vehicle passenger count
- `getLatestEvent` (query) — returns the most recent people event
- `getRecentEvents` (query) — returns last 50 people events
- `getCurrentCount` (query) — returns current total people count

---

#### `history.ts` — MODIFIED
Changed `insertLog` from `mutation` to `internalMutation` so it can be called
from the HTTP action context via `ctx.runMutation(internal.history.insertLog, ...)`.

---

### Frontend (`web/src/`)

#### `src/main.tsx` — MODIFIED
- Added `BrowserRouter` and `Routes` from `react-router-dom`
- Added `/sso-callback` route using Clerk's `AuthenticateWithRedirectCallback`
  (required for Google OAuth to complete sign-in)
- Fixed "No matching routes found" error

---

#### `src/App.tsx` — MODIFIED
- Added **Hardware** tab to the admin dashboard sidebar and bottom nav
- Tab uses `Cpu` icon
- Renders `<HardwarePanel />` component
- Added `"hardware"` case to `pageMeta` switch statement

---

#### `src/components/HardwarePanel.tsx` — CREATED
New dashboard component showing live hardware data:

- **People Inside card** — live YOLO count from `peopleEvents`
- **GPS Location card** — latest latitude/longitude from `hardwareReadings`
- **Satellites card** — satellite count and device ID
- **Entry/Exit Log** — scrollable list of last 50 people events with timestamps
- **GPS Reading Log** — scrollable list of last 50 GPS readings with timestamps

---

### Hardware Scripts (`hardware_scripts/`)

#### `arduino_sender.cpp` — CREATED
Arduino sketch for UNO R4 WiFi + NEO-6M GPS:

- Uses `Serial1` (hardware UART on pins 0/1) for GPS — no SoftwareSerial conflict
- Uses `Serial` (USB) to output JSON to PC
- Outputs structured JSON every 5 seconds:
  ```json
  {
    "deviceId": "JEEP-001",
    "latitude": 14.123456,
    "longitude": 121.456789,
    "satellites": 6,
    "timestamp": "2026-04-16T10:30:00Z",
    "source": "hardware"
  }
  ```
- Falls back to null coordinates if GPS fix not yet acquired
- Library required: TinyGPS++ by Mikal Hart

**Wiring:**
```
NEO-6M TX → Arduino Pin 0 (Serial1 RX)
NEO-6M RX → Arduino Pin 1 (Serial1 TX)
NEO-6M VCC → 5V
NEO-6M GND → GND
```

---

#### `config.py` — CREATED
Central configuration for all Python scripts:

| Variable | Default | Description |
|---|---|---|
| `CONVEX_SITE_URL` | `https://optimistic-turtle-928.convex.site` | Convex HTTP endpoint |
| `SERIAL_PORT` | `COM5` | Arduino USB serial port |
| `BAUD_RATE` | `9600` | Serial baud rate |
| `DEVICE_ID` | `JEEP-001` | Must match vehicle in Convex |
| `MODEL_PATH` | `model/best_chatcom.pt` | YOLO model file |
| `CAMERA_INDEX` | `1` | Webcam index |
| `CAMERA_ID` | `JEEP-001` | Must match vehicle in Convex |
| `YOLO_CONFIDENCE` | `0.5` | Detection confidence threshold |
| `YOLO_DEVICE` | `cuda` | GPU inference (RTX 3050) |
| `GPS_SEND_INTERVAL` | `5.0` | Seconds between Convex updates |
| `SHOW_DETECTION_WINDOW` | `true` | Show OpenCV window |

---

#### `convex_sender.py` — CREATED
Centralised Convex HTTP communication:

- `send_hardware_data()` — POSTs GPS data to `/ingest-hardware`
- `send_people_event()` — POSTs entry/exit event to `/ingest-people-event`
- Handles connection errors, timeouts, and bad responses gracefully

---

#### `gps_reader.py` — CREATED
Reads Arduino serial output and forwards to Convex:

- Opens serial port (COM5 at 9600 baud)
- Reads lines, skips malformed JSON
- Rate-limits sends to Convex (every `GPS_SEND_INTERVAL` seconds)

---

#### `people_counter.py` — CREATED / UPDATED
YOLO people counter with two-line counting zone:

- Loads `best_chatcom.pt` model onto NVIDIA RTX 3050 (CUDA)
- Webcam resolution set to 1280×720
- **Two horizontal half-lines with gap in the middle:**
  - Green line (left, 0%–38%) → label "Entrance" → crossing = ENTRY
  - Red line (right, 62%–100%) → label "Exit" → crossing = EXIT
  - Middle gap (38%–62%) → no counting zone
- Coloured dots on each detected person (green/red/grey by zone)
- Sends every event to Convex via `convex_sender.py`

---

#### `main.py` — CREATED
Runs GPS reader and people counter together in parallel threads:

- `GPSReader` thread → `gps_reader.run()`
- `PeopleCounter` thread → `people_counter.run()`
- Stops cleanly on Ctrl+C

---

#### `requirements.txt` — CREATED
Python dependencies:

```
pyserial==3.5
requests==2.32.3
ultralytics==8.3.0
opencv-python==4.10.0.84
python-dotenv==1.0.1
```

> PyTorch with CUDA must be installed separately:
> `pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121`

---

### Environment

#### `web/.env.local` — UPDATED
```
CONVEX_DEPLOYMENT=dev:optimistic-turtle-928
VITE_CONVEX_URL=https://optimistic-turtle-928.convex.cloud
VITE_CONVEX_SITE_URL=https://optimistic-turtle-928.convex.site
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## Setup Instructions

### Arduino
1. Install Arduino IDE
2. Install **TinyGPS++** library (Library Manager)
3. Rename `arduino_sender.cpp` → `arduino_sender.ino`
4. Select board: Arduino UNO R4 WiFi
5. Select port: COM5
6. Upload sketch
7. Verify JSON output in Serial Monitor at 9600 baud
8. **Close Serial Monitor** before running Python

### Python
```bash
cd hardware_scripts
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
python main.py
```

### Convex
```bash
cd web
npx convex dev
```

### Frontend
```bash
cd web
npm install
npm run dev
```
Open: http://localhost:5173

### Vercel (Production)
Set environment variables in Vercel dashboard:
- `VITE_CONVEX_URL=https://optimistic-turtle-928.convex.cloud`
- `VITE_CLERK_PUBLISHABLE_KEY=pk_test_...`

Then redeploy.
