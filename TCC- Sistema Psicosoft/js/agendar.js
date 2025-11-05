/*
 * agendar.js
 * Funcionalidades da página de Agendamento, incluindo calendário dinâmico.
 * * ATUALIZAÇÃO:
 * - Adicionada lógica de SUBMISSÃO DE AGENDAMENTO (POST) para a API.
 * - Adicionada validação de horários (GET) para carregar horários reais.
 * - Adicionados novos campos (idade, motivo, forma) ao payload.
 * - CORREÇÃO: Enviando 'cpf' e 'FuncionarioId'.
 * - CORREÇÃO 2: Campo 'email' REMOVIDO do payload a pedido.
 */

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. Script de Proteção de Rota (Guard) ---
    // (pacienteCPF é o CPF do paciente, salvo no login)
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
    // --- Fim da Lógica de Logout ---

    // --- 5. Seletores do Formulário de Agendamento ---
    const monthYearEl = document.getElementById('month-year');
    const calendarGridEl = document.getElementById('calendar-days-grid');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const timeSlotHeader = document.getElementById('time-slot-header');
    const timeSlotsGrid = document.getElementById('time-slots-grid');
    const profissionalSelect = document.getElementById('profissional');

    let currentDate = new Date(); 

    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const dayNames = [
        "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"
    ];

    // --- 6. Lógica do Calendário (Renderização) ---
    function renderCalendar(year, month) {
        calendarGridEl.innerHTML = '';
        timeSlotHeader.textContent = 'Escolha um horário';
        timeSlotsGrid.innerHTML = '<p style="color: var(--text-light); grid-column: 1 / -1;">Por favor, selecione um profissional e uma data para ver os horários disponíveis.</p>';

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
        
        // Adiciona os eventos de clique (agora com validação)
        addDayClickHandlers();
    }

    /**
     * Adiciona clique aos dias, que AGORA disparam a busca de horários.
     */
    function addDayClickHandlers() {
        const days = document.querySelectorAll('.day:not(.prev-month):not(.next-month):not(.disabled)');
        days.forEach(day => {
            day.addEventListener('click', async () => {
                
                // Validação: Exige seleção de profissional
                const funcionarioId = profissionalSelect.value;
                if (!funcionarioId) {
                    alert("Por favor, selecione um profissional primeiro (Etapa 1).");
                    return;
                }

                document.querySelectorAll('.day.selected').forEach(d => d.classList.remove('selected'));
                day.classList.add('selected');
                
                const dayNum = day.dataset.day;
                const monthNum = parseInt(day.dataset.month, 10);
                const yearNum = day.dataset.year;
                const dayOfWeek = dayNames[new Date(yearNum, monthNum, dayNum).getDay()];
                
                timeSlotHeader.textContent = `Escolha um horário (${dayOfWeek}, ${dayNum} de ${monthNames[monthNum]})`;

                // Chama a nova função de busca de horários
                const dataSelecionada = new Date(yearNum, monthNum, dayNum);
                await carregarHorariosDisponiveis(funcionarioId, dataSelecionada);
            });
        });
    }

    // --- 7. LÓGICA DE VALIDAÇÃO DE HORÁRIOS (API GET) ---

    async function carregarHorariosDisponiveis(funcionarioId, dataSelecionada) {
        timeSlotsGrid.innerHTML = '<p style="color: var(--text-light); grid-column: 1 / -1;">Carregando horários disponíveis...</p>';
        
        const url = `https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta?FuncionarioId=${encodeURIComponent(funcionarioId)}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Não foi possível buscar os horários.');
            }
            
            const todasConsultas = await response.json();
            
            const dataSelecionadaStr = dataSelecionada.toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });

            // 1. Cria um Set (lista) de horários JÁ OCUPADOS para este dia
            const horariosOcupados = new Set();
            todasConsultas.forEach(consulta => {
                const [dataStr, horaStr] = consulta.horario.split(' ');
                if (dataStr === dataSelecionadaStr) {
                    horariosOcupados.add(horaStr); 
                }
            });

            // 2. Gera os horários do dia (07:00 às 18:00)
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
                    
                    if (horariosOcupados.has(slotTimeStr)) {
                        isDisabled = true;
                    }
                    
                    if (slotDateTime < agora) {
                        isDisabled = true;
                    }
                    
                    horariosHTML.push(
                        `<button class="time-slot ${isDisabled ? 'disabled' : ''}" ${isDisabled ? 'disabled' : ''}>
                            ${slotTimeStr}
                        </button>`
                    );
                }
            }
            
            // 3. Renderiza os horários
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
     * Adiciona clique aos botões de horário (que agora são dinâmicos)
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

    // --- 8. Navegação do Calendário ---
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


    // =======================================================================
    // --- 9. ATUALIZADO: LÓGICA DE SUBMISSÃO DE AGENDAMENTO (API POST) ---
    // =======================================================================

    const confirmButton = document.querySelector('.btn-confirm');
    
    if (confirmButton) {
        confirmButton.addEventListener('click', async (event) => {
            event.preventDefault(); 

            // 1. Coletar Dados (Etapa 1)
            const especialidadeSelect = document.getElementById('especialidade');
            const profissionalSelect = document.getElementById('profissional');
            const formaSelect = document.getElementById('forma');
            const idadeInput = document.getElementById('idade');
            const motivoInput = document.getElementById('motivo');

            // 1. Coletar Dados (Etapa 2 e 3)
            const selectedDayEl = document.querySelector('.day.selected');
            const selectedTimeEl = document.querySelector('.time-slot.selected');

            // 2. Coletar Dados do Paciente (localStorage)
            const clienteId = pacienteCPF; // 'paciente_cpf' (CPF) é o ClienteId
            const nomePaciente = localStorage.getItem('paciente_nome');
            // const emailPaciente = localStorage.getItem('paciente_email'); // NÃO SERÁ ENVIADO

            // 3. Validação
            if (especialidadeSelect.value === "" || profissionalSelect.value === "" || formaSelect.value === "" || idadeInput.value === "" || motivoInput.value === "") {
                alert("Por favor, preencha todos os campos da Etapa 1.");
                return;
            }
            if (!selectedDayEl) {
                alert("Por favor, selecione uma data no calendário (Etapa 2).");
                return;
            }
            if (!selectedTimeEl) {
                alert("Por favor, selecione um horário (Etapa 3).");
                return;
            }
            if (!clienteId || !nomePaciente) { // Validação de email removida
                alert("Erro: Informações do paciente não encontradas. Por favor, faça login novamente.");
                return;
            }

            // 4. Formatar os Dados para a API
            const dia = selectedDayEl.dataset.day.padStart(2, '0');
            const mes = (parseInt(selectedDayEl.dataset.month) + 1).toString().padStart(2, '0');
            const ano = selectedDayEl.dataset.year;
            const hora = selectedTimeEl.textContent.trim();
            const horarioFormatado = `${dia}/${mes}/${ano} ${hora}`;

            const especialidadeTexto = especialidadeSelect.options[especialidadeSelect.selectedIndex].text;

            // 5. Montar o Payload (Corpo da Requisição) - CAMPO 'email' REMOVIDO
            const payload = {
                ClienteId: clienteId,
                cpf: clienteId, // CPF preenchido automaticamente
                nome: nomePaciente,
                // email: emailPaciente, // <-- CAMPO REMOVIDO
                especialidade: especialidadeTexto,
                FuncionarioId: profissionalSelect.value, // Email do médico
                horario: horarioFormatado,
                idade: idadeInput.value,
                motivo: motivoInput.value,
                forma: formaSelect.value
            };

            console.log("Enviando agendamento (SEM EMAIL):", payload);

            // 6. Enviar a Requisição POST
            const apiUrl = 'https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta';
            
            confirmButton.textContent = "Agendando...";
            confirmButton.disabled = true;

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const responseData = await response.json();

                if (!response.ok) {
                    throw new Error(responseData.message || 'Não foi possível completar o agendamento.');
                }

                // 7. Sucesso!
                alert('Consulta agendada com sucesso!');
                window.location.href = 'dashboard.html'; // Redireciona para o painel

            } catch (error) {
                // 8. Falha
                console.error('Erro ao agendar consulta:', error);
                alert(`Erro ao agendar: ${error.message}`);
            
            } finally {
                // Restaura o botão
                confirmButton.textContent = "Confirmar Agendamento";
                confirmButton.disabled = false;
            }
        });
    }
});