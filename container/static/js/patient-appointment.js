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
    }
};

// @POST: book a new user appointment
document.getElementById("appointment-submit").addEventListener("click", function (event) {
    event.preventDefault();

    let appointmentDate = document.getElementById("appointment-date").value;
    let appointmentTime = document.getElementById("appointment-time").value;
    let appointmentReason = document.getElementById("appointment-reason").value;

    let jsonBody = {
        "user_id": userID,
        "appointment_date": appointmentDate,
        "appointment_time": appointmentTime,
        "appointment_reason": appointmentReason
    };

    fetch(connectionURL.concat("/appointment"), {
        method: "POST",
        body: JSON.stringify(jsonBody),
        headers: {
            "Content-type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((json) => console.log(json));

    window.location.href = "patient-dash.html";
});

// redirect to login and clear user session
function logout() {
    sessionStorage.clear();
    window.location.href = "login.html";
}