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
    
    // ==============================================================================
    //  VARIÁVEL DE LOCALIZAÇÃO USUÁRIO
    // ==============================================================================
    let userLocation = {
        latitude: null,
        longitude: null,
        status: 'pending' // 'pending', 'granted', 'denied'
    };

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
                    pacienteCPF: pacienteCPF,
                    userLatitude: userLocation.latitude,
                    userLongitude: userLocation.longitude
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
            
            try {
                // Verifica se a API call que ACABOU de ser executada foi a de Rotas
                if (url.includes('/clinica/rotas') && responseData.clinicas && responseData.origem) {
                    try {
                        // O mapa é exibido APENAS aqui.
                        document.getElementById('map-container').style.display = 'block';
                        renderMap(responseData.clinicas, responseData.origem);
                        
                        const followupQuestion = "O mapa foi atualizado com as rotas. Qual o **NOME COMPLETO da clínica** você deseja agendar sua consulta presencial?";
                        
                        // Adiciona o follow-up ao histórico
                        setTimeout(() => { showTypingIndicator(); }, 500); 
                        setTimeout(() => {
                            hideTypingIndicator();
                            appendMessage(followupQuestion, 'bot-message');
                            conversationHistory.push({ role: 'model', parts: [{ text: followupQuestion }] });
                        }, 1200); 

                    } catch (mapError) {
                        console.error("Erro ao tentar renderizar o mapa:", mapError);
                        appendMessage("Desculpe, houve um erro ao tentar carregar o mapa de clínicas.", 'bot-message');
                        conversationHistory.push({ role: 'model', parts: [{ text: "Erro ao carregar mapa." }] });
                    }

                // Verifica se a API call que ACABOU de ser executada foi a de Histórico
                } else if (url.includes('/Consulta/HistoricoChat')) {
                    
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
    // FUNÇÃO PARA RENDERIZAR O MAPA DE CLÍNICAS E ROTAS DENTRO DE UMA MENSAGEM DO BOT
    // =============================================================================
    function renderMap(clinicas, origem) {
        const chatbox = document.getElementById('chatbox');
        
        // 1. Cria o HTML da nova mensagem do bot para o mapa
        const mapMessageHTML = `
            <div class="message bot-message">
                <img src="/img/psicosoft_logo.png" alt="Bot Profile" class="profile-pic">
                <div class="message-content map-message-content">
                    <p class="bot-text map-title-info" style="margin-bottom: 5px;">Rotas mais curtas a partir da sua localização:</p>
                    <div id="map-${Date.now()}" class="map-inserted" style="height: 300px; width: 100%; border-radius: 8px; margin-top: 5px;"></div>
                </div>
            </div>
        `;

        // 2. Adiciona a nova mensagem do mapa ao chatbox
        chatbox.insertAdjacentHTML('beforeend', mapMessageHTML);
        
        // 3. Identifica o ID do novo div do mapa (usando um timestamp para garantir unicidade)
        const mapId = chatbox.lastElementChild.querySelector('.map-inserted').id;
        const mapElement = document.getElementById(mapId);

        // Verifica se o SDK do Google Maps está carregado
        if (!mapElement || typeof google === 'undefined' || !google.maps.Map) {
            console.error("Google Maps SDK não carregado ou elemento DOM do mapa ausente. Não é possível renderizar o mapa.");
            // Oculta o container da mensagem se não puder renderizar o mapa
            if (mapElement) {
                mapElement.closest('.message').style.display = 'none';
            }
            return;
        }
        
        // 4. Scrolla para o final do chat
        chatbox.scrollTop = chatbox.scrollHeight;

        // 5. Inicializa o Mapa
        const map = new google.maps.Map(mapElement, {
            center: { lat: origem.lat, lng: origem.lng }, 
            zoom: 12,
            mapId: "d6184030db5995351120a20f"
        });

        // --- Cria um InfoWindow para ser reutilizado ---
        const infoWindow = new google.maps.InfoWindow();

        // 6. Adiciona o marcador de origem (o paciente) - Ponto Vermelho
        const originMarker = new google.maps.marker.AdvancedMarkerElement({
            position: { lat: origem.lat, lng: origem.lng },
            map: map,
            title: "Sua Localização",
            gmpClickable: true,
        });

        // Adiciona evento de clique para a Origem
        originMarker.addListener("click", () => {
            infoWindow.close();
            infoWindow.setContent("Você"); // Conteúdo: "Você"
            infoWindow.open(map, originMarker);
        });

        // 7. Adiciona marcadores e rotas para cada clínica
        clinicas.forEach((clinica, index) => {
            const destino = { lat: parseFloat(clinica.lat), lng: parseFloat(clinica.lng) };

            // Marcador da Clínica - Ponto Verde
            const pinElement = new google.maps.marker.PinElement({
                glyphText: (index + 1).toString(), 
                background: '#4CAF50', 
                borderColor: '#388E3C', 
                glyphColor: '#FFFFFF', 
            });

            pinElement.element.style.cursor = 'pointer'; 

            const clinicMarker = new google.maps.marker.AdvancedMarkerElement({
                position: destino,
                map: map,
                title: clinica.nome,
                content: pinElement.element,
                gmpClickable: true, 
            });

            // Conteúdo formatado para a clínica (com SVG corrigido e estilo)
            const contentString = `
                <div id="infoWindowContent" style="padding: 5px 10px 5px 10px; max-width: 250px;">
                    <h4 style="margin: 0 0 5px 0; font-size: 15px; font-weight: bold; color: #333;">${clinica.nome}</h4>
                    <p style="margin: 0; font-size: 13px; color: #555;">${clinica.endereco}</p>
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #555;">${clinica.cidade} - ${clinica.estado}</p>
                    <div style="display: flex; align-items: center; font-size: 13px; color: #777;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#555" width="16" height="16" style="margin-right: 5px;">
                            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l14-.01-1.3-4.33c-.09-.28-.35-.46-.64-.46h-11c-.28 0-.55.18-.64.46L5 11z"/>
                        </svg>
                        <span>${clinica.duracao} (${clinica.distancia})</span>
                    </div>
                </div>
            `;
            
            // Adiciona evento de clique para a Clínica
            clinicMarker.addListener("click", () => {
                infoWindow.close();
                infoWindow.setContent(contentString);
                infoWindow.open(map, clinicMarker);
            });


            // Desenha a Rota (Polyline)
            if (clinica.polyline && google.maps.geometry) {
                new google.maps.Polyline({
                    path: google.maps.geometry.encoding.decodePath(clinica.polyline),
                    geodesic: true,
                    strokeColor: '#007bff', 
                    strokeOpacity: 0.8,
                    strokeWeight: 4,
                    map: map
                });
            }
        });
    }
    
    function getGeolocation() {
        if (navigator.geolocation) {
            // Tenta obter a posição atual
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Sucesso: armazena a lat/lng
                    userLocation.latitude = position.coords.latitude;
                    userLocation.longitude = position.coords.longitude;
                    userLocation.status = 'granted';
                    console.log("Localização obtida com sucesso:", userLocation);
                },
                (error) => {
                    // Erro: armazena o status 'denied'
                    userLocation.status = 'denied';
                    console.warn("Permissão de geolocalização negada/erro:", error.message);
                    // NOTA: Se o usuário negar, a Lambda usará o FALLBACK!
                },
                {
                    enableHighAccuracy: false, // Não precisa de alta precisão
                    timeout: 30000, 
                    maximumAge: 0
                }
            );
        } else {
            userLocation.status = 'unsupported';
            console.warn("Geolocalização não suportada neste navegador.");
        }
    }
    // =============================================================================

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

    // 1. Tenta obter a geolocalização assim que o script é carregado
    getGeolocation(); 

    const savedTheme = localStorage.getItem('chat-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    window.addEventListener('load', () => {
        // 2. Inicia o chat após tentar obter a localização (independente do resultado)
        startChat();
    });

});