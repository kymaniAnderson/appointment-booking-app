from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
from dotenv import load_dotenv

from flask import jsonify, request
from flask_mail import Mail, Message
from requests import get
from marshmallow import Schema, fields, ValidationError
from bson.json_util import dumps
from json import loads
from passlib.hash import pbkdf2_sha256
from datetime import datetime

import uuid
import os

# APP:
app = Flask(__name__)
load_dotenv()

# CORS:
api_config = {
    "origins": os.getenv("ORIGINS"),
    "methods": ["OPTIONS", "HEAD", "GET", "POST", "PATCH", "DELETE"],
}
CORS(app, resources={r"/*": api_config})

# DB:
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)

user_operations = mongo.db.users
patient_operations = mongo.db.patients
appointment_operations = mongo.db.appointments

# EMAILS
mail_settings = {
    "MAIL_SERVER": "smtp.gmail.com",
    "MAIL_PORT": 465,
    "MAIL_USE_TLS": False,
    "MAIL_USE_SSL": True,
    "MAIL_USERNAME": os.getenv("EMAIL_USER"),
    "MAIL_PASSWORD": os.getenv("EMAIL_PASSWORD"),
}

app.config.update(mail_settings)
mail = Mail(app)


####### (USER ROUTES) #######
@app.route("/login", methods=["POST"])
def login():
    # LOGIN USER @ALL
    user_val = {
        "user_email": request.json["user_email"],
        "user_password": request.json["user_password"],
    }

    # ensure user exists
    if user_operations.find_one({"user_email": user_val["user_email"]}):

        user = user_operations.find_one({"user_email": user_val["user_email"]})

        # decrypt password and ensure it's correct
        if pbkdf2_sha256.verify(user_val["user_password"], user["user_password"]):

            # update user IP
            filt = {"user_email": user_val["user_email"]}

            user_ip = get("https://api.ipify.org").text
            user_update = {"$set": {"user_ip": user_ip}}

            user_operations.update_one(filt, user_update)

            return {
                "login": True,
                "message": "User logged in sucessful",
                "user_id": user["_id"],
                "user_type": user["user_type"],
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


@app.route("/register", methods=["POST"])
def register():
    # REGISTER USERS @ALL
    try:
        # grab user IP
        user_ip = get("https://api.ipify.org").text

        # ensure password is confirmed
        confirmation = request.json["confirmation"]
        if confirmation:

            try:
                user_id = request.json["test_id"]

            except Exception as e:
                user_id = uuid.uuid4().hex

            # grab user data from POST
            user = {
                "_id": user_id,
                "user_first_name": request.json["user_first_name"],
                "user_last_name": request.json["user_last_name"],
                "user_email": request.json["user_email"],
                "user_phone": request.json["user_phone"],
                "user_type": request.json["user_type"],
                "user_password": request.json["user_password"],
                "user_ip": user_ip,
            }

            # encrypt user password
            user["user_password"] = pbkdf2_sha256.hash(user["user_password"])

            # ensure user does not already exist before creation
            if user_operations.find_one({"user_email": user["user_email"]}):

                return {
                    "sucess": False,
                    "message": "User already exists",
                }, 400

            else:

                user_operations.insert_one(user)

                # email user's registration confirmation
                msg = Message(
                    subject="Welcome to MedManagment!",
                    sender=app.config.get("MAIL_USERNAME"),
                    recipients=[user["user_email"]],
                    body="Your Medmanagement account was sucessfully registered!",
                )
                mail.send(msg)

                return {
                    "sucess": True,
                    "message": "User stored in database",
                    "user_id": user["_id"],
                    "user_type": user["user_type"],
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


@app.route("/user/<path:id>", methods=["GET", "PATCH", "DELETE"])
def update_user(id):
    filt = {"_id": id}
    filt_2 = {"user_id": id}

    if request.method == "PATCH":

        # UPDATE USER @ALL
        user_update = {"$set": request.json}

        user_operations.update_one(filt, user_update)
        updated_user = user_operations.find_one(filt)

        return jsonify(loads(dumps(updated_user))), 200

    elif request.method == "DELETE":

        # DELETE ALL USER DATA @PATIENT
        # delete user
        user_profile = user_operations.delete_one(filt)
        result_1 = (
            "Deleted sucessfully"
            if user_profile.deleted_count == 1
            else "Error occured while trying to delete"
        )

        # delete patient medical data
        patient_profile = patient_operations.delete_one(filt)
        result_2 = (
            "Deleted sucessfully"
            if patient_profile.deleted_count == 1
            else "Error occured while trying to delete"
        )

        # delete attached appointments
        appointments = appointment_operations.delete_many(filt_2)
        result_3 = "Deleted sucessfully"

        return {
            "user": result_1,
            "medical_info": result_2,
            "appointments": result_3,
        }, 200

    else:
        # RETURN USER PROFILE @ALL
        user_profile = user_operations.find_one(filt)
        return jsonify(loads(dumps(user_profile))), 200


@app.route("/users", methods=["GET"])
def view_users():

    # RETURN USER PROFILE @DOCTOR
    user_profiles = user_operations.find()
    return jsonify(loads(dumps(user_profiles))), 200


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

        # RETURN MEDICAL PROFILE @ALL
        patient_profiles = patient_operations.find_one(filt)
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
    update = request.json["appointment_status"]
    doctor_id = request.json["user_id"]

    status_update = {"$set": {"appointment_status": update}}

    appointment_operations.update_one(filt, status_update)
    updated_appointment = appointment_operations.find_one(filt)

    # send email update on status
    patient = user_operations.find_one({"_id": updated_appointment["user_id"]})
    doctor = user_operations.find_one({"_id": doctor_id})

    message_body = "Hey there " + patient["user_first_name"] + " 👋,\n\n"
    message_body = (
        message_body + "Your appointment status has changed here are the details:\n"
    )
    message_body = (
        message_body + "\tStatus: " + updated_appointment["appointment_status"] + "\n"
    )
    message_body = (
        message_body + "\tDate: " + updated_appointment["appointment_date"] + "\n"
    )
    message_body = (
        message_body + "\tTime: " + updated_appointment["appointment_time"] + "\n"
    )
    message_body = (
        message_body
        + "\tDoctor's Name: "
        + doctor["user_first_name"]
        + " "
        + doctor["user_last_name"]
        + "\n"
    )
    message_body = message_body + "\tDoctor's Email: " + doctor["user_email"]

    msg = Message(
        subject="Appointment Status Update",
        sender=app.config.get("MAIL_USERNAME"),
        recipients=[patient["user_email"]],
        body=message_body,
    )

    mail.send(msg)

    return jsonify(loads(dumps(updated_appointment)))


@app.route("/personal-appointment/<path:id>", methods=["GET"])
def get_personal_appointments(id):
    # VIEW ALL PERSONAL APPOINTMENTS @PATIENT
    filt = {"user_id": id}

    personal_appointments = appointment_operations.find(filt)
    return jsonify(loads(dumps(personal_appointments))), 200


@app.route("/extras", methods=["GET"])
def get_extras():
    # getting extras for users
    date = datetime.now().strftime("%a, %d/%m/%Y %H:%M")

    json_body = {"date": date}

    return json_body


if __name__ == "__main__":
    app.run(debug=True, host=os.getenv("HOST"), port=os.getenv("PORT"))
