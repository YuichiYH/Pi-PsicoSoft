// Aguarda o carregamento completo do HTML para TODO o script
document.addEventListener('DOMContentLoaded', function() {

    // --- 1. LÓGICA DE MUDANÇA DE PAINEL (LOGIN/CADASTRO) ---
    const container = document.getElementById('container');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');
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


    // --- 2. FORMULÁRIO DE CADASTRO (formulario) ---
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

            const url = 'https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/paciente';

            fetch(url, {
                method: 'POST',
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
                // alert('Cadastro realizado com sucesso!'); // <-- REMOVIDO
                window.location.href = "register.html"; 
            })
            .catch(error => {
                console.error('Erro:', error);
                alert(`ERRO NO CADASTRO: ${error.message}`);
            });
        });
    }

    // --- 3. FORMULÁRIO DE LOGIN (login-form) ---
    
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
                console.log("Resposta login:", responseData);
                
                if (responseData.success && responseData.client) {
                    
                    // --- INÍCIO DA ATUALIZAÇÃO ---
                    // (Assumindo que responseData.client contém 'name', 'cpf' e 'email')
                    
                    // Mantemos a lógica original
                    localStorage.setItem('paciente_nome', responseData.client.name);
                    localStorage.setItem('paciente_cpf', responseData.client.cpf); 
                    
                    // ADICIONAMOS o email, que será usado como 'ClienteId'
                    localStorage.setItem('paciente_email', responseData.client.email);
                    // --- FIM DA ATUALIZAÇÃO ---

                    window.location.href = "dashboard.html"; // Redireciona para o painel
                } else {
                    throw new Error(responseData.message || "Login falhou.");
                }

            } catch (err) {
                console.error("Erro (Login):", err);
                loginError.textContent = err.message;
            }
        });
    } else {
        console.error("--- ERRO: Não foi possível encontrar o 'login-form'. Verifique o ID no HTML. ---");
    }

    // --- 4. CÓDIGO: MOSTRAR/ESCONDER SENHA ---
    
    /**
     * Função genérica para alternar a visibilidade de um campo de senha.
     * @param {string} inputId - O ID do <input type="password">
     * @param {string} toggleId - O ID do ícone <i> (o "olho")
     */
    const togglePasswordVisibility = (inputId, toggleId) => {
        const passwordInput = document.getElementById(inputId);
        const toggleIcon = document.getElementById(toggleId);

        if (passwordInput && toggleIcon) {
            toggleIcon.addEventListener('click', function() {
                // Verifica o tipo atual do input
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                // Muda o ícone (olho aberto / olho fechado)
                this.classList.toggle('fa-eye');
                this.classList.toggle('fa-eye-slash');
            });
        } else {
            console.warn(`Não foi possível encontrar os elementos para o toggle de senha: ${inputId} ou ${toggleId}`);
        }
    };

    // Aplica a função para o formulário de LOGIN
    togglePasswordVisibility('login-password', 'toggleLoginPassword');

    // Aplica a função para o formulário de CADASTRO
    togglePasswordVisibility('register-password', 'toggleRegisterPassword');

});