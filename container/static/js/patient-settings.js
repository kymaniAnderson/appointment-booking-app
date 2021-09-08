// VARIABLE DECLARATIONS:
var connectionURL = "http://192.168.100.243:3000";
var userID;
var userType;

window.onload = function () {
    userID = sessionStorage.getItem("user_id");
    userType = sessionStorage.getItem("user_type");
};

// UPDATE USER PROFILE:
document.getElementById("update-profile-submit").addEventListener("click", function () {
    let userFirstName = document.getElementById("fname").value;
    let userLastName = document.getElementById("lname").value;
    let userEmail = document.getElementById("email").value;
    let userPhone = document.getElementById("phone-num").value;

    jsonBody = {};

    if (userFirstName !== "") jsonBody["user_first_name"] = userFirstName;
    if (userLastName !== "") jsonBody["user_last_name"] = userLastName;
    if (userEmail !== "") jsonBody["user_email"] = userEmail;
    if (userPhone !== "") jsonBody["user_phone"] = userPhone;

    fetch(connectionURL.concat("/update-user/").concat(userID), {
        method: "PATCH",
        body: JSON.stringify(jsonBody),
        headers: {
            "Content-type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((json) => console.log(json));
});

function logout() {
    sessionStorage.clear();
    window.location.href = "login.html";
}