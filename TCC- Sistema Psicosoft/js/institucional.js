/*
 * institucional.js
 * Contém o menu mobile e a lógica do carrossel da equipe.
 */

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. Controle do Menu Mobile ---
    // (Copiado do js/scripts.js para consistência)
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            // Alterna a classe 'active' no menu e no botão
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // --- 2. Lógica do Carrossel da Equipe ---
    // Esta versão usa uma animação CSS contínua (veja institucional.css)
    // e pausa a animação ao passar o mouse.
    
    const sliderContainer = document.querySelector('.team-slider-container');
    const sliderTrack = document.querySelector('.team-slider-track');
    const cards = document.querySelectorAll('.team-card');

    if (sliderContainer && sliderTrack && cards.length > 0) {
        
        // NOVO: Duplica os cards para o loop infinito
        // Pega todos os cards existentes e clona eles,
        // adicionando os clones ao final do 'track'.
        cards.forEach((card) => {
            const clone = card.cloneNode(true);
            sliderTrack.appendChild(clone);
        });

        // O resto da mágica (animação e pausa no hover)
        // é feito 100% no CSS.
    }

});
// A chave '}' extra que estava aqui foi removida.