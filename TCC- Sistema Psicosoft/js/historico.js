/*
 * historico.js
 * Funcionalidades da página de Histórico de Consultas (Integrado com API).
 *
 * ATUALIZAÇÃO: Este script foi modificado para usar a API GET /Consulta?ClienteId=...
 * que retorna apenas consultas futuras. As funções de formatação
 * foram adaptadas, mas as abas "Realizadas" e "Canceladas" não
 * exibirão dados, pois essa API não os fornece.
 */

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. Script de Proteção de Rota (Guard) ---
    const idCliente = localStorage.getItem('paciente_cpf'); // Pega o CPF

    if (!idCliente) {
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
            window.location.href = "index.html"; 
        });
    }
    // --- Fim da Lógica de Logout ---

    // --- 5. Carregamento de Dados da API ---
        
    const historyList = document.querySelector('.history-list');

    /**
     * Busca os dados na API e inicia a renderização da lista
     */
    async function carregarHistorico() {
        
        if (!idCliente) {
            historyList.innerHTML = `<p style="padding: 1rem 0; color: red;">Erro: Paciente não identificado. Faça login novamente.</p>`;
            return;
        }

       
        // --- INÍCIO DA ATUALIZAÇÃO ---
        // 1. Usando a API que você especificou (GET /Consulta?ClienteId=...)
        const url = `https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta?ClienteId=${idCliente}`;
        // --- FIM DA ATUALIZAÇÃO ---
        

        try {
            // Passo 2: Mostrar feedback de carregamento
            historyList.innerHTML = `<p style="padding: 1rem 0;">Carregando seu histórico...</p>`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: Não foi possível buscar os dados.`);
            }
            
            // 3. A API retorna a lista de consultas futuras
            const consultas = await response.json(); 
            
            // Passo 3: Limpar o "Carregando..."
            historyList.innerHTML = ""; 

            if (!consultas || consultas.length === 0) {
                historyList.innerHTML = `<p style="padding: 1rem 0;">Nenhuma consulta encontrada no seu histórico.</p>`;
                return;
            }

            // Passo 4: Criar o HTML dinamicamente para cada consulta
            consultas.forEach(consulta => {
                // 4. Usando a nova função 'formatarConsultaDaAPI'
                const dadosFormatados = formatarConsultaDaAPI(consulta);
                const itemHtml = criarItemHistoricoHTML(dadosFormatados);
                historyList.innerHTML += itemHtml;
            });

            // Passo 5: Ativar os filtros (abas) agora que os itens existem
            setupFiltros();
            
            // Passo 6: Ativa os ícones (necessário após adicionar HTML dinâmico)
            lucide.createIcons();

        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            historyList.innerHTML = `<p style="padding: 1rem 0; color: red;">${error.message}</p>`;
        }
    }
    
    /**
     * (MODIFICADO) Converte os dados da API (GET /Consulta)
     * para o formato que o HTML da página de histórico espera.
     */
    function formatarConsultaDaAPI(consulta) {
        
        const diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
        const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
        const mesesCompleto = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

        // A Lambda retorna um campo "horario" (ex: "05/11/2025 11:00")
        const [dataStr, horaStr] = consulta.horario.split(' '); // ["05/11/2025", "11:00"]
        const [dia, mesNum, ano] = dataStr.split('/');       // ["05", "11", "2025"]
        
        // Criamos um objeto Date para descobrir o dia da semana
        const dataObj = new Date(parseInt(ano), parseInt(mesNum) - 1, parseInt(dia));
        const diaSemana = diasSemana[dataObj.getDay()];
        const mesIdx = dataObj.getMonth();

        // Como esta API SÓ retorna consultas futuras,
        // o status será sempre "proximas"
        const status = "proximas";

        let dadosFormatados = {
            dataStatus: status, // Para o filtro da aba
            mes: meses[mesIdx],
            dia: dia,
            titulo: `Consulta de ${consulta.especialidade || 'Clínica'}`, // API retorna 'especialidade'
            descricao: `${diaSemana}, ${dia} de ${mesesCompleto[mesIdx]} de ${ano} - ${horaStr}`,
            classeStatus: "status-confirmada", // Assumindo confirmada
            iconeStatus: "check-circle",
            textoStatus: "Confirmada",
            isCancelada: false
        };
        
        // Esta API não informa se está 'pendente' vs 'confirmada',
        // então tratamos todas como confirmadas.
        
        return dadosFormatados;
    }

    /**
     * Cria o HTML de um item do histórico
     * @param {object} d - Dados formatados da função formatarConsulta
     */
    function criarItemHistoricoHTML(d) {
        const disabledClass = d.isCancelada ? 'text-disabled' : '';
        const dateBoxClass = d.isCancelada ? 'date-box-disabled' : '';

        // Este HTML é baseado no seu 'historico.html'
        return `
            <div class="history-item" data-status="${d.dataStatus}" style="display: flex;">
                <div class="date-box ${dateBoxClass}">
                    <span class="month">${d.mes}</span>
                    <span class="day">${d.dia}</span>
                </div>
                <div class="appointment-details">
                    <h5 class="${disabledClass}">${d.titulo}</h5>
                    <p class="${disabledClass}">${d.descricao}</p>
                </div>
                <div class="status-tag ${d.classeStatus}">
                    <i data-lucide="${d.iconeStatus}"></i> ${d.textoStatus}
                </div>
            </div>
        `;
    }

    // --- 6. Lógica das Abas de Filtro ---
    // (Esta função está correta, ela vai funcionar)
    function setupFiltros() {
        const tabs = document.querySelectorAll('.tab-item');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 1. Remove 'active' de todas as abas
                tabs.forEach(t => t.classList.remove('active'));
                
                // 2. Adiciona 'active' à aba clicada
                tab.classList.add('active');
                
                // 3. Filtra a lista
                const filter = tab.dataset.filter; // Ex: "todas", "proximas", etc.
                
                // Seleciona os itens *APÓS* terem sido renderizados
                const historyItems = document.querySelectorAll('.history-item'); 
                
                historyItems.forEach(item => {
                    // O dataStatus de todos os itens será "proximas"
                    if (filter === 'todas') {
                        item.style.display = 'flex'; // Mostra (só as próximas)
                    } else if (item.dataset.status === filter) {
                        item.style.display = 'flex'; // Mostra (só as próximas)
                    } else {
                        item.style.display = 'none'; // Esconde
                    }
                });
            });
        });

        // Simula um clique na aba "Todas" para definir o estado inicial
        const abaTodas = document.querySelector('.tab-item[data-filter="todas"]');
        if (abaTodas) {
            abaTodas.click();
        }
    }

    // --- Ponto de Partida ---
    // Inicia o carregamento dos dados assim que a página abre
    carregarHistorico();

});