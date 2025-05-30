// Seleciona os elementos do DOM
const chatbox = document.getElementById('chatbox');
const userInputElement = document.getElementById('userInput');
const typingIndicator = document.getElementById('typing-indicator');
const sendButton = document.getElementById('send-button');
const closeButton = document.getElementById('close-chat');
const chatContainer = document.querySelector('.chat-container');
const calendarInputElement = document.getElementById('calendarInput');
const restartButton = document.querySelector('.restart-button');

// URL da API Gateway (Lambda)
const API_BASE_URL = 'https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha';

// ==============================================================================
// Funções Auxiliares
// ==============================================================================

function validarCPF(cpf) {
    cpf = String(cpf).replace(/[^\d]+/g, '');
    if (cpf === '') return false;
    // Elimina CPFs invalidos conhecidos
    if (cpf.length !== 11 ||
        cpf === "00000000000" ||
        cpf === "11111111111" ||
        cpf === "22222222222" ||
        cpf === "33333333333" ||
        cpf === "44444444444" ||
        cpf === "55555555555" ||
        cpf === "66666666666" ||
        cpf === "77777777777" ||
        cpf === "88888888888" ||
        cpf === "99999999999")
        return false;
    // Valida DVs
    let add = 0;
    for (let i = 0; i < 9; i++)
        add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11)
        rev = 0;
    if (rev !== parseInt(cpf.charAt(9)))
        return false;
    add = 0;
    for (let i = 0; i < 10; i++)
        add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11)
        rev = 0;
    if (rev !== parseInt(cpf.charAt(10)))
        return false;
    return true;
}

function verificarResposta(userInput) {
    const userInputLower = userInput.trim().toLowerCase();
    const simKeywords = [
        "sim", "claro", "positivo", "confirmo", "confirma", "correto", "ok", "quero", "pode", "isso", "certo",
        "afirmativo", "com certeza", "exatamente", "perfeito", "sem problemas", "prosseguir", "continuar", "vamos lá", "boa", "beleza", "ótimo", "excelente",
        "s",
    ];
    const naoKeywords = [
        "não", "negativo", "cancelar", "errado", "incorreto", "nao", "cancela",
        "negado", "de jeito nenhum", "nunca", "jamais", "nem pensar", "não quero", "para", "chega",
        "n",
    ];

    if (simKeywords.some(keyword => userInputLower.includes(keyword))) {
        return "sim";
    } else if (naoKeywords.some(keyword => userInputLower.includes(keyword))) {
        return "não";
    }
    return null;
}

// ==============================================================================
// Funções do Chat
// ==============================================================================

function appendMessage(sender, message) {
    const div = document.createElement('div');
    div.classList.add(sender === 'Você' ? 'user-message' : 'bot-message');
    div.innerHTML = message; // Permite HTML para quebras de linha <br>

    if (chatbox) chatbox.appendChild(div);
    if (chatbox) chatbox.scrollTop = chatbox.scrollHeight;

    const normalizedMessage = message.toLowerCase();

    const showCalendar = sender !== 'Você' && (
        normalizedMessage.includes("qual o melhor dia e horário") ||
        normalizedMessage.includes("data inválida")
    );
    if (calendarInputElement) {
        calendarInputElement.style.display = showCalendar ? 'inline-block' : 'none';
    }
    if (userInputElement) {
        userInputElement.style.display = showCalendar ? 'none' : 'inline-block';
        if (!showCalendar) userInputElement.focus();
    }
}

function showTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.classList.add('typing');
        typingIndicator.textContent = "PsicoSoft está digitando...";
    }
}

function hideTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.classList.remove('typing');
        typingIndicator.textContent = "";
    }
}

