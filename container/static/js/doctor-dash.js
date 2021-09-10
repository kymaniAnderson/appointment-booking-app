// VARIABLE DECLARATIONS:
var connectionURL = "http://192.168.100.230:3000";
var userID;
var userType;

window.onload = function () {
    userID = sessionStorage.getItem("user_id");
    userType = sessionStorage.getItem("user_type");

    drawTable();
};

function getAppointments() {
    return fetch(connectionURL.concat("/appointment"))
        .then((res) => res.json())
        .then((json) => json);
}

async function drawTable() {
    let appointments = await getAppointments();

    appointments.forEach((appointment) => {
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