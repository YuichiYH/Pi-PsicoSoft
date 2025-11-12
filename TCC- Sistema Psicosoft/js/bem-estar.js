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

    // --- 4. Lógica de Foco nas Dicas (NOVA E CORRIGIDA) ---
    const body = document.body;
    const focusOverlay = document.getElementById('tip-focus-overlay');
    const featuredCard = document.querySelector('.featured-card');
    const allCards = document.querySelectorAll('.tip-card');

    // Função para redefinir tudo para o estado padrão
    function resetFocus() {
        body.classList.remove('tip-focused');
        allCards.forEach(card => {
            card.classList.remove('focused');
            card.classList.remove('animated-border'); // Remove brilho de todos
        });
        
        // Recoloca o brilho apenas no card da semana (estado padrão)
        if (featuredCard) {
            featuredCard.classList.add('animated-border');
        }
    }

    // Adiciona o listener para cada card
    allCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Impede que o clique "vaze" para o overlay
            e.stopPropagation(); 
            
            const isAlreadyFocused = card.classList.contains('focused');

            // 1. Remove o foco e brilho de todos antes de decidir o que fazer
            allCards.forEach(c => {
                c.classList.remove('focused');
                c.classList.remove('animated-border'); // Remove o brilho de todos os cards
            });

            if (isAlreadyFocused) {
                // Se já estava focado, apenas reseta o estado geral
                resetFocus();
            } else {
                // Se não estava focado, foca no novo card
                body.classList.add('tip-focused');
                card.classList.add('focused');
                card.classList.add('animated-border'); // Adiciona o brilho APENAS ao card clicado
            }
        });
    });

    // Adiciona o listener no overlay para fechar o foco
    if (focusOverlay) {
        focusOverlay.addEventListener('click', resetFocus);
    }
    
    // Ativa os ícones (Lucide)
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
});