from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo

from flask import jsonify, request
from requests import get
from marshmallow import Schema, fields, ValidationError
from bson.json_util import dumps
from json import loads
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
patient_operations = mongo.db.patients
appointment_operations = mongo.db.appointments

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


####### (PATIENT ROUTES) #######
@app.route("/medical-profile/<path:id>", methods=["GET", "POST", "PATCH"])
def medical_profile(id):
    filt = {"_id": id}

    if request.method == "POST":

        # CREATE MEDICAL PROFILE @PATIENT
        try:
            patient_gender = request.json["patient_gender"]
            patient_dob = request.json["patient_dob"]
            patient_blood_type = request.json["patient_blood_type"]
            patient_height = request.json["patient_height"]
            patient_weight = request.json["patient_weight"]

            raw_data = {
                "_id": id,
                "patient_gender": patient_gender,
                "patient_dob": patient_dob,
                "patient_blood_type": patient_blood_type,
                "patient_height": patient_height,
                "patient_weight": patient_weight,
            }

            patient_operations.insert_one(raw_data)

            return {
                "sucess": True,
                "message": "Patient medical profile saved to database successfully!",
            }, 200

        except ValidationError as err1:
            return {
                "sucess": False,
                "message": "An error occured while trying to post patient medical profile",
            }, 400

    elif request.method == "PATCH":

        # UPDATE MEDICAL PROFILE @PATIENT
        profile_update = {"$set": request.json}

        patient_operations.update_one(filt, profile_update)
        updated_profile = patient_operations.find_one(filt)

        return jsonify(loads(dumps(updated_profile))), 200

    else:

        # RETURN MEDICAL PROFILE @PATIENT
        patient_profiles = patient_operations.find()
        return jsonify(loads(dumps(patient_profiles))), 200


####### (APPOINTMENT ROUTES) #######
@app.route("/appointment", methods=["GET", "POST"])
def general_appointments():
    if request.method == "POST":

        # BOOK APPOINTMENTS @PATIENT
        try:
            user_id = request.json["user_id"]
            appointment_date = request.json["appointment_date"]
            appointment_time = request.json["appointment_time"]
            appointment_reason = request.json["appointment_reason"]

            raw_data = {
                "_id": uuid.uuid4().hex,
                "user_id": user_id,
                "appointment_date": appointment_date,
                "appointment_time": appointment_time,
                "appointment_reason": appointment_reason,
                "appointment_status": "Pending",
            }

            appointment_operations.insert_one(raw_data)

            return {
                "sucess": True,
                "message": "Appointment saved to database successfully!",
            }, 200

        except ValidationError as err1:
            return {
                "sucess": False,
                "message": "An error occured while trying to post appointment",
            }, 400
    else:

        # VIEW ALL APPOINTMENTS @DOCTOR
        appointments = appointment_operations.find()
        return jsonify(loads(dumps(appointments))), 200


@app.route("/appointment/<path:id>", methods=["PATCH"])
def update_appointment_status(id):
    filt = {"_id": id}

    # UPDATE APPOINTMENT STATUS @DOCTOR
    status_update = {"$set": request.json}

    appointment_operations.update_one(filt, status_update)
    updated_appointment = appointment_operations.find_one(filt)

    return jsonify(loads(dumps(updated_appointment)))


@app.route("/personal-appointment/<path:id>", methods=["GET"])
def get_personal_appointments(id):
    # VIEW ALL PERSONAL APPOINTMENTS @PATIENT
    filt = {"user_id": id}

    personal_appointments = appointment_operations.find(filt)
    return jsonify(loads(dumps(personal_appointments))), 200


if __name__ == "__main__":
    app.run(debug=True, host="192.168.100.243", port=3000)
