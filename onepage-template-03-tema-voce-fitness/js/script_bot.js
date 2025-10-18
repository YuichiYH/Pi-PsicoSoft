// Seleciona os elementos do DOM
const chatbox = document.getElementById('chatbox');
const userInputElement = document.getElementById('userInput');
const typingIndicator = document.getElementById('typing-indicator');
const sendButton = document.getElementById('send-button');
const closeButton = document.getElementById('close-chat');
const chatContainer = document.querySelector('.chat-container');
const calendarInputElement = document.getElementById('calendarInput');
const restartButton = document.querySelector('.restart-button');

// ==============================================================================
//  CONFIGURAÇÃO PRINCIPAL
// ==============================================================================

// A URL de invocação da API, que será usada como base.
const API_GATEWAY_BASE_URL = 'https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha';

// Ela concatena a base com o novo recurso /chat:
const GEMINI_BACKEND_URL = API_GATEWAY_BASE_URL + '/chat';

// Armazena o histórico da conversa para manter o contexto
let conversationHistory = [];

// ==============================================================================
// Funções da Interface do Chat (UI)
// ==============================================================================

/**
 * Adiciona uma mensagem à caixa de chat.
 * @param {string} sender - Quem enviou a mensagem ('Você' ou 'PsicoSoft').
 * @param {string} message - O conteúdo da mensagem.
 */
function appendMessage(sender, message) {
    const div = document.createElement('div');
    div.classList.add(sender === 'Você' ? 'user-message' : 'bot-message');
    div.innerHTML = message; // Permite HTML para formatação (ex: <br>)

    if (chatbox) {
        chatbox.appendChild(div);
        chatbox.scrollTop = chatbox.scrollHeight; // Rola para a mensagem mais recente
    }
}

/**
 * Mostra o indicador "digitando...".
 */
function showTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.classList.add('typing');
        typingIndicator.textContent = "Psic está digitando...";
    }
}

/**
 * Esconde o indicador "digitando...".
 */
function hideTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.classList.remove('typing');
        typingIndicator.textContent = "";
    }
}

// ==============================================================================
// Comunicação com o Backend e Lógica Principal
// ==============================================================================

/**
 * Envia a mensagem do usuário para o backend e processa a resposta.
 */
async function sendMessage() {
    if (!userInputElement) return;
    const messageText = userInputElement.value;
    if (messageText.trim() === "") return;

    appendMessage('Você', messageText);
    userInputElement.value = '';
    showTypingIndicator();

    // Adiciona a mensagem do usuário ao histórico da conversa
    conversationHistory.push({ role: 'user', parts: [{ text: messageText }] });

    try {
        // Envia o histórico da conversa para o backend
        const response = await fetch(GEMINI_BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: conversationHistory })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({ error: `Erro de comunicação com o servidor: ${response.status}` }));
            throw new Error(errData.error);
        }

        const dataFromBackend = await response.json();
        const botResponse = dataFromBackend.response;

        // Adiciona a resposta do bot ao histórico para manter o contexto
        conversationHistory.push({ role: 'model', parts: [{ text: botResponse }] });

        hideTypingIndicator();
        appendMessage('PsicoSoft', botResponse);

        // Se o backend indicar que uma ação específica deve ser executada
        if (dataFromBackend.action) {
            await handleAction(dataFromBackend.action, dataFromBackend.data);
        }

    } catch (error) {
        hideTypingIndicator();
        console.error('Erro ao se comunicar com o backend:', error);
        appendMessage('PsicoSoft', `Desculpe, ocorreu um erro no nosso sistema. Tente novamente mais tarde. (${error.message})`);
    }
}

/**
 * Lida com ações específicas retornadas pelo backend (ex: salvar uma consulta).
 * @param {string} action - O nome da ação a ser executada.
 * @param {object} data - Os dados necessários para a ação.
 */
