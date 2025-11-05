/*
 * cancelar.js
 * Funcionalidades da página de Cancelamento.
 * - Lista consultas do usuário (GET)
 * - Adiciona coluna de Status
 * - Controla modal de confirmação (com ícone 'frown')
 * - Controla modal de notificação (sucesso/erro)
 * - Envia pedido de cancelamento (POST)
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

    // --- 3. Controle do Chat Bot ---
    const chatButton = document.getElementById('open-chat-bot');
                
    if (chatButton) {
        chatButton.addEventListener('click', function() {
            const chatUrl = 'bot_web.html';
            const windowName = 'PsicosoftChat';
            const windowFeatures = 'width=450,height=700,top=100,left=100,resizable=yes,scrollbars=yes';
            window.open(chatUrl, windowName, windowFeatures);
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
    
    /**
     * Exibe o modal de notificação
     * @param {boolean} isSuccess - Define o estilo (sucesso ou erro)
     * @param {string} title - O título (ex: "Sucesso!")
     * @param {string} message - A mensagem de detalhe
     */
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
        
        // A API GET /Consulta retorna TODAS. Filtramos no front-end pelo ClienteId (CPF).
        const url = `https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta?ClienteId=${pacienteCPF}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Não foi possível carregar suas consultas.');
            }
            
            const allConsultas = await response.json();
            
            // Filtra apenas as consultas deste cliente
            const minhasConsultas = allConsultas.filter(c => c.ClienteId === pacienteCPF);

            if (minhasConsultas.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Você não possui nenhuma consulta agendada.</td></tr>';
                return;
            }

            // Ordena por data (mais próximas primeiro)
            minhasConsultas.sort((a, b) => a.OrderDate - b.OrderDate);

            // Renderiza a tabela
            renderTable(minhasConsultas);

        } catch (error) {
            console.error('Erro ao carregar consultas:', error);
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: red;">${error.message}</td></tr>`;
        }
    }

    function renderTable(consultas) {
        tbody.innerHTML = ''; // Limpa a tabela

        consultas.forEach(consulta => {
            // Define o status (assume "Agendada" se não houver status)
            const status = consulta.status || "Agendada";
            const isCancelled = status.toLowerCase() === "cancelada";

            const tr = document.createElement('tr');
            if (isCancelled) {
                tr.classList.add('cancelled-row');
            }
            
            // Coluna Profissional (usa 'FuncionarioId' se 'profissional' não existir)
            // NOTA: O 'FuncionarioId' é o email, talvez 'profissional' (nome) não exista.
            // Vamos extrair o nome do email para ficar mais bonito.
            let nomeProfissional = consulta.profissional; // (Vazio no CSV)
            if (!nomeProfissional && consulta.FuncionarioId) {
                // Pega "psicosoft_dr" de "psicosoft_dr@gmail.com"
                let emailName = consulta.FuncionarioId.split('@')[0];
                // Troca "psicosoft_dr" por "Dr. André" (baseado em agendar.html)
                if (emailName === 'psicosoft_dr') nomeProfissional = 'Dr. André';
                else if (emailName === 'psicosoft_dra') nomeProfissional = 'Dra. Beatriz';
                else nomeProfissional = emailName; // Fallback
            } else if (!nomeProfissional) {
                nomeProfissional = "Não informado";
            }


            tr.innerHTML = `
                <td>${nomeProfissional}</td>
                <td>${consulta.especialidade || 'N/A'}</td>
                <td>${consulta.horario || 'N/A'}</td>
                <td class="status-cell ${status.toLowerCase()}">${status}</td>
                <td>
                    <button class="btn-cancel" 
                        data-order-id="${consulta.OrderId}" 
                        data-horario="${consulta.horario}"
                        ${isCancelled ? 'disabled' : ''}>
                        ${isCancelled ? 'Cancelada' : 'Cancelar'}
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Após renderizar, anexa os eventos aos botões
        attachCancelButtons();
    }

    // --- 8. Lógica de Cancelamento (Modal e POST) ---

    function attachCancelButtons() {
        const buttons = document.querySelectorAll('.btn-cancel:not(:disabled)');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = e.currentTarget.dataset.orderId;
                const horario = e.currentTarget.dataset.horario;

                // 1. Preenche o modal de confirmação
                cancelDetailsText.textContent = `Consulta: ${horario}`;
                // Adiciona o ícone "triste" (Frown)
                cancelIconWrapper.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line></svg>';
                
                // 2. Define a ação do botão "Sim, cancelar" (apenas para este clique)
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

        // 2. Mostra um estado de "carregando" (opcional, pode usar o modal de notificação)
        showNotification(false, 'Cancelando...', 'Aguarde enquanto processamos sua solicitação.');

        const apiUrl = 'https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta/CancelarConsulta';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // A API espera o OrderId para saber qual item cancelar
                body: JSON.stringify({ OrderId: orderId }) 
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Não foi possível cancelar a consulta.');
            }

            // 3. Sucesso! Mostra notificação de sucesso
            showNotification(true, 'Consulta Cancelada', 'Sua consulta foi cancelada com sucesso.');

            // 4. Recarrega a lista para atualizar o status
            loadAppointments();

        } catch (error) {
            console.error('Erro ao cancelar:', error);
            // 5. Falha! Mostra notificação de erro
            showNotification(false, 'Erro ao Cancelar', error.message);
        }
    }

    // --- Inicialização ---
    loadAppointments(); // Carrega as consultas ao abrir a página
});