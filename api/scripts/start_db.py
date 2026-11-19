"""
start_db.py - starts SafeZone's own MongoDB database.

Run it from the api folder:
    python scripts/start_db.py
(or in VS Code: Terminal -> Run Task -> "SafeZone: start database")

What it does:
  1. Finds the mongod program installed on this computer.
  2. Starts it on port 27018 as a "replica set" called rs0.
     (A replica set is what lets MongoDB do transactions: several changes
      that all succeed together, or none of them happen.)
  3. The first time only, it "initiates" the replica set.
  4. Keeps running until you press Ctrl+C, which stops the database cleanly.

The data is stored in api/.data/db. Git ignores that folder.
To start completely fresh, stop the database and delete api/.data.
"""
import glob
import shutil
import subprocess
import sys
import time
from pathlib import Path

from pymongo import MongoClient
from pymongo.errors import OperationFailure, PyMongoError

PORT = 27018
REPLICA_SET = "rs0"
DATA_DIR = Path(__file__).resolve().parent.parent / ".data" / "db"


def find_mongod() -> str:
    """Return the full path of mongod, or stop with a helpful message."""
    on_path = shutil.which("mongod")
    if on_path:
        return on_path
    # The Windows installer puts it in Program Files\MongoDB\Server\<version>\bin
    found = sorted(glob.glob(r"C:\Program Files\MongoDB\Server\*\bin\mongod.exe"))
    if found:
        return found[-1]  # the newest version
    sys.exit("Could not find mongod. Install MongoDB Community Server first (see README).")


def initiate_replica_set_once() -> None:
    """Turn on the replica set the first time. Safe to call every time."""
    # directConnection=True: talk to this one server even before the replica set exists
    client = MongoClient(f"mongodb://127.0.0.1:{PORT}/?directConnection=true", serverSelectionTimeoutMS=2000)
    try:
        for _ in range(30):  # wait up to ~15 seconds for mongod to start answering
            try:
                client.admin.command("ping")
                break
            except PyMongoError:
                time.sleep(0.5)
        try:
            client.admin.command("replSetGetStatus")
            print(f"Replica set '{REPLICA_SET}' is already set up.", flush=True)
        except OperationFailure as error:
            if error.code != 94:  # 94 = "not yet initialized" - anything else is a real problem
                raise
            client.admin.command(
                "replSetInitiate",
                {"_id": REPLICA_SET, "members": [{"_id": 0, "host": f"127.0.0.1:{PORT}"}]},
            )
            print(f"Replica set '{REPLICA_SET}' created (first run).", flush=True)
    finally:
        client.close()


def already_running() -> bool:
    """True if a database is already answering on our port (e.g. left over from last time)."""
    client = MongoClient(f"mongodb://127.0.0.1:{PORT}/?directConnection=true", serverSelectionTimeoutMS=800)
    try:
        client.admin.command("ping")
        return True
    except PyMongoError:
        return False
    finally:
        client.close()


def main() -> None:
    if already_running():
        print(f"The database is already running on port {PORT}. Nothing to do.", flush=True)
        return
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    mongod = find_mongod()
    print(f"Starting MongoDB on port {PORT} (data: {DATA_DIR}) ...", flush=True)
    process = subprocess.Popen(
        [
            mongod,
            "--replSet", REPLICA_SET,
            "--port", str(PORT),
            "--bind_ip", "127.0.0.1",  # only this computer can connect
            "--dbpath", str(DATA_DIR),
            "--quiet",
        ],
        stdout=subprocess.DEVNULL,
    )
    try:
        initiate_replica_set_once()
        print("Database ready. Leave this window open. Press Ctrl+C to stop it.", flush=True)
        process.wait()
    except KeyboardInterrupt:
        print("Stopping the database ...", flush=True)
    finally:
        if process.poll() is None:
            process.terminate()
            process.wait(timeout=30)


if __name__ == "__main__":
    main()
