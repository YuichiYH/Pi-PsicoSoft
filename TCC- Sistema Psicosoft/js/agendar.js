/*
 * agendar.js
 * Funcionalidades da página de Agendamento, incluindo calendário dinâmico.
 */

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. NOVO: Script de Proteção de Rota (Guard) ---
    const pacienteCPF = localStorage.getItem('paciente_cpf');

    if (!pacienteCPF) {
        // Se não houver CPF salvo, o usuário não está logado.
        alert("Acesso negado. Por favor, faça login para continuar.");
        window.location.href = "register.html";
        return; // Impede que o restante do script seja executado
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
    
    // --- 4. NOVO: Lógica de Logout ---
    const logoutButton = document.querySelector('.btn-logout');

    if (logoutButton) {
        logoutButton.addEventListener('click', function(event) {
            event.preventDefault(); 
            localStorage.removeItem('paciente_nome');
            localStorage.removeItem('paciente_cpf');
            window.location.href = "index.html"; 
        });
    }
    // --- Fim da Lógica de Logout ---

    // --- 5. Lógica do Calendário Dinâmico ---
    const monthYearEl = document.getElementById('month-year');
    const calendarGridEl = document.getElementById('calendar-days-grid');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const timeSlotHeader = document.getElementById('time-slot-header');

    let currentDate = new Date(); // Inicia com a data de hoje

    // Nomes dos meses em português
    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const dayNames = [
        "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"
    ];

    function renderCalendar(year, month) {
        // Limpa o grid e o cabeçalho de horário
        calendarGridEl.innerHTML = '';
        timeSlotHeader.textContent = 'Escolha um horário';

        // Define o texto do mês/ano (ex: "Novembro de 2025")
        monthYearEl.textContent = `${monthNames[month]} de ${year}`;

        const today = new Date();
        
        // Cálculos do calendário
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Dom) - 6 (Sáb)
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // 1. Preenche dias do mês anterior
        for (let i = firstDayOfMonth; i > 0; i--) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('day', 'prev-month');
            dayEl.textContent = daysInPrevMonth - i + 1;
            calendarGridEl.appendChild(dayEl);
        }

        // 2. Preenche dias do mês atual
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('day');
            dayEl.textContent = i;
            dayEl.dataset.day = i; // Guarda o dia para o handler
            dayEl.dataset.month = month;
            dayEl.dataset.year = year;

            // Marca o dia de hoje
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayEl.classList.add('current-day');
            }

            // (Opcional) Desabilita dias passados
            const dayDate = new Date(year, month, i);
            if (dayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
                dayEl.classList.add('disabled');
            }

            calendarGridEl.appendChild(dayEl);
        }

        // 3. Preenche dias do próximo mês
        const totalGridCells = 42; // 6 linhas x 7 colunas
        const renderedCells = firstDayOfMonth + daysInMonth;
        const remainingCells = totalGridCells - renderedCells;

        for (let i = 1; i <= remainingCells; i++) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('day', 'next-month');
            dayEl.textContent = i;
            calendarGridEl.appendChild(dayEl);
        }

        // Adiciona os eventos de clique aos dias recém-criados
        addDayClickHandlers();
    }

    function addDayClickHandlers() {
        const days = document.querySelectorAll('.day:not(.prev-month):not(.next-month):not(.disabled)');
        days.forEach(day => {
            day.addEventListener('click', () => {
                // Remove seleção anterior
                document.querySelectorAll('.day.selected').forEach(d => d.classList.remove('selected'));
                
                // Adiciona seleção nova
                day.classList.add('selected');
                
                // Atualiza o cabeçalho da Etapa 3
                const dayNum = day.dataset.day;
                const monthNum = parseInt(day.dataset.month, 10);
                const yearNum = day.dataset.year;
                const dayOfWeek = dayNames[new Date(yearNum, monthNum, dayNum).getDay()];
                
                timeSlotHeader.textContent = `Escolha um horário (${dayOfWeek}, ${dayNum} de ${monthNames[monthNum]})`;
            });
        });
    }

    // --- 6. Interatividade do Agendamento (Horários) ---

    function addTimeSlotClickHandlers() {
        const timeSlots = document.querySelectorAll('.time-slot:not(.disabled)');
        timeSlots.forEach(slot => {
            slot.addEventListener('click', () => {
                // Remove seleção anterior
                document.querySelectorAll('.time-slot.selected').forEach(s => s.classList.remove('selected'));
                // Adiciona seleção nova
                slot.classList.add('selected');
            });
        });
    }

    // --- 7. Event Listeners dos Botões (Navegação do Calendário) ---

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    // --- Inicialização ---
    renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    addTimeSlotClickHandlers(); // Para os horários estáticos de exemplo

});