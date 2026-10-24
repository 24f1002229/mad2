from flask import Flask, render_template, request, jsonify
from flask_security import login_user, auth_required, roles_required, roles_accepted
from flask_login import current_user
from werkzeug.security import check_password_hash, generate_password_hash
from app import app
from .utils import roles_list
from backend.model import db


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

