// VARIABLE DECLARATIONS:
var connectionURL = "http://45.79.219.166:80";
var userID;
var userType;
var today;

window.onload = function () {
    if (sessionStorage.getItem("user_id") === null) {

        alert("Please login to continue.")
        logout();
    }
    else {

        userID = sessionStorage.getItem("user_id");
        userType = sessionStorage.getItem("user_type");

        getExtras();
        drawTable();
    }
};

function getExtras() {
    return fetch(connectionURL.concat("/extras"))
        .then((res) => res.json())
        .then(function (extras) {
            var extrasDate = document.getElementById("date");
            var date = extras["date"];

            today = date.substr(11, 4).concat(date.substr(8, 2)).concat(date.substr(5, 2));

            extrasDate.innerHTML = date;
        });
}

function getAppointments() {
    return fetch(connectionURL.concat("/appointment"))
        .then((res) => res.json())
        .then((json) => json);
}

async function drawTable() {
    let appointments = await getAppointments();

    appointments.forEach((appointment) => {
        var temp = appointment.appointment_date;
        var appointmentDate = temp.substr(0, 4).concat(temp.substr(5, 2)).concat(temp.substr(8, 2));

        if (appointment.appointment_status !== "Completed" && appointmentDate < today) {

            updateAppointment("Completed", appointment._id);
        }

        addTableBody(appointment);
    });
    addTableHead();
}


// POPULATE TABLE:
function addTableBody(appointment) {
    var table = document.getElementById("appointment-table");
    var row = table.insertRow(0);

    var appointmentID = row.insertCell(0);
    var appointmentDate = row.insertCell(1);
    var appointmentTime = row.insertCell(2);
    var appointmentReason = row.insertCell(3);
    var appointmentStatus = row.insertCell(4);

    var appointmentActions = row.insertCell(5);

    appointmentID.innerHTML = appointment._id;
    appointmentDate.innerHTML = appointment.appointment_date;
    appointmentTime.innerHTML = appointment.appointment_time;
    appointmentReason.innerHTML = appointment.appointment_reason;
    appointmentStatus.innerHTML = appointment.appointment_status;

    if (appointment.appointment_status === "Declined") {
        appointmentStatus.style.color = "#d1350d";
    }
    if (appointment.appointment_status === "Approved") {
        appointmentStatus.style.color = "#2da44e";
    }
    if (appointment.appointment_status === "Pending") {
        appointmentStatus.style.color = "#f6bd3a";
    }
    if (appointment.appointment_status === "Completed") {
        appointmentStatus.style.color = "#282321";
    }

    if (appointment.appointment_status !== "Completed") {

        // APPROVE:
        var approveButton = document.createElement("BUTTON");
        approveButton.classList.add("green-btn");
        approveButton.innerHTML = "Approve";
        approveButton.setAttribute("onclick", "updateAppointment('Approved','".concat(appointment._id).concat("')"));
        appointmentActions.append(approveButton);

        // DECLINE:
        var declineButton = document.createElement("BUTTON");
        declineButton.classList.add("red-btn");
        declineButton.innerHTML = "Decline";
        declineButton.setAttribute("onclick", "updateAppointment('Declined','".concat(appointment._id).concat("')"));
        appointmentActions.append(declineButton);
    }
    else {
        appointmentActions.innerHTML = "No Action Allowed";
    }
}

function addTableHead() {
    var table = document.getElementById("appointment-table");
    var header = table.createTHead();
    var row = header.insertRow(0);

    var appointmentIDHead = row.insertCell(0);
    var appointmentDateHead = row.insertCell(1);
    var appointmentTimeHead = row.insertCell(2);
    var appointmentReasonHead = row.insertCell(3);
    var appointmentStatusHead = row.insertCell(4);
    var appointmentActionsHead = row.insertCell(5);

    appointmentIDHead.innerHTML = "Appointment ID";
    appointmentDateHead.innerHTML = "Date";
    appointmentTimeHead.innerHTML = "Time";
    appointmentReasonHead.innerHTML = "Reason";
    appointmentStatusHead.innerHTML = "Status";
    appointmentActionsHead.innerHTML = "Actions";
}

function updateAppointment(status, id) {

    jsonBody = {
        "appointment_status": status,
        "user_id": userID
    };

    fetch(connectionURL.concat("/appointment/").concat(id), {
        method: "PATCH",
        body: JSON.stringify(jsonBody),
        headers: {
            "Content-type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((json) => console.log(json));

    location.reload();
}

function logout() {
    sessionStorage.clear();
    window.location.href = "login.html"
}