
document.getElementById('form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('id').value;
    const email = document.getElementById('nome').value;

    const response = await fetch('https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/funcionario/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email })
    });