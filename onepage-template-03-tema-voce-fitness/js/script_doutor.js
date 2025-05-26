// --- NOVO: Configuração da API ---
const API_BASE_URL_DOUTOR = 'https://6blopd43v4.execute-api.us-east-1.amazonaws.com/Alpha'; // Mesma base da API
// ----------------------------------

async function carregarConsultas() {
    const lista = document.getElementById('consultas-lista');
    if (!lista) return;

    try {
        const response = await fetch(`${API_BASE_URL_DOUTOR}/consultas`); 
        if (!response.ok) {
            const errData = await response.json().catch(() => ({})); // Tenta ler o erro
            throw new Error(errData.error || `Erro ${response.status} ao buscar consultas`);
        }

        const consultas = await response.json();

        lista.innerHTML = ''; // Limpar lista antes de adicionar
        if (consultas && consultas.length > 0) {
            consultas.forEach((consulta) => {
                const item = document.createElement('div');
                item.className = 'consult-item';
                // Ajuste os campos conforme o que sua Lambda /consultas retorna
                item.innerHTML = `<strong>${consulta.nome || 'N/A'}</strong><br><small>${consulta.especialidade || 'N/A'} - ${consulta.horario || 'N/A'}</small>`;
                item.onclick = () => mostrarDetalhes(consulta);
                lista.appendChild(item);
            });
        } else {
            lista.innerHTML = '<p>Nenhuma consulta encontrada.</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar consultas:', error);
        if (lista) {
            lista.innerHTML = `<p>Erro ao carregar consultas: ${error.message}</p>`;
        }
    }
}

function mostrarDetalhes(consulta) {
    const tituloConsulta = document.getElementById('titulo-consulta');
    const detalhesConsulta = document.getElementById('detalhes-consulta');

    if (tituloConsulta) {
        tituloConsulta.innerText = `Atendimento de ${consulta.nome || 'N/A'}`;
    }
    if (detalhesConsulta) {
        detalhesConsulta.innerHTML = `
            <p><strong>Nome:</strong> ${consulta.nome || 'N/A'}</p>
            <p><strong>CPF:</strong> ${consulta.cpf || 'N/A'}</p> <!-- Adicionado CPF -->
            <p><strong>Idade:</strong> ${consulta.idade || 'N/A'}</p>
            <p><strong>Especialidade:</strong> ${consulta.especialidade || 'N/A'}</p>
            <p><strong>Forma:</strong> ${consulta.forma || 'N/A'}</p>
            <p><strong>Motivo:</strong> ${consulta.motivo || 'N/A'}</p>
            <p><strong>Horário:</strong> ${consulta.horarioOriginalString || consulta.horario || 'N/A'}</p> <!-- Preferir horarioOriginalString -->
            <p><strong>Status:</strong> ${consulta.status || 'AGENDADA'}</p> <!-- Adicionado Status -->
        `;
    }
}

window.onload = carregarConsultas;