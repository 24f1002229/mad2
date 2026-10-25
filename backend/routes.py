from flask import Flask, render_template, request, jsonify
from flask_security import login_user, auth_required, roles_required, roles_accepted
from flask_login import current_user
from werkzeug.security import check_password_hash, generate_password_hash
from app import app
from .utils import roles_list
from backend.model import *


@app.route("/")
def home():
    return render_template("home.html")

@app.route("/api/login", methods=["POST"])
def user_login():
    body = request.get_json()
    email = body["email"]
    password = body["password"]

    if not email:
        return jsonify ({"message" : "Email is required"})

    user = app.security.datastore.find_user(email=email)

    if user:
        if check_password_hash(user.password,password):
            login_user(user)
            return jsonify({"id": user.id, "username": user.username,"auth-token" : user.get_auth_token(),"roles": roles_list(current_user.roles)})
        else:
            return jsonify({"message": "password in not correct"})

    else:
        return jsonify({"User don't exist. Kindly register yourself!!"})


@app.route("/api/register", methods=["POST"])
def register():
    credentials = request.get_json()
    if not app.security.datastore.find_user(email = credentials["email"]):
        app.security.datastore.create_user(email = credentials["email"],
                                           username = credentials["username"],
                                           password = generate_password_hash(credentials["password"]),
                                           roles = ["user"])
        db.session.commit()
        return jsonify({
            "message" : "User created successfully!!"
        })
    return jsonify({
        "message" : "User already exists. You can login yourself!!"
    })

@app.route("/api/admin")
@auth_required('token')
@roles_required('admin')
def admin():
    return jsonify({
        "id" : current_user.id,
        "username" : current_user.username,
        "email" : current_user.email,
        "roles" : roles_list(current_user.roles)
    })


@app.route("/api/lot/<int:lot_id>", methods=["GET"])
@auth_required("token")
@roles_required("admin")
def get_lot(lot_id):
    lot = ParkingLot.query.get(lot_id)
    if not lot:
        return {"message" : "lot is not available"}
    return {
        "id" : lot_id,
        "prime_location_name" : lot.prime_location_name,
        "address" : lot.address,
        "price" : lot.price,
        "pincode" : lot.pincode,
        "spots" : [
            {"id" : s.id, "is_occupied" : s.is_occupied} for s in lot.spots
        ]
    }


@app.route("/api/lots_with_spots", methods=["GET"])
@auth_required("token")
@roles_required("admin")
def lots_with_spots():
    lots = ParkingLot.query.all()

    result = []

    for lot in lots:
        lot_data = {
            "id" : lot.id,
            "prime_location_name" : lot.prime_location_name,
            "address" : lot.address,
            "price" : lot.price,
            "pincode" : lot.pincode,
            "spots" : []
        }

        for s in lot.spots: 
            active_res = s.reservations.filter(Reservation.leaving_timestamp == None).order_by(Reservation.parking_timestamp.desc()).first()
            lot_data["spots"].append({
                "id": s.id,
                "is_occupied" : s.is_occupied,
                "vehicle_number": active_res.vehicle_number if active_res else None
            })

        result.append(lot_data)
    return {"lots" : result}




@app.route("/api/add_lot", methods=["POST"])
@auth_required("token")
@roles_required("admin")
def add_lot():
    data = request.get_json()
    lot = ParkingLot(
        prime_location_name = data["prime_location_name"],
        address = data["address"],
        price = data["price"],
        pincode = data["pincode"],
        number_of_spots = data["number_of_spots"]
    )
    db.session.add(lot)
    db.session.commit()

    for _ in range(int(data["number_of_spots"])):
        s = ParkingSpot(lot_id = lot.id, is_occupied = False )
        db.session.add(s)
    db.session.commit()
    return {"message" : "lot created successfully"}

@app.route("/api/update_lot/<int:lot_id>", methods=["PUT"])
@auth_required("token")
@roles_required("admin")
def update_lot(lot_id):
    data = request.get_json()
    lot = ParkingLot.query.get(lot_id)
    if not lot:
        return {"message" : "lot is not available"}
    lot.prime_location_name = data.get("prime_location_name", lot.prime_location_name)
    lot.address = data.get("address", lot.address)
    lot.price = data("price", lot.price)
    lot.pincode = data.get("pincode", lot.pincode)

    if "add_spots" in data:
        extra = int(data["add_spots"])
        for _ in range(extra):
            spot = ParkingSpot(lot_id=lot.id, is_occupied=False)
            db.session.add(spot)
        db.session.commit()
        
    return {"message" : "lot updated successfully"}





@app.route("/api/home")
@auth_required('token')
def api_home():
    return {
        "username" : current_user.username,
        "email" : current_user.email,
        "roles" : current_user.roles[0].name
    }


@app.route("/api/user")
@auth_required('token')
@roles_accepted('admin', 'user')
def user_home():
    return jsonify({
        "username" : current_user.username,
        "email" : current_user.email,
        "roles" : roles_list(current_user.roles)
    })

