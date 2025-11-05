/*
 * reagendar.js
 * Funcionalidades da página de Reagendamento, com fluxo de 2 etapas.
 *
 * ATUALIZAÇÃO:
 * - Etapa 1: Carrega consultas futuras via API GET /Consulta.
 * - Etapa 2: Submete o reagendamento via API PATCH /Consulta.
 */

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. Constantes e Variáveis Globais ---
    const API_URL = "https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta";
    const pacienteCPF = localStorage.getItem('paciente_cpf');
    
    // Armazena os dados da consulta (Empresa, OrderId) selecionada na Etapa 1
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
    
    // Seletores do Calendário (já existentes)
    const monthYearEl = document.getElementById('month-year');
    const calendarGridEl = document.getElementById('calendar-days-grid');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const timeSlotHeader = document.getElementById('time-slot-header');
    
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
    
    /**
     * Busca as consultas do paciente e as renderiza na Etapa 1.
     */
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
            
            // Filtra APENAS consultas futuras
            const consultasFuturas = todasConsultas.filter(consulta => {
                const dataConsulta = parseDataHorario(consulta.horario);
                return dataConsulta > agora;
            });

            if (consultasFuturas.length === 0) {
                appointmentListContainer.innerHTML = "<p>Você não possui consultas futuras para reagendar.</p>";
                return;
            }

            // Renderiza os itens
            appointmentListContainer.innerHTML = ""; // Limpa o "carregando"
            consultasFuturas.forEach(consulta => {
                const dados = formatarConsultaParaLista(consulta);
                appointmentListContainer.innerHTML += criarItemConsultaHTML(dados);
            });
            
            // Ativa os ícones do Lucide (se houver)
            if (window.lucide) {
                window.lucide.createIcons();
            }

            // ADICIONA OS LISTENERS AOS BOTÕES DINÂMICOS
            addRescheduleButtonClickHandlers();

        } catch (error) {
            console.error('Erro ao carregar consultas:', error);
            appointmentListContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }

    /**
     * Converte a string 'dd/mm/yyyy HH:MM' em um objeto Date.
     */
    function parseDataHorario(horarioStr) {
        const [dataStr, horaStr] = horarioStr.split(' '); // ["10/11/2025", "14:30"]
        const [dia, mesNum, ano] = dataStr.split('/'); // ["10", "11", "2025"]
        const [hora, minuto] = horaStr.split(':'); // ["14", "30"]
        // Mês é 0-indexado (mesNum - 1)
        return new Date(parseInt(ano), parseInt(mesNum) - 1, parseInt(dia), parseInt(hora), parseInt(minuto));
    }

    /**
     * Formata o objeto de consulta da API para o HTML da Etapa 1.
     */
    function formatarConsultaParaLista(consulta) {
        const dataObj = parseDataHorario(consulta.horario);
        const horaStr = consulta.horario.split(' ')[1];

        return {
            mes: mesesAbv[dataObj.getMonth()],
            dia: String(dataObj.getDate()).padStart(2, '0'),
            titulo: `Consulta de ${consulta.especialidade || 'Clínica'}`,
            // (A API GET não parece ter status "pendente", então assumimos confirmada)
            statusIcon: "check-circle",
            statusClass: "status-confirmado",
            statusText: `Confirmada - ${horaStr}`,
            // Dados essenciais para o PATCH
            empresa: consulta.Empresa,
            orderId: consulta.OrderId
        };
    }

    /**
     * Cria o HTML de um item de consulta para a Etapa 1.
     */
    function criarItemConsultaHTML(d) {
        return `
            <div class="appointment-item" 
                 data-empresa="${d.empresa}" 
                 data-orderid="${d.orderId}">
                
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
     * Adiciona os listeners aos botões "Reagendar" (deve ser chamada após o GET).
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
                    orderId: selectedItem.dataset.orderid
                };
                
                // UI
                appointmentItems.forEach(item => item.classList.remove('selected'));
                selectedItem.classList.add('selected');
                step2Container.style.display = 'block';
                step2Container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    // Ao clicar em "Cancelar Alteração" na Etapa 2 (Lógica original)
    cancelRescheduleBtn.addEventListener('click', () => {
        step2Container.style.display = 'none';
        consultaParaReagendar = null; // Limpa os dados
        document.querySelectorAll('.appointment-item.selected').forEach(item => item.classList.remove('selected'));
        step1Container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });


    // --- 7. LÓGICA DE SUBMISSÃO (ETAPA 2 - API PATCH) ---

    /**
     * Manipula o clique do botão "Confirmar Reagendamento".
     */
    async function handleConfirmarReagendamento(event) {
        event.preventDefault();
        
        // 1. Validação dos dados da Etapa 1
        if (!consultaParaReagendar) {
            alert("Erro: Nenhum consulta selecionada. Por favor, volte à Etapa 1.");
            return;
        }

        // 2. Validação dos dados da Etapa 2
        const selectedDayEl = document.querySelector('.day.selected');
        const selectedTimeEl = document.querySelector('.time-slot.selected');

        if (!selectedDayEl || !selectedTimeEl) {
            alert("Por favor, selecione uma nova data E um novo horário.");
            return;
        }

        // 3. Formatar o novo horário (dd/mm/yyyy HH:MM)
        const dia = selectedDayEl.dataset.day.padStart(2, '0');
        const mes = (parseInt(selectedDayEl.dataset.month) + 1).toString().padStart(2, '0');
        const ano = selectedDayEl.dataset.year;
        const hora = selectedTimeEl.textContent.trim();
        const newHorarioStr = `${dia}/${mes}/${ano} ${hora}`;

        // 4. Montar o payload para a API PATCH
        const payload = {
            Empresa: consultaParaReagendar.empresa,
            OrderId: consultaParaReagendar.orderId,
            new_horario: newHorarioStr
        };

        console.log("Enviando Reagendamento (PATCH):", payload);

        // 5. Enviar a Requisição PATCH
        confirmButton.textContent = "Reagendando...";
        confirmButton.disabled = true;

        try {
            const response = await fetch(API_URL, { // Usa a mesma API_URL
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Não foi possível reagendar.');
            }
            
            // Sucesso!
            alert("Consulta reagendada com sucesso!");
            window.location.href = "dashboard.html"; // Redireciona para o painel

        } catch (error) {
            console.error('Erro ao reagendar:', error);
            alert(`Erro ao reagendar: ${error.message}`);
        
        } finally {
            confirmButton.textContent = "Confirmar Reagendamento";
            confirmButton.disabled = false;
        }
    }
    
    // Adiciona o listener ao botão de confirmar
    if (confirmButton) {
        confirmButton.addEventListener('click', handleConfirmarReagendamento);
    }


    // --- 8. Lógica do Calendário (Lógica original, sem mudanças) ---
    
    function renderCalendar(year, month) {
        calendarGridEl.innerHTML = '';
        timeSlotHeader.textContent = 'Escolha um horário';
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
            day.addEventListener('click', () => {
                document.querySelectorAll('.day.selected').forEach(d => d.classList.remove('selected'));
                day.classList.add('selected');
                
                const dayNum = day.dataset.day;
                const monthNum = parseInt(day.dataset.month, 10);
                const yearNum = day.dataset.year;
                const dayOfWeek = dayNames[new Date(yearNum, monthNum, dayNum).getDay()];
                
                timeSlotHeader.textContent = `Escolha um horário (${dayOfWeek}, ${dayNum} de ${monthNames[monthNum]})`;
            });
        });
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    function addTimeSlotClickHandlers() {
        const timeSlots = document.querySelectorAll('.time-slot:not(.disabled)');
        timeSlots.forEach(slot => {
            slot.addEventListener('click', () => {
                document.querySelectorAll('.time-slot.selected').forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
            });
        });
    }

    // --- 9. Inicialização ---
    carregarConsultasAgendadas(); // NOVO
    renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    addTimeSlotClickHandlers();

});