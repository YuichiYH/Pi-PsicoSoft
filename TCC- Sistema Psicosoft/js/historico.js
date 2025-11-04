/*
 * historico.js
 * Funcionalidades da página de Histórico de Consultas (Integrado com API).
 * Esta versão busca os dados dinamicamente.
 */

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. NOVO: Script de Proteção de Rota (Guard) ---
    const idCliente = localStorage.getItem('paciente_cpf'); // Pega o CPF

    if (!idCliente) {
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

    // --- 5. Carregamento de Dados da API ---
        
    const historyList = document.querySelector('.history-list');

    /**
     * Busca os dados na API e inicia a renderização da lista
     */
    async function carregarHistorico() {
        
        // Passo 1: O ID do cliente (CPF) já foi verificado pela Guarda de Rota
        
        if (!idCliente) {
            // (Esta verificação é redundante por causa da Guarda, mas é uma boa prática)
            historyList.innerHTML = `<p style="padding: 1rem 0; color: red;">Erro: Paciente não identificado. Faça login novamente.</p>`;
            return;
        }

       
        // A URL deve apontar para o recurso que busca consultas por ID de cliente
        const url = `https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/consultas/${idCliente}`;
        

        try {
            // Passo 2: Mostrar feedback de carregamento
            historyList.innerHTML = `<p style="padding: 1rem 0;">Carregando seu histórico...</p>`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: Não foi possível buscar os dados.`);
            }
            
            const consultas = await response.json(); // Espera-se um array [ ... ]
            
            // Passo 3: Limpar o "Carregando..."
            historyList.innerHTML = ""; 

            if (!consultas || consultas.length === 0) {
                historyList.innerHTML = `<p style="padding: 1rem 0;">Nenhuma consulta encontrada no seu histórico.</p>`;
                return;
            }

            // Passo 4: Criar o HTML dinamicamente para cada consulta
            consultas.forEach(consulta => {
                // 'consulta' aqui é o item vindo do DynamoDB/Lambda
                // Ex: { "id_cliente": "123...", "data": "2025-11-10T14:30:00", "profissional": "Dr. André", "status": "proximas" }
                
                const dadosFormatados = formatarConsulta(consulta);
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
     * Converte os dados brutos do DynamoDB/Lambda em um formato fácil para o HTML.
     * @param {object} consulta - O item bruto.
     * @returns {object} - Um objeto pronto para o template.
     */
    function formatarConsulta(consulta) {
        // Assume que 'consulta.data' é um ISOString (ex: "2025-11-10T14:30:00Z")
        const data = new Date(consulta.data); 
        
        // Assume que 'consulta.status' existe (ex: "proximas", "realizadas", "canceladas")
        const status = consulta.status || 'proximas'; 
        
        const diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
        const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
        const mesesCompleto = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

        const dia = String(data.getDate()).padStart(2, '0');
        const mesIdx = data.getMonth();
        const ano = data.getFullYear();
        const diaSemana = diasSemana[data.getDay()];
        const hora = data.toTimeString().substring(0, 5);

        let dadosFormatados = {
            dataStatus: status, // O 'data-status' para o filtro
            mes: meses[mesIdx],
            dia: dia,
            titulo: `Consulta com ${consulta.profissional || 'Profissional'}`,
            descricao: `${diaSemana}, ${dia} de ${mesesCompleto[mesIdx]} de ${ano} - ${hora}`,
            classeStatus: "",
            iconeStatus: "",
            textoStatus: "",
            isCancelada: (status === 'canceladas')
        };
        
        // Define o estilo da tag de status
        switch (status) {
            case 'realizadas':
                dadosFormatados.classeStatus = 'status-realizada';
                dadosFormatados.iconeStatus = 'history';
                dadosFormatados.textoStatus = 'Realizada';
                break;
            case 'canceladas':
                dadosFormatados.classeStatus = 'status-cancelada';
                dadosFormatados.iconeStatus = 'x-circle';
                dadosFormatados.textoStatus = 'Cancelada';
                break;
            case 'proximas':
            default:
                // Assume que seu item 'consulta' tem um campo 'confirmada' (boolean)
                if (consulta.confirmada === false) { 
                    dadosFormatados.classeStatus = 'status-pendente';
                    dadosFormatados.iconeStatus = 'clock';
                    dadosFormatados.textoStatus = 'Pendente';
                } else {
                    dadosFormatados.classeStatus = 'status-confirmada';
                    dadosFormatados.iconeStatus = 'check-circle';
                    dadosFormatados.textoStatus = 'Confirmada';
                }
                dadosFormatados.dataStatus = "proximas"; // Garante que caia na aba "Próximas"
                break;
        }
        
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

    // --- 6. Lógica das Abas de Filtro (MODIFICADA) ---
    // Esta função agora é chamada *depois* que os dados são carregados
    
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
                    if (filter === 'todas') {
                        item.style.display = 'flex'; // Mostra todos
                    } else if (item.dataset.status === filter) {
                        item.style.display = 'flex'; // Mostra o item
                    } else {
                        item.style.display = 'none'; // Esconde o item
                    }
                });
            });
        });

        // Simula um clique na aba "Todas" para definir o estado inicial
        // (Verifica se a aba existe antes de clicar)
        const abaTodas = document.querySelector('.tab-item[data-filter="todas"]');
        if (abaTodas) {
            abaTodas.click();
        }
    }

    // --- Ponto de Partida ---
    // Inicia o carregamento dos dados assim que a página abre
    carregarHistorico();

});