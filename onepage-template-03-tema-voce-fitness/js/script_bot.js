// Aguarda o documento HTML ser completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    
    // =============================================================================
    // Seletores do DOM
    // =============================================================================
    const chatbox = document.getElementById('chatbox');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('send-button');
    const typingIndicator = document.getElementById('typing-indicator');
    
    // Seletores do Menu
    const menuToggle = document.getElementById('menu-toggle');
    const chatMenu = document.getElementById('chat-menu');
    const themeToggle = document.getElementById('theme-toggle');
    const clearChat = document.getElementById('clear-chat');
    const restartChat = document.getElementById('restart-chat');

    // ==============================================================================
    //  CONFIGURAÇÃO PRINCIPAL
    // ==============================================================================

    // A URL de invocação da API, que será usada como base.
    const API_GATEWAY_BASE_URL = 'https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha';

    // Ela concatena a base com o novo recurso /chat:
    const GEMINI_BACKEND_URL = API_GATEWAY_BASE_URL + '/chat';

    // Armazena o histórico da conversa para manter o contexto
    let conversationHistory = [];

    // =============================================================================
    // Funções da Interface (UI)
    // =============================================================================

    /**
     * Adiciona uma nova mensagem ao chatbox
     * @param {string} text - O texto da mensagem
     * @param {string} className - A classe CSS ('user-message' ou 'bot-message')
     */
    const appendMessage = (text, className) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', className);
        messageDiv.textContent = text; // textContent é seguro
        chatbox.appendChild(messageDiv);
        chatbox.scrollTop = chatbox.scrollHeight; // Rola automaticamente
    };

    /**
     * Mostra o indicador "digitando..."
     */
    const showTypingIndicator = () => {
        typingIndicator.style.display = 'flex';
        chatbox.scrollTop = chatbox.scrollHeight;
    };

    /**
     * Esconde o indicador "digitando..."
     */
    const hideTypingIndicator = () => {
        typingIndicator.style.display = 'none';
    };

    // --- Lógica do Textarea (Input) ---

    // Auto-resize do textarea
    const resetTextareaHeight = () => {
        userInput.style.height = 'auto';
    };
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto'; // Reseta para calcular o scrollHeight
        userInput.style.height = `${userInput.scrollHeight}px`; // Define a altura
    });
    resetTextareaHeight(); // Ajusta a altura inicial

    // =============================================================================
    // Funções de Lógica do Bot
    // =============================================================================

    /**
     * Função principal para enviar a mensagem
     */
    const sendMessage = async () => {
        const text = userInput.value.trim();
        if (text === '') return;

        // 1. Adiciona a mensagem do usuário
        appendMessage(text, 'user-message');
        userInput.value = '';
        resetTextareaHeight();
        showTypingIndicator();

        try {
            // 2. Adiciona ao histórico
            conversationHistory.push({ role: 'user', parts: [{ text: text }] });

            // 3. Envia para o backend
            const response = await fetch(GEMINI_BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: conversationHistory })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // 4. Processa a resposta
            processApiResponse(data);
        
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            appendMessage('Desculpe, não consegui me conectar ao assistente. Tente novamente mais tarde.', 'bot-message');
            hideTypingIndicator();
        }
    };

    /**
     * Processa a resposta recebida da API.
     */
    function processApiResponse(data) {
        hideTypingIndicator();
        
        const botResponse = data.response;
        conversationHistory.push({ role: 'model', parts: [{ text: botResponse }] });

        if (data.action) {
            handleApiAction(data.action, data.parameters);
        } else {
            appendMessage(botResponse, 'bot-message');
        }
    }

    /**
     * Lida com ações especiais (ex: salvar agendamento).
     */
    function handleApiAction(action, parameters) {
        if (action === 'solicitar_data_hora_agendamento') {
            appendMessage('Por favor, selecione uma data e hora para o agendamento.', 'bot-message');
        } 
        // Adicione outras ações (salvar_agendamento, etc.) aqui
    }

    /**
     * Reinicia o chat, limpa o histórico e começa de novo.
     */
    function recomecarChat(showMessage = true) {
        chatbox.innerHTML = '';
        conversationHistory = [];
        if (showMessage) {
            appendMessage('Iniciando um novo atendimento...', 'bot-message');
        }
        startChat();
    }

    /**
     * Inicia o chat com uma saudação do backend.
     */
    async function startChat() {
        // Remove a mensagem estática "Olá! Como posso te ajudar hoje?" do HTML
        const staticMessage = document.querySelector('.bot-message');
        if (staticMessage && staticMessage.textContent.includes("Olá!")) {
             chatbox.innerHTML = '';
        }
        
        if (chatbox.children.length > 0) return; // Não inicia se já tiver msgs

        showTypingIndicator(); 
        
        try {
            const response = await fetch(GEMINI_BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: [], initialMessage: "SAUDACAO_INICIAL" }) 
            });

            if (!response.ok) throw new Error('Falha na saudação inicial');
            
            const data = await response.json();
            conversationHistory.push({ role: 'model', parts: [{ text: data.response }] });

            hideTypingIndicator();
            appendMessage(data.response, 'bot-message');

        } catch (error) {
            hideTypingIndicator();
            appendMessage('Não foi possível conectar ao nosso assistente. Por favor, tente novamente mais tarde.', 'bot-message');
            console.error("Erro ao iniciar o chat:", error);
        }
        if (userInput) userInput.focus();
    }

    // =============================================================================
    // Event Listeners (Ouvintes de Eventos)
    // =============================================================================

    // --- Lógica do Menu Flutuante ---
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        chatMenu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!chatMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            chatMenu.classList.remove('active');
        }
    });

    // --- Ações do Menu ---
    
    // 1. Alternar Tema
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('chat-theme', newTheme);
        chatMenu.classList.remove('active');
    });

    // 2. Limpar Conversa
    clearChat.addEventListener('click', () => {
        recomecarChat(true);
        chatMenu.classList.remove('active');
    });

    // 3. Reiniciar Chat
    restartChat.addEventListener('click', () => {
        recomecarChat(true);
        chatMenu.classList.remove('active');
    });

    // --- Envio de Mensagem ---

    // 1. Enviar com o botão
    sendButton.addEventListener('click', sendMessage);

    // 2. Enviar com "Enter" (Shift+Enter para nova linha)
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Impede a nova linha
            sendMessage();
        }
    });

    // --- Inicialização ---

    // 1. Carrega o tema salvo
    const savedTheme = localStorage.getItem('chat-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // 2. Iniciar o chat quando a página carregar
    window.addEventListener('load', () => {
        startChat();
    });

});