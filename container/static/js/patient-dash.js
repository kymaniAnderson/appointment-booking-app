// VARIABLE DECLARATIONS:
var connectionURL = "http://192.168.100.230:3000";
var userID;
var userType;

window.onload = function () {
    userID = sessionStorage.getItem("user_id");
    userType = sessionStorage.getItem("user_type");
    // userInitials = sessionStorage.getItem("user_initials");

    // var userIcon = document.getElementById("user-icon");
    // userIcon.innerHTML = userInitials;
    getExtras();
    drawTable();
};

function getExtras() {
    return fetch(connectionURL.concat("/extras"))
        .then((res) => res.json())
        .then(function (extras) {
            var extrasDate = document.getElementById("date");
            extrasDate.innerHTML = extras["date"];
        });
}

function getAppointments() {
    return fetch(connectionURL.concat("/personal-appointment/").concat(userID))
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

    appointmentIDHead.innerHTML = "Appointment ID";
    appointmentDateHead.innerHTML = "Date";
    appointmentTimeHead.innerHTML = "Time";
    appointmentReasonHead.innerHTML = "Reason";
    appointmentStatusHead.innerHTML = "Status";
}

function logout() {
    sessionStorage.clear();
    window.location.href = "login.html"
}