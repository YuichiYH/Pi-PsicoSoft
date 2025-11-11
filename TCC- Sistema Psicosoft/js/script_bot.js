// --- AJUSTE: SCRIPT DE PROTEÇÃO DE ROTA (GUARD) ---
// (Este script de proteção no topo do arquivo está correto e deve ser mantido)
(function() {
    const pacienteCPF = localStorage.getItem('paciente_cpf');
    if (!pacienteCPF) {
        console.warn("Acesso ao Chatbot negado. Usuário não autenticado.");
        window.top.location.href = "register.html";
        throw new Error("Usuário não autenticado. Interrompendo a execução do bot.");
    }
})();
// --- FIM DO SCRIPT DE PROTEÇÃO ---


document.addEventListener('DOMContentLoaded', () => {
    
    // =============================================================================
    // Seletores do DOM
    // =============================================================================
    const chatbox = document.getElementById('chatbox');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('send-button');
    const typingIndicator = document.getElementById('typing-indicator');
    
    // (Seletores do Menu, etc... todo o início do arquivo é mantido)
    // ...
    const menuToggle = document.getElementById('menu-toggle');
    const chatMenu = document.getElementById('chat-menu');
    const themeToggle = document.getElementById('theme-toggle');
    const clearChat = document.getElementById('clear-chat');
    const restartChat = document.getElementById('restart-chat');

    // ==============================================================================
    //  CONFIGURAÇÃO PRINCIPAL
    // ==============================================================================
    const API_GATEWAY_BASE_URL = 'https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha';
    const GEMINI_BACKEND_URL = API_GATEWAY_BASE_URL + '/chat';
    let conversationHistory = [];

    // =============================================================================
    // Funções da Interface (UI)
    // =============================================================================

    /**
     * Adiciona uma nova mensagem ao chatbox
     * (Esta função é mantida exatamente como está)
     */
    const appendMessage = (text, className) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', className);
        messageDiv.textContent = text; 
        chatbox.appendChild(messageDiv);
        chatbox.scrollTop = chatbox.scrollHeight; 
    };

    /**
     * Mostra o indicador "digitando..."
     * (Esta função é mantida exatamente como está)
     */
    const showTypingIndicator = () => {
        typingIndicator.style.display = 'flex';
        chatbox.scrollTop = chatbox.scrollHeight;
    };

    /**
     * Esconde o indicador "digitando..."
     * (Esta função é mantida exatamente como está)
     */
    const hideTypingIndicator = () => {
        typingIndicator.style.display = 'none';
    };

    // (Lógica do Textarea - mantida)
    // ...
    const resetTextareaHeight = () => {
        userInput.style.height = 'auto';
    };
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto'; 
        userInput.style.height = `${userInput.scrollHeight}px`;
    });
    resetTextareaHeight(); 

    // =============================================================================
    // Funções de Lógica do Bot
    // =============================================================================

    /**
     * Função principal para enviar a mensagem
     * (Esta função é mantida exatamente como está)
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
            
            const pacienteNome = localStorage.getItem('paciente_nome') || 'Paciente';
            const pacienteCPF = localStorage.getItem('paciente_cpf') || 'CPF_NAO_ENCONTRADO';

            // 3. Envia para o backend
            const response = await fetch(GEMINI_BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    history: conversationHistory,
                    pacienteNome: pacienteNome,
                    pacienteCPF: pacienteCPF
                })
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
     * (Esta função é mantida exatamente como está)
     */
    function processApiResponse(data) {
        hideTypingIndicator();
        
        const botResponseText = data.response; 
        const apiCallString = data.apiCall;     

        // 1. Sempre exibe a resposta de texto do bot
        if (botResponseText) {
            appendMessage(botResponseText, 'bot-message');
            // Adiciona a resposta *de texto* do bot ao histórico
            conversationHistory.push({ role: 'model', parts: [{ text: botResponseText }] });
        }

        // 2. Se houver uma apiCall, executa ela
        if (apiCallString) {
            console.log("Ação de API detectada:", apiCallString);
            executeApiCall(apiCallString);
        }
    }

    
    // =============================================================================
    //  INÍCIO DA CORREÇÃO (DENTRO DE SCRIPT_BOT.JS)
    // =============================================================================
    /**
     * Parseia a string [API_CALL:...] e executa a chamada fetch real.
     * @param {string} apiCallString - A string no formato [API_CALL:METODO|URL|BODY_JSON]
     */
    async function executeApiCall(apiCallString) {
        
        try {
            // 1. Parse da string (LÓGICA ATUALIZADA E MAIS ROBUSTA)
            const innerString = apiCallString.substring(10, apiCallString.length - 1).trim();
            const firstPipeIndex = innerString.indexOf('|');
            const secondPipeIndex = innerString.indexOf('|', firstPipeIndex + 1);

            if (firstPipeIndex === -1 || secondPipeIndex === -1) {
                console.error("String da API_CALL malformada recebida:", apiCallString);
                console.error("InnerString (após substring/trim):", innerString);
                throw new Error(`Formato da API_CALL inválido.`);
            }

            const method = innerString.substring(0, firstPipeIndex).trim();
            const url = innerString.substring(firstPipeIndex + 1, secondPipeIndex).trim();
            const bodyString = innerString.substring(secondPipeIndex + 1).trim(); 

            if (bodyString.charAt(0) !== '{' || bodyString.charAt(bodyString.length - 1) !== '}') {
                console.error("String do Body extraída parece inválida:", bodyString);
                throw new Error('O corpo (payload) da API_CALL não é um JSON válido.');
            }
            
            const body = JSON.parse(bodyString); 

            console.log(`Executando API Call: ${method} para ${url}`, body);
            showTypingIndicator(); 

            // 2. Executa a chamada de API real (para agendar, cancelar, etc.)
            const apiResponse = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            hideTypingIndicator();
            
            let responseData;
            try {
                 responseData = await apiResponse.json();
            } catch (e) {
                if (!apiResponse.ok) {
                    throw new Error(`Erro ${apiResponse.status}: ${apiResponse.statusText}`);
                }
                responseData = { message: "Sua solicitação foi processada com sucesso!" };
            }

            if (!apiResponse.ok) {
                throw new Error(responseData.message || 'Erro ao processar a solicitação.');
            }

            // 3. Mostra a resposta final da API (ex: "Agendamento confirmado!" ou Histórico)
            const finalContent = responseData.response || responseData.message || responseData.Message || "Sua solicitação foi processada com sucesso!";

            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'bot-message');
            messageDiv.innerHTML = finalContent; // Usa innerHTML para processar o HTML formatado
            chatbox.appendChild(messageDiv);
            chatbox.scrollTop = chatbox.scrollHeight;
            
            
            // --- INÍCIO DA CORREÇÃO: Follow-up de Cancelamento ---
            // (Esta é a nova lógica que você precisa)
            try {
                // Verifica se a API call que ACABOU de ser executada foi a de Histórico
                if (url.includes('/Consulta/HistoricoChat')) {
                    
                    // Pega a penúltima mensagem do histórico (a última é a do bot, ex: "Claro! Vou mostrar...")
                    // A penúltima é a do usuário (ex: "cancelar")
                    const lastUserMessage = conversationHistory.length > 1 ? conversationHistory[conversationHistory.length - 2] : null;

                    if (lastUserMessage && lastUserMessage.role === 'user') {
                        const userText = lastUserMessage.parts[0].text.toLowerCase();
                        
                        // Verifica se a intenção do usuário era realmente "cancelar"
                        if (userText.includes('cancelar') || userText.includes('desmarcar')) {
                            
                            // Esta é a pergunta que você solicitou
                            const followupQuestion = "Aqui estão suas consultas. Você gostaria de cancelar alguma delas? Se sim, por favor, me informe o código da consulta.";
                            
                            // Adiciona a pergunta com um pequeno delay para parecer natural
                            setTimeout(() => {
                                showTypingIndicator();
                            }, 500); // Mostra "digitando" por 0.5s

                            setTimeout(() => {
                                hideTypingIndicator();
                                // Adiciona a pergunta como uma nova mensagem do bot
                                appendMessage(followupQuestion, 'bot-message');
                                // Adiciona esta pergunta ao histórico para o Gemini ter contexto
                                conversationHistory.push({ role: 'model', parts: [{ text: followupQuestion }] });
                            }, 1200); // Adiciona a mensagem após 1.2s
                        }
                    }
                }
            } catch (e) {
                console.error("Erro ao tentar adicionar follow-up de cancelamento:", e);
            }
            // --- FIM DA CORREÇÃO ---


            // Adiciona a resposta final (a lista/mensagem de sucesso) ao histórico
            const historyText = responseData.response ? "Histórico de consultas enviado ao usuário." : finalContent;
            conversationHistory.push({ role: 'model', parts: [{ text: historyText }] });
            
        } catch (error) {
            console.error("Erro ao executar API_CALL:", error);
            hideTypingIndicator();
            const errorMessage = `Houve um problema ao processar sua solicitação. Detalhe: ${error.message}`;
            appendMessage(errorMessage, 'bot-message');
            conversationHistory.push({ role: 'model', parts: [{ text: errorMessage }] });
        }
    }
    // =============================================================================
    //  FIM DA CORREÇÃO
    // =============================================================================


    /**
     * Reinicia o chat, limpa o histórico e começa de novo.
     * (Esta função é mantida exatamente como está)
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
     * (Esta função é mantida exatamente como está)
     */
    async function startChat() {
        const staticMessage = document.querySelector('.bot-message');
        if (staticMessage && staticMessage.textContent.includes("Olá!")) {
             chatbox.innerHTML = '';
        }
        if (chatbox.children.length > 0) return; 

        showTypingIndicator(); 
        
        try {
            const pacienteNome = localStorage.getItem('paciente_nome') || 'Paciente';
            const pacienteCPF = localStorage.getItem('paciente_cpf') || 'CPF_NAO_ENCONTRADO';

            const response = await fetch(GEMINI_BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    history: [], 
                    initialMessage: "SAUDACAO_INICIAL",
                    pacienteNome: pacienteNome,
                    pacienteCPF: pacienteCPF
                }) 
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
    // (Todas as funções de menu e envio são mantidas como estão)
    // =============================================================================
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        chatMenu.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
        if (!chatMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            chatMenu.classList.remove('active');
        }
    });
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('chat-theme', newTheme);
        chatMenu.classList.remove('active');
    });
    clearChat.addEventListener('click', () => {
        recomecarChat(true);
        chatMenu.classList.remove('active');
    });
    restartChat.addEventListener('click', () => {
        recomecarChat(true);
        chatMenu.classList.remove('active');
    });
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); 
            sendMessage();
        }
    });

    // --- Inicialização ---
    const savedTheme = localStorage.getItem('chat-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    window.addEventListener('load', () => {
        startChat();
    });

});