function chatBotStateMachine(userInput) {
    let state = localStorage.getItem("chatbotState") || "start";
    let data = JSON.parse(localStorage.getItem("chatbotData")) || {};
    const userInputLower = userInput.trim().toLowerCase();
    let responseMessage = "";
    let nextState = state;
    let action = null;

    // Comando "recomeçar" ou "menu"
    if (["recomeçar", "reiniciar", "resetar", "começar", "menu"].includes(userInputLower)) {
        if (userInputLower === "menu") {
            nextState = "menu";
            responseMessage = "Você voltou ao menu principal:<br><br>(1) Agendar consulta<br>(2) Ver consultas anteriores<br>(3) Cancelar consulta";
        } else {
            nextState = "menu";
            data = {};
            responseMessage = "Tudo bem! Vamos começar do zero.<br>" +
                "Em que posso te ajudar?<br><br>" +
                "(1) Agendar consulta<br>" +
                "(2) Ver consultas anteriores<br>" +
                "(3) Cancelar consulta";
        }
        localStorage.setItem("chatbotState", nextState);
        localStorage.setItem("chatbotData", JSON.stringify(data));
        return { response: responseMessage, action: null, dataToFetch: null };
    }

    switch (state) {
        case "start":
            nextState = "menu";
            responseMessage = "Olá! Eu sou o assistente da PsicoSoft.<br>" +
                "Em que posso te ajudar hoje?<br><br>" +
                "(1) Agendar consulta<br>" +
                "(2) Ver consultas anteriores<br>" +
                "(3) Cancelar consulta";
            break;

        case "menu":
            if (["1", "agendar", "marcar"].some(k => userInputLower.includes(k))) {
                nextState = "ask_name";
                responseMessage = "Ótimo! Vamos agendar sua consulta. Qual é o seu nome completo?";
            } else if (["2", "ver", "acessar"].some(k => userInputLower.includes(k))) {
                nextState = "fetch_needed_for_history"; // Exemplo de estado que sinaliza necessidade de fetch
                responseMessage = "Para ver suas consultas, preciso do seu nome completo.";
            } else if (["3", "cancelar"].some(k => userInputLower.includes(k))) {
                nextState = "ask_cancel_order_id";
                responseMessage = "Entendido. Para cancelar sua consulta, por favor, informe o código da consulta.";
            } else {
                responseMessage = "Desculpe, não entendi. Por favor escolha uma opção válida:<br><br>" +
                    "(1) Agendar consulta<br>" +
                    "(2) Ver consultas anteriores<br>" +
                    "(3) Cancelar consulta";
            }
            break;

        // --- FLUXO DE AGENDAMENTO (onde o fetch é só no final) ---
        case "ask_name":
            // Regex simples para nome com pelo menos um espaço (nome e sobrenome)
            if (!/^[A-Za-zÀ-ÿ']+( [A-Za-zÀ-ÿ']+)+$/.test(userInput.trim())) {
                responseMessage = "Nome inválido. Por favor, digite seu nome completo (nome e sobrenome).";
            } else {
                data.nome = userInput.trim();
                nextState = "ask_idade";
                responseMessage = "Qual é a sua idade?";
            }
            break;

        case "ask_idade":
            const idade = parseInt(userInput.trim());
            if (isNaN(idade) || idade < 1 || idade > 120) {
                responseMessage = "Idade inválida. Por favor, digite um número entre 1 e 120.";
            } else {
                data.idade = idade;
                nextState = "ask_cpf";
                responseMessage = "Qual é o seu CPF?";
            }
            break;

        case "ask_cpf":
            const cpf = userInput.replace(/[^\d]+/g, '');
            if (validarCPF(cpf)) {
                data.cpf = cpf;
                nextState = "ask_especialidade";
                responseMessage = "Qual especialidade deseja?<br>(1) Psiquiatria<br>(2) Psicologia";
            } else {
                responseMessage = "CPF inválido. Por favor, digite um CPF válido.";
            }
            break;

        case "ask_especialidade":
            if (!["1", "2"].includes(userInput.trim())) {
                responseMessage = "Opção inválida. Escolha:<br>(1) Psiquiatria<br>(2) Psicologia";
            } else {
                data.especialidade = userInput.trim() === "1" ? "Psiquiatria" : "Psicologia";
                nextState = "ask_motivo";
                responseMessage = "Qual o motivo da consulta?";
            }
            break;

        case "ask_motivo":
            if (userInput.trim().length < 5) {
                responseMessage = "Por favor, descreva melhor o motivo da consulta (mínimo 5 caracteres).";
            } else {
                data.motivo = userInput.trim();
                nextState = "ask_forma";
                responseMessage = "Prefere atendimento online ou presencial?";
            }
            break;

        case "ask_forma":
            if (!["online", "presencial"].includes(userInputLower)) {
                responseMessage = "Responda com 'online' ou 'presencial'.";
            } else {
                data.forma = userInputLower.charAt(0).toUpperCase() + userInputLower.slice(1);
                nextState = "ask_horario";
                responseMessage = "Qual o melhor dia e horário para você? Por favor, selecione no calendário abaixo.";
            }
            break;

        case "ask_horario":
            try {
                const input = userInput.trim();

                // Valida o formato DD/MM/AAAA HH:MM
                if (!/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(input)) {
                    throw new Error("Formato inválido");
                }

                // Converte a string para um objeto Date
                const [datePart, timePart] = input.split(' ');
                const [day, month, year] = datePart.split('/').map(Number);
                const [hour, minute] = timePart.split(':').map(Number);

                const selectedDate = new Date(year, month - 1, day, hour, minute);

                // Compara com a data atual
                const now = new Date();
                if (selectedDate < now) {
                    throw new Error("Data no passado");
                }

                data.horario = input;
                nextState = "confirmacao_agendamento";
                responseMessage = `Você está prestes a agendar:<br>` +
                    `Nome: ${data.nome}<br>` +
                    `Data e horário: ${data.horario}<br>` +
                    `Especialidade: ${data.especialidade}<br>` +
                    `Formato: ${data.forma}<br>Deseja confirmar? (sim/não)`;

            } catch (e) {
                responseMessage = "Data inválida. Use o seletor de calendário ou digite no formato DD/MM/AAAA HH:MM.";
            }
            break;

        case "confirmacao_agendamento":
            const confirmacao = verificarResposta(userInput);
            if (confirmacao === "sim") {
                action = "SAVE_CONSULTA";
                responseMessage = "Agendamento confirmado! 😊<br>" +
                    "Obrigado por utilizar nosso serviço. Em breve entraremos em contato para confirmar os detalhes. Digite 'menu' para voltar ao menu principal.";
                nextState = "start"; // Volta ao início após salvar
            } else if (confirmacao === "não") {
                responseMessage = "O agendamento foi cancelado. Você pode voltar ao menu a qualquer momento digitando 'menu'.";
                nextState = "start";
                data = {};
            } else {
                responseMessage = "Desculpe, não entendi. Responda com 'sim' para confirmar ou 'não' para cancelar.";
            }
            break;

        case "fetch_needed_for_history":
            if (!/^[A-Za-zÀ-ÿ']+( [A-Za-zÀ-ÿ']+)+$/.test(userInput.trim())) {
                responseMessage = "Nome inválido. Por favor, digite seu nome completo (nome e sobrenome).";
            } else {
                data.nome_consulta = userInput.trim();
                nextState = "fetch_needed_for_history_cpf";
                responseMessage = "Qual seu CPF para buscar o histórico?";
            }
            break;
        case "fetch_needed_for_history_cpf":
            const cpfHist = userInput.replace(/[^\d]+/g, '');
            if (validarCPF(cpfHist)) {
                data.cpf_consulta = cpfHist;
                action = "FETCH_HISTORY"; 
                responseMessage = "Buscando seu histórico...";
            } else {
                responseMessage = "CPF inválido. Por favor, digite um CPF válido.";
            }
            break;
        
        case "ask_cancel_order_id":
            const orderIdInput = userInput.trim();
            // Validação simples para o OrderId (ex: não pode ser vazio e ter um tamanho mínimo)
            if (orderIdInput && orderIdInput.length >= 5) { 
                data.order_id_to_cancel = orderIdInput; // Armazena o OrderId
                nextState = "confirm_cancel_consulta";
                responseMessage = `Você deseja realmente cancelar a consulta com o código: <b>${orderIdInput}</b>? (sim/não)`;
            } else {
                responseMessage = "Código da consulta inválido. Por favor, digite um código válido (mínimo 5 caracteres).";
            }
            break;

        case "confirm_cancel_consulta":
            const confirmacaoCancelamento = verificarResposta(userInput);
            if (confirmacaoCancelamento === "sim") {
                action = "CANCEL_CONSULTA"; // Define a ação para cancelar
                responseMessage = "Processando o cancelamento da sua consulta...";
            } else if (confirmacaoCancelamento === "não") {
                responseMessage = "O cancelamento foi abortado. Você pode voltar ao menu digitando 'menu'.";
                nextState = "menu";
                delete data.order_id_to_cancel; // Limpa o OrderId se o cancelamento for abortado
            } else {
                responseMessage = "Desculpe, não entendi. Responda com 'sim' para confirmar o cancelamento ou 'não' para abortar.";
            }
            break;

        default:
            console.warn('Estado desconhecido:', state);
            nextState = "menu";
            data = {};
            responseMessage = "Algo deu errado. Vamos começar de novo. Em que posso te ajudar?<br><br>" +
                "(1) Agendar consulta<br>" +
                "(2) Ver consultas anteriores<br>" +
                "(3) Cancelar consulta";
    }

    localStorage.setItem("chatbotState", nextState);
    localStorage.setItem("chatbotData", JSON.stringify(data));

    return { response: responseMessage, action: action, dataToFetch: data };
}


