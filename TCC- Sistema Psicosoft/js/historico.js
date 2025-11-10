/*
 * historico.js
 * Funcionalidades da página de Histórico de Consultas (Integrado com API).
 *
 * ATUALIZAÇÃO: Agora usa 'paciente_email' (salvo no login) como
 * ClienteId para a API, conforme a estrutura da tabela.
 * ATUALIZAÇÃO 2: Chatbot agora é um widget flutuante.
 * ATUALIZAÇÃO 3 (CORREÇÃO): Corrigido erro de digitação (dataDtr) em parseDataHorario.
 */

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. Script de Proteção de Rota (Guard) ---
    // ATUALIZADO: Verificamos o 'paciente_cpf', que é o 'ClienteId'
    const idCliente = localStorage.getItem('paciente_cpf'); // Pega o cpf

    if (!idCliente) {
        // AJUSTE: Removido 'alert' para um redirecionamento silencioso.
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
            // ATUALIZADO: Limpa também o email
            localStorage.removeItem('paciente_email');
            window.location.href = "index.html"; 
        });
    }
    // --- Fim da Lógica de Logout ---

    // --- INÍCIO DA CORREÇÃO: Função Auxiliar de Data ---
    /**
     * Converte "dd/mm/aaaa HH:MM" para um objeto Date.
     * Retorna null se o formato for inválido.
     */
    function parseDataHorario(horarioStr) {
        try {
            if (!horarioStr || typeof horarioStr !== 'string' || !horarioStr.includes(' ')) {
                return null;
            }
            const [dataStr, horaStr] = horarioStr.split(' ');
            
            // ==================================================
            // --- CORREÇÃO DO ERRO DE DIGITAÇÃO ESTAVA AQUI ---
            if (!dataStr || !horaStr || !dataStr.includes('/') || !horaStr.includes(':')) {
            // --- (Estava dataDtr.includes) ---
            // ==================================================
                return null;
            }
            const [dia, mesNum, ano] = dataStr.split('/');
            const [hora, minuto] = horaStr.split(':');
            if (!dia || !mesNum || !ano || !hora || !minuto) {
                return null;
            }
             // new Date(ano, mes_zero_index, dia, hora, min)
            const dataObj = new Date(parseInt(ano), parseInt(mesNum) - 1, parseInt(dia), parseInt(hora), parseInt(minuto));
            if (isNaN(dataObj.getTime())) return null;
            return dataObj;
        } catch (e) {
            console.warn("Erro ao parsear data no historico:", horarioStr, e);
            return null;
        }
    }
    // --- FIM DA CORREÇÃO ---

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

       
        // 1. URL atualizada para usar o 'idCliente' (que é o cpf)
        const url = `https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta?ClienteId=${pacienteCPF}`;
        

        try {
            historyList.innerHTML = `<p style="padding: 1rem 0;">Carregando seu histórico...</p>`;
            
            // --- CORREÇÃO DE CACHE ADICIONADA AQUI ---
            const response = await fetch(url, { cache: 'no-store' });
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: Não foi possível buscar os dados.`);
            }
            
            let consultas = await response.json(); // Mude de const para let
            
            historyList.innerHTML = ""; 

            if (!consultas || !Array.isArray(consultas) || consultas.length === 0) {
                historyList.innerHTML = `<p style="padding: 1rem 0;">Nenhuma consulta encontrada no seu histórico.</p>`;
                return;
            }

            // --- INÍCIO DA CORREÇÃO (ORDENAÇÃO DECRESCENTE) ---
            consultas.sort((a, b) => {
                const dataA = parseDataHorario(a.horario);
                const dataB = parseDataHorario(b.horario);
                // Coloca datas inválidas no final
                if (!dataA) return 1;
                if (!dataB) return -1;
                return dataB - dataA; // Ordena do mais recente (maior data) para o mais antigo (menor data)
            });
            // --- FIM DA CORREÇÃO ---

            consultas.forEach(consulta => {
                // 4. Usando a nova função 'formatarConsultaDaAPI'
                const dadosFormatados = formatarConsultaDaAPI(consulta);
                const itemHtml = criarItemHistoricoHTML(dadosFormatados);
                historyList.innerHTML += itemHtml;
            });

            setupFiltros();
            lucide.createIcons();

        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            historyList.innerHTML = `<p style="padding: 1rem 0; color: red;">${error.message}</p>`;
        }
    }
    
    /**
     * (MODIFICADO E CORRIGIDO) Converte os dados da API (GET /Consulta)
     * para o formato que o HTML da página de histórico espera.
     */
    function formatarConsultaDaAPI(consulta) {
        
        const diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
        const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
        const mesesCompleto = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

        // --- INÍCIO DA CORREÇÃO DE ROBUSTEZ E LÓGICA ---

        // 1. (ROBUSTEZ) Função de helper para retornar um objeto de erro visível
        function retornarErro(motivo) {
            console.warn(`Historico: ${motivo}`, consulta);
            return {
                dataStatus: "canceladas", // Coloca na aba "canceladas"
                mes: "ERR", dia: "!",
                titulo: `Consulta Inválida (ID: ${consulta.OrderId || 'N/A'})`,
                descricao: "O formato da data desta consulta está incorreto.",
                classeStatus: "status-cancelada", 
                iconeStatus: "alert-triangle",
                textoStatus: "Inválida", 
                isCancelada: true
            };
        }

        // 2. (ROBUSTEZ) Tenta parsear a data primeiro
        const dataObj = parseDataHorario(consulta.horario);
        
        // Se a data for inválida, retorna o bloco de erro
        if (!dataObj) {
            return retornarErro("Não foi possível parsear o 'horario'.");
        }
        
        const agora = new Date();
        let status = "proximas"; 
        let classeStatus = "status-confirmada";
        let iconeStatus = "check-circle";
        let textoStatus = "Agendada";
        let isCancelada = false;

        // Verifica status da API primeiro
        if ((consulta.status || '').toLowerCase() === "cancelada") {
            status = "canceladas";
            classeStatus = "status-cancelada";
            iconeStatus = "x-circle";
            textoStatus = "Cancelada";
            isCancelada = true;
        } else {
            // Consulta passada
            if (dataObj < agora) {
                status = "realizadas";
                classeStatus = "status-realizada";
                iconeStatus = "history";
                textoStatus = "Realizada";
            } else {
                // Consulta de hoje ou futura
                status = "proximas";
                classeStatus = "status-confirmada";
                iconeStatus = "check-circle";
                textoStatus = "Agendada";
            }
        }

        
        // Extrai os dados do objeto dataObj (que é válido)
        const diaSemana = diasSemana[dataObj.getDay()];
        const mesIdx = dataObj.getMonth();
        const dia = String(dataObj.getDate()).padStart(2, '0');
        const horaStr = String(dataObj.getHours()).padStart(2, '0') + ":" + String(dataObj.getMinutes()).padStart(2, '0');
        const ano = dataObj.getFullYear();


        let dadosFormatados = {
            dataStatus: status, // Para o filtro da aba
            mes: meses[mesIdx],
            dia: dia,
            titulo: `Consulta de ${consulta.especialidade || 'Clínica'}`, 
            descricao: `${diaSemana}, ${dia} de ${mesesCompleto[mesIdx]} de ${ano} - ${horaStr}`,
            classeStatus: classeStatus,
            iconeStatus: iconeStatus,
            textoStatus: textoStatus,
            isCancelada: isCancelada
        };
        
        return dadosFormatados;
    }

    /**
     * Cria o HTML de um item do histórico
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
    function setupFiltros() {
        const tabs = document.querySelectorAll('.tab-item');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const filter = tab.dataset.filter; // Ex: "todas", "proximas", "realizadas"
                const historyItems = document.querySelectorAll('.history-item'); 
                
                historyItems.forEach(item => {
                    if (filter === 'todas') {
                        item.style.display = 'flex';
                    } else if (item.dataset.status === filter) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });


        // (MODIFICADO) Clica na aba "Todas" por padrão ao carregar
        const abaTodas = document.querySelector('.tab-item[data-filter="todas"]');
        if (abaTodas) {
            abaTodas.click();
        } else {
            // Fallback se não encontrar (clica na primeira aba que achar)
            const primeiraAba = document.querySelector('.tab-item');
            if (primeiraAba) {
                primeiraAba.click();
            }
        }
    }

    // --- Ponto de Partida ---
    carregarHistorico();

});