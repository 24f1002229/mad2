from flask import Flask, render_template, request, jsonify
from flask_security import login_user
from flask_login import current_user
from werkzeug.security import check_password_hash
from app import app
from utils import roles_list


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



