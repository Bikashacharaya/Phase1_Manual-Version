from flask import Blueprint, request, jsonify, g
from extensions import mongo
from utils import auth_required, roles_required, to_json
from bson.objectid import ObjectId
import datetime

loans_bp = Blueprint("loans", __name__, url_prefix="/v1/loans")


@loans_bp.route("/request", methods=["POST"])
@auth_required
@roles_required("student")
def request_loan():
    data = request.json or {}
    equipment_id = data.get("equipment_id")
    if not equipment_id:
        return jsonify({"error": "equipment_id required"}), 400

    equipment = mongo.db.equipment.find_one({"_id": ObjectId(equipment_id)})
    if not equipment:
        return jsonify({"error": "equipment not found"}), 404

    if equipment.get("available", 0) <= 0:
        return jsonify({"error": "No items available"}), 400
    # Create a PENDING loan
    loan = {
        "equipment_id": ObjectId(equipment_id),
        "user_id": ObjectId(g.user["user_id"]),
        "status": "PENDING",
        "request_date": datetime.datetime.utcnow(),
        "approved_by": None,
        "approved_date": None,
        "return_date": None,
        "notes": data.get("notes", "")
    }
    res = mongo.db.loans.insert_one(loan)
    loan["id"] = str(res.inserted_id)
    return jsonify({"message": "request created", "loan": to_json(loan)}), 201


@loans_bp.route("/pending", methods=["GET"])
@auth_required
@roles_required("staff", "admin")
def list_pending():
    docs = list(mongo.db.loans.find({"status": "PENDING"}))
    out = []
    for d in docs:
        d["id"] = str(d["_id"])
        d["equipment_id"] = str(d["equipment_id"])
        d["user_id"] = str(d["user_id"])
        d.pop("_id", None)
        out.append(d)
    return jsonify(out), 200


@loans_bp.route("/<string:loan_id>/approve", methods=["PUT"])
@auth_required
@roles_required("staff", "admin")
def approve_loan(loan_id):
    loan = mongo.db.loans.find_one({"_id": ObjectId(loan_id)})
    if not loan:
        return jsonify({"error": "loan not found"}), 404

    if loan["status"] != "PENDING":
        return jsonify({"error": "loan not pending"}), 400

    equipment = mongo.db.equipment.find_one({"_id": loan["equipment_id"]})
    if not equipment:
        return jsonify({"error": "equipment not found"}), 404
    if equipment.get("available", 0) <= 0:
        # cannot approve
        mongo.db.loans.update_one({"_id": loan["_id"]}, {
            "$set": {"status": "REJECTED", "approved_by": ObjectId(g.user["user_id"]),
                     "approved_date": datetime.datetime.utcnow(), "notes": "auto-rejected: no availability"}})
        return jsonify({"error": "no items available; loan auto-rejected"}), 400
    # decrement available and mark approved
    mongo.db.equipment.update_one({"_id": equipment["_id"]}, {"$inc": {"available": -1}})
    mongo.db.loans.update_one({"_id": loan["_id"]}, {
        "$set": {"status": "APPROVED", "approved_by": ObjectId(g.user["user_id"]),
                 "approved_date": datetime.datetime.utcnow()}})
    updated = mongo.db.loans.find_one({"_id": loan["_id"]})
    updated["id"] = str(updated["_id"]);
    updated.pop("_id", None)
    updated["equipment_id"] = str(updated["equipment_id"]);
    updated["user_id"] = str(updated["user_id"])
    return jsonify({"message": "approved", "loan": to_json(updated)}), 200


@loans_bp.route("/<string:loan_id>/reject", methods=["PUT"])
@auth_required
@roles_required("staff", "admin")
def reject_loan(loan_id):
    data = request.json or {}
    loan = mongo.db.loans.find_one({"_id": ObjectId(loan_id)})
    if not loan:
        return jsonify({"error": "loan not found"}), 404
    if loan["status"] != "PENDING":
        return jsonify({"error": "loan not pending"}), 400
    mongo.db.loans.update_one({"_id": loan["_id"]}, {
        "$set": {"status": "REJECTED", "approved_by": ObjectId(g.user["user_id"]),
                 "approved_date": datetime.datetime.utcnow(), "notes": data.get("notes", "")}})
    return jsonify({"message": "rejected"}), 200


@loans_bp.route("/<string:loan_id>/return", methods=["PUT"])
@auth_required
@roles_required("staff", "admin")
def mark_returned(loan_id):
    loan = mongo.db.loans.find_one({"_id": ObjectId(loan_id)})
    if not loan:
        return jsonify({"error": "loan not found"}), 404
    if loan["status"] != "APPROVED":
        return jsonify({"error": "loan is not in APPROVED state"}), 400
    # increment available
    mongo.db.equipment.update_one({"_id": loan["equipment_id"]}, {"$inc": {"available": 1}})
    mongo.db.loans.update_one({"_id": loan["_id"]},
                              {"$set": {"status": "RETURNED", "return_date": datetime.datetime.utcnow()}})
    updated = mongo.db.loans.find_one({"_id": loan["_id"]})
    updated["id"] = str(updated["_id"]);
    updated.pop("_id", None)
    updated["equipment_id"] = str(updated["equipment_id"]);
    updated["user_id"] = str(updated["user_id"])
    return jsonify({"message": "marked as returned", "loan":to_json(updated)}), 200
@loans_bp.route("/my", methods=["GET"])
@auth_required
def my_loans():
    user_id = ObjectId(g.user["user_id"])
    docs = list(mongo.db.loans.find({"user_id": user_id}))
    out = []
    for d in docs:
        d["id"] = str(d["_id"])
        d["equipment_id"] = str(d["equipment_id"])
        d["user_id"] = str(d["user_id"])
        d.pop("_id", None)
        out.append(d)
    return jsonify(to_json(out)), 200

@loans_bp.route("/approved", methods=["GET"])
@auth_required
@roles_required("staff", "admin")
def get_approved_loans():
    loans = list(mongo.db.loans.find({"status": "APPROVED"}))
    for l in loans:
        l["id"] = str(l["_id"])
    return jsonify(to_json(loans)), 200