async function sendMessage() {
    if (!userInputElement) return;
    const messageText = userInputElement.value;
    if (messageText.trim() === "") return;

    appendMessage('Você', messageText);
    userInputElement.value = '';
    showTypingIndicator();
    
    const botTurn = chatBotStateMachine(messageText);
    
    hideTypingIndicator();
    appendMessage('PsicoSoft', botTurn.response);

    if (botTurn.action) {
        let bodyPayload = {}; // Inicializa o payload que será enviado
        const collectedData = botTurn.dataToFetch;

        if (botTurn.action === "SAVE_CONSULTA") {
            bodyPayload = {
                ClienteId: collectedData.cpf, // Opção: usar CPF
                FuncionarioId: "psicosoft_dr@gmail.com",
                nome: collectedData.nome,
                cpf: collectedData.cpf,
                especialidade: collectedData.especialidade,
                forma: collectedData.forma,
                horario: collectedData.horario,
                motivo: collectedData.motivo,
                idade: String(collectedData.idade)
            };
        
            console.log("Payload final formatado para a Lambda original:", JSON.stringify(bodyPayload, null, 2));

            // Limpar dados após preparar o payload para envio
            localStorage.removeItem("chatbotData");
            localStorage.setItem("chatbotState", "start"); // Volta ao início após a tentativa de salvar
        }
        else if (botTurn.action === "FETCH_HISTORY") {
            console.log("Preparando para buscar histórico na Lambda:", botTurn.dataToFetch);
            bodyPayload = {
                action: "buscar_consultas",
                cpf: botTurn.dataToFetch.cpf_consulta
            };
        }
        else if (botTurn.action === "CANCEL_CONSULTA") {
            if (!collectedData.order_id_to_cancel) {
                hideTypingIndicator();
                appendMessage('PsicoSoft', "Código da consulta não encontrado para cancelamento.");
                localStorage.setItem("chatbotState", "ask_cancel_order_id");
                return;
            }
            bodyPayload = {
                OrderId: collectedData.order_id_to_cancel
            };
            console.log("Payload para CANCEL_CONSULTA:", JSON.stringify(bodyPayload, null, 2));
        }
        try {
            let targetApiUrl = '';

            if (botTurn.action === "SAVE_CONSULTA") {
                targetApiUrl = `${API_BASE_URL}/Consulta`;
            } else if (botTurn.action === "FETCH_HISTORY") {
                targetApiUrl = `${API_BASE_URL}/Consulta/HistoricoChat`;
            } else if (botTurn.action === "CANCEL_CONSULTA") {
                targetApiUrl = `${API_BASE_URL}/Consulta/CancelarConsulta`;
            }

            const response = await fetch(targetApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ error: `Erro ${response.status}` }));
                const detailedError = errData.response || errData.message || errData.error || `Erro ${response.status}`;
                throw new Error(detailedError);
            }

            const dataFromLambda = await response.json();
            hideTypingIndicator();

            if (dataFromLambda && dataFromLambda.response) {
                appendMessage('PsicoSoft', dataFromLambda.response);
            } else if (botTurn.action === "SAVE_CONSULTA" && response.ok) {
                console.log("Agendamento salvo. Resposta da Lambda:", dataFromLambda);
            } else {
                appendMessage('PsicoSoft', "Operação concluída.");
            }

            if (response.ok) {
                if (botTurn.action === "SAVE_CONSULTA") {
                    localStorage.removeItem("chatbotData");
                    localStorage.setItem("chatbotState", "start");
                } else if (botTurn.action === "FETCH_HISTORY") {
                    localStorage.setItem("chatbotState", dataFromLambda.nextState || "menu");
                } else if (botTurn.action === "CANCEL_CONSULTA") {
                    let tempData = JSON.parse(localStorage.getItem("chatbotData")) || {};
                    delete tempData.order_id_to_cancel;
                    localStorage.setItem("chatbotData", JSON.stringify(tempData));
                    localStorage.setItem("chatbotState", dataFromLambda.nextState || "menu");
                }
            }

        } catch (error) {
            hideTypingIndicator();
            console.error(`Erro ao executar ação ${botTurn.action}:`, error);
            appendMessage('PsicoSoft', `Desculpe, ocorreu um erro: ${error.message}`);
            localStorage.setItem("chatbotState", "menu");
        }
    }
}