async function handleAction(action, data) {
    console.log("Ação recebida do backend:", action, "com os dados:", data);
    showTypingIndicator();

    let targetApiUrl = '';
    let bodyPayload = {};
    let successMessage = "Operação realizada com sucesso!";

    try {
        if (action === "SAVE_CONSULTA") {
            targetApiUrl = `${API_GATEWAY_BASE_URL}/Consulta`;
            bodyPayload = {
                ClienteId: data.cpf,
                FuncionarioId: "psicosoft_dr@gmail.com", 
                nome: data.nome,
                cpf: data.cpf,
                especialidade: data.especialidade,
                forma: data.forma,
                horario: data.horario,
                motivo: data.motivo,
                idade: String(data.idade)
            };
            successMessage = "Consulta agendada! Em breve nossa equipe confirmará todos os detalhes. Se precisar de algo mais, é só chamar!";
        } else if (action === "CANCEL_CONSULTA") {
            
            targetApiUrl = `${API_GATEWAY_BASE_URL}/Consulta/CancelarConsulta`;
            bodyPayload = { OrderId: data.order_id };
            successMessage = "Sua consulta foi cancelada. Se mudar de ideia, estamos aqui para ajudar.";

        
            
        } else {
            console.warn("Ação desconhecida:", action);
            hideTypingIndicator();
            return;
        }

        const response = await fetch(targetApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `Erro ao processar a solicitação.`);
        }

        const resultData = await response.json();
        console.log("Resposta da API Gateway:", resultData);
        hideTypingIndicator();
        appendMessage('PsicoSoft', successMessage);

        // Após uma ação bem-sucedida, podemos reiniciar a conversa
        recomecarChat(false); // Reinicia sem mostrar a mensagem do usuário

    } catch (error) {
        hideTypingIndicator();
        console.error(`Erro ao executar a ação ${action}:`, error);
        appendMessage('PsicoSoft', `Houve um problema ao tentar realizar a operação: ${error.message}`);
    }
}


/**
 * Reinicia o chat, limpando o histórico e a interface.
 * @param {boolean} showUserMessage - Se deve mostrar "recomeçar" como mensagem do usuário.
 */
function recomecarChat(showUserMessage = true) {
    if (showUserMessage) {
        appendMessage('Você', 'Recomeçar');
    }
    conversationHistory = []; // Limpa o histórico
    chatbox.innerHTML = ''; // Limpa a UI
    localStorage.clear(); // Limpa qualquer resquício do sistema antigo

    // Inicia a conversa com a mensagem de boas-vindas do backend
    startChat();
}


/**
 * Inicia o chat, enviando uma mensagem vazia para obter a saudação inicial.
 */
async function startChat() {
    showTypingIndicator();
    try {
        // Envia uma requisição inicial (sem histórico) para obter a primeira mensagem do bot
        const response = await fetch(GEMINI_BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: [] }) // Histórico vazio para começar
        });

        if (!response.ok) throw new Error('Falha ao iniciar o chat.');

        const data = await response.json();
        conversationHistory.push({ role: 'model', parts: [{ text: data.response }] }); // Adiciona a saudação ao histórico

        hideTypingIndicator();
        appendMessage('PsicoSoft', data.response);
    } catch (error) {
        hideTypingIndicator();
        appendMessage('PsicoSoft', 'Não foi possível conectar ao nosso assistente. Por favor, tente novamente mais tarde.');
        console.error("Erro ao iniciar o chat:", error);
    }
    if (userInputElement) userInputElement.focus();
}


// ==============================================================================
// Event Listeners (Ouvintes de Eventos)
// ==============================================================================

// Enviar mensagem com o botão
if (sendButton) {
    sendButton.addEventListener('click', sendMessage);
}

// Enviar mensagem com a tecla "Enter"
if (userInputElement) {
    userInputElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });
}

// Fechar o chat
if (closeButton) {
    closeButton.addEventListener('click', () => {
        if (chatContainer) {
            chatContainer.style.display = 'none';
        }
    });
}

// Reiniciar o chat
if (restartButton) {
    restartButton.addEventListener('click', () => recomecarChat(true));
}

// Iniciar o chat quando a página carregar
window.addEventListener('load', () => {
    if (chatbox && chatbox.children.length === 0) {
        startChat();
    }
});