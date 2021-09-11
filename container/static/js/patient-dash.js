// VARIABLE DECLARATIONS:
var connectionURL = "http://192.168.100.230:3000";
var userID;
var userType;
var today;

var status1 = 0, status2 = 0, status3 = 0, status4 = 0;
var pieChart;
var xAxis, yAxis;
var barChart;

window.onload = function () {
    userID = sessionStorage.getItem("user_id");
    userType = sessionStorage.getItem("user_type");
    // userInitials = sessionStorage.getItem("user_initials");

    // var userIcon = document.getElementById("user-icon");
    // userIcon.innerHTML = userInitials;
    getExtras();
    drawTable();

    setTimeout(function () {
        drawCharts();
    }, 250);
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
    return fetch(connectionURL.concat("/personal-appointment/").concat(userID))
        .then((res) => res.json())
        .then((json) => json);
}

async function drawTable() {
    let appointments = await getAppointments();

    appointments.forEach((appointment) => {
        var temp = appointment.appointment_date;
        var appointmentDate = temp.substr(0, 4).concat(temp.substr(5, 2)).concat(temp.substr(8, 2));
        console.log(appointmentDate);
        if (appointment.appointment_status !== "Completed" && appointmentDate < today) {

            updateAppointment("Completed", appointment._id);
        }

        addTableBody(appointment);

        if (appointment.appointment_status === "Pending") status1++;
        if (appointment.appointment_status === "Approved") status2++;
        if (appointment.appointment_status === "Declined") status3++;
        if (appointment.appointment_status === "Completed") status4++;
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

function drawCharts() {
    var chart1 = document.getElementById('chart-1').getContext('2d');
    barChart = new Chart(chart1, {
        options: {
            plugins: {
                legend: {
                    display: false
                }
            }
        },

        type: 'bar',
        data: {
            labels: ["Pending", "Approved", "Declined", "Complete"],
            datasets: [{
                data: [status1, status2, status3, status4],
                backgroundColor: ["#f6bd3a", "#2da44e", "#d1350d", "#282321"],
                hoverOffset: 4
            }]
        }
    });

    var chart2 = document.getElementById('chart-2').getContext('2d');
    pieChart = new Chart(chart2, {
        options: {
            plugins: {
                legend: {
                    display: false
                }
            }
        },

        type: 'doughnut',
        data: {
            labels: ["Pending", "Approved", "Declined", "Complete"],
            datasets: [{
                data: [status1, status2, status3, status4],
                backgroundColor: ["#f6bd3a", "#2da44e", "#d1350d", "#282321"],
                hoverOffset: 4
            }]
        }
    });
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