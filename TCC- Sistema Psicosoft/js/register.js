const container = document.getElementById('container');

// Botões do Desktop (do painel roxo)
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

// Botões para o celular (os links de texto)
const registerMobileBtn = document.getElementById('register-mobile');
const loginMobileBtn = document.getElementById('login-mobile');

// Listener para o botão de Registrar (Desktop)
if (registerBtn) {
    registerBtn.addEventListener('click', () => {
        container.classList.add("active");
    });
}

// Listener para o botão de Login (Desktop)
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        container.classList.remove("active");
    });
}

// Listeners para os links do celular
if (registerMobileBtn) {
    registerMobileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        container.classList.add("active");
    });
}

if (loginMobileBtn) {
    loginMobileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        container.classList.remove("active");
    });
}



// Aguarda o carregamento completo do HTML
document.addEventListener('DOMContentLoaded', function() {

    const formulario = document.getElementById('formulario');

    // Verifica se o formulário existe antes de adicionar o listener
    if (formulario) {
        formulario.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o recarregamento da página

            const formData = new FormData(this);
            const jsonData = {};
            
            formData.forEach(function(value, key) {
                jsonData[key] = value;
            });

            jsonData["Empresas"] = "PSICOSOFT";
            jsonData["id"] = jsonData["email"];

            const url = 'https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/cliente';

            fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.message || 'Erro de rede') });
                }
                return response.json(); 
            })
            .then(data => {
                console.log('Sucesso:', data);
                alert('Cadastro realizado com sucesso!');
                
                // *** CORREÇÃO APLICADA AQUI ***
                // Redireciona para o painel, não para a landing page
                window.location.href = "dashboard.html"; 
            })
            .catch(error => {
                console.error('Erro:', error);
                alert(`ERRO NO CADASTRO: ${error.message}`);
            });
        });
    }
});