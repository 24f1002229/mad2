from flask import Flask, render_template, request, jsonify
from flask_security import login_user, auth_required, roles_required, roles_accepted
from flask_login import current_user
from werkzeug.security import check_password_hash, generate_password_hash
from app import app
from .utils import roles_list
from backend.model import *
from datetime import datetime, timezone
from celery.result import AsyncResult
from .tasks import export_csv_task, daily_reminder, send_monthly_report

@app.route("/api/export_csv", methods=["POST"])
@auth_required("token")
def export_csv():
    task = export_csv_task.delay(current_user.id)
    return jsonify({"task_id" : task.id})

@app.route("/api/task-status/<task_id>")
def task_status(task_id):
    res = AsyncResult(task_id)
    return jsonify({"state" : res.state, "result" : res.result})

@app.route("/trigger/daily_reminder")
def trigger_daily():
    daily_reminder.delay()
    return {"status" : "daily reminder triggered"}

@app.route("/trigger/send_monthly_report")
def send_monthly_report():
    send_monthly_report.delay()
    return {"status" : "Monthly report send"}

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
    lot.price = data.get("price", lot.price)
    lot.pincode = data.get("pincode", lot.pincode)

    if "add_spots" in data:
        extra = int(data["add_spots"])
        for _ in range(extra):
            spot = ParkingSpot(lot_id=lot.id, is_occupied=False)
            db.session.add(spot)
    db.session.commit()
        
    return {"message" : "lot updated successfully"}


@app.route('/api/delete_lots/<int:lot_id>', methods=["DELETE"])
@auth_required("token")
@roles_accepted("admin")
def delete_lot(lot_id):
    lot = ParkingLot.query.get(lot_id)
    if not lot:
        return jsonify({"message": "Lot not found"})
    db.session.delete(lot)
    db.session.commit()
    return jsonify({"message" : "Lot deleted successfully!!"})



@app.route('/api/spot/<int:spot_id>', methods=["GET"])
@auth_required("token")
@roles_required("admin")
def get_spot(spot_id):
    spot = ParkingSpot.query.get(spot_id)

    if not spot:
        return jsonify({"message": "spot is not found"})

    response = {
        "id" : spot.id,
        "is_occupied" : spot.is_occupied,
        "status" : "Occupied" if spot.is_occupied else "Available"
    }

    if spot.is_occupied and spot.reservations:
        reservation = spot.reservations.filter(Reservation.leaving_timestamp == None).order_by(Reservation.parking_timestamp.desc()).first()
        if reservation:
            parking_cost = reservation.parking_cost
            if reservation.parking_timestamp and not reservation.leaving_timestamp:
                duration = datetime.utcnow() - reservation.parking_timestamp
                hours = duration.total_seconds()/3600
                parking_cost = round(hours*spot.lot.price, 2)

                response['reservation'] = {
                    "vehicle_number" : reservation.vehicle_number,
                    "customer_id" : reservation.user_id,
                    "start_time" : reservation.parking_timestamp,
                    "parking_cost" : parking_cost
                }
    return response


@app.route('/api/delete_spots/<int:spot_id>', methods=["DELETE"])
@auth_required("token")
@roles_accepted("admin")
def delete_spot(spot_id):
    spot = ParkingSpot.query.get(spot_id)

    if not spot:
        return jsonify({"message": "Spot not found"})

    if spot.is_occupied:
        return jsonify({"message" : "spot has occupied, can't delete"})

    active_reservation = spot.reservations.filter(Reservation.leaving_timestamp == None).first()

    if active_reservation:
        return jsonify({"message" : "Spot is in use"})

    db.session.delete(spot)
    db.session.commit()
    return jsonify({"message" : "Spot deleted successfully!!"})



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



@app.route("/api/user/reservations", methods=["GET"])
@auth_required("token")
@roles_accepted("user", "admin")
def get_user_reservations():
    reservations = Reservation.query.filter_by(user_id = current_user.id).all()

    result = []

    for r in reservations:
        spot_info = {
            "id" : r.spot.id,
            "lot" : {
                "prime_locatione_name" : r.spot.lot.prime_location_name
            }
        }
        result.append({
            "id" : r.id,
            "vehicle_number" : r.vehicle_number,
            "parking_started" : bool(r.parking_timestamp),
            "parking_ended" : bool(r.leaving_timestamp),
            "start_time" : r.parking_timestamp.isoformat() if r.parking_timestamp else None,
            "end_time" : r.leaving_timestamp.isoformat() if r.leaving_timestamp else None,
            "spot" : spot_info,
            "parking_cost" : r.parking_cost,
        })

    return jsonify(result)

