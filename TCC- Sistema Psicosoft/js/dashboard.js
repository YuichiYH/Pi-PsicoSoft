/*
 * dashboard.js
 * Funcionalidade do menu mobile, chat bot, proteção de rota e carregamento de consultas.
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


    // --- 6. NOVO: Carregamento das Próximas Consultas ---
    
    const appointmentList = document.querySelector('.appointment-list');

    /**
     * Busca e renderiza as próximas consultas do paciente logado.
     */
    async function carregarProximasConsultas() {
        if (!appointmentList) return; // Sai se o elemento não existir

        // Mostra feedback de carregamento
        appointmentList.innerHTML = '<li style="padding: 1rem; color: #718096;">Carregando consultas...</li>';
        
        // --- INÍCIO DA CORREÇÃO ---
        
        // 1. URL corrigida para o endpoint POST, conforme sua instrução
        const url = `https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta/HistoricoChat`;

        // 2. Opções da requisição POST, enviando o CPF no corpo
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cpf: pacienteCPF }) // Assumindo que a API espera um JSON com a chave "cpf"
        };

        try {
            // 3. Requisição atualizada para usar POST e as 'options'
            const response = await fetch(url, options);
            
            // --- FIM DA CORREÇÃO ---
  
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: Não foi possível buscar os dados.`);
            }
            
            const todasConsultas = await response.json();
            
            // Filtra para pegar APENAS as consultas com status "proximas"
            const consultasProximas = todasConsultas.filter(consulta => consulta.status === 'proximas');

            // Limpa a lista antes de adicionar os itens
            appointmentList.innerHTML = ""; 

            if (!consultasProximas || consultasProximas.length === 0) {
                // Adiciona a mensagem de "nenhuma consulta"
                appointmentList.innerHTML = `
                    <li class="no-appointments">
                        <i data-lucide="calendar-search"></i>
                        <p>Nenhuma consulta futura agendada.</p>
                    </li>`;
            } else {
                // Cria o HTML dinamicamente para cada consulta futura
                consultasProximas.forEach(consulta => {
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
     * Converte os dados brutos da consulta em um formato para o HTML.
     */
    function formatarConsultaDashboard(consulta) {
        const data = new Date(consulta.data);
        const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
        
        const dia = String(data.getDate()).padStart(2, '0');
        const mesIdx = data.getMonth();
        const hora = data.toTimeString().substring(0, 5);

        let dadosFormatados = {
            mes: meses[mesIdx],
            dia: dia,
            titulo: `Consulta com ${consulta.profissional || 'Profissional'}`,
            classeStatus: "",
            iconeStatus: "",
            textoStatus: ""
        };
        
        // Define o estilo do status (Confirmada ou Pendente)
        if (consulta.confirmada === false) { 
            dadosFormatados.classeStatus = 'status-pendente';
            dadosFormatados.iconeStatus = 'clock';
            dadosFormatados.textoStatus = `Aguardando Confirmação`;
        } else {
            dadosFormatados.classeStatus = 'status-confirmado';
            dadosFormatados.iconeStatus = 'check-circle';
            dadosFormatados.textoStatus = `Confirmada - ${hora}`;
        }
        
        return dadosFormatados;
    }

    /**
     * Cria o HTML de um item da lista de consultas.
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