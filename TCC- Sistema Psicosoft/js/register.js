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
                window.location.href = "register.html"; 
            })
            .catch(error => {
                console.error('Erro:', error);
                alert(`ERRO NO CADASTRO: ${error.message}`);
            });
        });
    }
});

// --- 3. FORMULÁRIO DE LOGIN ---
console.log("--- 3. Procurando formulário de LOGIN ---");
const loginForm = document.getElementById('login-form');
console.log("Formulário de LOGIN encontrado:", loginForm); // DEBUG

if (loginForm) {
    console.log("Anexando 'submit' ao LOGIN"); // DEBUG
    const loginError = document.getElementById('login-error');

    loginForm.addEventListener('submit', async event => {
        console.log("--- EVENTO 'SUBMIT' DO LOGIN FOI DISPARADO! ---"); // DEBUG
        event.preventDefault();
        loginError.textContent = "";

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();

        console.log("Email:", email, "Password:", password); // DEBUG

        if (!email || !password) {
            console.log("Login bloqueado: campos vazios."); // DEBUG
            loginError.textContent = "Por favor, preencha e-mail e senha.";
            return;
        }

        const data = { email: email, password: password, empresa: "PSICOSOFT" };
        console.log("Enviando login:", data); // DEBUG

        try {
            const res = await fetch('https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const responseData = await res.json();
            console.log("🔹 Resposta login:", responseData);
            alert(JSON.stringify(responseData)); // debug

            if (responseData.success) {
                alert(`Login bem-sucedido! Bem-vindo(a) ${responseData.client.name}`);
                window.location.href = "dashboard.html";
            } else {
                throw new Error(responseData.message || "Login falhou.");
            }

        } catch (err) {
            console.error("Erro (Login):", err);
            loginError.textContent = err.message;
        }
    });
} else {
    console.error("--- ERRO CRÍTICO: Não foi possível encontrar o 'login-form'. O script pode ter corrido antes do HTML. ---");
}