@app.route("/api/parking/lots", methods=["GET"])
@auth_required("token")
@roles_accepted("user", "admin")
def get_available_spots():
    lots = ParkingLot.query.all()

    result = []
    for lot in lots:
        result.append({
            "id" : lot.id,
            "prime_location_name" : lot.prime_location_name,
            "price" : lot.price,
            "spots" : [{ "id" : s.id, "is_occupied" : s.is_occupied} for s in lot.spots ]
        })
    return jsonify(result)


@app.route("/api/occupy_spot/<int:reservation_id>", methods=["PUT"])
@auth_required("token")
@roles_accepted("admin", "user")
def occupy_spot(reservation_id):
    reservation = Reservation.query.get(reservation_id)

    if not reservation:
        return jsonify({"message" : "reservation not available !!"})

    spot = reservation.spot 
    spot.is_occupied = True

    if not reservation.parking_timestamp:
        reservation.parking_timestamp = datetime.now(timezone.utc)

    db.session.commit()
    return jsonify({"message" : "spot is occupied"})

@app.route("/api/free_spot/<int:reservation_id>", methods=["PUT"])
@auth_required("token")
@roles_accepted("admin", "user")
def free_spot(reservation_id):
    reservation = Reservation.query.get(reservation_id)

    if not reservation:
        return jsonify({"message" : "reservation not available !!"})

    spot = reservation.spot 
    lot = spot.lot

    spot.is_occupied = False

    reservation.leaving_timestamp = datetime.utcnow()

    if reservation.parking_timestamp:
        duration = reservation.leaving_timestamp - reservation.parking_timestamp
        hours = duration.total_seconds()/3600
        reservation.parking_cost = round(hours*lot.price, 2)

    db.session.commit()
    return {"message" : "Spot is free", "parking_cost" : reservation.parking_cost}


@app.route("/api/book_spot/<int:spot_id>", methods=["POST"])
@auth_required("token")
@roles_accepted("admin", "user")
def book_spot(spot_id):

    data = request.get_json()

    spot = ParkingSpot.query.get(spot_id)

    if not spot:
        return {"message" : "Spot is not available"}
    
    if spot.is_occupied:
        return {"message" : "Spot is occupied"}
    
    spot.is_occupied = True

    reservation = Reservation(
        vehicle_number = data.get("vehicle_number"),
        parking_timestamp = None,
        leaving_timestamp = None,        
        parking_cost = 0.0,
        remarks = data.get("remarks"),
        spot_id = spot.id,
        user_id = current_user.id
    )

    try:
        db.session.add(reservation)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return{"message": f"Database error : {str(e)} "}
    return {"message": "Spot is booked"}


@app.route("/api/lot_first_available_spot/<int:lot_id>", methods=["GET"])
@auth_required("token")
@roles_accepted("admin", "user")
def lot_first_available_spot(lot_id):
    lot = ParkingLot.query.get(lot_id)
    if not lot:
        return { "message" : "lot not found" }

    spot = next((s for s in lot.spots if not s.is_occupied), None)
    if not spot: 
        return {"message" : "No Spot available"}
    return {"spot_id" : spot.id}


@app.route("/api/search/user/<int:user_id>")
@auth_required("token")
@roles_accepted("admin")
def search_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return {"message" : "User is not found"}
    return {
        "id" : user.id,
        "email" : user.email,
        "username" : user.username,
        "active" : user.active
    }

@app.route("/api/search/lot")
@auth_required("token")
@roles_required("admin")
def search_lot():
    location = request.args.get("location", "")
    lots = ParkingLot.query.filter(ParkingLot.prime_location_name.ilike(f"%{location}%")).all()

    return {
        "results" : [
            {
                "id" : lot.id,
                "prime_location_name" : lot.prime_location_name,
                "address" : lot.address,
                "pincode" : lot.pincode,
                "price" : lot.price
            } for lot in lots
        ]
    }