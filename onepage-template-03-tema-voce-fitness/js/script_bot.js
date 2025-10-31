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

    // [COLE ESTAS DUAS NOVAS FUNÇÕES NO LUGAR]

    /**
     * Processa a resposta recebida da API.
     * Esta função agora separa o texto (response) da ação (apiCall).
     */
    function processApiResponse(data) {
        hideTypingIndicator();
        
        const botResponseText = data.response; // Ex: "Perfeito, estou processando..."
        const apiCallString = data.apiCall;     // Ex: "[API_CALL:POST|...]" ou null

        // 1. Sempre exibe a resposta de texto do bot
        if (botResponseText) {
            appendMessage(botResponseText, 'bot-message');
            // Adiciona a resposta *de texto* do bot ao histórico
            conversationHistory.push({ role: 'model', parts: [{ text: botResponseText }] });
        }

        // 2. Se houver uma apiCall, executa ela
        if (apiCallString) {
            console.log("Ação de API detectada:", apiCallString);
            // Chama a função para executar a chamada de API real
            executeApiCall(apiCallString);
        }
    }

    /**
     * Parseia a string [API_CALL:...] e executa a chamada fetch real.
     * @param {string} apiCallString - A string no formato [API_CALL:METODO|URL|BODY_JSON]
     */
    async function executeApiCall(apiCallString) {
        // Ex: [API_CALL:POST|https://.../Consulta|{nome:"...", ...}]
        
        try {
           // 1. Parse da string
            // Remove "[API_CALL:" (10 chars) e "]" (último char) e remove espaços
            const innerString = apiCallString.substring(10, apiCallString.length - 1).trim();
            
            const parts = innerString.split('|');
            
            // Validação
            if (parts.length < 3) {
                // Log de debug para sabermos exatamente o que deu errado
                console.error("String da API_CALL malformada recebida:", apiCallString);
                console.error("InnerString (após substring/trim):", innerString);
                throw new Error(`Formato da API_CALL inválido. Esperava 3 partes, mas recebi ${parts.length}.`);
            }
            
            const method = parts[0].trim(); // POST
            const url = parts[1].trim();    // https://...
            const bodyString = parts.slice(2).join('|'); // Pega o resto, caso o JSON tenha '|'
            
            const body = JSON.parse(bodyString); // Converte a string do body em objeto JSON

            console.log(`Executando API Call: ${method} para ${url}`, body);
            showTypingIndicator(); // Mostra "digitando" de novo enquanto a API real processa

            // 2. Executa a chamada de API real (para agendar, cancelar, etc.)
            const apiResponse = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            hideTypingIndicator();
            
            // Tenta ler a resposta como JSON
            let responseData;
            try {
                 responseData = await apiResponse.json();
            } catch (e) {
                // Se a API de agendamento não retornar JSON (ex: só um 200 OK)
                if (!apiResponse.ok) {
                    throw new Error(`Erro ${apiResponse.status}: ${apiResponse.statusText}`);
                }
                // Se deu OK mas não era JSON, simulamos uma resposta de sucesso
                responseData = { message: "Sua solicitação foi processada com sucesso!" };
            }

            if (!apiResponse.ok) {
                // Se a API de agendamento der erro (ex: "horário indisponível")
                throw new Error(responseData.message || 'Erro ao processar a solicitação.');
            }

            // 3. Mostra a resposta final da API (ex: "Agendamento confirmado!")
            const successMessage = responseData.message || "Sua solicitação foi processada com sucesso!";
            appendMessage(successMessage, 'bot-message');
            
            // Adiciona a resposta final ao histórico para o bot saber que concluiu
            conversationHistory.push({ role: 'model', parts: [{ text: successMessage }] });

        } catch (error) {
            console.error("Erro ao executar API_CALL:", error);
            hideTypingIndicator();
            
            // Informa o usuário que a *ação* falhou
            const errorMessage = `Houve um problema ao processar sua solicitação. Por favor, tente novamente.`;
            appendMessage(errorMessage, 'bot-message');
            
            // Adiciona o erro ao histórico para o bot ter contexto
            conversationHistory.push({ role: 'model', parts: [{ text: errorMessage }] });
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