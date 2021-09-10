try:
    from main import app
    import unittest

except Exception as e:
    print("Modules may be missing {} ".format(e))

############# TEST VARIABLES #############
good_user_register = {
    "test_id": "UserTestID-0101010101010101",
    "user_first_name": "UserTestFirstName",
    "user_last_name": "UserTestLastName",
    "user_email": "UserTestEmail@email.com",
    "user_phone": "UserTestPhone8760000000",
    "user_type": "patient",
    "user_password": "UserTestPassword",
    "confirmation": True,
}

bad_user_register = {
    "test_id": "UserTestID-0101010101010101",
    "user_first_name": "UserTestFirstName",
    "user_last_name": "UserTestLastName",
    "user_email": "UserTestEmail@email.com",
    "user_phone": "UserTestPhone8760000000",
    "user_type": "patient",
    "user_password": "UserTestPassword",
    "confirmation": False,
}

good_user_login = {
    "user_email": "UserTestEmail@email.com",
    "user_password": "UserTestPassword",
}

bad_user_login_1 = {
    "user_email": "UserTestEmail@email.com",
    "user_password": "something-else",
}

bad_user_login_2 = {
    "user_email": "someone-else@email.com",
    "user_password": "UserTestPassword",
}

good_book_appointment = {
    "user_id": "UserTestPatientID-010101010",
    "appointment_date": "UserTestDate-2021-09-30",
    "appointment_time": "UserTestTime-13:00",
    "appointment_reason": "UserTestReason-I feel sick.",
}


class ApiTest(unittest.TestCase):
    API_URL = "http://192.168.100.230:5000"

    # TEST USER REGISTER
    REGISTER_URL = "{}/register".format(API_URL)

    def test_register_users_case_1(self):
        response = app.test_client(self).post(
            ApiTest.REGISTER_URL, json=bad_user_register
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.content_type, "application/json")
        self.assertTrue(b"Passwords do not match" in response.data)

    def test_register_users_case_2(self):
        response = app.test_client(self).post(
            ApiTest.REGISTER_URL, json=good_user_register
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, "application/json")
        self.assertTrue(b"User stored in database" in response.data)

        # then make sure we can't create this user again:

        response = app.test_client(self).post(
            ApiTest.REGISTER_URL, json=good_user_register
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.content_type, "application/json")
        self.assertTrue(b"User already exists" in response.data)

    # TEST USER LOGIN
    LOGIN_URL = "{}/login".format(API_URL)

    def test_login_users_case_1(self):
        response = app.test_client(self).post(ApiTest.LOGIN_URL, json=good_user_login)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, "application/json")
        self.assertTrue(b"User logged in sucessful" in response.data)

    def test_login_users_case_2(self):
        response = app.test_client(self).post(ApiTest.LOGIN_URL, json=bad_user_login_1)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.content_type, "application/json")
        self.assertTrue(b"Incorrect password" in response.data)

    def test_login_users_case_3(self):
        response = app.test_client(self).post(ApiTest.LOGIN_URL, json=bad_user_login_2)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.content_type, "application/json")
        self.assertTrue(b"User does not exist" in response.data)

    # TEST USERS
    USERS_URL = "{}/users".format(API_URL)

    def test_get_users(self):
        response = app.test_client(self).get(ApiTest.USERS_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, "application/json")

    # TEST APPOINTMENTS
    APPOINTMENTS_URL = "{}/appointment".format(API_URL)

    def test_book_appointments(self):
        response = app.test_client(self).post(
            ApiTest.APPOINTMENTS_URL, json=good_book_appointment
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, "application/json")
        self.assertTrue(b"Appointment saved to database successfully!" in response.data)

    def test_get_appointments(self):
        response = app.test_client(self).get(ApiTest.APPOINTMENTS_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, "application/json")
        self.assertTrue(b"UserTestPatientID-010101010" in response.data)

    # DELETE USER
    SINGLE_USER_URL = "{}/user/UserTestID-0101010101010101".format(API_URL)

    def test_delete_user(self):
        response = app.test_client(self).delete(ApiTest.SINGLE_USER_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, "application/json")
        self.assertTrue(b"Deleted sucessfully" in response.data)


if __name__ == "__main__":
    unittest.main()
