/*
 * dashboard.js
 * Funcionalidade do menu mobile e chat bot.
 */

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. Controle do Menu Mobile ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            // Alterna a classe 'active' no menu e no botão
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    /* * --- 2. NOVO: Controle do Chat Bot ---
     * (Adicione este bloco)
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
    // --- Fim do novo bloco ---

});