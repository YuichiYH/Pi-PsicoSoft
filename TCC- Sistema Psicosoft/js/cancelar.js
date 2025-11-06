/*
 * cancelar.js
 * Funcionalidades da página de Cancelamento.
 * ... (outros comentários)
 * - ATUALIZAÇÃO: Desabilita cancelamento para datas passadas.
 * - ATUALIZAÇÃO 2: Chatbot agora é um widget flutuante.
 */

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. Script de Proteção de Rota (Guard) ---
    const pacienteCPF = localStorage.getItem('paciente_cpf');

    if (!pacienteCPF) {
        alert("Acesso negado. Por favor, faça login para continuar.");
        window.location.href = "register.html";
        return; 
    }
    // --- Fim do Script de Proteção ---

    
    // --- 2. Controle do Menu Mobile ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // --- 3. Controle do Chat Bot (Widget Flutuante) ---
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
    
    // --- 4. Lógica de Logout ---
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

    // --- 5. Seletores dos Modais ---
    // Modal de Confirmação (o primeiro)
    const cancelModal = document.getElementById('cancel-modal');
    const confirmCancelBtn = document.getElementById('modal-btn-confirm');
    const closeModalBtn = document.getElementById('modal-btn-close');
    const cancelDetailsText = document.getElementById('modal-cancel-details');
    const cancelIconWrapper = document.querySelector('#cancel-modal .modal-icon-wrapper');

    // Modal de Notificação (o segundo, de resultado)
    const notificationModal = document.getElementById('notification-modal');
    const notificationIconWrapper = notificationModal.querySelector('.modal-icon-wrapper');
    const notificationTitle = document.getElementById('modal-title');
    const notificationMessage = document.getElementById('modal-message');
    const notificationOkButton = document.getElementById('modal-btn-ok');

    // --- 6. Lógica do Modal de Notificação (Sucesso/Erro) ---
    
    function showNotification(isSuccess, title, message) {
        notificationModal.classList.remove('modal--success', 'modal--error');

        if (isSuccess) {
            notificationModal.classList.add('modal--success');
            notificationIconWrapper.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        } else {
            notificationModal.classList.add('modal--error');
            notificationIconWrapper.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>';
        }

        notificationTitle.textContent = title;
        notificationMessage.textContent = message;
        notificationModal.classList.add('active');
    }

    // Evento para fechar o modal de notificação
    notificationOkButton.addEventListener('click', () => {
        notificationModal.classList.remove('active');
    });

    // Evento para fechar o modal de confirmação (botão "Voltar")
    if(closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            cancelModal.classList.remove('active');
        });
    }

    // --- 7. Lógica Principal: Carregar e Exibir Consultas (GET) ---

    const tbody = document.getElementById('consultas-tbody');

    async function loadAppointments() {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Carregando suas consultas...</td></tr>';
        
        const url = `https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta?ClienteId=${pacienteCPF}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Não foi possível carregar suas consultas.');
            }
            
            const allConsultas = await response.json();
            const minhasConsultas = allConsultas.filter(c => c.ClienteId === pacienteCPF);

            if (minhasConsultas.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Você não possui nenhuma consulta agendada.</td></tr>';
                return;
            }

            // Ordena por data (OrderDate)
            minhasConsultas.sort((a, b) => a.OrderDate - b.OrderDate);

            // Renderiza a tabela (função atualizada)
            renderTable(minhasConsultas);

        } catch (error) {
            console.error('Erro ao carregar consultas:', error);
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: red;">${error.message}</td></tr>`;
        }
    }

    /**
     * ATUALIZADO: Renderiza a tabela, agora com validação de data
     */
    function renderTable(consultas) {
        tbody.innerHTML = ''; // Limpa a tabela
        const now = new Date(); // Pega a data/hora atual *antes* do loop

        consultas.forEach(consulta => {
            
            // --- Início da Nova Lógica de Validação ---
            
            // 1. Converte o horário da consulta (ex: "03/06/2025 09:30") para um objeto Date
            const [dataStr, horaStr] = (consulta.horario || "01/01/1970 00:00").split(' ');
            const [dia, mes, ano] = dataStr.split('/');
            const [hora, minuto] = horaStr.split(':');
            const appointmentDate = new Date(ano, mes - 1, dia, hora, minuto); // Mês é 0-indexado

            // 2. Verifica as condições
            const isCancelled = (consulta.status || '').toLowerCase() === "cancelada";
            const isPast = appointmentDate < now;

            // 3. Define o Status e o Texto do Botão
            let statusText = "Agendada";
            let statusClass = "agendada";
            let buttonText = "Cancelar";
            let isDisabled = false;
            
            const tr = document.createElement('tr');

            if (isCancelled) {
                statusText = "Cancelada";
                statusClass = "cancelada";
                buttonText = "Cancelada";
                isDisabled = true;
                tr.classList.add('cancelled-row');
            } else if (isPast) {
                statusText = "Concluída";
                statusClass = "concluida"; // Nova classe de CSS
                buttonText = "Concluída";
                isDisabled = true;
                tr.classList.add('past-row'); // Nova classe de CSS
            }
            
            // --- Fim da Nova Lógica ---


            // Coluna Profissional (lógica para extrair nome do email)
            let nomeProfissional = consulta.profissional;
            if (!nomeProfissional && consulta.FuncionarioId) {
                let emailName = consulta.FuncionarioId.split('@')[0];
                if (emailName === 'psicosoft_dr') nomeProfissional = 'Dr. André';
                else if (emailName === 'psicosoft_dra') nomeProfissional = 'Dra. Beatriz';
                else nomeProfissional = emailName;
            } else if (!nomeProfissional) {
                nomeProfissional = "Não informado";
            }

            // Renderiza a linha com os dados atualizados
            tr.innerHTML = `
                <td>${nomeProfissional}</td>
                <td>${consulta.especialidade || 'N/A'}</td>
                <td>${consulta.horario || 'N/A'}</td>
                <td class="status-cell ${statusClass}">${statusText}</td>
                <td>
                    <button class="btn-cancel" 
                        data-order-id="${consulta.OrderId}" 
                        data-horario="${consulta.horario}"
                        ${isDisabled ? 'disabled' : ''}>
                        ${buttonText}
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Anexa os eventos APENAS aos botões que NÃO estão desabilitados
        attachCancelButtons();
    }

    // --- 8. Lógica de Cancelamento (Modal e POST) ---

    function attachCancelButtons() {
        // O seletor ':not(:disabled)' já garante que a lógica só se aplique
        // aos botões "Cancelar" que estão ativos.
        const buttons = document.querySelectorAll('.btn-cancel:not(:disabled)');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = e.currentTarget.dataset.orderId;
                const horario = e.currentTarget.dataset.horario;

                // 1. Preenche o modal de confirmação
                cancelDetailsText.textContent = `Consulta: ${horario}`;
                cancelIconWrapper.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line></svg>';
                
                // 2. Define a ação do botão "Sim, cancelar"
                confirmCancelBtn.onclick = () => {
                    performCancellation(orderId);
                };

                // 3. Mostra o modal de confirmação
                cancelModal.classList.add('active');
            });
        });
    }

    async function performCancellation(orderId) {
        // 1. Esconde o modal de confirmação
        cancelModal.classList.remove('active');

        // 2. Mostra estado de "carregando"
        showNotification(false, 'Cancelando...', 'Aguarde enquanto processamos sua solicitação.');

        const apiUrl = 'https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta/CancelarConsulta';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ OrderId: orderId }) 
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Não foi possível cancelar a consulta.');
            }

            // 3. Sucesso!
            showNotification(true, 'Consulta Cancelada', 'Sua consulta foi cancelada com sucesso.');

            // 4. Recarrega a lista para atualizar o status
            loadAppointments();

        } catch (error) {
            console.error('Erro ao cancelar:', error);
            // 5. Falha!
            showNotification(false, 'Erro ao Cancelar', error.message);
        }
    }

    // --- Inicialização ---
    loadAppointments(); // Carrega as consultas ao abrir a página
});