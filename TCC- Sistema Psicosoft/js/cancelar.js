/*
 * cancelar.js
 * Funcionalidades da página de Cancelamento.
 * - Lista consultas do usuário (GET)
 * - Adiciona coluna de Status
 * - Controla modal de confirmação (com ícone 'frown')
 * - Controla modal de notificação (sucesso/erro)
 * - Envia pedido de cancelamento (POST)
 * - ATUALIZAÇÃO: Bloqueia cancelamento < 24h ou datas passadas.
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
    const cancelModal = document.getElementById('cancel-modal');
    const confirmCancelBtn = document.getElementById('modal-btn-confirm');
    const closeModalBtn = document.getElementById('modal-btn-close');
    const cancelDetailsText = document.getElementById('modal-cancel-details');
    const cancelIconWrapper = document.querySelector('#cancel-modal .modal-icon-wrapper');

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

    notificationOkButton.addEventListener('click', () => {
        notificationModal.classList.remove('active');
    });

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

            minhasConsultas.sort((a, b) => a.OrderDate - b.OrderDate);
            renderTable(minhasConsultas);

        } catch (error) {
            console.error('Erro ao carregar consultas:', error);
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: red;">${error.message}</td></tr>`;
        }
    }

    /**
     * ATUALIZADO: Converte o formato "dd/mm/aaaa hh:mm" para um objeto Date
     */
    function parseHorario(horarioStr) {
        if (!horarioStr) return null;
        // Ex: "05/11/2025 16:00"
        const [dataStr, horaStr] = horarioStr.split(' ');
        if (!dataStr || !horaStr) return null;
        
        const [dia, mes, ano] = dataStr.split('/');
        const [hora, minuto] = horaStr.split(':');
        
        // Mês no JS é 0-indexado (0 = Jan, 11 = Dez)
        return new Date(ano, mes - 1, dia, hora, minuto);
    }


    /**
     * ATUALIZADO: Agora valida a data da consulta antes de habilitar o botão.
     */
    function renderTable(consultas) {
        tbody.innerHTML = ''; // Limpa a tabela

        consultas.forEach(consulta => {
            const status = consulta.status || "Agendada";
            const isCancelled = status.toLowerCase() === "cancelada";

            // --- INÍCIO DA NOVA LÓGICA DE VALIDAÇÃO DE DATA ---
            let isDisparada = false; // "Disparada" = Não pode mais ser alterada
            let buttonText = "Cancelar";
            const agora = new Date();
            const consultaDateTime = parseHorario(consulta.horario);

            // Define a regra de 24 horas (em milissegundos)
            const H24_EM_MS = 24 * 60 * 60 * 1000;
            
            if (isCancelled) {
                isDisparada = true;
                buttonText = "Cancelada";
            } else if (!consultaDateTime || (consultaDateTime.getTime() - agora.getTime()) < H24_EM_MS) {
                // Se a data é inválida, ou
                // se a consulta for em menos de 24h (ou já passou)
                
                isDisparada = true;
                
                // Muda o texto do botão para ser mais claro
                if (consultaDateTime && consultaDateTime < agora) {
                    // Já passou
                    buttonText = "Concluída"; 
                } else {
                    // Está a menos de 24h
                    buttonText = "Bloqueado"; 
                }
            }
            // --- FIM DA NOVA LÓGICA ---

            const tr = document.createElement('tr');
            if (isCancelled) {
                tr.classList.add('cancelled-row');
            }
            
            // Lógica para nome do profissional
            let nomeProfissional = consulta.profissional;
            if (!nomeProfissional && consulta.FuncionarioId) {
                let emailName = consulta.FuncionarioId.split('@')[0];
                if (emailName === 'psicosoft_dr') nomeProfissional = 'Dr. André';
                else if (emailName === 'psicosoft_dra') nomeProfissional = 'Dra. Beatriz';
                else nomeProfissional = emailName;
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
                        ${isDisparada ? 'disabled' : ''}>
                        ${buttonText}
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
        // Seleciona apenas botões que NÃO estão desabilitados
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

        // 2. Mostra um estado de "carregando"
        showNotification(false, 'Cancelando...', 'Aguarde enquanto processamos sua solicitação.');

        const apiUrl = 'https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta/CancelarConsulta';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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