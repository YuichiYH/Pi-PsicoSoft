
function getInputValues() {
    var inputs = document.getElementsByTagName('input');
    console.log(inputs)
    var values = [];
    for (var i = 0; i < inputs.length; i++) {
        values.push(inputs[i].value);
      
    }
    console.log(values);

    return(values);
}

function onRegister(){
    var values = getInputValues()

    // var error = document.getElementById("error")
    var inputs = document.getElementsByTagName('input');

    // error.textContent = ""

    console.log(values);

    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].value === '') {
            console.log("No values");
          return
        }
    }

    // if (localStorage.getItem(values[2]) !== null){
    //     //error.textContent += "Email já utilizado"
    //     return
    // }

    // if(values[2] !== values[3]){
    //     error.textContent += "Senhas não são as mesmas"
    //     return
    // }

    // if (!(values[4] < 100000000000)){
    //     console.log(values[4])
    //     error.textContent += "CPF invalido"
    //     return;
    // }

    localStorage.setItem(values[2], JSON.stringify(values));
    /* window.location.href = "login.html" */
}

const button = document.getElementById("submit");

/* button.addEventListener("click", onRegister); */






/* yoshi script */
document.getElementById('formulario').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    // Get form data
    var formData = new FormData(this);
    var jsonData = {};
    formData.forEach(function(value, key) {
        jsonData[key] = value;
    });

    jsonData["Empresas"] = "PSICOSOFT"

    // Send POST request
    var url = 'https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/paciente'; // Replace 'YOUR_URL_HERE' with the URL you want to send the request to
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        window.location.href = "login.html"
        // Do something with the response data if needed
    })
    .catch(error => {
        console.error('Error:', error);
        alert("ERRO NO CADASTRO")
        // Handle error
    });
});

