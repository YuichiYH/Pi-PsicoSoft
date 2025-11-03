/*
 * cancelar.js
 * Funcionalidades da página de Cancelamento, incluindo modal.
 */

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. Controle do Menu Mobile ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // --- 2. Controle do Chat Bot ---
    const chatButton = document.getElementById('open-chat-bot');
                
    if (chatButton) {
        chatButton.addEventListener('click', function() {
            const chatUrl = 'bot_web.html';
            const windowName = 'PsicosoftChat';
            const windowFeatures = 'width=450,height=700,top=100,left=100,resizable=yes,scrollbars=yes';
            
            window.open(chatUrl, windowName, windowFeatures);
        });
    }
    
    // --- 3. Lógica do Modal de Confirmação ---
    
    const modal = document.getElementById('confirm-modal');
    const cancelButtons = document.querySelectorAll('.btn-cancel');
    const modalBtnYes = document.getElementById('modal-btn-yes');
    const modalBtnNo = document.getElementById('modal-btn-no');

    let itemToCancel = null; // Variável para guardar o item que será cancelado

    // Abre o modal quando qualquer botão "Cancelar" é clicado
    cancelButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Guarda a referência do card da consulta
            itemToCancel = e.target.closest('.cancel-item');
            modal.classList.add('active');
        });
    });

    // Fecha o modal ao clicar em "Não, voltar"
    modalBtnNo.addEventListener('click', () => {
        modal.classList.remove('active');
        itemToCancel = null; // Limpa a referência
    });

    // Fecha o modal ao clicar fora dele (no overlay)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            itemToCancel = null;
        }
    });

    // Ação de "Sim, cancelar"
    modalBtnYes.addEventListener('click', () => {
        if (itemToCancel) {
            // Simula a remoção do item da lista
            itemToCancel.style.transition = 'opacity 0.5s ease';
            itemToCancel.style.opacity = '0';
            
            // Remove o elemento da DOM após a animação
            setTimeout(() => {
                itemToCancel.remove();
                // Aqui você também faria a chamada de API real para cancelar
            }, 500);
        }
        
        // Fecha o modal e limpa a referência
        modal.classList.remove('active');
        itemToCancel = null;
    });

});