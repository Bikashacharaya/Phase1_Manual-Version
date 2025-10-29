from flask import Blueprint, request, jsonify, g
from extensions import mongo
from bson.objectid import ObjectId
from utils import auth_required, roles_required, to_json
import datetime

equipment_bp = Blueprint("equipment", __name__, url_prefix="/v1/equipment")


@equipment_bp.route("", methods=["GET"])
@auth_required
def list_equipment():
    q = request.args.get("q")
    category = request.args.get("category")
    available = request.args.get("available")  # "true"/"false"
    query = {}
    if q:
        query["name"] = {"$regex": q, "$options": "i"}
    if category:
        query["category"] = category
    if available is not None:
        if available.lower() == "true":
            query["available"] = {"$gt": 0}
        else:
            query["available"] = 0
    docs = list(mongo.db.equipment.find(query))
    for d in docs:
        d["id"] = str(d["_id"])
        d.pop("_id", None)
    return jsonify(docs), 200


@equipment_bp.route("", methods=["POST"])
@auth_required
@roles_required("admin")
def add_equipment():
    data = request.json or {}
    name = data.get("name")
    category = data.get("category", "General")
    condition = data.get("condition", "Good")
    quantity = data.get("quantity", 1)
    if not name or quantity is None:
        return jsonify({"error": "name and quantity required"}), 400
    try:
        quantity = int(quantity)
    except:
        return jsonify({"error": "quantity must be integer"}), 400
    doc = {
        "name": name,
        "category": category,
        "condition": condition,
        "quantity": quantity,
        "available": quantity,
        "created_at": datetime.datetime.utcnow()
    }
    res = mongo.db.equipment.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    return jsonify({"message": "created", "equipment": doc}), 201


@equipment_bp.route("/<string:equipment_id>", methods=["PUT"])
@auth_required
@roles_required("admin")
def update_equipment(equipment_id):
    data = request.json or {}
    update = {}
    for field in ("name", "category", "condition"):
        if field in data:
            update[field] = data[field]
    if "quantity" in data:
        try:
            new_total = int(data["quantity"])
        except:
            return jsonify({"error": "quantity must be integer"}), 400
        # adjust available relative to previous total
        eq = mongo.db.equipment.find_one({"_id": ObjectId(equipment_id)})
        if not eq:
            return jsonify({"error": "equipment not found"}), 404
        old_total = eq.get("quantity", 0)
        old_available = eq.get("available", 0)
        # compute new available = max(0, old_available + (new_total - old_total))
        new_available = max(0, old_available + (new_total - old_total))
        update["quantity"] = new_total
        update["available"] = new_available
    if not update:
        return jsonify({"error": "nothing to update"}), 400
    mongo.db.equipment.update_one({"_id": ObjectId(equipment_id)}, {"$set": update})
    eq = mongo.db.equipment.find_one({"_id": ObjectId(equipment_id)})
    eq["id"] = str(eq["_id"]);
    eq.pop("_id", None)
    return jsonify({"message": "updated", "equipment": eq}), 200


@equipment_bp.route("/<string:equipment_id>", methods=["DELETE"])
@auth_required
@roles_required("admin")
def delete_equipment(equipment_id):
    res = mongo.db.equipment.delete_one({"_id": ObjectId(equipment_id)})
    if res.deleted_count == 0:
        return jsonify({"error": "not found"}), 404
    return jsonify({"message": "deleted"}), 200


@equipment_bp.route("/<string:equipment_id>", methods=["GET"])
@auth_required
@roles_required("admin", "staff")
def get_equipment(equipment_id):
    item = mongo.db.equipment.find_one({"_id": ObjectId(equipment_id)})
    if not item:
        return jsonify({"error": "Equipment not found"}), 404
    item["id"] = str(item["_id"])

    return jsonify(to_json(item)), 200
