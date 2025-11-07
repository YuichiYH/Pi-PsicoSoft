// Aguarda o carregamento completo do HTML para TODO o script
document.addEventListener('DOMContentLoaded', function() {

    // --- 1. LÓGICA DE MUDANÇA DE PAINEL (LOGIN/CADASTRO) ---
    const container = document.getElementById('container');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');
    const registerMobileBtn = document.getElementById('register-mobile');
    const loginMobileBtn = document.getElementById('login-mobile');

    if (registerBtn) {
        registerBtn.addEventListener('click', () => { container.classList.add("active"); });
    }
    if (loginBtn) {
        loginBtn.addEventListener('click', () => { container.classList.remove("active"); });
    }
    if (registerMobileBtn) {
        registerMobileBtn.addEventListener('click', (e) => { e.preventDefault(); container.classList.add("active"); });
    }
    if (loginMobileBtn) {
        loginMobileBtn.addEventListener('click', (e) => { e.preventDefault(); container.classList.remove("active"); });
    }

    // --- Seletores do Modal de Notificação ---
    const modal = document.getElementById('notification-modal');
    const modalIconWrapper = modal.querySelector('.modal-icon-wrapper');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalOkButton = document.getElementById('modal-btn-ok');
    let isSuccessRedirect = false; // Controla se o 'OK' deve mudar de tela

    // --- 2. FORMULÁRIO DE CADASTRO (formulario) ---
    const formulario = document.getElementById('formulario');
    // AJUSTE: Seletores dos campos de cadastro
    const registerName = document.getElementById('register-name');
    const registerCpf = document.getElementById('register-cpf');
    const registerTelefone = document.getElementById('register-telefone');
    const registerEmail = document.getElementById('register-email');
    const registerPassword = document.getElementById('register-password');
    const registerError = document.getElementById('register-error');

    // Função de confete
    function runConfettiAnimation() {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let confetti = [];
        const confettiCount = 200;
        const gravity = 0.5;
        const terminalVelocity = 5;
        const drag = 0.075;
        const colors = [
            { r: 122, g: 126, b: 191 }, { r: 169, g: 171, b: 217 },
            { r: 91, g: 166, b: 166 }, { r: 139, g: 195, b: 217 }
        ];
        const randomRange = (min, max) => Math.random() * (max - min) + min;

        function initConfetti() {
            confetti = [];
            for (let i = 0; i < confettiCount; i++) {
                confetti.push({
                    color: colors[Math.floor(randomRange(0, colors.length))],
                    dimensions: { x: randomRange(10, 20), y: randomRange(10, 30) },
                    position: { x: randomRange(0, canvas.width), y: canvas.height - 1 },
                    rotation: randomRange(0, 2 * Math.PI),
                    scale: { x: 1, y: 1 },
                    velocity: { x: randomRange(-25, 25), y: randomRange(0, -50) }
                });
            }
        }

        function updateConfetti() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            confetti.forEach((c, idx) => {
                c.velocity.y += gravity;
                c.velocity.x -= c.velocity.x * drag;
                c.velocity.y = Math.min(c.velocity.y, terminalVelocity);
                c.position.x += c.velocity.x;
                c.position.y += c.velocity.y;
                c.rotation += c.velocity.x * 0.1;
                c.scale.y = Math.cos(c.position.y * 0.1);
                c.scale.x = Math.sin(c.position.y * 0.1);
                if (c.position.y > canvas.height) confetti.splice(idx, 1);
            });
            confetti.forEach((c) => {
                ctx.save();
                ctx.fillStyle = `rgb(${c.color.r}, ${c.color.g}, ${c.color.b})`;
                ctx.translate(c.position.x + c.dimensions.x / 2, c.position.y + c.dimensions.y / 2);
                ctx.rotate(c.rotation);
                ctx.scale(c.scale.x, c.scale.y);
                ctx.fillRect(-c.dimensions.x / 2, -c.dimensions.y / 2, c.dimensions.x, c.dimensions.y);
                ctx.restore();
            });
            if (confetti.length > 0) {
                requestAnimationFrame(updateConfetti);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        initConfetti();
        updateConfetti();
    }

    // Função para mostrar o modal
    function showNotification(isSuccess, title, message) {
        if (!modal) return;
        modal.classList.remove('modal--success', 'modal--error');

        if (isSuccess) {
            modal.classList.add('modal--success');
            // Ícone de "Usuário Verificado"
            modalIconWrapper.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <polyline points="17 11 19 13 23 9"></polyline>
                </svg>
            `;
            isSuccessRedirect = true;
        } else {
            modal.classList.add('modal--error');
            // Ícone de erro
            modalIconWrapper.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                    <line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line>
                </svg>
            `;
            isSuccessRedirect = false;
        }
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.add('active');
    }

    // Evento para fechar o modal
    if (modalOkButton) {
        modalOkButton.addEventListener('click', () => {
            modal.classList.remove('active');
            if (isSuccessRedirect) {
                // Se foi sucesso, muda para a tela de login e limpa o formulário
                if (container) container.classList.remove("active");
                if (formulario) formulario.reset();
                isSuccessRedirect = false; // Reseta a flag
            }
        });
    }

    // --- AJUSTE: Nova Função de Validação do Formulário ---
    function validateForm() {
        // Limpa erros e estilos inválidos antigos
        registerError.textContent = "";
        const inputs = [registerName, registerCpf, registerTelefone, registerEmail, registerPassword];
        inputs.forEach(input => input.classList.remove('invalid'));

        // Validação do Nome (mínimo 3 caracteres, apenas letras e espaços)
        if (!/^[A-Za-zÀ-ú\s]{3,}$/.test(registerName.value)) {
            registerError.textContent = "Nome inválido. (mínimo 3 letras)";
            registerName.classList.add('invalid');
            registerName.focus();
            return false;
        }

        // Validação do CPF (exatamente 11 dígitos numéricos)
        if (!/^\d{11}$/.test(registerCpf.value)) {
            registerError.textContent = "CPF inválido. Digite 11 números, sem pontos ou traços.";
            registerCpf.classList.add('invalid');
            registerCpf.focus();
            return false;
        }

        // Validação do Telefone (10 ou 11 dígitos numéricos)
        if (!/^\d{10,11}$/.test(registerTelefone.value)) {
            registerError.textContent = "Telefone inválido. Digite 10 ou 11 números (com DDD).";
            registerTelefone.classList.add('invalid');
            registerTelefone.focus();
            return false;
        }
        
        // Validação do Email (formato básico)
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail.value)) {
            registerError.textContent = "Formato de e-mail inválido.";
            registerEmail.classList.add('invalid');
            registerEmail.focus();
            return false;
        }

        // Validação da Senha (mínimo 6 caracteres)
        if (registerPassword.value.length < 6) {
            registerError.textContent = "Senha muito curta (mínimo 6 caracteres).";
            registerPassword.classList.add('invalid');
            registerPassword.focus();
            return false;
        }

        return true; // Todos os campos são válidos
    }

    // Listener do formulário de cadastro atualizado
    if (formulario) {
        formulario.addEventListener('submit', function(event) {
            event.preventDefault(); // Sempre impede o envio padrão

            const submitButton = formulario.querySelector('button[type="submit"]');

            // --- AJUSTE: Executa a validação JS primeiro ---
            if (!validateForm()) {
                // Se a validação falhar, não faz nada (a mensagem de erro já foi definida)
                return;
            }
            
            // Se a validação JS passar, continua com o envio para a API
            submitButton.disabled = true;
            submitButton.textContent = "CADASTRANDO...";

            const formData = new FormData(this);
            const jsonData = {};
            formData.forEach((value, key) => { jsonData[key] = value; });
            jsonData["Empresas"] = "PSICOSOFT";

            const url = 'https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/paciente';

            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonData)
            })
            .then(response => {
                if (!response.ok) {
                    // Se a API retornar um erro (ex: CPF já existe), lança o erro
                    return response.json().then(err => { throw new Error(err.message || 'Erro de rede') });
                }
                return response.json(); 
            })
            .then(data => {
                console.log('Sucesso:', data);
                
                // 1. MOSTRA O MODAL DE SUCESSO
                showNotification(true, 'Cadastro Realizado!', 'Sua conta foi criada com sucesso. Faça o login para continuar.');
                
                // 2. DISPARA O CONFETE (simultaneamente)
                runConfettiAnimation();
                
            })
            .catch(error => {
                console.error('Erro:', error);
                // 3. MOSTRA O MODAL DE ERRO (com a mensagem da API)
                // Se a API retornar "Este CPF já está cadastrado.", é isso que aparecerá.
                showNotification(false, 'Erro no Cadastro', error.message);
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = "Cadastre-se";
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
        const loginButton = loginForm.querySelector('button[type="submit"]');

        loginForm.addEventListener('submit', async event => {
            console.log("--- EVENTO 'SUBMIT' DO LOGIN FOI DISPARADO! ---"); // DEBUG
            event.preventDefault();
            loginError.textContent = "";

            loginButton.disabled = true;
            loginButton.classList.add('loading');
            loginButton.innerHTML = 'Entrando... <span class="loader"></span>';

            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value.trim();

            console.log("Email:", email, "Password:", password); // DEBUG

            if (!email || !password) {
                console.log("Login bloqueado: campos vazios."); // DEBUG
                loginError.textContent = "Por favor, preencha e-mail e senha.";
                
                loginButton.disabled = false;
                loginButton.classList.remove('loading');
                loginButton.innerHTML = 'Entre';
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
                    
                    localStorage.setItem('paciente_nome', responseData.client.name);
                    localStorage.setItem('paciente_cpf', responseData.client.cpf); 
                    localStorage.setItem('paciente_email', email);

                    window.location.href = "dashboard.html"; 
                } else {
                    throw new Error(responseData.message || "Login falhou.");
                }

            } catch (err) {
                console.error("Erro (Login):", err);
                loginError.textContent = err.message;
            
            } finally {
                loginButton.disabled = false;
                loginButton.classList.remove('loading');
                loginButton.innerHTML = 'Entre';
            }
        });
    } else {
        console.error("--- ERRO: Não foi possível encontrar o 'login-form'. Verifique o ID no HTML. ---");
    }

    // --- 4. CÓDIGO: MOSTRAR/ESCONDER SENHA ---
    const togglePasswordVisibility = (inputId, toggleId) => {
        const passwordInput = document.getElementById(inputId);
        const toggleIcon = document.getElementById(toggleId);

        if (passwordInput && toggleIcon) {
            toggleIcon.addEventListener('click', function() {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.classList.toggle('fa-eye');
                this.classList.toggle('fa-eye-slash');
            });
        } else {
            console.warn(`Não foi possível encontrar os elementos para o toggle de senha: ${inputId} ou ${toggleId}`);
        }
    };

    togglePasswordVisibility('login-password', 'toggleLoginPassword');
    togglePasswordVisibility('register-password', 'toggleRegisterPassword');

});