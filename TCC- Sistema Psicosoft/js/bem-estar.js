/*
 * bem-estar.js
 * Funcionalidade do menu mobile, chat bot, logout e o novo Deck de Dicas.
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

    // --- 4. Lógica do Deck de Dicas ---
    const stack = document.querySelector(".tip-card-stack");
    const cards = Array.from(stack.querySelectorAll(".tip-card-item")).reverse(); // Inverte para que o índice 0 seja o do topo
    const nextTipBtn = document.getElementById("next-tip");
    const prevTipBtn = document.getElementById("prev-tip");

    let currentCardIndex = 0;

    const updateCardClasses = () => {
        cards.forEach((card, index) => {
            card.classList.remove("active", "is-next", "is-dismissed", "is-returning");

            if (index === currentCardIndex) {
                card.classList.add("active");
                // Se foi um "voltar", anima o retorno
                if (card.dataset.returning === "true") {
                    card.classList.add("is-returning");
                    setTimeout(() => card.classList.remove("is-returning"), 10); // Remove a classe de animação
                    delete card.dataset.returning;
                }
            } else if (index === currentCardIndex + 1) {
                card.classList.add("is-next");
            }
        });

        // Desabilita o botão de voltar se estiver no primeiro card
        prevTipBtn.disabled = (currentCardIndex === 0);
    };

    const nextCard = () => {
        if (currentCardIndex < cards.length - 1) {
            const currentCard = cards[currentCardIndex];
            currentCard.classList.add("is-dismissed"); // Animação de saída
            
            currentCardIndex++;
            updateCardClasses();
        } else {
            // Opcional: Reinicia o deck
            cards.forEach(card => card.classList.remove("is-dismissed"));
            currentCardIndex = 0;
            updateCardClasses();
        }
    };

    const prevCard = () => {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            const newActiveCard = cards[currentCardIndex];
            newActiveCard.dataset.returning = "true"; // Marca para animação de retorno
            updateCardClasses();
        }
    };

    if (stack) {
        nextTipBtn.addEventListener("click", nextCard);
        prevTipBtn.addEventListener("click", prevCard);

        // Inicializa o estado dos cards
        updateCardClasses();
    }
    
    // Ativa os ícones recém-adicionados
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});