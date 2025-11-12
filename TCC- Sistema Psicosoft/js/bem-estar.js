/*
 * bem-estar.js
 * Funcionalidade do menu mobile, chat bot, logout e a nova lógica de Foco nas Dicas.
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

    // --- 4. Lógica de Foco nas Dicas (NOVA) ---
    const mainContainer = document.querySelector('main .container');
    const featuredCard = document.querySelector('.featured-card');
    const gridCards = document.querySelectorAll('.tip-grid .tip-card');
    
    // Combina a Dica da Semana e os cards do grid em uma única lista
    const allCards = [featuredCard, ...gridCards];

    allCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const clickedCard = e.currentTarget;

            // 1. Verifica se o card clicado já está focado
            if (clickedCard.classList.contains('focused')) {
                // Se sim, remove o foco dele e do container
                mainContainer.classList.remove('tip-focused');
                clickedCard.classList.remove('focused');
                
                // Devolve o brilho padrão apenas para a Dica da Semana
                featuredCard.classList.add('animated-border');
                
            } else {
                // Se não, foca no novo card
                mainContainer.classList.add('tip-focused');
                
                // Remove o foco e o brilho de TODOS os cards
                allCards.forEach(c => {
                    c.classList.remove('focused');
                    c.classList.remove('animated-border');
                });
                
                // Adiciona o foco e o brilho APENAS no card clicado
                clickedCard.classList.add('focused');
                clickedCard.classList.add('animated-border');
            }
        });
    });

    
    // Ativa os ícones (Lucide)
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
});