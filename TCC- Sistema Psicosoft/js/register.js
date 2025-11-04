/*
 * register.js - versão corrigida
 */

// --- 1. ANIMAÇÃO DOS PAINÉIS ---
const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const registerMobileBtn = document.getElementById('register-mobile');
const loginMobileBtn = document.getElementById('login-mobile');

if (registerBtn) registerBtn.addEventListener('click', () => container.classList.add("active"));
if (loginBtn) loginBtn.addEventListener('click', () => container.classList.remove("active"));
if (registerMobileBtn) registerMobileBtn.addEventListener('click', e => { e.preventDefault(); container.classList.add("active"); });
if (loginMobileBtn) loginMobileBtn.addEventListener('click', e => { e.preventDefault(); container.classList.remove("active"); });

// --- 2. FORMULÁRIO DE CADASTRO ---
const formulario = document.getElementById('formulario');
if (formulario) {
    formulario.addEventListener('submit', async event => {
        event.preventDefault();
        const formData = new FormData(formulario);
        const jsonData = Object.fromEntries(formData.entries());
        jsonData["Empresas"] = "PSICOSOFT";

        try {
            const res = await fetch('https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/cliente', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonData)
            });

            const data = await res.json();
            console.log('Sucesso (Cadastro):', data);
            alert('Cadastro realizado com sucesso!');
            localStorage.setItem('paciente_cpf', jsonData.cpf);
            window.location.href = "dashboard.html";
        } catch (err) {
            console.error('Erro (Cadastro):', err);
            alert('Erro ao cadastrar: ' + err.message);
        }
    });
}
// --- 3. FORMULÁRIO DE LOGIN ---
console.log("--- 3. Procurando formulário de LOGIN ---");
const loginForm = document.getElementById('login-form');
console.log("Formulário de LOGIN encontrado:", loginForm); // DEBUG

if (loginForm) {
    console.log("Anexando 'submit' ao LOGIN"); // DEBUG
    const loginError = document.getElementById('login-error');

    loginForm.addEventListener('submit_login', async event => {
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

        const data = { email, password, empresa: "PSICOSOFT" };
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