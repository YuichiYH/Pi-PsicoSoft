function getInputValues() {
    var inputs = document.getElementsByTagName('input');
    console.log(inputs)

    var values = [];
    
    for (var i = 0; i < inputs.length; i++) {
        values.push(inputs[i].value);
      
    }

    console.log(localStorage.getItem(values[4]));

    return(values);
}

function login(){
    var values = getInputValues()

    console.log(values);

    var login_values = JSON.parse((localStorage.getItem(values[3])));

    console.log(login_values[1]);
    console.log(values[4]);

    if (login_values[4] === values[4]){
        window.location.href = "index.html"
    }

    console.log(login_values);
}


function Bem_vindo(){
    alert("Bemvindo  "+document.getElementById('email').value);

}






/* yoshi script */


document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    // Get form values
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    // Create an object to send in the POST request
    var data = {
        email: email,
        password: password
    };

    // Send POST request
    fetch('https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        // Check the response and show alert accordingly
        if (data.success) {
            alert("Login successful!");
        } else {
            alert("Login failed. Please check your credentials.");
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert("An error occurred while trying to login.");
    });
});

