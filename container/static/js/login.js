// VARIABLE DECLARATIONS:
var connectionURL = "http://192.168.100.230:5000";

window.onload = function () {
  sessionStorage.clear();
};

// LOGIN: 
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
        if (mssg["login"]) {

          sessionStorage.setItem("user_id", mssg["user_id"]);
          sessionStorage.setItem("user_type", mssg["user_type"]);
          window.location.href = "patient-dash.html"
        }
        else {

          var errMessage = document.getElementById("err-message-login");
          errMessage.innerHTML = JSON.stringify(mssg["message"]);
          errMessage.style.display = "block";
        }
      });
  });


// REGISTER: 
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

// TOGGLE FORM:
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
