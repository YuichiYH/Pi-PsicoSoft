/*
 * script.js
 * Funcionalidades da Landing Page Psicosoft (Versão Paciente)
 */

document.addEventListener("DOMContentLoaded", function() {

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

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

    // --- 2. Animação de Fade-in ao Rolar (Intersection Observer) ---
    // Esta é uma forma moderna e eficiente de detectar quando um elemento entra na tela
    
    // Seleciona todas as seções que devem ter a animação
    const sectionsToFade = document.querySelectorAll('section, .feature-card, .step, .footer-layout');

    // Configura o "observador"
    const observerOptions = {
        root: null, // Observa em relação ao viewport
        threshold: 0.1, // Ativa quando 10% do item está visível
        rootMargin: '0px 0px -50px 0px' // Começa a animação um pouco antes de entrar totalmente
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Adiciona a classe 'visible' para ativar a animação CSS
                entry.target.classList.add('visible');
                // Para de observar o item após a animação
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Adiciona a classe 'fade-in' (estado inicial) e começa a observar cada elemento
    sectionsToFade.forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });

});