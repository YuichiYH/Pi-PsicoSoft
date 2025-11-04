/*
 * dashboard.js
 * Funcionalidade do menu mobile e chat bot.
 */

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. NOVO: Script de Proteção de Rota (Guard) ---
    const pacienteCPF = localStorage.getItem('paciente_cpf');

    if (!pacienteCPF) {
        // Se não houver CPF salvo, o usuário não está logado.
        alert("Acesso negado. Por favor, faça login para continuar.");
        window.location.href = "register.html";
        return; // Impede que o restante do script do dashboard seja executado
    }
    // --- Fim do Script de Proteção ---


    // --- 2. NOVO: Personalização do Painel ---
    // (Pega o nome salvo no login e atualiza o h1)
    const pacienteNome = localStorage.getItem('paciente_nome');
    const welcomeHeader = document.querySelector('.welcome-header h1'); //

    if (pacienteNome && welcomeHeader) {
        welcomeHeader.textContent = `Olá, ${pacienteNome} 👋`;
    }
    // --- Fim da Personalização ---


    // --- 3. Controle do Menu Mobile ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            // Alterna a classe 'active' no menu e no botão
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    /* * --- 4. Controle do Chat Bot ---
     */
    const chatButton = document.getElementById('open-chat-bot');
                
    if (chatButton) {
        chatButton.addEventListener('click', function() {
            const chatUrl = 'bot_web.html';
            const windowName = 'PsicosoftChat';
            // Define o tamanho e a posição da janela pop-up
            const windowFeatures = 'width=450,height=700,top=100,left=100,resizable=yes,scrollbars=yes';
            
            window.open(chatUrl, windowName, windowFeatures);
        });
    }
    // --- Fim do bloco ---

    // --- 5. NOVO: Lógica de Logout ---
    const logoutButton = document.querySelector('.btn-logout');

    if (logoutButton) {
        logoutButton.addEventListener('click', function(event) {
            event.preventDefault(); // Impede o link de navegar imediatamente
            
            // Limpa os dados de sessão do usuário
            localStorage.removeItem('paciente_nome');
            localStorage.removeItem('paciente_cpf');
            
            // Redireciona para a página inicial
            window.location.href = "index.html"; 
        });
    }
    // --- Fim da Lógica de Logout ---

});