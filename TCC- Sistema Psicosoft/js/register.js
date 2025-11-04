/*
 * register.js
 * Contém a lógica para:
 * 1. Animação de troca de painel (Login/Cadastro)
 * 2. Envio do formulário de CADASTRO (para /cliente)
 * 3. Envio do formulário de LOGIN (para /login)
 */

// --- 1. LÓGICA DE ANIMAÇÃO DO PAINEL ---
const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const registerMobileBtn = document.getElementById('register-mobile');
const loginMobileBtn = document.getElementById('login-mobile');

if (registerBtn) {
    registerBtn.addEventListener('click', () => {
        container.classList.add("active");
    });
}
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        container.classList.remove("active");
    });
}
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

// --- 2. LÓGICA DOS FORMULÁRIOS (CADASTRO E LOGIN) ---
document.addEventListener('DOMContentLoaded', function() {

    // --- LÓGICA DE CADASTRO (SEU CÓDIGO ATUAL) ---
    const formulario = document.getElementById('formulario');
    if (formulario) {
        formulario.addEventListener('submit', function(event) {
            event.preventDefault(); 
            const formData = new FormData(this);
            const jsonData = {};
            formData.forEach(function(value, key) {
                jsonData[key] = value;
            });
            jsonData["Empresas"] = "PSICOSOFT";

            // URL da sua API de CADASTRO
            const url = 'https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/cliente'; 

            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.message || 'Erro de rede') });
                }
                return response.json(); 
            })
            .then(data => {
                console.log('Sucesso (Cadastro):', data);
                alert('Cadastro realizado com sucesso!');
                
                // Salva o CPF no localStorage após o cadastro
                localStorage.setItem('paciente_cpf', jsonData.cpf); 
                window.location.href = "dashboard.html"; 
            })
            .catch(error => {
                console.error('Erro (Cadastro):', error);
                alert(`ERRO NO CADASTRO: ${error.message}`);
            });
        });
    }

    // --- NOVA LÓGICA DE LOGIN (BASEADA NO SEU "YOSHI SCRIPT") ---
    
    // 1. Encontra o formulário de login pelo ID "login-form"
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        // Encontra o parágrafo de erro
        const loginError = document.getElementById('login-error');

        // 2. Adiciona o "ouvinte" de evento de "submit"
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o recarregamento da página
            loginError.textContent = ""; // Limpa erros antigos

            // 3. Pega os valores dos inputs de login pelos IDs corretos
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            // Prepara os dados para a sua API
            const data = {
                email: email,
                password: password,
                empresa: "PSICOSOFT"
            };

            // 4. URL da sua API de LOGIN (do seu script antigo)
            const urlLogin = 'https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/login';

            // 5. Envia o POST request
            fetch(urlLogin, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { 
                        throw new Error(err.message || "Erro desconhecido"); 
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log(data); // Ex: { success: true, client: { ... } }

                if (data.success) {
                    alert(`Login bem-sucedido! \nBem-vindo(a) ${data.client.name}`);

                    // 7. Redireciona para o painel de controle
                    window.location.href = "dashboard.html"; 
                } else {
                    // Se 'data.success' for false
                    throw new Error(data.message || "Login falhou. Verifique suas credenciais.");
                }
            })
            .catch((error) => {
                // 8. Mostra o erro na tela (ex: "Usuário ou senha incorretos")
                console.error('Erro (Login):', error);
                loginError.textContent = error.message; 
            });
        });
    }
});