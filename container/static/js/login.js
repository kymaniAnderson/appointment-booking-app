// VARIABLE DECLARATIONS:
var connectionURL = "http://192.168.100.243:3000";

// window.onload = function () {
//   sessionStorage.clear();
// };

// LOGIN: 
document
  .getElementById("login-submit")
  .addEventListener("click", function (event) {
    event.preventDefault();

    let email = document.getElementById("login-email").value;
    let password = document.getElementById("login-password").value;

    let jsonBody = {
      email: email,
      password: password
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

          //sessionStorage.setItem("data", jsonBody);
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

    let fname = document.getElementById("fname").value;
    let lname = document.getElementById("lname").value;
    let email = document.getElementById("email").value;
    let userType = document.getElementById("user-type").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirm-password").value;

    var confirmation;
    if (password === confirmPassword) {

      confirmation = true;
    }
    else {

      confirmation = false;
    }

    let jsonBody = {
      fname: fname,
      lname: lname,
      email: email,
      userType: userType,
      password: password,
      confirmation: confirmation
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

          //sessionStorage.setItem("data", jsonBody);
          window.location.href = "patient-dash.html"
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
