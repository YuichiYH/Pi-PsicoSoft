/*
 * contato.js
 * Funcionalidade do menu mobile, chat bot, logout e feedback do formulário.
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

    // --- 4. Lógica do Formulário de Contato ---
    const supportForm = document.getElementById('support-form');
    const formStatus = document.getElementById('form-status');
    const submitButton = document.querySelector('.btn-submit');

    if (supportForm) {
        supportForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Simula o envio
            submitButton.textContent = "Enviando...";
            submitButton.disabled = true;

            // Limpa status anterior
            formStatus.hidden = true;
            formStatus.classList.remove('success', 'error');

            // Simula um delay de rede de 1 segundo
            setTimeout(() => {
                // Simulação de Sucesso
                formStatus.textContent = "Mensagem enviada com sucesso! Entraremos em contato em breve.";
                formStatus.className = "form-status success";
                formStatus.hidden = false;
                
                // Restaura o botão e limpa o formulário
                submitButton.textContent = "Enviar Mensagem";
                submitButton.disabled = false;
                supportForm.reset();

                // Esconde a mensagem de sucesso após 5 segundos
                setTimeout(() => {
                    formStatus.hidden = true;
                }, 5000);

                /*
                // Para simular um ERRO, comente o bloco de Sucesso acima e descomente este:
                formStatus.textContent = "Houve um erro ao enviar sua mensagem. Tente novamente.";
                formStatus.className = "form-status error";
                formStatus.hidden = false;
                submitButton.textContent = "Enviar Mensagem";
                submitButton.disabled = false;
                */

            }, 1000);
        });
    }
    
});