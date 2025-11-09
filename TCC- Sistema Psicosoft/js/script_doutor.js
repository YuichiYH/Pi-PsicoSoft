/*
 * script_doutor.js
 * Lógica da nova "Central de Atendimento"
 * - ATUALIZADO: funcionarioId = psicosoft_dr@gmail.com
 * - ATUALIZADO: Lógica para mostrar/esconder card de Meet vs. Presencial
 * - Busca dados da API
 * - Habilita filtro de busca e data
 *
 * REVISÃO:
 * - Adicionada funcionalidade de CANCELAMENTO de consulta.
 * - Inclui helpers (getStatusConsulta) e lógica de Modal.
 */

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. Seletores do DOM ---
    const consultasListaEl = document.getElementById('consultas-lista');
    
    // Filtros
    const searchInput = document.getElementById('search-input');
    const dateFilter = document.getElementById('date-filter');
    
    // Painel de Detalhes
    const placeholderEl = document.getElementById('detalhes-placeholder');
    const detalhesContentEl = document.getElementById('detalhes-consulta-content');
    
    // Cards
    const cardMeet = document.getElementById('card-meet');
    const cardPresencial = document.getElementById('card-presencial');
    const cardAcao = document.getElementById('card-acao'); // NOVO
    
    // Campos de Detalhes
    const detailMeetLink = document.getElementById('detail-meet-link');
    const detailNome = document.getElementById('detail-nome');
    const detailIdade = document.getElementById('detail-idade');
    const detailHorario = document.getElementById('detail-horario');
    const detailForma = document.getElementById('detail-forma');
    const detailMotivo = document.getElementById('detail-motivo');
    const btnCancelarConsulta = document.getElementById('btn-cancelar-consulta'); // NOVO

    // --- Seletores dos Modais (ADICIONADOS) ---
    const cancelModal = document.getElementById('cancel-modal');
    const confirmCancelBtn = document.getElementById('modal-btn-confirm');
    const closeModalBtn = document.getElementById('modal-btn-close');
    const cancelDetailsText = document.getElementById('modal-cancel-details');

    const notificationModal = document.getElementById('notification-modal');
    const notificationIconWrapper = notificationModal.querySelector('.modal-icon-wrapper');
    const notificationTitle = document.getElementById('modal-title');
    const notificationMessage = document.getElementById('modal-message');
    const notificationOkButton = document.getElementById('modal-btn-ok');


    // --- 2. Variáveis Globais ---
    const API_URL = "https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta";
    // API de Cancelamento (ADICIONADA)
    const API_POST_CANCELAR = "https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta/CancelarConsulta";

    const funcionarioId = "psicosoft_dr@gmail.com"; 
    
    let todasConsultas = []; // Armazena todas as consultas da API

    // --- 3. Funções Principais ---

    /**
     * Busca todas as consultas do profissional na API
     */
    async function carregarConsultas() {
        const url = `${API_URL}?FuncionarioId=${encodeURIComponent(funcionarioId)}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: Não foi possível buscar os dados.`);
            }
            
            todasConsultas = await response.json();
            
            if (!Array.isArray(todasConsultas)) {
                 todasConsultas = [];
                 throw new Error("A resposta da API não foi uma lista de consultas.");
            }
            
            // Ordena da mais recente para a mais antiga
            todasConsultas.sort((a, b) => {
                return (parseDataHorario(b.horario) || 0) - (parseDataHorario(a.horario) || 0);
            });

            renderListaConsultas(todasConsultas);
            setupFiltros();
            
        } catch (error) {
            console.error("Erro ao carregar consultas:", error);
            consultasListaEl.innerHTML = `
                <div class="list-placeholder">
                    <i data-lucide="alert-triangle" style="color: var(--status-danger);"></i>
                    <p style="color: var(--status-danger);">${error.message}</p>
                </div>
            `;
            lucide.createIcons();
        }
    }

    /**
     * Renderiza a lista de consultas na sidebar
     */
    function renderListaConsultas(consultas) {
        consultasListaEl.innerHTML = ''; // Limpa a lista

        if (consultas.length === 0) {
            consultasListaEl.innerHTML = `
                <div class="list-placeholder">
                    <i data-lucide="search-x"></i>
                    <p>Nenhuma consulta encontrada para este filtro.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        consultas.forEach((consulta) => {
            const item = document.createElement('div');
            item.className = 'consult-item';
            
            item.dataset.consulta = JSON.stringify(consulta);
            
            item.innerHTML = `
                <h5>${consulta.nome || 'Paciente não informado'}</h5>
                <p>${consulta.horario || 'Data não informada'}</p>
            `;
            
            item.addEventListener('click', () => {
                document.querySelectorAll('.consult-item.active').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                mostrarDetalhes(consulta);
            });
            
            consultasListaEl.appendChild(item);
        });
        
        lucide.createIcons();
    }

    /**
     * Mostra os detalhes de uma consulta no painel da direita
     * @param {object} consulta - O objeto da consulta
     */
    function mostrarDetalhes(consulta) {
        // Esconde o placeholder e mostra o conteúdo
        placeholderEl.classList.add('hidden');
        detalhesContentEl.classList.remove('hidden');

        // Popula os campos
        detailNome.textContent = consulta.nome || 'N/A';
        detailIdade.textContent = consulta.idade || 'N/A';
        detailHorario.textContent = consulta.horario || 'N/A';
        detailForma.textContent = consulta.forma || 'N/A';
        detailMotivo.textContent = consulta.motivo || 'Nenhum motivo informado.';
        
        // --- LÓGICA DO CARD PRESENCIAL vs ONLINE ---
        const forma = (consulta.forma || '').toLowerCase();

        if (forma === 'online' && consulta.meet_url) {
            detailMeetLink.href = consulta.meet_url;
            cardMeet.classList.remove('hidden');
            cardPresencial.classList.add('hidden');
        } else if (forma === 'presencial') {
            cardMeet.classList.add('hidden');
            cardPresencial.classList.remove('hidden');
        } else {
            cardMeet.classList.add('hidden');
            cardPresencial.classList.add('hidden');
        }
        
        // =======================================================
        // === NOVA LÓGICA DO BOTÃO DE CANCELAMENTO ===
        // =======================================================
        
        // 1. Verifica o status da consulta
        const statusInfo = getStatusConsulta(consulta, new Date());
        
        if (statusInfo.disabled) {
            // Se estiver concluída ou já cancelada, esconde o card de Ação
            cardAcao.classList.add('hidden');
        } else {
            // Se puder ser cancelada, mostra o card
            cardAcao.classList.remove('hidden');
            
            // 2. Anexa o evento de clique ao botão
            btnCancelarConsulta.onclick = () => {
                // Preenche o modal de confirmação
                cancelDetailsText.textContent = `Paciente: ${consulta.nome} (${consulta.horario})`;
                
                // Define a ação do botão "Sim" do modal
                confirmCancelBtn.onclick = () => {
                    performCancellation(consulta.OrderId);
                };
                
                // Abre o modal de confirmação
                cancelModal.classList.add('active');
            };
        }
        // =======================================================
    }

    /**
     * Configura os event listeners para os filtros
     */
    function setupFiltros() {
        const aplicarFiltros = () => {
            const termoBusca = searchInput.value.toLowerCase();
            const dataFiltro = dateFilter.value; // Formato "aaaa-mm-dd"

            let consultasFiltradas = todasConsultas;

            // 1. Filtra por termo de busca (nome ou cpf)
            if (termoBusca) {
                consultasFiltradas = consultasFiltradas.filter(c => 
                    (c.nome && c.nome.toLowerCase().includes(termoBusca)) ||
                    (c.ClienteId && c.ClienteId.includes(termoBusca))
                );
            }

            // 2. Filtra por data
            if (dataFiltro) {
                const [ano, mes, dia] = dataFiltro.split('-');
                const dataFiltroFormatada = `${dia}/${mes}/${ano}`;
                
                consultasFiltradas = consultasFiltradas.filter(c =>
                    c.horario && c.horario.startsWith(dataFiltroFormatada)
                );
            }

            renderListaConsultas(consultasFiltradas);
            
            // Reseta a visão de detalhes
            placeholderEl.classList.remove('hidden');
            detalhesContentEl.classList.add('hidden');
        };

        searchInput.addEventListener('input', aplicarFiltros);
        dateFilter.addEventListener('change', aplicarFiltros);
    }

    // --- 4. Funções Helper (Copiladas) ---

    /**
     * Helper para converter "dd/mm/aaaa HH:MM" em um objeto Date
     */
    function parseDataHorario(horarioStr) {
        if (!horarioStr || !horarioStr.includes(' ')) return null;
        const [dataStr, horaStr] = horarioStr.split(' ');
        const [dia, mes, ano] = dataStr.split('/');
        const [hora, minuto] = horaStr.split(':');
        return new Date(ano, mes - 1, dia, hora, minuto);
    }
    
    /**
     * Helper para verificar o status da consulta (copiado de admin_dashboard.js)
     */
    function getStatusConsulta(consulta, agora) {
        if ((consulta.status || '').toLowerCase() === "cancelada") {
            return { status: "cancelada", disabled: true };
        }
        const dataConsulta = parseDataHorario(consulta.horario);
        if (isNaN(dataConsulta.getTime())) {
             return { status: "agendada", disabled: false };
        }
        if (dataConsulta < agora) {
            return { status: "concluida", disabled: true };
        }
        const diffMinutos = (agora - dataConsulta) / (1000 * 60);
        if (diffMinutos > 0 && diffMinutos < 45) {
             return { status: "andamento", disabled: false };
        }
        return { status: "agendada", disabled: false };
    }
    
    // --- 5. Lógica de Cancelamento (ADICIONADA) ---

    async function performCancellation(orderId) {
        cancelModal.classList.remove('active');
        showNotification(false, 'Cancelando...', 'Aguarde enquanto processamos a solicitação.');

        try {
            const response = await fetch(API_POST_CANCELAR, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ OrderId: orderId }) 
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Não foi possível cancelar a consulta.');
            }

            showNotification(true, 'Consulta Cancelada', 'A consulta foi cancelada com sucesso.');
            
            // Reseta a UI
            placeholderEl.classList.remove('hidden');
            detalhesContentEl.classList.add('hidden');
            
            // Recarrega a lista
            carregarConsultas(); 

        } catch (error) {
            console.error('Erro ao cancelar:', error);
            showNotification(false, 'Erro ao Cancelar', error.message);
        }
    }

    /**
     * Exibe o modal de notificação de Sucesso ou Erro
     */
    function showNotification(isSuccess, title, message) {
        notificationModal.classList.remove('modal--success', 'modal--error');

        if (isSuccess) {
            notificationModal.classList.add('modal--success');
            notificationIconWrapper.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        } else {
            notificationModal.classList.add('modal--error');
            notificationIconWrapper.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>';
        }

        notificationTitle.textContent = title;
        notificationMessage.textContent = message;
        notificationModal.classList.add('active');
        lucide.createIcons(); // Recria ícone do modal
    }

    // Eventos para fechar os modais
    if(closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            cancelModal.classList.remove('active');
        });
    }
    if(notificationOkButton) {
        notificationOkButton.addEventListener('click', () => {
            notificationModal.classList.remove('active');
        });
    }


    // --- 6. Inicialização ---
    carregarConsultas(); 
    lucide.createIcons(); // Ativa os ícones estáticos
});