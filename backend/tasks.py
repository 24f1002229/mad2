from celery import shared_task
from .model import User, Reservation, db, ParkingLot
from .mail import send_email
import os
from sqlalchemy import func
import pandas as pd
from .utils import format_report
from datetime import datetime, timezone



EXPORT_PATH = os.environ.get("EXPORT_PATH", "/tmp/exports")
os.makedirs(EXPORT_PATH, exist_ok=True)

@shared_task(name="backend.tasks.export_csv_task")
def export_csv_task(user_id):
    user = User.query.get(user_id)
    if not user:
        return {"error" : "user not found"}

    reservation = Reservation.query.filter_by(user_id=user_id).all()

    row = []
    for r in reservation:
        row.append({
            "lot_id" : r.spot.lot.id,
            "spot_id" : r.spot_id,
            "parking_timestamp" : str(r.parking_timestamp),
            "leaving_timestamp" : str(r.leaving_timestamp),
            "parking_cost" : r.parking_cost,
            "vehicle_number" : r.vehicle_number,
            "remarks" : r.remarks,
        })

    df = pd.DataFrame(row)
    filename = f"user_{user_id}.csv"
    path = os.path.join(EXPORT_PATH, filename)
    df.to_csv(path, index=False)

    data = {}
    data["username"] = user.username
    data["reservation"] = row

    message = format_report("templates/mail_details.html", data=data)
    send_email(user.email, "Parking Reservation Report", message=message, attachment_file=path)
    return {"file" : filename}


@shared_task(name="backend.tasks.daily_reminder")
def daily_reminder():
    users = User.query.all()
    notified_user = []

    today = datetime.now(timezone.utc).date()

    for user in users:
        reservations = db.session.query(Reservation).filter(
            Reservation.user_id == user.id,
            func.date(Reservation.parking_timestamp) == today
        ).all()

        data = {}
        data["username"] = user.username
        data["reservation"] = []
        data["message"] = "You don't have any reservation today"

        if not reservations and ParkingLot.query.count() > 0:
            message = format_report("templates/mail_details.html", data=data)
            send_email(user.email, "Daily Reminder Report", message=message)
            notified_user.append(user.email)

    return {"notified_users" : notified_user}


@shared_task(name="backend.tasks.send_monthly_report")
def send_monthly_report():
    users = User.query.all()

    today = datetime.now(timezone.utc).date()

    for user in users:
        reservations = Reservation.query.filter(
            Reservation.user_id == user.id,
            db.extract("month", Reservation.parking_timestamp) == datetime.now(timezone.utc).month,
            db.extract("year", Reservation.parking_timestamp) == datetime.now(timezone.utc).year,
        ).all()

        data = {}
        data["username"] = user.username
        data["reservation"] = reservations

        message = format_report("templates/mail_details.html", data=data)
        send_email(user.email, "Monthly Report", message=message)

    return "Monthly report sent"
