# main.py
# Entry point that starts both the GPS reader and the people counter
# in parallel using Python threads.
#
# Run with:  python main.py
# Stop with: Ctrl+C

import threading
import sys

from gps_reader import run as run_gps
from people_counter import run as run_people_counter


def start_gps_thread() -> threading.Thread:
    t = threading.Thread(target=run_gps, name="GPSReader", daemon=True)
    t.start()
    print("[main] GPS reader thread started.")
    return t


def start_people_counter_thread() -> threading.Thread:
    t = threading.Thread(target=run_people_counter, name="PeopleCounter", daemon=True)
    t.start()
    print("[main] People counter thread started.")
    return t


def main():
    print("=" * 50)
    print("  Chatcommiot Hardware Pipeline")
    print("  Press Ctrl+C to stop all services")
    print("=" * 50)

    # You can comment out either thread if you only want to run one service
    gps_thread = start_gps_thread()
    people_thread = start_people_counter_thread()

    try:
        # Keep the main thread alive while the daemon threads run
        while True:
            gps_thread.join(timeout=1)
            people_thread.join(timeout=1)

            # If both threads died unexpectedly, exit
            if not gps_thread.is_alive() and not people_thread.is_alive():
                print("[main] Both threads have stopped. Exiting.")
                break

    except KeyboardInterrupt:
        print("\n[main] Shutting down Chatcommiot pipeline...")
        sys.exit(0)


if __name__ == "__main__":
    main()
