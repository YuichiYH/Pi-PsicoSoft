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
