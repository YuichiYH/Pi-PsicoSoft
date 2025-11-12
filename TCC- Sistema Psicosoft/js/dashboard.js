/*
 * bem-estar.js
 * Funcionalidade do menu mobile, chat bot e logout.
 * (A lógica complexa do Deck de Dicas foi removida a pedido.)
 */

document.addEventListener("DOMContentLoaded", function() {

    // --- AJUSTE: Adicionada Proteção de Rota ---
    const pacienteCPF = localStorage.getItem('paciente_cpf');

    if (!pacienteCPF) {
        // Redireciona silenciosamente
        window.location.href = "register.html";
        return; 
    }
    // --- Fim da Proteção ---

    // --- 1. Controle do Menu Mobile ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // --- 2. Controle do Chat Bot (Widget Flutuante) ---
    const chatButton = document.getElementById('open-chat-bot');
    const chatContainer = document.getElementById('chat-widget-container');
    const chatCloseButton = document.getElementById('chat-widget-close');

    if (chatButton && chatContainer && chatCloseButton) {
        
        // Abre/Fecha o widget ao clicar no botão FAB
        chatButton.addEventListener('click', function() {
            chatContainer.classList.toggle('active');
            chatButton.classList.toggle('chat-aberto');
        });

        // Fecha o widget ao clicar no 'X' interno
        chatCloseButton.addEventListener('click', function() {
            chatContainer.classList.remove('active');
            chatButton.classList.remove('chat-aberto');
        });
    }
    
    // --- 3. Lógica de Logout ---
    const logoutButton = document.querySelector('.btn-logout');

    if (logoutButton) {
        logoutButton.addEventListener('click', function(event) {
            event.preventDefault(); 
            localStorage.removeItem('paciente_nome');
            localStorage.removeItem('paciente_cpf');
            localStorage.removeItem('paciente_email');
            window.location.href = "index.html"; 
        });
    }

    // --- 4. Lógica do Deck de Dicas (REMOVIDA) ---
    // (Toda a lógica de nextCard, prevCard, updateCardClasses foi removida)

    // Ativa os ícones (Lucide)
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
});