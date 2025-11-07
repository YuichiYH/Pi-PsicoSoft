/*
 * script_doutor.js
 * Lógica da nova "Central de Atendimento"
 * - ATUALIZADO: funcionarioId = psicosoft_dr@gmail.com
 * - ATUALIZADO: Lógica para mostrar/esconder card de Meet vs. Presencial
 * - Busca dados da API
 * - Habilita filtro de busca e data
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
    
    // --- NOVOS Seletores de Card ---
    const cardMeet = document.getElementById('card-meet');
    const cardPresencial = document.getElementById('card-presencial');
    
    // Campos de Detalhes
    const detailMeetLink = document.getElementById('detail-meet-link');
    const detailNome = document.getElementById('detail-nome');
    const detailIdade = document.getElementById('detail-idade');
    const detailHorario = document.getElementById('detail-horario');
    const detailForma = document.getElementById('detail-forma');
    const detailMotivo = document.getElementById('detail-motivo');

    // --- 2. Variáveis Globais ---
    const API_URL = "https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha/Consulta";
    
    // ATUALIZADO: ID do Dr. André
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
        
        // =======================================================
        // === LÓGICA DO CARD PRESENCIAL vs ONLINE ===
        // =======================================================
        const forma = (consulta.forma || '').toLowerCase();

        if (forma === 'online' && consulta.meet_url) {
            // Mostra card ONLINE
            detailMeetLink.href = consulta.meet_url;
            cardMeet.classList.remove('hidden');
            cardPresencial.classList.add('hidden');
            
        } else if (forma === 'presencial') {
            // Mostra card PRESENCIAL
            cardMeet.classList.add('hidden');
            cardPresencial.classList.remove('hidden');
            
        } else {
            // Esconde AMBOS se a forma não for clara ou não tiver link
            cardMeet.classList.add('hidden');
            cardPresencial.classList.add('hidden');
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
            
            placeholderEl.classList.remove('hidden');
            detalhesContentEl.classList.add('hidden');
        };

        searchInput.addEventListener('input', aplicarFiltros);
        dateFilter.addEventListener('change', aplicarFiltros);
    }

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

    // --- 4. Inicialização ---
    carregarConsultas(); 
    lucide.createIcons(); // Ativa os ícones estáticos
});