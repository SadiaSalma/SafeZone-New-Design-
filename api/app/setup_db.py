"""
setup_db.py - applies schema.py to a database.

For each collection in schema.py it:
  1. creates the collection if it is missing, with its rules (validator), or
     updates the rules if the collection already exists;
  2. creates every index (if an index with the same name exists but is
     different, it is replaced).

It is SAFE TO RUN AGAIN: things that are already correct are left alone.
Used by scripts/init_db.py and by the tests.
"""
from pymongo.database import Database
from pymongo.errors import OperationFailure

from app.schema import COLLECTIONS

# MongoDB error codes meaning "an index with this name/keys exists but is different"
INDEX_CONFLICT_CODES = {85, 86}


def apply_schema(db: Database) -> dict:
    """Create/update all collections and indexes. Returns a small summary."""
    summary = {"created": [], "updated": [], "indexes": 0}
    existing = set(db.list_collection_names())

    for name, spec in COLLECTIONS.items():
        # 1) The collection and its rules
        if name in existing:
            db.command("collMod", name, validator=spec["validator"], validationLevel="strict")
            summary["updated"].append(name)
        else:
            db.create_collection(name, validator=spec["validator"], validationLevel="strict")
            summary["created"].append(name)

        # 2) Its indexes
        for keys, options in spec["indexes"]:
            key_list = list(keys.items())
            try:
                db[name].create_index(key_list, **options)
            except OperationFailure as error:
                if error.code not in INDEX_CONFLICT_CODES:
                    raise
                db[name].drop_index(options["name"])  # replace the old version
                db[name].create_index(key_list, **options)
            summary["indexes"] += 1

    return summary
