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

        drawTable();
    }
};

// @GET: get all users
function getUsers() {
    return fetch(connectionURL.concat("/users"))
        .then((res) => res.json())
        .then((json) => json);
}

// filter users for patient type and create table
async function drawTable() {
    let users = await getUsers();

    users.forEach((user) => {
        if (user.user_type === "patient") {

            addTableBody(user);
        }
    });
    addTableHead();
}

// populate the table body
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

    // view patient's medical data button:
    var viewMedicalButton = document.createElement("BUTTON");
    viewMedicalButton.classList.add("purple-btn");
    viewMedicalButton.innerHTML = "View Medical";
    viewMedicalButton.setAttribute("onclick", "medicalProfileView('".concat(patient._id).concat("')"));
    patientActions.append(viewMedicalButton);
}

// table head is static
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

// @GET: retrieve medical data using ID
function getMedical(id) {
    return fetch(connectionURL.concat("/medical-profile/").concat(id))
        .then((res) => res.json())
        .then((json) => json);
}

// create card with medical data
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

// toggle patient card pop-up
function togglePopup() {
    var blur = document.getElementById("blur");
    blur.classList.toggle("active");
    var popup = document.getElementById("popup");
    popup.classList.toggle("active");
}

// reload page on back button pressed
document.getElementById("back").addEventListener("click", function () {
    window.location.reload();
});

// redirect to login and clear user session
function logout() {
    sessionStorage.clear();
    window.location.href = "login.html"
}