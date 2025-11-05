/*
 * reagendar.js
 * Funcionalidades da página de Reagendamento, com fluxo de 2 etapas.
 *
 * ATUALIZAÇÃO:
 * - Etapa 1: Carrega consultas futuras via API GET /Consulta.
 * - Etapa 2: Submete o reagendamento via API PATCH /Consulta.
 * - (v2) Implementada a busca de horários disponíveis (GET).
 * - (v3) Adicionado 'FuncionarioId' ao payload do PATCH para
 * permitir a verificação de colisão no backend.
 */

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. Constantes e Variáveis Globais ---
    const API_URL = "https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta";
    const pacienteCPF = localStorage.getItem('paciente_cpf');
    
    // Armazena os dados da consulta (Empresa, OrderId, FuncionarioId)
    let consultaParaReagendar = null; 
    
    // --- 2. Script de Proteção de Rota (Guard) ---
    if (!pacienteCPF) {
        alert("Acesso negado. Por favor, faça login para continuar.");
        window.location.href = "register.html";
        return; 
    }
    // --- Fim do Script de Proteção ---

    // --- 3. Seletores do DOM ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const chatButton = document.getElementById('open-chat-bot');
    const logoutButton = document.querySelector('.btn-logout');
    
    // Seletores da Página
    const step1Container = document.getElementById('step-1-select');
    const step2Container = document.getElementById('step-2-reschedule');
    const appointmentListContainer = document.querySelector('.appointment-list');
    const cancelRescheduleBtn = document.getElementById('cancel-reschedule');
    const confirmButton = document.querySelector('.btn-confirm'); // Botão de Confirmar
    
    // Seletores do Calendário
    const monthYearEl = document.getElementById('month-year');
    const calendarGridEl = document.getElementById('calendar-days-grid');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const timeSlotHeader = document.getElementById('time-slot-header');
    const timeSlotsGrid = document.getElementById('time-slots-grid'); // ID corrigido no HTML
    
    let currentDate = new Date(); // Inicia com a data de hoje
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const mesesAbv = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];


    // --- 4. Funções de UI (Menu, Chat, Logout) ---
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    if (chatButton) {
        chatButton.addEventListener('click', function() {
            const chatUrl = 'bot_web.html';
            const windowName = 'PsicosoftChat';
            const windowFeatures = 'width=450,height=700,top=100,left=100,resizable=yes,scrollbars=yes';
            window.open(chatUrl, windowName, windowFeatures);
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

    // --- 5. LÓGICA DE CARREGAMENTO (ETAPA 1 - API GET) ---
    
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

    /**
     * Formata o objeto de consulta da API para o HTML da Etapa 1.
     * Salva o FuncionarioId.
     */
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
            // Dados essenciais para o PATCH
            empresa: consulta.Empresa,
            orderId: consulta.OrderId,
            funcionarioId: consulta.FuncionarioId
        };
    }

    /**
     * Cria o HTML de um item de consulta para a Etapa 1.
     * Adiciona o data-funcionarioid.
     */
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

    // --- 6. LÓGICA DAS ETAPAS DE REAGENDAMENTO ---

    /**
     * Adiciona os listeners aos botões "Reagendar"
     * Armazena o funcionarioId salvo.
     */
    function addRescheduleButtonClickHandlers() {
        const rescheduleButtons = document.querySelectorAll('.btn-reschedule');
        const appointmentItems = document.querySelectorAll('.appointment-item');

        rescheduleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const selectedItem = e.target.closest('.appointment-item');
                
                // Salva os dados da consulta que será reagendada
                consultaParaReagendar = {
                    empresa: selectedItem.dataset.empresa,
                    orderId: selectedItem.dataset.orderid,
                    funcionarioId: selectedItem.dataset.funcionarioid
                };
                
                // UI
                appointmentItems.forEach(item => item.classList.remove('selected'));
                selectedItem.classList.add('selected');
                step2Container.style.display = 'block';
                step2Container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    cancelRescheduleBtn.addEventListener('click', () => {
        step2Container.style.display = 'none';
        consultaParaReagendar = null; // Limpa os dados
        document.querySelectorAll('.appointment-item.selected').forEach(item => item.classList.remove('selected'));
        step1Container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });


    // --- 7. LÓGICA DE SUBMISSÃO (ETAPA 2 - API PATCH) ---

    async function handleConfirmarReagendamento(event) {
        event.preventDefault();
        
        if (!consultaParaReagendar) {
            alert("Erro: Nenhum consulta selecionada. Por favor, volte à Etapa 1.");
            return;
        }

        const selectedDayEl = document.querySelector('.day.selected');
        const selectedTimeEl = document.querySelector('.time-slot.selected');

        if (!selectedDayEl || !selectedTimeEl) {
            alert("Por favor, selecione uma nova data E um novo horário.");
            return;
        }

        const dia = selectedDayEl.dataset.day.padStart(2, '0');
        const mes = (parseInt(selectedDayEl.dataset.month) + 1).toString().padStart(2, '0');
        const ano = selectedDayEl.dataset.year;
        const hora = selectedTimeEl.textContent.trim();
        const newHorarioStr = `${dia}/${mes}/${ano} ${hora}`;

        // --- ATUALIZAÇÃO (v3) ---
        // Adiciona o FuncionarioId ao payload para verificação no backend
        const payload = {
            Empresa: consultaParaReagendar.empresa,
            OrderId: consultaParaReagendar.orderId,
            new_horario: newHorarioStr,
            FuncionarioId: consultaParaReagendar.funcionarioId // <-- ADICIONADO
        };
        // --- FIM DA ATUALIZAÇÃO ---

        console.log("Enviando Reagendamento (PATCH):", payload);

        confirmButton.textContent = "Reagendando...";
        confirmButton.disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();

            if (!response.ok) {
                // Irá capturar o erro 409 (Conflito) da Lambda
                throw new Error(responseData.message || 'Não foi possível reagendar.');
            }
            
            alert("Consulta reagendada com sucesso!");
            window.location.href = "dashboard.html"; 

        } catch (error) {
            console.error('Erro ao reagendar:', error);
            // Exibe a mensagem de erro vinda do backend (ex: "Conflito de agendamento...")
            alert(`Erro ao reagendar: ${error.message}`);
        
        } finally {
            confirmButton.textContent = "Confirmar Reagendamento";
            confirmButton.disabled = false;
        }
    }
    
    if (confirmButton) {
        confirmButton.addEventListener('click', handleConfirmarReagendamento);
    }


    // --- 8. LÓGICA DO CALENDÁRIO E HORÁRIOS (ETAPA 2) ---

    function renderCalendar(year, month) {
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

        // Dias do mês anterior
        for (let i = firstDayOfMonth; i > 0; i--) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('day', 'prev-month');
            dayEl.textContent = daysInPrevMonth - i + 1;
            calendarGridEl.appendChild(dayEl);
        }

        // Dias do mês atual
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

        // Dias do próximo mês
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

    /**
     * Esta função agora chama a API de horários.
     */
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
                    alert("Erro: Não foi possível identificar o profissional. Tente selecionar a consulta novamente.");
                    return;
                }

                const dataSelecionada = new Date(yearNum, monthNum, dayNum);
                await carregarHorariosDisponiveis(consultaParaReagendar.funcionarioId, dataSelecionada);
            });
        });
    }

    /**
     * Função para carregar horários disponíveis.
     */
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
                const [dataStr, horaStr] = consulta.horario.split(' ');
                if (dataStr === dataSelecionadaStr) {
                    horariosOcupados.add(horaStr); 
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


    /**
     * Função para adicionar clique aos horários.
     */
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
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });


    // --- 9. Inicialização ---
    carregarConsultasAgendadas(); // Inicia o GET da Etapa 1
    renderCalendar(currentDate.getFullYear(), currentDate.getMonth()); // Renderiza o calendário

});