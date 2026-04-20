# people_counter.py
# Two horizontal half-lines with a gap in the middle:
#   LEFT  side → GREEN line  → "Entrance" (crossing up→down = ENTRY)
#   RIGHT side → RED   line  → "Exit"     (crossing up→down = EXIT)
#   Middle gap = no counting zone

import cv2
import time
import torch
from datetime import datetime, timezone
from collections import defaultdict

from ultralytics import YOLO

from config import MODEL_PATH, CAMERA_INDEX, CAMERA_ID, YOLO_CONFIDENCE, SHOW_DETECTION_WINDOW, YOLO_DEVICE
from convex_sender import send_people_event

# ─── Layout config ────────────────────────────────────────────────────────────
LINE_Y        = 0.50   # vertical position of both lines (fraction of frame height)
LEFT_END_X    = 0.38   # green line spans from 0%  → 38% of frame width
RIGHT_START_X = 0.62   # red   line spans from 62% → 100% of frame width


def get_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def run():
    # ── Device ────────────────────────────────────────────────────────────────
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

    total_people  = 0
    track_history = defaultdict(list)   # track_id → [prev_cy, curr_cy]

    print("[people_counter] Running. Press Q to stop.")

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                time.sleep(0.5)
                continue

            frame_h, frame_w = frame.shape[:2]

            # Pixel coordinates
            line_y       = int(frame_h * LINE_Y)
            left_end     = int(frame_w * LEFT_END_X)
            right_start  = int(frame_w * RIGHT_START_X)

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

                    history = track_history[track_id]
                    history.append(cy)
                    if len(history) > 2:
                        history.pop(0)

                    # ── Crossing detection ────────────────────────────────────
                    if len(history) == 2:
                        prev_cy, curr_cy = history[0], history[1]

                        # Person is on the LEFT (entrance) side
                        if cx <= left_end:
                            if prev_cy < line_y <= curr_cy:   # crossed downward
                                total_people += 1
                                print(f"[people_counter] ENTRY | ID {track_id} | total={total_people}")
                                send_people_event(
                                    camera_id=CAMERA_ID,
                                    event_type="entry",
                                    count=1,
                                    total_people=total_people,
                                    timestamp=get_timestamp(),
                                )

                        # Person is on the RIGHT (exit) side
                        elif cx >= right_start:
                            if prev_cy < line_y <= curr_cy:   # crossed downward
                                total_people = max(0, total_people - 1)
                                print(f"[people_counter] EXIT  | ID {track_id} | total={total_people}")
                                send_people_event(
                                    camera_id=CAMERA_ID,
                                    event_type="exit",
                                    count=1,
                                    total_people=total_people,
                                    timestamp=get_timestamp(),
                                )

                    # ── Per-person overlay ────────────────────────────────────
                    if SHOW_DETECTION_WINDOW:
                        # Box color based on which side the person is on
                        if cx <= left_end:
                            color = (0, 255, 0)      # green — entrance side
                        elif cx >= right_start:
                            color = (0, 0, 255)      # red   — exit side
                        else:
                            color = (200, 200, 200)  # grey  — middle gap

                        cv2.rectangle(frame,
                                      (int(x1), int(y1)), (int(x2), int(y2)),
                                      color, 2)

                        # ID label
                        cv2.putText(frame, f"ID {track_id}",
                                    (int(x1), int(y1) - 8),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 2)

                        # Dot at person centre
                        cv2.circle(frame, (cx, cy), 10, color, -1)
                        cv2.circle(frame, (cx, cy), 10, (255, 255, 255), 2)

            # ── Draw the two half-lines and labels ────────────────────────────
            if SHOW_DETECTION_WINDOW:
                # Green line — left half (Entrance)
                cv2.line(frame, (0, line_y), (left_end, line_y), (0, 200, 0), 3)

                # Red line — right half (Exit)
                cv2.line(frame, (right_start, line_y), (frame_w, line_y), (0, 0, 220), 3)

                # Labels above the lines
                cv2.putText(frame, "Entrance",
                            (20, line_y - 12),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 200, 0), 2)

                cv2.putText(frame, "Exit",
                            (right_start + 20, line_y - 12),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 220), 2)

                # People count — bottom left
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
