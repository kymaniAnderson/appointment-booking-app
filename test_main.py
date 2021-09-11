from server.app import app
import unittest


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

good_user_patch = {"user_phone": "UserTestPatchPhone876111111"}

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


class AppTest(unittest.TestCase):
    API_URL = "http://192.168.100.230:3000"

    APPOINTMENTS_URL = "{}/appointment".format(API_URL)
    USERS_URL = "{}/users".format(API_URL)
    REGISTER_URL = "{}/register".format(API_URL)
    LOGIN_URL = "{}/login".format(API_URL)
    SINGLE_USER_URL = "{}/user/UserTestID-0101010101010101".format(API_URL)

    # NEW USER REGISTER/LOGIN USERFLOW
    def test_register_login_user_flow(self):
        # 1. register a new user
        ## a. if passwords do not match
        response_1 = app.test_client(self).post(
            AppTest.REGISTER_URL, json=bad_user_register
        )
        self.assertEqual(response_1.status_code, 400)
        self.assertEqual(response_1.content_type, "application/json")
        self.assertTrue(b"Passwords do not match" in response_1.data)

        ## b. if passwords match and user exists
        response_2 = app.test_client(self).post(
            AppTest.REGISTER_URL, json=good_user_register
        )
        self.assertEqual(response_2.status_code, 200)
        self.assertEqual(response_2.content_type, "application/json")
        self.assertTrue(b"User stored in database" in response_2.data)

        ## c. ensure we can't create this user again
        response_3 = app.test_client(self).post(
            AppTest.REGISTER_URL, json=good_user_register
        )
        self.assertEqual(response_3.status_code, 400)
        self.assertEqual(response_3.content_type, "application/json")
        self.assertTrue(b"User already exists" in response_3.data)

        # 2. login new user
        ## a. if user does not exist
        response_4 = app.test_client(self).post(
            AppTest.LOGIN_URL, json=bad_user_login_2
        )
        self.assertEqual(response_4.status_code, 400)
        self.assertEqual(response_4.content_type, "application/json")
        self.assertTrue(b"User does not exist" in response_4.data)

        ## b. if password is incorrect
        response_5 = app.test_client(self).post(
            AppTest.LOGIN_URL, json=bad_user_login_1
        )
        self.assertEqual(response_5.status_code, 400)
        self.assertEqual(response_5.content_type, "application/json")
        self.assertTrue(b"Incorrect password" in response_5.data)

        ## c. if user exists and password is correct
        response_6 = app.test_client(self).post(AppTest.LOGIN_URL, json=good_user_login)
        self.assertEqual(response_6.status_code, 200)
        self.assertEqual(response_6.content_type, "application/json")
        self.assertTrue(b"User logged in sucessful" in response_6.data)

        # 3. update user info
        response_7 = app.test_client(self).patch(
            AppTest.SINGLE_USER_URL, json=good_user_patch
        )
        self.assertEqual(response_7.status_code, 200)
        self.assertEqual(response_7.content_type, "application/json")
        self.assertTrue(b"UserTestPatchPhone876111111" in response_7.data)

        # 4. delete all user data
        response_8 = app.test_client(self).delete(AppTest.SINGLE_USER_URL)
        self.assertEqual(response_8.status_code, 200)
        self.assertEqual(response_8.content_type, "application/json")

    # APPOINTMENT USERFLOW
    def test_appointment_user_flow(self):
        # 1. book an appointment
        response_1 = app.test_client(self).post(
            AppTest.APPOINTMENTS_URL, json=good_book_appointment
        )
        self.assertEqual(response_1.status_code, 200)
        self.assertEqual(response_1.content_type, "application/json")
        self.assertTrue(
            b"Appointment saved to database successfully!" in response_1.data
        )

        # 2. view the booked appointment
        response_2 = app.test_client(self).get(AppTest.APPOINTMENTS_URL)
        self.assertEqual(response_2.status_code, 200)
        self.assertEqual(response_2.content_type, "application/json")
        self.assertTrue(b"UserTestPatientID-010101010" in response_2.data)

        # 3. delete booked appointment
        response_3 = app.test_client(self).delete(AppTest.SINGLE_USER_URL)
        self.assertEqual(response_3.status_code, 200)
        self.assertEqual(response_3.content_type, "application/json")

    # USERS USERFLOW
    def test_get_users(self):
        response = app.test_client(self).get(AppTest.USERS_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, "application/json")


if __name__ == "__main__":
    unittest.main()
