# people_counter.py
# Two-line counting zone:
#   GREEN line (left)  → crossing left-to-right = ENTRY
#   RED   line (right) → crossing right-to-left = EXIT
#   Buffer zone between the two lines prevents double-counting.

import cv2
import time
import torch
from datetime import datetime, timezone
from collections import defaultdict

from ultralytics import YOLO

from config import MODEL_PATH, CAMERA_INDEX, CAMERA_ID, YOLO_CONFIDENCE, SHOW_DETECTION_WINDOW, YOLO_DEVICE
from convex_sender import send_people_event

# ─── Two-line zone configuration ─────────────────────────────────────────────
# Fractions of frame WIDTH.  Adjust if your door is off-centre.
ENTRY_LINE_X = 0.38   # green line — left boundary
EXIT_LINE_X  = 0.62   # red   line — right boundary


def get_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def run():
    # ── Device selection ──────────────────────────────────────────────────────
    device = YOLO_DEVICE if (YOLO_DEVICE == "cpu" or torch.cuda.is_available()) else "cpu"
    if YOLO_DEVICE == "cuda" and not torch.cuda.is_available():
        print("[people_counter] WARNING: CUDA not available, falling back to CPU.")
    else:
        print(f"[people_counter] Device: {device} "
              f"({torch.cuda.get_device_name(0) if device == 'cuda' else 'CPU'})")

    print(f"[people_counter] Loading model: {MODEL_PATH}")
    try:
        model = YOLO(MODEL_PATH)
        model.to(device)
    except Exception as e:
        print(f"[people_counter] Failed to load model: {e}")
        return

    print(f"[people_counter] Opening camera {CAMERA_INDEX}")
    cap = cv2.VideoCapture(CAMERA_INDEX)
    cap.set(3, 1280)
    cap.set(4, 720)
    if not cap.isOpened():
        print(f"[people_counter] Cannot open camera {CAMERA_INDEX}")
        return

    total_people = 0
    # track_id → list of cx values (horizontal position history)
    track_history = defaultdict(list)
    # track_id → last confirmed zone: "left" | "middle" | "right"
    track_zone    = {}

    print("[people_counter] Running. Press Q to stop.")

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                time.sleep(0.5)
                continue

            frame_h, frame_w = frame.shape[:2]
            entry_x = int(frame_w * ENTRY_LINE_X)   # green line x
            exit_x  = int(frame_w * EXIT_LINE_X)    # red   line x

            # ── YOLO tracking ─────────────────────────────────────────────────
            results = model.track(
                frame,
                persist=True,
                conf=YOLO_CONFIDENCE,
                classes=[0],
                device=device,
                verbose=False,
            )

            if results and results[0].boxes is not None:
                for box in results[0].boxes:
                    if box.id is None:
                        continue

                    track_id = int(box.id.item())
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    cx = int((x1 + x2) / 2)
                    cy = int((y1 + y2) / 2)

                    # ── Determine current zone ─────────────────────────────────
                    if cx < entry_x:
                        zone = "left"
                    elif cx > exit_x:
                        zone = "right"
                    else:
                        zone = "middle"

                    prev_zone = track_zone.get(track_id)
                    track_zone[track_id] = zone

                    # ── Crossing detection ────────────────────────────────────
                    # ENTRY: moved from left → crossed green line → now in middle or right
                    if prev_zone == "left" and zone in ("middle", "right"):
                        total_people += 1
                        print(f"[people_counter] ENTRY | ID {track_id} | total={total_people}")
                        send_people_event(
                            camera_id=CAMERA_ID,
                            event_type="entry",
                            count=1,
                            total_people=total_people,
                            timestamp=get_timestamp(),
                        )

                    # EXIT: moved from right → crossed red line → now in middle or left
                    elif prev_zone == "right" and zone in ("middle", "left"):
                        total_people = max(0, total_people - 1)
                        print(f"[people_counter] EXIT  | ID {track_id} | total={total_people}")
                        send_people_event(
                            camera_id=CAMERA_ID,
                            event_type="exit",
                            count=1,
                            total_people=total_people,
                            timestamp=get_timestamp(),
                        )

                    # ── Draw overlays ─────────────────────────────────────────
                    if SHOW_DETECTION_WINDOW:
                        # Bounding box — green for entry side, red for exit side
                        box_color = (0, 255, 0) if zone != "right" else (0, 0, 255)
                        cv2.rectangle(frame,
                                      (int(x1), int(y1)), (int(x2), int(y2)),
                                      box_color, 2)

                        # ID label above the box
                        cv2.putText(frame, f"ID {track_id}",
                                    (int(x1), int(y1) - 8),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, box_color, 2)

                        # Large filled dot at person centre
                        dot_color = (0, 255, 0) if zone == "left" else \
                                    (0, 0, 255) if zone == "right" else \
                                    (0, 220, 255)   # yellow-ish for middle zone
                        cv2.circle(frame, (cx, cy), 10, dot_color, -1)
                        cv2.circle(frame, (cx, cy),  10, (255, 255, 255), 2)  # white ring

            # ── Draw the two counting lines and HUD ───────────────────────────
            if SHOW_DETECTION_WINDOW:
                # Green entry line (left)
                cv2.line(frame, (entry_x, 0), (entry_x, frame_h), (0, 255, 0), 2)
                cv2.putText(frame, "ENTRY", (entry_x + 6, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

                # Red exit line (right)
                cv2.line(frame, (exit_x, 0), (exit_x, frame_h), (0, 0, 255), 2)
                cv2.putText(frame, "EXIT", (exit_x + 6, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

                # Semi-transparent buffer zone between the two lines
                overlay = frame.copy()
                cv2.rectangle(overlay, (entry_x, 0), (exit_x, frame_h),
                              (200, 200, 200), -1)
                cv2.addWeighted(overlay, 0.12, frame, 0.88, 0, frame)

                # People counter HUD (top-left)
                cv2.putText(frame, f"People inside: {total_people}",
                            (10, frame_h - 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2)

                cv2.imshow("Chatcommiot People Counter", frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break

    except KeyboardInterrupt:
        print("\n[people_counter] Stopped by user.")
    finally:
        cap.release()
        if SHOW_DETECTION_WINDOW:
            cv2.destroyAllWindows()
        print("[people_counter] Camera released.")


if __name__ == "__main__":
    run()
