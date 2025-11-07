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

    // AJUSTE: Função de confete que será chamada no sucesso
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
            { r: 122, g: 126, b: 191 }, // Roxo --primary
            { r: 169, g: 171, b: 217 }, // Roxo --primary-light
            { r: 91, g: 166, b: 166 },  // Verde --accent-2
            { r: 139, g: 195, b: 217 }  // Azul --accent-1
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
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa no final
            }
        }
        
        initConfetti();
        updateConfetti();
    }

    // Verifica se o formulário existe antes de adicionar o listener
    if (formulario) {
        formulario.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o recarregamento da página

            // AJUSTE: Pega o botão e o campo de erro
            const submitButton = formulario.querySelector('button[type="submit"]');
            const registerError = document.getElementById('register-error');
            if (registerError) registerError.textContent = "";

            // AJUSTE: Mostra carregando
            submitButton.disabled = true;
            submitButton.textContent = "CADASTRANDO...";

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
                
                // 1. INICIA A ANIMAÇÃO DE CONFETE
                runConfettiAnimation();
                
                // 2. MOSTRA UM ALERTA AMIGÁVEL
                alert('Cadastro realizado com sucesso! Faça o login para continuar.');
                
                // 3. LIMPA O FORMULÁRIO
                formulario.reset();

                // 4. MUDA PARA A TELA DE LOGIN
                if (container) container.classList.remove("active");
            })
            .catch(error => {
                console.error('Erro:', error);
                // AJUSTE: Mostra erro no parágrafo, em vez de alert
                if (registerError) {
                    registerError.textContent = `ERRO: ${error.message}`;
                } else {
                    alert(`ERRO NO CADASTRO: ${error.message}`);
                }
            })
            .finally(() => {
                // AJUSTE: Restaura o botão
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
        // AJUSTE: Pega o botão de login
        const loginButton = loginForm.querySelector('button[type="submit"]');

        loginForm.addEventListener('submit', async event => {
            console.log("--- EVENTO 'SUBMIT' DO LOGIN FOI DISPARADO! ---"); // DEBUG
            event.preventDefault();
            loginError.textContent = "";

            // 1. AJUSTE: ATIVA O ESTADO DE CARREGAMENTO
            loginButton.disabled = true;
            loginButton.classList.add('loading');
            loginButton.innerHTML = 'Entrando... <span class="loader"></span>';

            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value.trim();

            console.log("Email:", email, "Password:", password); // DEBUG

            if (!email || !password) {
                console.log("Login bloqueado: campos vazios."); // DEBUG
                loginError.textContent = "Por favor, preencha e-mail e senha.";
                
                // 2. AJUSTE: DESATIVA O CARREGAMENTO (EM CASO DE ERRO IMEDIATO)
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
                    
                    // --- INÍCIO DA ATUALIZAÇÃO ---
                    // Salvamos os dados do paciente que vieram da API
                    localStorage.setItem('paciente_nome', responseData.client.name);
                    localStorage.setItem('paciente_cpf', responseData.client.cpf); 
                    
                    // CORREÇÃO: Salvamos o 'email' que o usuário USOU PARA LOGAR
                    localStorage.setItem('paciente_email', email);
                    // --- FIM DA ATUALIZAÇÃO ---

                    window.location.href = "dashboard.html"; // Redireciona para o painel
                } else {
                    throw new Error(responseData.message || "Login falhou.");
                }

            } catch (err) {
                console.error("Erro (Login):", err);
                loginError.textContent = err.message;
            
            } finally {
                // 3. AJUSTE: DESATIVA O CARREGAMENTO (SEJA SUCESSO OU FALHA)
                loginButton.disabled = false;
                loginButton.classList.remove('loading');
                loginButton.innerHTML = 'Entre';
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