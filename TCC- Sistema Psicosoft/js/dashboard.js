/*
 * dashboard.js
 * Funcionalidade do menu mobile, chat bot, proteção de rota e carregamento de consultas.
 *
 * ATUALIZAÇÃO: Agora usa a API GET /Consulta?ClienteId=...
 * e formata os dados com base nos campos 'horario' e 'especialidade'.
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

    // --- 4. Controle do Chat Bot ---
    const chatButton = document.getElementById('open-chat-bot');
                
    if (chatButton) {
        chatButton.addEventListener('click', function() {
            const chatUrl = 'bot_web.html';
            const windowName = 'PsicosoftChat';
            const windowFeatures = 'width=450,height=700,top=100,left=100,resizable=yes,scrollbars=yes';
            
            window.open(chatUrl, windowName, windowFeatures);
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
        
        // --- INÍCIO DA ATUALIZAÇÃO ---
        // 1. URL atualizada para a nova Lambda, usando 'ClienteId' como query param
        const url = `https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta?ClienteId=${pacienteCPF}`;

        try {
            // 2. Requisição GET simples (como a Lambda espera)
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: Não foi possível buscar os dados.`);
            }
            
            // 3. A resposta já é a lista de consultas futuras
            const proximasConsultas = await response.json();
            
            // 4. REMOVIDO: a linha .filter(consulta => consulta.status === 'proximas')
            // pois a própria Lambda já faz esse filtro de tempo.
            
            // --- FIM DA ATUALIZAÇÃO ---

            // Limpa a lista antes de adicionar os itens
            appointmentList.innerHTML = ""; 

            if (!proximasConsultas || proximasConsultas.length === 0) {
                // Adiciona a mensagem de "nenhuma consulta"
                appointmentList.innerHTML = `
                    <li class="no-appointments">
                        <i data-lucide="calendar-search"></i>
                        <p>Nenhuma consulta futura agendada.</p>
                    </li>`;
            } else {
                // Cria o HTML dinamicamente para cada consulta futura
                proximasConsultas.forEach(consulta => {
                    // Usa a nova função de formatação adaptada
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
        
        // Esta Lambda não parece ter o status "confirmada" (boolean).
        // Se houver um campo (ex: consulta.confirmada), podemos re-adicionar a lógica:
        /*
        if (consulta.confirmada === false) { 
            dadosFormatados.classeStatus = 'status-pendente';
            dadosFormatados.iconeStatus = 'clock';
            dadosFormatados.textoStatus = `Aguardando Confirmação`;
        } else {
            dadosFormatados.classeStatus = 'status-confirmado';
            dadosFormatados.iconeStatus = 'check-circle';
            dadosFormatados.textoStatus = `Confirmada - ${horaStr}`;
        }
        */
        
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