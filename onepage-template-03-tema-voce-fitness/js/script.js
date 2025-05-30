// Seleciona os elementos do DOM
const chatbox = document.getElementById('chatbox');
const input = document.getElementById('userInput');
const typingIndicator = document.getElementById('typing-indicator');
const sendButton = document.getElementById('send-button');
const closeButton = document.getElementById('close-chat'); 
const chatContainer = document.querySelector('.chat-container'); 

const API_BASE_URL = 'https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha';

function appendMessage(sender, message) {
    const div = document.createElement('div');
    div.classList.add(sender === 'Você' ? 'user-message' : 'bot-message');
    div.innerHTML = message; 
                           
    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;

    // Mostrar calendário quando o bot perguntar data/hora
    if (sender !== 'Você' && message && message.includes("Qual o melhor dia e horário para você")) {
        if(document.getElementById('calendarInput')) {
            document.getElementById('calendarInput').style.display = 'inline-block';
        }
        if(input) {
            input.style.display = 'none';
        }
    } else {
        if(document.getElementById('calendarInput')) {
            document.getElementById('calendarInput').style.display = 'none';
        }
        if(input) {
            input.style.display = 'inline-block';
        }
    }
}

// Mostra o indicador de digitação
function showTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.classList.add('typing');
        typingIndicator.textContent = "PisicoSoft está digitando...";
    }
}

// Esconde o indicador de digitação
function hideTypingIndicator() {
    setTimeout(() => {
        if (typingIndicator) {
            typingIndicator.classList.remove('typing');
            typingIndicator.textContent = "";
        }
    }, 1000);
}

function chatBotFunction(user_input) {
    let state = localStorage.getItem("state");
    if (!state) {
        state = 'start'; // Estado inicial
        localStorage.setItem("state", state);
    }
    
    user_input_lower = user_input.toLowerCase().trim();

    switch (state) {
        case 'start':
            localStorage["state"] = "menu";
            response = {"response": (
                "Olá! Eu sou o assistente da Pisicosoft.<br>"
                + "Em que posso te ajudar hoje?<br><br>"
                + "(1) Agendar consulta<br>"
                + "(2) Ver consultas anteriores<br>"
                + "(3) Confirmar agendamento<br>"
                + "(4) Remarcar consulta<br>"
                + "(5) Cancelar consulta"
            )};
            break;
        case 'menu':
            if (user_input_lower in ["1", "agendar", "marcar"]) {
                localStorage["state"] = "ask_name";
                response = {"response": "Ótimo! Vamos agendar sua consulta. Qual é o seu nome completo?"};
            } else if (user_input_lower in ["2", "ver", "acessar"]) {
                localStorage["state"] = "check_name";
                response = {"response": "Tudo bem, vamos verificar suas consultas. Qual é o seu nome completo?"};
            } else if (user_input_lower in ["3", "confirmar"]) {
                localStorage["state"] = "confirm_name";
                response = {"response": "Vamos confirmar o seu agendamento. Qual é o seu nome completo?"};
            } else if (user_input_lower in ["4", "remarcar"]) {
                localStorage["state"] = "ask_remarcar";
                response = {"response": "Vamos remarcar a sua consulta. Qual é o seu nome completo?"};
            } else if (user_input_lower in ["5", "cancelar"]) {
                localStorage["state"] = "cancelar_name";
                response = {"response": "Certo! Vamos cancelar sua consulta. Qual é o seu nome completo?"};
            } else {
                response = {"response": "Desculpe, não entendi. Por favor escolha uma opção válida:<br><br>"
                    + "(1) Agendar consulta<br>"
                    + "(2) Ver consultas anteriores<br>"
                    + "(3) Confirmar agendamento<br>"
                    + "(4) Remarcar consulta<br>"
                    + "(5) Cancelar consulta"
                    };
            }
            break;
        case 'success':
            hideTypingIndicator();
            break;
        default:
            console.warn('Estado desconhecido:', state);
    }
    return response;
};


// Função para enviar mensagem
function sendMessage() {
    if (!input) return;
    const messageText = input.value;
    if (messageText.trim() === "") return;

    appendMessage('Você', messageText);
    input.value = '';
    showTypingIndicator();
    
    response = chatBotFunction(messageText); 

    hideTypingIndicator();
    // A Lambda retorna um objeto com uma chave "response" dentro do "body"
    // e o "body" da resposta da Lambda é uma string JSON.
    // A resposta do fetch já parseou o JSON do corpo da Lambda.
    appendMessage('PisicoSoft', response.response); 
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
if (input) {
    input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });
}


function recomecarChat() {
    appendMessage('Você', 'recomeçar');
    if (input) input.value = '';
    showTypingIndicator();

    // TODO: Mudar
    fetch(`${API_BASE_URL}/chat`, { // << USA A NOVA URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'recomeçar' }) // A Lambda já trata "recomeçar"
    })
    .then(response => {
        if (!response.ok) {
             return response.json().then(errData => {
                throw new Error(errData.error || `Erro ${response.status} do servidor`);
            }).catch(() => {
                throw new Error(`Erro ${response.status} do servidor`);
            });
        }
        return response.json();
    })
    .then(data => {
        hideTypingIndicator();
        appendMessage('PisicoSoft', data.response);
    })
    .catch(error => {
        hideTypingIndicator();
        console.error('Erro ao recomeçar chat:', error);
        appendMessage('PisicoSoft', `Desculpe, ocorreu um erro: ${error.message}`);
    });
}

// Evento para o input de calendário
const calendarInputElement = document.getElementById('calendarInput');
if (calendarInputElement) {
    calendarInputElement.addEventListener('change', function () {
        const calendarValue = this.value;
        if (calendarValue) {
            const [date, time] = calendarValue.split('T');
            const formattedDateTime = date.split('-').reverse().join('/') + ' ' + time;

            appendMessage('Você', formattedDateTime);
            showTypingIndicator();

            fetch(`${API_BASE_URL}/chat`, { // << USA A NOVA URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: formattedDateTime })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errData => {
                        throw new Error(errData.error || `Erro ${response.status} do servidor`);
                    }).catch(() => {
                        throw new Error(`Erro ${response.status} do servidor`);
                    });
                }
                return response.json();
            })
            .then(data => {
                hideTypingIndicator();
                appendMessage('PisicoSoft', data.response);
            })
            .catch(error => {
                hideTypingIndicator();
                console.error('Erro ao enviar data do calendário:', error);
                appendMessage('PisicoSoft', `Desculpe, ocorreu um erro: ${error.message}`);
            });

            // Limpar o valor do campo de data e voltar o campo de texto
            this.value = '';
            if (document.getElementById('calendarInput')) {
                document.getElementById('calendarInput').style.display = 'none';
            }
            if (input) {
                input.style.display = 'inline-block';
                input.focus();
            }
        }
    });
}
window.addEventListener('load', () => {
});
const restartButton = document.querySelector('.restart-button'); // Ajuste o seletor se necessário
if (restartButton && typeof recomecarChat === 'function') {
    restartButton.addEventListener('click', recomecarChat);
} else if (restartButton) {
    console.warn("Função recomecarChat não definida ou botão de recomeçar não encontrado da forma esperada.");
}