// VARIABLE DECLARATIONS:
var connectionURL = "https://www.kymani-andersons-api.live";
var userID;
var userType;

// ensure user is logged in
window.onload = function () {
    if (sessionStorage.getItem("user_id") === null) {

        alert("Please login to continue.")
        logout();
    }
    else {

        userID = sessionStorage.getItem("user_id");
        userType = sessionStorage.getItem("user_type");

        userProfileView();
    }
};

// @PATCH: update doctor profile info
document.getElementById("update-profile-submit").addEventListener("click", function (event) {
    event.preventDefault();

    let userFirstName = document.getElementById("fname").value;
    let userLastName = document.getElementById("lname").value;
    let userEmail = document.getElementById("email").value;
    let userPhone = document.getElementById("phone-num").value;

    jsonBody = {};

    if (userFirstName !== "") jsonBody["user_first_name"] = userFirstName;
    if (userLastName !== "") jsonBody["user_last_name"] = userLastName;
    if (userEmail !== "") jsonBody["user_email"] = userEmail;
    if (userPhone !== "") jsonBody["user_phone"] = userPhone;

    fetch(connectionURL.concat("/user/").concat(userID), {
        method: "PATCH",
        body: JSON.stringify(jsonBody),
        headers: {
            "Content-type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((json) => console.log(json));

    location.reload();
});

// @GET: get doctor profile current info
function getUser() {
    return fetch(connectionURL.concat("/user/").concat(userID))
        .then((res) => res.json())
        .then((json) => json);
}

// show doctor profile current info
async function userProfileView() {
    let user = await getUser();

    userFirstName = document.getElementById("view-fname");
    userLastName = document.getElementById("view-lname");
    userEmail = document.getElementById("view-email");
    userPhone = document.getElementById("view-phone-num");

    userFirstName.innerHTML = user.user_first_name;
    userLastName.innerHTML = user.user_last_name;
    userEmail.innerHTML = user.user_email;
    userPhone.innerHTML = user.user_phone;
}

// @DELETE: remove all connected user data
function deleteAcc() {
    var confirmation = confirm("Are you sure you want to delete your account?");;

    if (confirmation == true) {

        fetch(connectionURL.concat("/user/").concat(userID), {
            method: "DELETE",
            headers: {
                "Content-type": "application/json",
            }
        })
            .then((res) => res.json())
            .then((json) => console.log(json));

        logout();
    }
}

// redirect to login and clear user session
function logout() {
    sessionStorage.clear();
    window.location.href = "login.html";
}