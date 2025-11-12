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
        window.location.href = "register.html";
        return; 
    }
    


    // --- 2. Personalização do Painel ---
    const pacienteNomeCompleto = localStorage.getItem('paciente_nome'); 
    const welcomeHeader = document.querySelector('.welcome-header h1');

    if (pacienteNomeCompleto && welcomeHeader) {
        const primeiroNome = pacienteNomeCompleto.split(' ')[0]; 
        welcomeHeader.textContent = `Olá, ${primeiroNome} 👋`;
    }


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
            localStorage.removeItem('paciente_email'); // Limpa o email também
            window.location.href = "index.html"; 
        });
    }
    // --- Fim da Lógica de Logout ---

    // Função Auxiliar de Data ---
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
            if (!dataStr || !horaStr || !dataStr.includes('/') || !horaStr.includes(':')) {
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
            console.warn("Erro ao parsear data no dashboard:", horarioStr, e);
            return null;
        }
    }

    // --- 6. Carregamento das Próximas Consultas ---
    
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
            // --- CORREÇÃO DE CACHE ADICIONADA AQUI ---
            const response = await fetch(url, { cache: 'no-store' });
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: Não foi possível buscar os dados.`);
            }
            
            // 3. A resposta (API envia todas as consultas)
            let todasConsultas = await response.json();
            
            if (!Array.isArray(todasConsultas)) {
                 todasConsultas = []; // Garante que é um array
            }
            
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
            
            consultasFuturas.sort((a, b) => {
                const dataA = parseDataHorario(a.horario);
                const dataB = parseDataHorario(b.horario);
                // Coloca datas inválidas no final
                if (!dataA) return 1;
                if (!dataB) return -1;
                return dataA - dataB; // Ordena do mais próximo (menor data) para o mais distante (maior data)
            });
            
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
     *  Converte os dados da Lambda /Consulta em um formato para o HTML.
     */
    function formatarConsultaDashboard(consulta) {
        const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
        
        const dataObj = parseDataHorario(consulta.horario);
        if (!dataObj) {
             return { mes: 'ERR', dia: '!', titulo: 'Consulta Inválida', classeStatus: 'status-cancelada', iconeStatus: 'alert-triangle', textoStatus: 'Inválida' };
        }

        const horaStr = String(dataObj.getHours()).padStart(2, '0') + ":" + String(dataObj.getMinutes()).padStart(2, '0');
        const dia = String(dataObj.getDate()).padStart(2, '0');
        const mesNum = dataObj.getMonth();

        let dadosFormatados = {
            mes: meses[mesNum],
            dia: dia,
            titulo: `Consulta de ${consulta.especialidade || 'Clínica'}`, 
            classeStatus: "status-confirmado", // Assumindo confirmada
            iconeStatus: "check-circle",
            textoStatus: `Confirmada - ${horaStr}` // Exibe a hora
        };
        
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

// --- 7. LÓGICA DO CARROSSEL DE INFORMAÇÕES (ADICIONADO) ---
const slidesContainer = document.querySelector(".info-carousel-slides");
const slides = document.querySelectorAll(".carousel-slide");
const prevButton = document.querySelector(".carousel-nav.prev");
const nextButton = document.querySelector(".carousel-nav.next");
const paginationContainer = document.querySelector(".carousel-pagination");

if (slides.length > 0) {
    let currentSlide = 0;
    let autoPlayInterval = null;

    // Função para mostrar um slide específico
    const showSlide = (index) => {
        slides.forEach((slide, i) => {
            slide.classList.remove("active");
            if (i === index) {
                slide.classList.add("active");
            }
        });
        // Atualiza a paginação
        const dots = document.querySelectorAll(".pagination-dot");
        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === index);
        });
        currentSlide = index;
    };

    // Navegação manual
    prevButton.addEventListener("click", () => {
        const newSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(newSlide);
        resetAutoPlay();
    });

    nextButton.addEventListener("click", () => {
        const newSlide = (currentSlide + 1) % slides.length;
        showSlide(newSlide);
        resetAutoPlay();
    });
    
    // Criação da Paginação
    slides.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.classList.add("pagination-dot");
        dot.addEventListener("click", () => {
            showSlide(i);
            resetAutoPlay();
        });
        paginationContainer.appendChild(dot);
    });

    // Autoplay
    const startAutoPlay = () => {
        autoPlayInterval = setInterval(() => {
            const newSlide = (currentSlide + 1) % slides.length;
            showSlide(newSlide);
        }, 5000); // Muda a cada 5 segundos
    };

    const resetAutoPlay = () => {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    };

    // Inicia o carrossel
    showSlide(0);
    startAutoPlay();
    lucide.createIcons(); // Recria os ícones do Lucide, caso necessário
}