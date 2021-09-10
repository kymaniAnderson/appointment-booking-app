// VARIABLE DECLARATIONS:
var connectionURL = "http://192.168.100.230:3000";
var userID;
var userType;

window.onload = function () {
    userID = sessionStorage.getItem("user_id");
    userType = sessionStorage.getItem("user_type");

    drawTable();
};

function getUsers() {
    return fetch(connectionURL.concat("/users"))
        .then((res) => res.json())
        .then((json) => json);
}

async function drawTable() {
    let users = await getUsers();

    users.forEach((user) => {
        if (user.user_type === "patient") {

            addTableBody(user);
        }
    });
    addTableHead();
}

// POPULATE PATIENT TABLE:
function addTableBody(patient) {
    var table = document.getElementById("patient-table");
    var row = table.insertRow(0);

    var patientID = row.insertCell(0);
    var patientFirstName = row.insertCell(1);
    var patientLastName = row.insertCell(2);
    var patientEmail = row.insertCell(3);
    var patientContact = row.insertCell(4);

    var patientActions = row.insertCell(5);

    patientID.innerHTML = patient._id;
    patientFirstName.innerHTML = patient.user_first_name;
    patientLastName.innerHTML = patient.user_last_name;
    patientEmail.innerHTML = patient.user_email;
    patientContact.innerHTML = patient.user_phone;

    // VIEW MEDICAL:
    var viewMedicalButton = document.createElement("BUTTON");
    viewMedicalButton.classList.add("purple-btn");
    viewMedicalButton.innerHTML = "View Medical";
    viewMedicalButton.setAttribute("onclick", "medicalProfileView('".concat(patient._id).concat("')"));
    patientActions.append(viewMedicalButton);
}

function addTableHead() {
    var table = document.getElementById("patient-table");
    var header = table.createTHead();
    var row = header.insertRow(0);

    var patientIDHead = row.insertCell(0);
    var patientFirstNameHead = row.insertCell(1);
    var patientLastNameHead = row.insertCell(2);
    var patientEmailHead = row.insertCell(3);
    var patientContactHead = row.insertCell(4);
    var patientActionsHead = row.insertCell(5);

    patientIDHead.innerHTML = "Patient ID";
    patientFirstNameHead.innerHTML = "First Name";
    patientLastNameHead.innerHTML = "Last Name";
    patientEmailHead.innerHTML = "Email";
    patientContactHead.innerHTML = "Phone Number";
    patientActionsHead.innerHTML = "Actions";
}

// VIEW MEDICAL PROFILE:
function getMedical(id) {
    return fetch(connectionURL.concat("/medical-profile/").concat(id))
        .then((res) => res.json())
        .then((json) => json);
}

async function medicalProfileView(id) {
    let medical = await getMedical(id);

    patientGender = document.getElementById("view-gender");
    patientDOB = document.getElementById("view-dob");
    patientBloodType = document.getElementById("view-blood-type");
    patientHeight = document.getElementById("view-height");
    patientWeight = document.getElementById("view-weight");

    patientGender.innerHTML = medical.patient_gender;
    patientDOB.innerHTML = medical.patient_dob;
    patientBloodType.innerHTML = medical.patient_blood_type;
    patientHeight.innerHTML = medical.patient_height;
    patientWeight.innerHTML = medical.patient_weight;

    togglePopup();
}

function togglePopup() {
    var blur = document.getElementById("blur");
    blur.classList.toggle("active");
    var popup = document.getElementById("popup");
    popup.classList.toggle("active");
}

document.getElementById("back").addEventListener("click", function () {
    window.location.reload();
});

function logout() {
    sessionStorage.clear();
    window.location.href = "login.html"
}