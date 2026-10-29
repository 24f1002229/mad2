from flask import Flask
from flask_security import Security, SQLAlchemyUserDatastore
from werkzeug.security import generate_password_hash
from backend.model import db, User, Role
from backend.celery_init import celery_init_app
from celery.schedules import crontab

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///vehicle_app"
app.config["SECRET_KEY"] = "vehicle-parking"
app.config["SECURITY_PASSWORD_HASH"] = "bcrypt"
app.config["SECURITY_PASSWORD_SALT"] = "vehicle-salt"
datastore = SQLAlchemyUserDatastore(db, User, Role)
app.security = Security(app, datastore)

celery = celery_init_app(app)

with app.app_context():
    db.init_app(app)
    db.create_all()

    app.security.datastore.find_or_create_role(name="admin", description="superuser")
    app.security.datastore.find_or_create_role(name="user", description="general user")

    if not app.security.datastore.find_user(email="admin@gmail.com"):
        app.security.datastore.create_user(email="admin@gmail.com", username="admin", password = generate_password_hash("1234"), roles=["admin"])
    if not app.security.datastore.find_user(email="user@gmail.com"):
        app.security.datastore.create_user(email="user@gmail.com", username="user", password = generate_password_hash("1234"), roles=["user"])
    db.session.commit()

celery.conf.beat_schedule = {
    'monthly-report': {
        'task': 'backend.tasks.send_monthly_report',
        'schedule': 60.0,
    },
    'daily-report': {
        'task': 'backend.tasks.daily_reminder',
        'schedule': 60.0,
    },
}

if __name__=="__main__":
    app.run(debug=True)