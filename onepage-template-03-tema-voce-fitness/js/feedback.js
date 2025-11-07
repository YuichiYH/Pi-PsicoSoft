document.getElementById('feedbackForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Previne o envio padrão do formulário

    const formData = new FormData(this); // Coleta os dados do formulário

    // Converte o FormData para um objeto simples
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Captura a nota do formulário
    const rating = document.querySelector('input[name="rating"]:checked');
    if (rating) {
        data.nota = rating.value; // Definindo a nota de 1 a 5
    } else {
        alert("Por favor, selecione uma avaliação de 1 a 5 estrelas.");
        return;
    }

    // Estrutura os dados conforme o formato do código Lambda
    const feedbackData = {
        empresa: data.company,
        email: data.email,
        nota: data.nota, // Nota da avaliação
        funcionario: data.employee,
        mensagem: data.message
    };

    // Envia os dados para o servidor via POST para o Lambda
    fetch('https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData), // Envia os dados como JSON
    })
    .then(response => response.json()) // Assumindo que o servidor responde com JSON
    .then(data => {
        alert('Feedback enviado com sucesso!');
        document.getElementById('feedbackForm').reset(); // Limpa o formulário
    })
    .catch(error => {
        console.error('Erro ao enviar feedback:', error);
        alert('Ocorreu um erro. Tente novamente!');
    });
});
