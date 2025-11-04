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
                window.location.href = "register.html"; 
            })
            .catch(error => {
                console.error('Erro:', error);
                alert(`ERRO NO CADASTRO: ${error.message}`);
            });
        });
    }
// --- NOVA LÓGICA DE LOGIN (BASEADA NO SEU "YOSHI SCRIPT") ---
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        const loginError = document.getElementById('login-error');

        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o recarregamento da página
            loginError.textContent = ""; // Limpa erros antigos

            // Pega os valores dos inputs de login pelos IDs que criamos
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            // Prepara os dados para a sua API (exatamente como no seu script antigo)
            const data = {
                email: email,
                password: password,
                empresa: "PSICOSOFT"
            };

            // URL da sua API de LOGIN (do seu script antigo)
            const urlLogin = 'https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/login';

            // Envia o POST request
            fetch(urlLogin, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    // Se a resposta não for OK (ex: 401, 500), rejeita a promessa
                    return response.json().then(err => { 
                        throw new Error(err.message || "Erro desconhecido"); 
                    });
                }
                return response.json(); // Converte a resposta OK para JSON
            })
            .then(data => {
                console.log(data); // { success: true, client: { ... } }

                // Verifica a resposta da sua API
                if (data.success) {
                    alert(`Login bem-sucedido! \nBem-vindo(a) ${data.client.name}`);
                    
                    // *** ETAPA CRÍTICA: SALVAR O CPF/ID NO NAVEGADOR ***
                    // Precisamos que sua API retorne o CPF. 
                    // Vou assumir que o CPF está em 'data.client.id' ou 'data.client.cpf'
                    // (A tabela 'Users' tem 'Usuario' (S) que é o CPF/email. A Lambda deve retornar isso)
                    
                    // Trocamos 'data.client.id' pelo campo que sua API retorna (ex: data.client.cpf)
                    // Se a API de login não retorna o CPF, ela PRECISA ser ajustada para isso.
                    // Vou assumir que o email que o usuário usou para logar é o CPF:
                    localStorage.setItem('paciente_cpf', email); 
                    
                    // Redireciona para o painel de controle, não para o index
                    window.location.href = "dashboard.html"; 
                } else {
                    // Mensagem da sua API (ex: "Usuário ou senha incorretos")
                    throw new Error(data.message || "Login falhou. Verifique suas credenciais.");
                }
            })
            .catch((error) => {
                console.error('Erro (Login):', error);
                loginError.textContent = error.message; // Mostra o erro no HTML
            });
        });
    }
});