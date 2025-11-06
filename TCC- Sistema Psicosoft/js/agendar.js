/*
 * agendar.js
 * Funcionalidades da página de Agendamento, incluindo calendário dinâmico
 * e MODAL DE NOTIFICAÇÃO customizado.
 * ATUALIZAÇÃO 2: Chatbot agora é um widget flutuante.
 */

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. Script de Proteção de Rota (Guard) ---
    const pacienteCPF = localStorage.getItem('paciente_cpf');

    if (!pacienteCPF) {
        // (Usaremos o modal de erro para esta falha também)
        console.warn("Acesso negado. CPF não encontrado no localStorage.");
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

    function addDayClickHandlers() {
        const days = document.querySelectorAll('.day:not(.prev-month):not(.next-month):not(.disabled)');
        days.forEach(day => {
            day.addEventListener('click', async () => {
                
                const funcionarioId = profissionalSelect.value;
                if (!funcionarioId) {
                    // USA O NOVO MODAL PARA AVISO
                    showNotification(false, 'Ação Necessária', 'Por favor, selecione um profissional primeiro (Etapa 1).');
                    return;
                }

                document.querySelectorAll('.day.selected').forEach(d => d.classList.remove('selected'));
                day.classList.add('selected');
                
                const dayNum = day.dataset.day;
                const monthNum = parseInt(day.dataset.month, 10);
                const yearNum = day.dataset.year;
                const dayOfWeek = dayNames[new Date(yearNum, monthNum, dayNum).getDay()];
                
                timeSlotHeader.textContent = `Escolha um horário (${dayOfWeek}, ${dayNum} de ${monthNames[monthNum]})`;

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

    // =======================================================================
    // --- 9. NOVO: LÓGICA DO MODAL DE NOTIFICAÇÃO ---
    // =======================================================================

    const modal = document.getElementById('notification-modal');
    const modalIconWrapper = modal.querySelector('.modal-icon-wrapper');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalOkButton = document.getElementById('modal-btn-ok');

    let isSuccessRedirect = false; // Controla se o 'OK' deve redirecionar

    /**
     * Exibe o modal de notificação
     * @param {boolean} isSuccess - Define o estilo (sucesso ou erro)
     * @param {string} title - O título (ex: "Sucesso!")
     * @param {string} message - A mensagem de detalhe
     */
    function showNotification(isSuccess, title, message) {
        // Limpa classes antigas
        modal.classList.remove('modal--success', 'modal--error');

        if (isSuccess) {
            modal.classList.add('modal--success');
            // Ícone de Sucesso (Lucide Check)
            modalIconWrapper.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            isSuccessRedirect = true; // Prepara para redirecionar ao fechar
        } else {
            modal.classList.add('modal--error');
            // Ícone de Erro (Lucide Alert Triangle)
            modalIconWrapper.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>';
            isSuccessRedirect = false;
        }

        // Atualiza o texto
        modalTitle.textContent = title;
        modalMessage.textContent = message;

        // Ativa o modal
        modal.classList.add('active');
        
        // (Lucide.createIcons() não é necessário aqui, pois estamos usando o innerHTML do SVG puro)
    }

    // Evento para fechar o modal
    modalOkButton.addEventListener('click', () => {
        modal.classList.remove('active');
        if (isSuccessRedirect) {
            // Se foi sucesso, redireciona para o dashboard
            window.location.href = 'dashboard.html';
        }
    });

    // --- 10. Checagem de Proteção de Rota (AGORA USA O MODAL) ---
    if (!pacienteCPF) {
        showNotification(false, 'Acesso Negado', 'Você precisa fazer login para agendar uma consulta.');
        // Desabilita o botão de confirmar se o usuário não estiver logado
        const confirmButton = document.querySelector('.btn-confirm');
        if (confirmButton) {
            confirmButton.disabled = true;
            confirmButton.textContent = "Faça login para agendar";
        }
    }


    // =======================================================================
    // --- 11. ATUALIZADO: LÓGICA DE SUBMISSÃO (c/ Modal) ---
    // =======================================================================

    const confirmButton = document.querySelector('.btn-confirm');
    
    if (confirmButton && pacienteCPF) { // Só adiciona o listener se o usuário estiver logado
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
            const clienteId = pacienteCPF; 
            const nomePaciente = localStorage.getItem('paciente_nome');
            
            // 3. Validação (Substitui os 'alert' por 'showNotification')
            if (especialidadeSelect.value === "" || profissionalSelect.value === "" || formaSelect.value === "" || idadeInput.value === "" || motivoInput.value === "") {
                showNotification(false, 'Campos Incompletos', 'Por favor, preencha todos os campos da Etapa 1.');
                return;
            }
            if (!selectedDayEl) {
                showNotification(false, 'Data não selecionada', 'Por favor, selecione uma data no calendário (Etapa 2).');
                return;
            }
            if (!selectedTimeEl) {
                showNotification(false, 'Horário não selecionado', 'Por favor, selecione um horário (Etapa 3).');
                return;
            }
            if (!clienteId || !nomePaciente) {
                showNotification(false, 'Erro de Autenticação', 'Informações do paciente não encontradas. Por favor, faça login novamente.');
                return;
            }

            // 4. Formatar os Dados para a API
            const dia = selectedDayEl.dataset.day.padStart(2, '0');
            const mes = (parseInt(selectedDayEl.dataset.month) + 1).toString().padStart(2, '0');
            const ano = selectedDayEl.dataset.year;
            const hora = selectedTimeEl.textContent.trim();
            const horarioFormatado = `${dia}/${mes}/${ano} ${hora}`;
            const especialidadeTexto = especialidadeSelect.options[especialidadeSelect.selectedIndex].text;

            // 5. Montar o Payload (Corpo da Requisição)
            const payload = {
                ClienteId: clienteId,
                cpf: clienteId, 
                nome: nomePaciente,
                especialidade: especialidadeTexto,
                FuncionarioId: profissionalSelect.value, 
                horario: horarioFormatado,
                idade: idadeInput.value,
                motivo: motivoInput.value,
                forma: formaSelect.value
            };

            console.log("Enviando agendamento (c/ Modal):", payload);

            // 6. Enviar a Requisição POST
            const apiUrl = 'https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta';
            
            confirmButton.textContent = "Agendando...";
            confirmButton.disabled = true;

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const responseData = await response.json();

                if (!response.ok) {
                    throw new Error(responseData.message || 'Não foi possível completar o agendamento.');
                }

                // 7. Sucesso! (Usa o novo modal)
                showNotification(true, 'Consulta Agendada!', 'Seu agendamento foi confirmado com sucesso. Você será redirecionado para o painel.');
                // O redirecionamento acontece ao clicar "OK"

            } catch (error) {
                // 8. Falha! (Usa o novo modal)
                console.error('Erro ao agendar consulta:', error);
                // Exibe uma mensagem de erro mais amigável se for um conflito de horário
                const errorMsg = error.message.includes('Horário indisponível')
                    ? 'O horário selecionado não está mais disponível. Por favor, atualize a página e tente outro.'
                    : `Não foi possível agendar: ${error.message}`;
                
                showNotification(false, 'Erro no Agendamento', errorMsg);
            
            } finally {
                // Restaura o botão
                confirmButton.textContent = "Confirmar Agendamento";
                confirmButton.disabled = false;
            }
        });
    }

    // --- Inicialização ---
    renderCalendar(currentDate.getFullYear(), currentDate.getMonth());

});