// Evento de clique do botão enviar
if (sendButton) {
    sendButton.addEventListener('click', sendMessage);
}

// Evento de clique do botão fechar
if (closeButton) {
    closeButton.addEventListener('click', function() {
        if (chatContainer) {
            chatContainer.style.display = 'none';
        }
    });
}

// Evento de pressionar Enter para enviar mensagem
if (userInputElement) {
    userInputElement.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });
}

// Evento para o input de calendário
if (calendarInputElement) {
    calendarInputElement.addEventListener('change', function() {
        const calendarValue = this.value;
        if (calendarValue) {
            const [date, time] = calendarValue.split('T'); // Formato do datetime-local é YYYY-MM-DDTHH:MM
            const formattedDateTime = date.split('-').reverse().join('/') + ' ' + time;

            appendMessage('Você', formattedDateTime); // Mostra a data formatada na UI
            showTypingIndicator();
            
            // Chama a state machine com o valor do calendário
            const botTurn = chatBotStateMachine(formattedDateTime);
            
            hideTypingIndicator();
            appendMessage('PsicoSoft', botTurn.response);

            // Verifica se a resposta contém mensagem de erro
            const deuErroDeData = botTurn.response.includes("Data inválida");

            if (!deuErroDeData) {
                this.value = ''; // Limpar o campo do calendário
                if (calendarInputElement) calendarInputElement.style.display = 'none';
                if (userInputElement) {
                    userInputElement.style.display = 'inline-block';
                    userInputElement.focus();
                }
            }
        }
    });
}

