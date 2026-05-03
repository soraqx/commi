# people_counter.py
# Single full-width counting line:
#   Person crosses line with FACE visible → ENTRY
#   Person crosses line with BACK visible → EXIT

import cv2
import time
import torch
from datetime import datetime, timezone
from collections import defaultdict

from ultralytics import YOLO

from config import MODEL_PATH, CAMERA_INDEX, CAMERA_ID, YOLO_CONFIDENCE, SHOW_DETECTION_WINDOW, YOLO_DEVICE
from convex_sender import send_people_event

# ─── Layout config ────────────────────────────────────────────────────────────
LINE_Y = 0.50   # vertical position of the counting line (0.0 = top, 1.0 = bottom)

# ─── Face detector (built into OpenCV, no extra install needed) ───────────────
_face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)


def get_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def _face_visible(frame, x1: float, y1: float, x2: float, y2: float) -> bool:
    """Returns True if a frontal face is detected inside the person's bounding box."""
    ix1 = max(0, int(x1))
    iy1 = max(0, int(y1))
    ix2 = max(0, int(x2))
    iy2 = max(0, int(y2))
    crop = frame[iy1:iy2, ix1:ix2]
    if crop.size == 0:
        return False
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    faces = _face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=3,
        minSize=(30, 30),
    )
    return len(faces) > 0


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
    track_history = defaultdict(list)
    counted_ids   = {}   # track_id → last event ("entry"/"exit"), prevents double-count

    print("[people_counter] Running. Press Q to stop.")

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                time.sleep(0.5)
                continue

            frame_h, frame_w = frame.shape[:2]
            line_y = int(frame_h * LINE_Y)

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
                        crossed = prev_cy < line_y <= curr_cy or prev_cy > line_y >= curr_cy

                        if crossed:
                            face = _face_visible(frame, x1, y1, x2, y2)
                            last = counted_ids.get(track_id)

                            if face and last != "entry":
                                # Face visible — person is boarding facing forward
                                total_people += 1
                                counted_ids[track_id] = "entry"
                                print(f"[people_counter] ENTRY (face) | ID {track_id} | total={total_people}")
                                send_people_event(
                                    camera_id=CAMERA_ID,
                                    event_type="entry",
                                    count=1,
                                    total_people=total_people,
                                    timestamp=get_timestamp(),
                                )

                            elif not face and last != "exit":
                                # No face — back of person, person is alighting
                                total_people = max(0, total_people - 1)
                                counted_ids[track_id] = "exit"
                                print(f"[people_counter] EXIT  (back) | ID {track_id} | total={total_people}")
                                send_people_event(
                                    camera_id=CAMERA_ID,
                                    event_type="exit",
                                    count=1,
                                    total_people=total_people,
                                    timestamp=get_timestamp(),
                                )

                    # ── Per-person overlay ────────────────────────────────────
                    if SHOW_DETECTION_WINDOW:
                        face_now = _face_visible(frame, x1, y1, x2, y2)
                        color = (0, 255, 0) if face_now else (0, 0, 255)  # green=face, red=back

                        cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
                        label = f"ID {track_id} {'[face]' if face_now else '[back]'}"
                        cv2.putText(frame, label,
                                    (int(x1), int(y1) - 8),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 2)
                        cv2.circle(frame, (cx, cy), 10, color, -1)
                        cv2.circle(frame, (cx, cy), 10, (255, 255, 255), 2)

            # ── Draw the counting line and labels ─────────────────────────────
            if SHOW_DETECTION_WINDOW:
                # Single white line across full width
                cv2.line(frame, (0, line_y), (frame_w, line_y), (255, 255, 255), 3)

                cv2.putText(frame, "face = Entry  |  back = Exit",
                            (20, line_y - 12),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 255), 2)

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
