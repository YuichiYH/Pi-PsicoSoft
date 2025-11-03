/*
 * reagendar.js
 * Funcionalidades da página de Reagendamento, com fluxo de 2 etapas.
 */

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. Controle do Menu Mobile ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // --- 2. Controle do Chat Bot ---
    const chatButton = document.getElementById('open-chat-bot');
                
    if (chatButton) {
        chatButton.addEventListener('click', function() {
            const chatUrl = 'bot_web.html';
            const windowName = 'PsicosoftChat';
            const windowFeatures = 'width=450,height=700,top=100,left=100,resizable=yes,scrollbars=yes';
            
            window.open(chatUrl, windowName, windowFeatures);
        });
    }
    
    // --- 3. Lógica do Calendário Dinâmico ---
    const monthYearEl = document.getElementById('month-year');
    const calendarGridEl = document.getElementById('calendar-days-grid');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const timeSlotHeader = document.getElementById('time-slot-header');

    let currentDate = new Date(); // Inicia com a data de hoje

    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const dayNames = [
        "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"
    ];

    function renderCalendar(year, month) {
        calendarGridEl.innerHTML = '';
        timeSlotHeader.textContent = 'Escolha um horário';

        monthYearEl.textContent = `${monthNames[month]} de ${year}`;

        const today = new Date();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // 1. Dias do mês anterior
        for (let i = firstDayOfMonth; i > 0; i--) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('day', 'prev-month');
            dayEl.textContent = daysInPrevMonth - i + 1;
            calendarGridEl.appendChild(dayEl);
        }

        // 2. Dias do mês atual
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

        // 3. Dias do próximo mês
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

    // --- 4. Lógica dos Horários ---

    function addTimeSlotClickHandlers() {
        const timeSlots = document.querySelectorAll('.time-slot:not(.disabled)');
        timeSlots.forEach(slot => {
            slot.addEventListener('click', () => {
                document.querySelectorAll('.time-slot.selected').forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
            });
        });
    }

    // --- 5. LÓGICA DAS ETAPAS DE REAGENDAMENTO ---

    const step1Container = document.getElementById('step-1-select');
    const step2Container = document.getElementById('step-2-reschedule');
    const rescheduleButtons = document.querySelectorAll('.btn-reschedule');
    const appointmentItems = document.querySelectorAll('.appointment-item');
    const cancelRescheduleBtn = document.getElementById('cancel-reschedule');

    // Ao clicar em "Reagendar" em um item
    rescheduleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Marca o item como selecionado
            const selectedItem = e.target.closest('.appointment-item');
            appointmentItems.forEach(item => item.classList.remove('selected'));
            selectedItem.classList.add('selected');

            // Mostra a Etapa 2
            step2Container.style.display = 'block';
            
            // Rola suavemente para a Etapa 2
            step2Container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Ao clicar em "Cancelar Alteração" na Etapa 2
    cancelRescheduleBtn.addEventListener('click', () => {
        // Esconde a Etapa 2
        step2Container.style.display = 'none';

        // Remove a seleção do item da Etapa 1
        appointmentItems.forEach(item => item.classList.remove('selected'));
        
        // Rola suavemente de volta para a Etapa 1
        step1Container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });


    // --- Inicialização ---
    renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    addTimeSlotClickHandlers();

});