// Função para reiniciar/recomeçar o chat
function recomecarChat() {
    appendMessage('Você', 'recomeçar'); // Envia "recomeçar" para a state machine
    if (userInputElement) userInputElement.value = '';
    showTypingIndicator();
    
    const botTurn = chatBotStateMachine('recomeçar'); // Processa o comando "recomeçar"
    
    hideTypingIndicator();
    appendMessage('PsicoSoft', botTurn.response);

    // Esconde o calendário e mostra o input de texto normal
    if (calendarInputElement) calendarInputElement.style.display = 'none';
    if (userInputElement) {
         userInputElement.style.display = 'inline-block';
         userInputElement.focus();
    }
}

if (restartButton) {
    restartButton.addEventListener('click', recomecarChat);
}

// Iniciar chat ao carregar a página
window.addEventListener('load', () => {
    const initialBotTurn = chatBotStateMachine(''); // Enviar uma string vazia pode acionar o estado 'start'
    if (initialBotTurn.response && chatbox && chatbox.children.length === 0) { // Só adiciona se o chatbox estiver vazio
        // Não precisa de `showTypingIndicator` aqui, é a primeira mensagem.
        appendMessage('PsicoSoft', initialBotTurn.response);
    }
    if (userInputElement) userInputElement.focus();
});