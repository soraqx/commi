/*
 * arduino_sender.cpp
 * Chatcommiot – Arduino UNO R4 WiFi + NEO-6M GPS
 *
 * Uses Serial1 (hardware UART on pins 0/1) for the GPS module so it
 * does NOT conflict with Serial (USB) which sends JSON to the PC.
 *
 * Wiring (NEO-6M → Arduino UNO R4 WiFi):
 *   NEO-6M TX  →  Arduino Pin 0  (Serial1 RX)
 *   NEO-6M RX  →  Arduino Pin 1  (Serial1 TX)
 *   NEO-6M VCC →  5V
 *   NEO-6M GND →  GND
 *
 * Libraries required (install via Arduino Library Manager):
 *   - TinyGPS++ by Mikal Hart
 *
 * Upload steps:
 *   1. Open Arduino IDE
 *   2. Board: Arduino UNO R4 WiFi
 *   3. Install TinyGPS++ from Library Manager
 *   4. Rename this file to arduino_sender.ino and upload
 *   5. Open Serial Monitor at 9600 baud to verify JSON output
 */

#include <Arduino.h>
#include <TinyGPSPlus.h>

// Serial1 = hardware UART on Pin 0 (RX) and Pin 1 (TX) — no SoftwareSerial needed
// Serial  = USB serial used to send JSON to the PC running gps_reader.py

static const uint32_t GPS_BAUD         = 9600;
static const unsigned long SEND_INTERVAL_MS = 5000;
static const char* DEVICE_ID           = "JEEP-001";

TinyGPSPlus gps;
unsigned long lastSentAt = 0;

// ─── Timestamp helper ─────────────────────────────────────────────────────────
void printTimestamp() {
  if (gps.date.isValid() && gps.time.isValid()) {
    char buf[25];
    snprintf(buf, sizeof(buf),
      "%04d-%02d-%02dT%02d:%02d:%02dZ",
      gps.date.year(),   gps.date.month(),  gps.date.day(),
      gps.time.hour(),   gps.time.minute(), gps.time.second()
    );
    Serial.print(buf);
  } else {
    // No fix yet — use millis() as a fallback so the field is never empty
    Serial.print(F("1970-01-01T00:00:"));
    unsigned long secs = millis() / 1000;
    if (secs < 10) Serial.print('0');
    Serial.print(secs);
    Serial.print('Z');
  }
}

// ─── JSON output ──────────────────────────────────────────────────────────────
// Example (locked):   {"deviceId":"JEEP-001","latitude":14.123456,"longitude":121.456789,"satellites":6,"timestamp":"2026-04-16T10:30:00Z","source":"hardware"}
// Example (no fix):   {"deviceId":"JEEP-001","latitude":null,"longitude":null,"satellites":0,"timestamp":"1970-01-01T00:00:05Z","source":"hardware"}
void sendJSON() {
  Serial.print(F("{\"deviceId\":\""));
  Serial.print(DEVICE_ID);
  Serial.print(F("\","));

  if (gps.location.isValid()) {
    Serial.print(F("\"latitude\":"));
    Serial.print(gps.location.lat(), 6);
    Serial.print(F(",\"longitude\":"));
    Serial.print(gps.location.lng(), 6);
  } else {
    Serial.print(F("\"latitude\":null,\"longitude\":null"));
  }

  Serial.print(F(",\"satellites\":"));
  Serial.print(gps.satellites.isValid() ? (int)gps.satellites.value() : 0);

  Serial.print(F(",\"timestamp\":\""));
  printTimestamp();
  Serial.print(F("\",\"source\":\"hardware\"}"));
  Serial.println();
}

// ─── Setup ────────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(9600);          // USB → PC (Python reads this)
  while (!Serial) { ; }        // Wait for USB Serial to be ready

  Serial1.begin(GPS_BAUD);     // Hardware UART → NEO-6M on pins 0 (RX) / 1 (TX)

  Serial.println(F("// Chatcommiot GPS sender ready (Serial1 on pins 0/1)"));
  Serial.println(F("// Waiting for GPS fix..."));
}

// ─── Loop ─────────────────────────────────────────────────────────────────────
void loop() {
  // Feed every byte from the NEO-6M into TinyGPS++
  while (Serial1.available() > 0) {
    gps.encode(Serial1.read());
  }

  // Send a JSON reading every SEND_INTERVAL_MS milliseconds
  unsigned long now = millis();
  if (now - lastSentAt >= SEND_INTERVAL_MS) {
    lastSentAt = now;
    sendJSON();
  }
}
