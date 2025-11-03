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

    if (sliderContainer && sliderTrack) {
        
        // Lógica para destacar o card central (opcional, mas melhora o efeito)
        // Esta função é mais complexa. O CSS puro com :hover já dá um bom efeito.

        // Por enquanto, o CSS @keyframes "slide-infinite" 
        // e o ":hover" no container já cuidam da animação e da pausa,
        // e os cards individuais destacam com :hover.
        
        // Se precisar de controles manuais (botões < >), 
        // a lógica abaixo seria necessária.
        
        /*
        let currentIndex = 0;
        const totalSlides = cards.length;
        const slideWidth = cards[0].offsetWidth + 30; // Largura + margin

        function updateSlidePosition() {
            sliderTrack.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
            
            // Lógica de fade
            cards.forEach((card, index) => {
                if (index === currentIndex) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
        }

        // Intervalo para trocar os slides
        setInterval(() => {
            currentIndex++;
            if (currentIndex >= totalSlides) {
                currentIndex = 0;
            }
            updateSlidePosition();
        }, 3000); // Troca a cada 3 segundos
        */
    }

});