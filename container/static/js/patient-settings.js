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
        medicalProfileView();
    }
};

// @PATCH: update the patient profile
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

// @GET: get patient profile current info
function getUser() {
    return fetch(connectionURL.concat("/user/").concat(userID))
        .then((res) => res.json())
        .then((json) => json);
}

// show patient profile current info
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


// @PATCH: update medical profile info
document.getElementById("update-patient-data-submit").addEventListener("click", function (event) {
    event.preventDefault();

    try {

        let patientGender = document.getElementById("gender").value;
        let patientDOB = document.getElementById("dob").value;
        let patientBloodType = document.getElementById("blood-type").value;
        let patientHeight = document.getElementById("height").value;
        let patientWeight = document.getElementById("weight").value;

        jsonBody = {};

        if (patientGender !== "") jsonBody["patient_gender"] = patientGender;
        if (patientDOB !== "") jsonBody["patient_dob"] = patientDOB;
        if (patientBloodType !== "") jsonBody["patient_blood_type"] = patientBloodType;
        if (patientHeight !== "") jsonBody["patient_height"] = patientHeight;
        if (patientWeight !== "") jsonBody["patient_weight"] = patientWeight;

        fetch(connectionURL.concat("/medical-profile/").concat(userID), {
            method: "PATCH",
            body: JSON.stringify(jsonBody),
            headers: {
                "Content-type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((json) => console.log(json));

    } catch (error) {

        createMedicalProfile(userID);
    }


    location.reload();
});

// @GET: get medical profile current info
function getMedical() {
    return fetch(connectionURL.concat("/medical-profile/").concat(userID))
        .then((res) => res.json())
        .then((json) => json);
}

// show medical profile current info 
async function medicalProfileView() {
    let medical = await getMedical();

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

//@POST: create medical profile
function createMedicalProfile(id) {
    let jsonBody = {
        "patient_gender": "NOT ADDED",
        "patient_dob": "NOT ADDED",
        "patient_blood_type": "NOT ADDED",
        "patient_height": "NOT ADDED",
        "patient_weight": "NOT ADDED",
    };

    fetch(connectionURL.concat("/medical-profile/").concat(id), {
        method: "POST",
        body: JSON.stringify(jsonBody),
        headers: {
            "Content-type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((json) => console.log(json));
}

// redirect to login and clear user session
function logout() {
    sessionStorage.clear();
    window.location.href = "login.html";
}