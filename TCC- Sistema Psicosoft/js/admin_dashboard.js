/*
 * admin_dashboard.js
 * Funcionalidades do painel gerencial da clínica.
 * - Carrega dados reais da API GET /Consulta
 * - Utiliza a API POST /Consulta/CancelarConsulta para cancelamentos.
 * - Calcula KPIs e filtra a tabela para as consultas do dia.
 */

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. Seletores dos Modais (Reutilizados de cancelar.js) ---
    const cancelModal = document.getElementById('cancel-modal');
    const confirmCancelBtn = document.getElementById('modal-btn-confirm');
    const closeModalBtn = document.getElementById('modal-btn-close');
    const cancelDetailsText = document.getElementById('modal-cancel-details');

    const notificationModal = document.getElementById('notification-modal');
    const notificationIconWrapper = notificationModal.querySelector('.modal-icon-wrapper');
    const notificationTitle = document.getElementById('modal-title');
    const notificationMessage = document.getElementById('modal-message');
    const notificationOkButton = document.getElementById('modal-btn-ok');

    // --- 2. Lógica de UI Padrão (Menu, Logout, Chat) ---

    // Menu Mobile
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // Logout
    const logoutButton = document.querySelector('.btn-logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(event) {
            event.preventDefault(); 
            // Limparia o localStorage do admin (ex: localStorage.removeItem('admin_id'))
            window.location.href = "index.html"; 
        });
    }

    // Chat
    const chatButton = document.getElementById('open-chat-bot');
    const chatContainer = document.getElementById('chat-widget-container');
    const chatCloseButton = document.getElementById('chat-widget-close');
    if (chatButton && chatContainer && chatCloseButton) {
        chatButton.addEventListener('click', function() {
            chatContainer.classList.toggle('active');
            chatButton.classList.toggle('chat-aberto');
        });
        chatCloseButton.addEventListener('click', function() {
            chatContainer.classList.remove('active');
            chatButton.classList.remove('chat-aberto');
        });
    }
    
    // --- 3. Carregamento de Dados da API ---

    // URLs das APIs (baseadas nos seus outros arquivos JS)
    const API_GET_CONSULTAS = "https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta";
    const API_POST_CANCELAR = "https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta/CancelarConsulta";

    // Seletores da UI do Dashboard
    const tbody = document.getElementById('consultas-tbody');
    const kpiTotal = document.getElementById('kpi-consultas-total');
    const kpiAgendadas = document.getElementById('kpi-consultas-agendadas');
    const kpiConcluidas = document.getElementById('kpi-consultas-concluidas');
    const kpiCanceladas = document.getElementById('kpi-consultas-canceladas');
    const statsHoje = document.getElementById('stats-hoje');
    
    /**
     * Helper para converter "dd/mm/aaaa HH:MM" em um objeto Date
     */
    function parseDataHorario(horarioStr) {
        // Ex: "07/11/2025 09:30"
        const [dataStr, horaStr] = horarioStr.split(' '); 
        const [dia, mesNum, ano] = dataStr.split('/'); 
        const [hora, minuto] = horaStr.split(':'); 
        // Mês em JS é 0-indexado (0 = Jan, 11 = Dez)
        return new Date(parseInt(ano), parseInt(mesNum) - 1, parseInt(dia), parseInt(hora), parseInt(minuto));
    }
    
    /**
     * Define o status dinâmico de uma consulta
     */
    function getStatusConsulta(consulta, agora) {
        // Se a API já marcou como cancelada, esse é o status final.
        if ((consulta.status || '').toLowerCase() === "cancelada") {
            return { status: "cancelada", tag: '<span class="status-tag status-cancelada">Cancelada</span>', disabled: true };
        }

        const dataConsulta = parseDataHorario(consulta.horario);

        // Se a data/hora da consulta já passou
        if (dataConsulta < agora) {
            return { status: "concluida", tag: '<span class="status-tag status-concluida">Concluída</span>', disabled: true };
        }
        
        // (Lógica opcional para "Em Andamento")
        // Se a consulta começou nos últimos 45 min
        const diffMinutos = (agora - dataConsulta) / (1000 * 60);
        if (diffMinutos > 0 && diffMinutos < 45) {
             return { status: "andamento", tag: '<span class="status-tag status-andamento">Em Andamento</span>', disabled: false };
        }

        // Se não, ainda está agendada
        return { status: "agendada", tag: '<span class="status-tag status-agendada">Agendada</span>', disabled: false };
    }


    /**
     * Carrega todos os dados do painel (KPIs e tabela)
     */
    async function loadDashboardData() {
        // ATENÇÃO: O ID do funcionário está fixo para "Dra. Beatriz".
        // Em um app real, você pegaria isso do localStorage após o login do admin.
        const funcionarioId = "psicosoft_dra@gmail.com"; 
        
        const url = `${API_GET_CONSULTAS}?FuncionarioId=${encodeURIComponent(funcionarioId)}`;

        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="4">Carregando consultas...</td></tr>';
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: Não foi possível buscar os dados.`);
            }
            
            const allConsultas = await response.json();

            // --- Processamento dos Dados ---
            const agora = new Date();
            const hojeStr = agora.toLocaleDateString('pt-BR'); // Ex: "07/11/2025"
            const hojeFormatado = agora.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

            // 1. Filtra apenas as consultas de HOJE
            const consultasDeHoje = allConsultas.filter(c => 
                c.horario && c.horario.startsWith(hojeStr)
            );
            
            // 2. Calcula os KPIs com base nas consultas de HOJE
            let agendadasCount = 0;
            let concluidasCount = 0;
            let canceladasCount = 0;

            consultasDeHoje.forEach(consulta => {
                const statusInfo = getStatusConsulta(consulta, agora);
                switch(statusInfo.status) {
                    case 'cancelada': canceladasCount++; break;
                    case 'concluida': concluidasCount++; break;
                    case 'agendada':
                    case 'andamento':
                        agendadasCount++;
                        break;
                }
            });

            // 3. Atualiza a UI (Cabeçalho e KPIs)
            statsHoje.textContent = `Hoje é ${hojeFormatado}. Você tem ${consultasDeHoje.length} consultas.`;
            kpiTotal.textContent = consultasDeHoje.length;
            kpiAgendadas.innerHTML = `<strong>${agendadasCount}</strong> Agendadas`;
            kpiConcluidas.innerHTML = `<strong>${concluidasCount}</strong> Concluídas`;
            kpiCanceladas.innerHTML = `<strong>${canceladasCount}</strong> Canceladas`;

            // 4. Renderiza a Tabela
            renderTable(consultasDeHoje, agora);
            
        } catch (error) {
            console.error("Erro ao carregar dashboard:", error);
            tbody.innerHTML = `<tr><td colspan="4" style="color: red;">${error.message}</td></tr>`;
        }
    }

    /**
     * Renderiza a tabela de consultas de hoje
     */
    function renderTable(consultas, agora) {
        tbody.innerHTML = ''; // Limpa a tabela
        
        if (consultas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">Nenhuma consulta para hoje.</td></tr>';
            return;
        }

        // Ordena pela hora
        consultas.sort((a, b) => {
            return parseDataHorario(a.horario) - parseDataHorario(b.horario);
        });

        consultas.forEach(consulta => {
            const tr = document.createElement('tr');
            const statusInfo = getStatusConsulta(consulta, agora);
            const horario = consulta.horario.split(' ')[1] || 'N/A';
            
            // O nome do paciente vem da API (campo 'nome')
            const nomePaciente = consulta.nome || 'Paciente não informado'; 

            tr.innerHTML = `
                <td>${nomePaciente}</td>
                <td>${horario}</td>
                <td>${statusInfo.tag}</td>
                <td>
                    <button class="btn-cancel" 
                        data-order-id="${consulta.OrderId}" 
                        data-horario="${horario}"
                        data-paciente="${nomePaciente}"
                        ${statusInfo.disabled ? 'disabled' : ''}>
                        ${statusInfo.disabled ? '—' : 'Cancelar'}
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // (Re)anexa os eventos aos novos botões
        attachCancelButtons();
        lucide.createIcons();
    }


    // --- 4. Lógica de Cancelamento (Reutilizada de cancelar.js) ---

    function attachCancelButtons() {
        const buttons = document.querySelectorAll('.btn-cancel:not(:disabled)');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = e.currentTarget.dataset.orderId;
                const horario = e.currentTarget.dataset.horario;
                const paciente = e.currentTarget.dataset.paciente;

                cancelDetailsText.textContent = `Paciente: ${paciente} (${horario})`;
                
                confirmCancelBtn.onclick = () => {
                    performCancellation(orderId);
                };

                cancelModal.classList.add('active');
            });
        });
    }

    async function performCancellation(orderId) {
        cancelModal.classList.remove('active');
        showNotification(false, 'Cancelando...', 'Aguarde enquanto processamos a solicitação.');

        try {
            const response = await fetch(API_POST_CANCELAR, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ OrderId: orderId }) 
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Não foi possível cancelar a consulta.');
            }

            // Sucesso!
            showNotification(true, 'Consulta Cancelada', 'A consulta foi cancelada com sucesso.');

            // Recarrega o painel para atualizar a tabela e KPIs
            loadDashboardData();

        } catch (error) {
            console.error('Erro ao cancelar:', error);
            showNotification(false, 'Erro ao Cancelar', error.message);
        }
    }

    /**
     * Exibe o modal de notificação de Sucesso ou Erro
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
        lucide.createIcons(); // Recria ícone do modal
    }

    // Eventos para fechar os modais
    if(closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            cancelModal.classList.remove('active');
        });
    }
    if(notificationOkButton) {
        notificationOkButton.addEventListener('click', () => {
            notificationModal.classList.remove('active');
        });
    }

    // --- 5. Inicialização ---
    loadDashboardData(); // Carrega os dados reais ao iniciar
    lucide.createIcons(); // Ativa todos os ícones da página

});