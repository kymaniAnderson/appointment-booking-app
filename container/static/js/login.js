// VARIABLE DECLARATIONS:
var connectionURL = "https://www.kymani-andersons-api.live";

// clear the user session
window.onload = function () {
  sessionStorage.clear();
};

// @POST: login user 
document
  .getElementById("login-submit")
  .addEventListener("click", function (event) {
    event.preventDefault();

    let userEmail = document.getElementById("login-email").value;
    let userPassword = document.getElementById("login-password").value;

    let jsonBody = {
      "user_email": userEmail,
      "user_password": userPassword
    };

    fetch(connectionURL.concat("/login"), {
      method: "POST",
      body: JSON.stringify(jsonBody),
      headers: {
        "Content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(function (mssg) {
        // if login is true redirect based on user type
        if (mssg["login"]) {

          sessionStorage.setItem("user_id", mssg["user_id"]);
          sessionStorage.setItem("user_type", mssg["user_type"]);

          if (mssg["user_type"] === "patient") {

            window.location.href = "patient-dash.html";
          }
          else {

            window.location.href = "doctor-dash.html";
          }
        }
        // else display the error message we got back
        else {

          var errMessage = document.getElementById("err-message-login");
          errMessage.innerHTML = JSON.stringify(mssg["message"]);
          errMessage.style.display = "block";
        }
      });
  });


// @POST: register a new user
document
  .getElementById("register-submit")
  .addEventListener("click", function (event) {
    event.preventDefault();

    let userFirstName = document.getElementById("fname").value;
    let userLastName = document.getElementById("lname").value;
    let userEmail = document.getElementById("email").value;
    let userPhone = document.getElementById("phone").value;
    let userType = document.getElementById("user-type").value;
    let userPassword = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirm-password").value;

    // ensure passwords match
    var confirmation;
    if (userPassword === confirmPassword) {

      confirmation = true;
    }
    else {

      confirmation = false;
    }

    let jsonBody = {
      "confirmation": confirmation,
      "user_first_name": userFirstName,
      "user_last_name": userLastName,
      "user_email": userEmail,
      "user_phone": userPhone,
      "user_type": userType,
      "user_password": userPassword
    };

    fetch(connectionURL.concat("/register"), {
      method: "POST",
      body: JSON.stringify(jsonBody),
      headers: {
        "Content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(function (mssg) {
        if (mssg["sucess"]) {

          sessionStorage.setItem("user_id", mssg["user_id"]);
          sessionStorage.setItem("user_type", jsonBody["user_type"]);

          if (jsonBody["user_type"] === "patient") {

            createMedicalProfile(mssg["user_id"]);
            window.location.href = "patient-dash.html";
          }
          else {

            window.location.href = "doctor-dash.html";
          }
        }
        else {

          var errMessage = document.getElementById("err-message-register");
          errMessage.innerHTML = JSON.stringify(mssg["message"]);
          errMessage.style.display = "block";
        }
      });
  });

//@POST: create medical profile
function createMedicalProfile(id) {
  let jsonBody = {
    "patient_gender": "NULL",
    "patient_dob": "NULL",
    "patient_blood_type": "NULL",
    "patient_height": "NULL",
    "patient_weight": "NULL",
  };

  fetch(connectionURL.concat("/medical-profile/").concat(id), {
    method: "POST",
    body: JSON.stringify(jsonBody),
    headers: {
      "Content-type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((json) => console.log(json));

}

// toggle between login and register forms
function toggleLogin() {
  var loginForm = document.getElementById("login-form");
  var registerForm = document.getElementById("register-form");

  if (loginForm.style.display === "none") {

    loginForm.style.display = "block";
    registerForm.style.display = "none";
  }
  else {

    loginForm.style.display = "none";
    registerForm.style.display = "block";
  }
}