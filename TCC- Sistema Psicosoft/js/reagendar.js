/*
 * reagendar.js
 * Funcionalidades da página de Reagendamento, com fluxo de 2 etapas.
 *
 * ATUALIZAÇÃO (v4):
 * - Substituídos todos os 'alert()' por um modal customizado.
 * - Adicionada animação de calendário/relógio para sucesso.
 * - Adicionado ícone de erro para falhas.
 * - (v3) Adicionado 'FuncionarioId' ao payload do PATCH.
 * - ATUALIZAÇÃO 5: Chatbot agora é um widget flutuante.
 */

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. Constantes e Variáveis Globais ---
    const API_URL = "https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta";
    const pacienteCPF = localStorage.getItem('paciente_cpf');
    
    let consultaParaReagendar = null; 
    
    // --- 2. Seletores do DOM ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const logoutButton = document.querySelector('.btn-logout');
    
    // Seletores da Página
    const step1Container = document.getElementById('step-1-select');
    const step2Container = document.getElementById('step-2-reschedule');
    const appointmentListContainer = document.querySelector('.appointment-list');
    const cancelRescheduleBtn = document.getElementById('cancel-reschedule');
    const confirmButton = document.querySelector('.btn-confirm'); 
    
    // Seletores do Calendário
    const monthYearEl = document.getElementById('month-year');
    const calendarGridEl = document.getElementById('calendar-days-grid');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const timeSlotHeader = document.getElementById('time-slot-header');
    const timeSlotsGrid = document.getElementById('time-slots-grid');
    
    // --- NOVO: Seletores do Modal ---
    const modal = document.getElementById('notification-modal');
    const modalIconWrapper = modal.querySelector('.modal-icon-wrapper');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalOkButton = document.getElementById('modal-btn-ok');
    
    // Controla se o 'OK' deve redirecionar
    let isSuccessRedirect = false; 
    
    // Constantes de data
    let currentDate = new Date();
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const mesesAbv = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

    // --- 3. Script de Proteção de Rota (Guard) ---
    if (!pacienteCPF) {
        // Mostra o modal de erro se não estiver logado
        showNotification(false, 'Acesso Negado', 'Você precisa fazer login para reagendar uma consulta.');
        // Desabilita os botões para segurança
        document.querySelectorAll('.btn-reschedule, .btn-confirm').forEach(btn => {
            if(btn) btn.disabled = true;
        });
        // Não continua a execução
    } else {
        // Se estiver logado, inicia o carregamento
        carregarConsultasAgendadas();
    }
    // --- Fim do Script de Proteção ---

    // --- 4. Funções de UI (Menu, Chat, Logout) ---
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // --- 4.B. Controle do Chat Bot (Widget Flutuante) ---
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
    
    if (logoutButton) {
        logoutButton.addEventListener('click', function(event) {
            event.preventDefault(); 
            localStorage.removeItem('paciente_nome');
            localStorage.removeItem('paciente_cpf');
            window.location.href = "index.html"; 
        });
    }

    // --- 5. LÓGICA DO MODAL ---
    
    /**
     * Exibe o modal de notificação
     * @param {boolean} isSuccess - Define o estilo (sucesso ou erro)
     * @param {string} title - O título (ex: "Sucesso!")
     * @param {string} message - A mensagem de detalhe
     */
    function showNotification(isSuccess, title, message) {
        if (!modal) return; // Segurança caso o HTML não esteja pronto
        
        modal.classList.remove('modal--success', 'modal--error');

        if (isSuccess) {
            modal.classList.add('modal--success');
            // INJETA A ANIMAÇÃO PERSONALIZADA
            modalIconWrapper.innerHTML = `
                <div class="animated-icon-container">
                    <div class="calendar-icon"></div>
                    <div class="clock-icon"></div>
                </div>
            `;
            isSuccessRedirect = true;
        } else {
            modal.classList.add('modal--error');
            // INJETA O ÍCONE DE ERRO (SVG do Lucide)
            modalIconWrapper.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                    <line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line>
                </svg>
            `;
            isSuccessRedirect = false;
        }

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.add('active');
    }

    // Evento para fechar o modal
    if (modalOkButton) {
        modalOkButton.addEventListener('click', () => {
            modal.classList.remove('active');
            if (isSuccessRedirect) {
                // Se foi sucesso, redireciona para o painel
                window.location.href = 'dashboard.html';
            }
        });
    }

    // --- 6. LÓGICA DE CARREGAMENTO (ETAPA 1 - API GET) ---
    
    async function carregarConsultasAgendadas() {
        if (!appointmentListContainer) return;

        appointmentListContainer.innerHTML = "<p>Buscando suas consultas...</p>";
        
        try {
            const response = await fetch(`${API_URL}?ClienteId=${pacienteCPF}`);
            
            if (!response.ok) {
                throw new Error("Não foi possível buscar suas consultas.");
            }
            
            const todasConsultas = await response.json();
            const agora = new Date();
            
            const consultasFuturas = todasConsultas.filter(consulta => {
                const dataConsulta = parseDataHorario(consulta.horario);
                return dataConsulta > agora;
            });

            if (consultasFuturas.length === 0) {
                appointmentListContainer.innerHTML = "<p>Você não possui consultas futuras para reagendar.</p>";
                return;
            }

            const itemsHtml = []; 
            consultasFuturas.forEach(consulta => {
                const dados = formatarConsultaParaLista(consulta);
                itemsHtml.push(criarItemConsultaHTML(dados));
            });
            
            appointmentListContainer.innerHTML = itemsHtml.join('');

            if (window.lucide) {
                window.lucide.createIcons();
            }
            addRescheduleButtonClickHandlers();

        } catch (error) {
            console.error('Erro ao carregar consultas:', error);
            appointmentListContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }

    function parseDataHorario(horarioStr) {
        const [dataStr, horaStr] = horarioStr.split(' '); 
        const [dia, mesNum, ano] = dataStr.split('/'); 
        const [hora, minuto] = horaStr.split(':'); 
        return new Date(parseInt(ano), parseInt(mesNum) - 1, parseInt(dia), parseInt(hora), parseInt(minuto));
    }

    function formatarConsultaParaLista(consulta) {
        const dataObj = parseDataHorario(consulta.horario);
        const horaStr = consulta.horario.split(' ')[1];

        return {
            mes: mesesAbv[dataObj.getMonth()],
            dia: String(dataObj.getDate()).padStart(2, '0'),
            titulo: `Consulta de ${consulta.especialidade || 'Clínica'}`,
            statusIcon: "check-circle",
            statusClass: "status-confirmado",
            statusText: `Confirmada - ${horaStr}`,
            empresa: consulta.Empresa,
            orderId: consulta.OrderId,
            funcionarioId: consulta.FuncionarioId
        };
    }

    function criarItemConsultaHTML(d) {
        return `
            <div class="appointment-item" 
                 data-empresa="${d.empresa}" 
                 data-orderid="${d.orderId}"
                 data-funcionarioid="${d.funcionarioId}"> 
                
                <div class="date-box">
                    <span class="month">${d.mes}</span>
                    <span class="day">${d.dia}</span>
                </div>
                <div class="appointment-details">
                    <h5>${d.titulo}</h5>
                    <p class="${d.statusClass}">
                        <i data-lucide="${d.statusIcon}"></i> ${d.statusText}
                    </p>
                </div>
                <div class="action-wrapper">
                    <button class="btn-reschedule">Reagendar</button>
                </div>
            </div>
        `;
    }

    // --- 7. LÓGICA DAS ETAPAS DE REAGENDAMENTO ---

    function addRescheduleButtonClickHandlers() {
        const rescheduleButtons = document.querySelectorAll('.btn-reschedule');
        const appointmentItems = document.querySelectorAll('.appointment-item');

        rescheduleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const selectedItem = e.target.closest('.appointment-item');
                
                consultaParaReagendar = {
                    empresa: selectedItem.dataset.empresa,
                    orderId: selectedItem.dataset.orderid,
                    funcionarioId: selectedItem.dataset.funcionarioid
                };
                
                appointmentItems.forEach(item => item.classList.remove('selected'));
                selectedItem.classList.add('selected');
                step2Container.style.display = 'block';
                step2Container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    if(cancelRescheduleBtn) {
        cancelRescheduleBtn.addEventListener('click', () => {
            step2Container.style.display = 'none';
            consultaParaReagendar = null; 
            document.querySelectorAll('.appointment-item.selected').forEach(item => item.classList.remove('selected'));
            step1Container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }


    // --- 8. LÓGICA DE SUBMISSÃO (ETAPA 2 - API PATCH) ---

    async function handleConfirmarReagendamento(event) {
        event.preventDefault();
        
        if (!consultaParaReagendar) {
            showNotification(false, 'Erro', 'Nenhuma consulta selecionada. Por favor, volte à Etapa 1.');
            return;
        }

        const selectedDayEl = document.querySelector('.day.selected');
        const selectedTimeEl = document.querySelector('.time-slot.selected');

        if (!selectedDayEl || !selectedTimeEl) {
            showNotification(false, 'Campos Incompletos', 'Por favor, selecione uma nova data E um novo horário.');
            return;
        }

        const dia = selectedDayEl.dataset.day.padStart(2, '0');
        const mes = (parseInt(selectedDayEl.dataset.month) + 1).toString().padStart(2, '0');
        const ano = selectedDayEl.dataset.year;
        const hora = selectedTimeEl.textContent.trim();
        const newHorarioStr = `${dia}/${mes}/${ano} ${hora}`;

        const payload = {
            Empresa: consultaParaReagendar.empresa,
            OrderId: consultaParaReagendar.orderId,
            new_horario: newHorarioStr,
            FuncionarioId: consultaParaReagendar.funcionarioId 
        };

        console.log("Enviando Reagendamento (PATCH):", payload);

        confirmButton.textContent = "Reagendando...";
        confirmButton.disabled = true;

        try {
            const response = await fetch('https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta',
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();

            if (!response.ok) {
                // Irá capturar o erro 409 (Conflito) da Lambda
                throw new Error(responseData.message || 'Não foi possível reagendar.');
            }
            
            // SUCESSO! Chama o modal com a animação
            showNotification(true, 'Consulta Reagendada!', 'Seu agendamento foi alterado com sucesso.');

        } catch (error) {
            console.error('Erro ao reagendar:', error);
            // ERRO! Chama o modal de erro
            showNotification(false, 'Erro ao Reagendar', error.message);
        
        } finally {
            confirmButton.textContent = "Confirmar Reagendamento";
            confirmButton.disabled = false;
        }
    }
    
    if (confirmButton && pacienteCPF) { // Só adiciona listener se estiver logado
        confirmButton.addEventListener('click', handleConfirmarReagendamento);
    }


    // --- 9. LÓGICA DO CALENDÁRIO E HORÁRIOS (ETAPA 2) ---

    function renderCalendar(year, month) {
        if (!calendarGridEl) return; // Segurança
        calendarGridEl.innerHTML = '';
        timeSlotHeader.textContent = 'Escolha um horário';
        if (timeSlotsGrid) {
             timeSlotsGrid.innerHTML = '<p style="color: var(--text-light); grid-column: 1 / -1;">Selecione uma data para ver os horários.</p>';
        }

        monthYearEl.textContent = `${monthNames[month]} de ${year}`;
        const today = new Date();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        for (let i = firstDayOfMonth; i > 0; i--) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('day', 'prev-month');
            dayEl.textContent = daysInPrevMonth - i + 1;
            calendarGridEl.appendChild(dayEl);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('day');
            dayEl.textContent = i;
            dayEl.dataset.day = i;
            dayEl.dataset.month = month;
            dayEl.dataset.year = year;

            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayEl.classList.add('current-day');
            }

            const dayDate = new Date(year, month, i);
            if (dayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
                dayEl.classList.add('disabled');
            }
            calendarGridEl.appendChild(dayEl);
        }

        const totalGridCells = 42; 
        const renderedCells = firstDayOfMonth + daysInMonth;
        const remainingCells = totalGridCells - renderedCells;

        for (let i = 1; i <= remainingCells; i++) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('day', 'next-month');
            dayEl.textContent = i;
            calendarGridEl.appendChild(dayEl);
        }
        
        addDayClickHandlers();
    }

    function addDayClickHandlers() {
        const days = document.querySelectorAll('.day:not(.prev-month):not(.next-month):not(.disabled)');
        days.forEach(day => {
            day.addEventListener('click', async () => {
                document.querySelectorAll('.day.selected').forEach(d => d.classList.remove('selected'));
                day.classList.add('selected');
                
                const dayNum = day.dataset.day;
                const monthNum = parseInt(day.dataset.month, 10);
                const yearNum = day.dataset.year;
                const dayOfWeek = dayNames[new Date(yearNum, monthNum, dayNum).getDay()];
                
                timeSlotHeader.textContent = `Escolha um horário (${dayOfWeek}, ${dayNum} de ${monthNames[monthNum]})`;

                if (!consultaParaReagendar || !consultaParaReagendar.funcionarioId) {
                    showNotification(false, 'Erro de Etapa', 'Não foi possível identificar o profissional. Tente selecionar a consulta na Etapa 1 novamente.');
                    return;
                }

                const dataSelecionada = new Date(yearNum, monthNum, dayNum);
                await carregarHorariosDisponiveis(consultaParaReagendar.funcionarioId, dataSelecionada);
            });
        });
    }

    async function carregarHorariosDisponiveis(funcionarioId, dataSelecionada) {
        if (!timeSlotsGrid) return;
        timeSlotsGrid.innerHTML = '<p style="color: var(--text-light); grid-column: 1 / -1;">Carregando horários...</p>';
        
        const url = `${API_URL}?FuncionarioId=${encodeURIComponent(funcionarioId)}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Não foi possível buscar os horários.');
            }
            
            const todasConsultas = await response.json();
            
            const dataSelecionadaStr = dataSelecionada.toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });

            const horariosOcupados = new Set();
            todasConsultas.forEach(consulta => {
                if (consulta.OrderId !== consultaParaReagendar.orderId) {
                    const [dataStr, horaStr] = consulta.horario.split(' ');
                    if (dataStr === dataSelecionadaStr) {
                        horariosOcupados.add(horaStr); 
                    }
                }
            });

            const horariosHTML = [];
            const agora = new Date();
            
            for (let hora = 7; hora <= 17; hora++) {
                for (let minuto = 0; minuto < 60; minuto += 30) {
                    
                    const horaStr = hora.toString().padStart(2, '0');
                    const minutoStr = minuto.toString().padStart(2, '0');
                    const slotTimeStr = `${horaStr}:${minutoStr}`; 

                    const slotDateTime = new Date(
                        dataSelecionada.getFullYear(),
                        dataSelecionada.getMonth(),
                        dataSelecionada.getDate(),
                        hora,
                        minuto
                    );

                    let isDisabled = false;
                    if (horariosOcupados.has(slotTimeStr) || slotDateTime < agora) {
                        isDisabled = true;
                    }
                    
                    horariosHTML.push(
                        `<button class="time-slot ${isDisabled ? 'disabled' : ''}" ${isDisabled ? 'disabled' : ''}>
                            ${slotTimeStr}
                        </button>`
                    );
                }
            }
            
            if (horariosHTML.length === 0) {
                 timeSlotsGrid.innerHTML = '<p style="color: var(--text-light); grid-column: 1 / -1;">Nenhum horário encontrado.</p>';
            } else {
                 timeSlotsGrid.innerHTML = horariosHTML.join('');
                 addTimeSlotClickHandlers();
            }

        } catch (error) {
            console.error('Erro ao carregar horários:', error);
            timeSlotsGrid.innerHTML = `<p style="color: red; grid-column: 1 / -1;">${error.message}</p>`;
        }
    }

    function addTimeSlotClickHandlers() {
        const timeSlots = document.querySelectorAll('.time-slot:not(.disabled)');
        timeSlots.forEach(slot => {
            slot.addEventListener('click', () => {
                document.querySelectorAll('.time-slot.selected').forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
            });
        });
    }

    // Navegação do Calendário
    if(prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
        });
    }

    if(nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
        });
    }


    // --- 10. Inicialização ---
    // (O carregamento das consultas agora é feito dentro da verificação do CPF)
    renderCalendar(currentDate.getFullYear(), currentDate.getMonth());

});