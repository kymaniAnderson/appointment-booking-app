from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo

from flask import jsonify, request
from requests import get
from marshmallow import Schema, fields, ValidationError
from passlib.hash import pbkdf2_sha256
import uuid
import socket

# APP:
app = Flask(__name__)

# CORS:
api_config = {
    "origins": ["http://192.168.100.243", "http://127.0.0.1:5500"],
    "methods": ["OPTIONS", "HEAD", "GET", "POST", "PATCH", "DELETE"],
}
CORS(app, resources={r"/*": api_config})

# DB:
app.config[
    "MONGO_URI"
] = "mongodb+srv://admin:P98fB292RPizAVAt@cluster0.gtdnk.mongodb.net/medmanagement?retryWrites=true&w=majority"
mongo = PyMongo(app)

user_operations = mongo.db.users

# (USER) LOGIN
@app.route("/login", methods=["POST"])
def login():
    # grab user data from POST
    user_val = {
        "email": request.json["email"],
        "password": request.json["password"],
    }

    # ensure user exists
    if user_operations.find_one({"email": user_val["email"]}):

        user = user_operations.find_one({"email": user_val["email"]})

        # decrypt password and ensure it's correct
        if pbkdf2_sha256.verify(user_val["password"], user["password"]):

            return {
                "login": True,
                "message": "User logged in sucessful",
            }, 200
        else:

            return {
                "login": False,
                "message": "Incorrect password",
            }, 400
    else:

        return {
            "login": False,
            "message": "User does not exist",
        }, 400


# (USER) REGISTER
@app.route("/register", methods=["POST"])
def register():
    try:
        # grab user IP
        ip_addr = get("https://api.ipify.org").text

        # ensure password is confirmed
        confirmation = request.json["confirmation"]
        if confirmation:

            # grab user data from POST
            user = {
                "_id": uuid.uuid4().hex,
                "fname": request.json["fname"],
                "lname": request.json["lname"],
                "email": request.json["email"],
                "userType": request.json["userType"],
                "password": request.json["password"],
                "ip_addr": ip_addr,
            }
            # encrypt user password
            user["password"] = pbkdf2_sha256.hash(user["password"])

            # ensure user does not already exist before creation
            if user_operations.find_one({"email": user["email"]}):

                return {
                    "sucess": False,
                    "message": "User already exists",
                }, 400

            else:

                user_operations.insert_one(user)
                return {
                    "sucess": True,
                    "message": "User stored in database",
                }, 200
        else:

            return {
                "sucess": False,
                "message": "Passwords do not match",
            }, 400

    except ValidationError as err:
        return {
            "sucess": False,
            "message": "An error occured while trying to register new user",
        }, 400


# (USER) LOGOUT
@app.route("/logout")
def logout():
    return {
        "sucess": True,
        "message": "Logout sucessful",
    }, 200


# (PATIENT) BOOK APPOINTMENT
@app.route("/book-appointment")
def book_appointment():
    pass


if __name__ == "__main__":
    app.run(debug=True, host="192.168.100.243", port=3000)
