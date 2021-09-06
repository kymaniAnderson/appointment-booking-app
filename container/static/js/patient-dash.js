// VARIABLE DECLARATIONS:
var connectionURL = "http://192.168.100.243:3000";

window.onload = function () {
    //data = sessionStorage.getItem("data");
    getSessionData();
};

// VIEW SESSION: 
function getUserSession() {
    return fetch(connectionURL.concat("/book-appointment"))
        .then((res) => res.json())
        .then((json) => json);
}

async function getSessionData() {
    let data = await getUserSession();
    console.log(data);
}

function logout() {
    return fetch(connectionURL.concat("/logout"))
        .then((res) => res.json())
        .then(function () {
            window.location.href = "login.html"
        });
}