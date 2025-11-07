/*
 * dashboard.js
 * Funcionalidade do menu mobile, chat bot, proteção de rota e carregamento de consultas.
 *
 * ATUALIZAÇÃO: Adicionado filtro de data no frontend para garantir
 * que APENAS consultas futuras sejam exibidas no painel.
 * ATUALIZAÇÃO 2: Chatbot agora é um widget flutuante.
 */

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. Script de Proteção de Rota (Guard) ---
    const pacienteCPF = localStorage.getItem('paciente_cpf');

    if (!pacienteCPF) {
        // AJUSTE: Removido 'alert' para um redirecionamento silencioso.
        window.location.href = "register.html";
        return; 
    }
    // --- Fim do Script de Proteção ---


    // --- 2. Personalização do Painel ---
    const pacienteNomeCompleto = localStorage.getItem('paciente_nome'); 
    const welcomeHeader = document.querySelector('.welcome-header h1');

    if (pacienteNomeCompleto && welcomeHeader) {
        const primeiroNome = pacienteNomeCompleto.split(' ')[0]; 
        welcomeHeader.textContent = `Olá, ${primeiroNome} 👋`;
    }
    // --- Fim da Personalização ---


    // --- 3. Controle do Menu Mobile ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // --- 4. Controle do Chat Bot (Widget Flutuante) ---
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
    
    // --- 5. Lógica de Logout ---
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


    // --- 6. Carregamento das Próximas Consultas (MODIFICADO) ---
    
    const appointmentList = document.querySelector('.appointment-list');

    /**
     * Busca e renderiza as próximas consultas do paciente logado.
     */
    async function carregarProximasConsultas() {
        if (!appointmentList) return; // Sai se o elemento não existir

        // Mostra feedback de carregamento
        appointmentList.innerHTML = '<li style="padding: 1rem; color: #718096;">Carregando consultas...</li>';
        
        // 1. URL da API (GET /Consulta?ClienteId=...)
        const url = `https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta?ClienteId=${pacienteCPF}`;

        try {
            // 2. Requisição GET simples
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: Não foi possível buscar os dados.`);
            }
            
            // 3. A resposta (API envia todas as consultas)
            const todasConsultas = await response.json();
            
            // --- INÍCIO DA CORREÇÃO (FILTRO DE DATA) ---
            
            const agora = new Date(); // Pega a data/hora atual

            // 4. Filtra a lista no frontend
            const consultasFuturas = todasConsultas.filter(consulta => {
                // A API retorna "horario" (ex: "10/11/2025 14:30")
                const [dataStr, horaStr] = consulta.horario.split(' '); // ["10/11/2025", "14:30"]
                const [dia, mesNum, ano] = dataStr.split('/');       // ["10", "11", "2025"]
                const [hora, minuto] = horaStr.split(':');           // ["14", "30"]
                
                // Cria a data da consulta (Mês é 0-indexado, por isso mesNum - 1)
                const dataConsulta = new Date(parseInt(ano), parseInt(mesNum) - 1, parseInt(dia), parseInt(hora), parseInt(minuto));
                
                // Retorna true APENAS se a data da consulta for maior (mais nova) que agora
                return dataConsulta > agora;
            });
            // --- FIM DA CORREÇÃO ---

            // Limpa a lista
            appointmentList.innerHTML = ""; 

            // 5. Usa a lista filtrada 'consultasFuturas'
            if (!consultasFuturas || consultasFuturas.length === 0) {
                // Adiciona a mensagem de "nenhuma consulta"
                appointmentList.innerHTML = `
                    <li class="no-appointments">
                        <i data-lucide="calendar-search"></i>
                        <p>Nenhuma consulta futura agendada.</p>
                    </li>`;
            } else {
                // Cria o HTML dinamicamente para cada consulta futura
                consultasFuturas.forEach(consulta => {
                    const dadosFormatados = formatarConsultaDashboard(consulta);
                    const itemHtml = criarItemConsultaHTML(dadosFormatados);
                    appointmentList.innerHTML += itemHtml;
                });
            }
            
            // Ativa os ícones (necessário após adicionar HTML dinâmico)
            lucide.createIcons();

        } catch (error) {
            console.error('Erro ao carregar próximas consultas:', error);
            appointmentList.innerHTML = `<li style="padding: 1rem; color: red;">${error.message}</li>`;
        }
    }

    /**
     * (MODIFICADO) Converte os dados da Lambda /Consulta em um formato para o HTML.
     */
    function formatarConsultaDashboard(consulta) {
        const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
        
        // A Lambda retorna um campo "horario" (ex: "10/11/2025 14:30")
        const [dataStr, horaStr] = consulta.horario.split(' '); // ["10/11/2025", "14:30"]
        const [dia, mesNum, ano] = dataStr.split('/');       // ["10", "11", "2025"]

        let dadosFormatados = {
            mes: meses[parseInt(mesNum, 10) - 1], // Pega o mês (ex: 11 -> 10)
            dia: dia,
            // Usa 'especialidade' pois 'profissional' não existe nesta Lambda
            titulo: `Consulta de ${consulta.especialidade || 'Clínica'}`, 
            classeStatus: "status-confirmado", // Assumindo confirmada
            iconeStatus: "check-circle",
            textoStatus: `Confirmada - ${horaStr}` // Exibe a hora
        };
        
        // (Lógica de 'confirmada' vs 'pendente' omitida,
        // pois a API /Consulta não parece fornecer esse booleano)
        
        return dadosFormatados;
    }

    /**
     * Cria o HTML de um item da lista de consultas.
     * (Esta função não precisou de mudanças)
     */
    function criarItemConsultaHTML(d) {
        return `
            <li class="appointment-item">
                <div class="date-box">
                    <span class="month">${d.mes}</span>
                    <span class="day">${d.dia}</span>
                </div>
                <div class="info">
                    <h5>${d.titulo}</h5>
                    <p class="status ${d.classeStatus}">
                        <i data-lucide="${d.iconeStatus}"></i> ${d.textoStatus}
                    </p>
                </div>
            </li>
        `;
    }

    // --- Ponto de Partida ---
    // Inicia o carregamento das consultas assim que a página abre
    carregarProximasConsultas();

});