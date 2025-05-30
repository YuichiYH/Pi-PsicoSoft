async function carregarConsultas() {
    try {
        const response = await fetch(`https://6blopd43v4.execute-api.us-east-1.amazonaws.com/dev/Consulta`);
        
        if (!response.ok) {
            throw new Error(`Erro ao carregar consultas: ${response.status}`);
        }

        const consultas = await response.json();
        const lista = document.getElementById('consultas-lista');
        lista.innerHTML = ''; // Limpa antes de preencher

        consultas.forEach((consulta) => {
            const item = document.createElement('div');
            item.className = 'consult-item';
            item.innerHTML = `<strong>${consulta.nome}</strong><br><small>${consulta.especialidade}</small>`;
            item.onclick = () => mostrarDetalhes(consulta);
            lista.appendChild(item);
        });
    } catch (error) {
        console.error('Erro ao buscar consultas:', error);
        alert('Erro ao carregar consultas. Tente novamente mais tarde.');
    }
}

function mostrarDetalhes(consulta) {
    document.getElementById('titulo-consulta').innerText = `Atendimento de ${consulta.nome}`;
    const detalhes = document.getElementById('detalhes-consulta');
    detalhes.innerHTML = `
        <p><strong>Idade:</strong> ${consulta.idade}</p>
        <p><strong>Especialidade:</strong> ${consulta.especialidade}</p>
        <p><strong>Forma:</strong> ${consulta.forma}</p>
        <p><strong>Motivo:</strong> ${consulta.motivo}</p>
        <p><strong>Horário:</strong> ${consulta.horario}</p>
        <p><strong>Link da Consulta:</strong> <a href="${consulta.meet_url}" target="_blank">Acessar Sala</a></p>
    `;
}

window.onload = carregarConsultas;
