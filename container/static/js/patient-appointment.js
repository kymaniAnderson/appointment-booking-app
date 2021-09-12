// VARIABLE DECLARATIONS:
var connectionURL = "http://45.79.219.166:80";
var userID;
var userType;

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

// BOOK APPOINTMENT:
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

function logout() {
    sessionStorage.clear();
    window.location.href = "login.html";
}