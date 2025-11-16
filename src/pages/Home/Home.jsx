import "./Home.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;
const APP_NAME = import.meta.env.VITE_APP_NAME || "PsicoSoft MGF";

function Home() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setMe(data))
      .catch(() => {});
  }, []);

  const goToFilas = () => navigate("/filas");
  const goToHome = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const goToAnchor = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleBackToLogin = () => navigate("/");

  const toggleTheme = () => {
    const html = document.documentElement;
    html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
  };

  return (
    <div className="page">
      <main id="home" className="container">

        {/* HERO */}
        <section className="hero" id="home">
          <div className="hero-grid">
            <div>
              <div className="eyebrow">Apresentação do Projeto</div>
              <h1 className="title">PsicoSoft – Módulo de Gerenciamento de Filas &amp; NPS</h1>
              <p className="subtitle">
                Otimize o atendimento com filas inteligentes e mensure a satisfação com NPS integrado — simples, visual e acessível.
              </p>
              <div className="hero-actions">
                {/* CTA: vai direto para o módulo de Filas */}
                <button className="btn primary" onClick={goToFilas}>Ir para o Gerenciamento de Filas</button>
                <button className="btn ghost" onClick={() => goToAnchor("modulos")}>Explorar Módulos</button>
              </div>
            </div>
          </div>
        </section>

        {/* SOBRE */}
        <section id="sobre">
          <div className="section-head">
            <h2 className="section-title">Sobre o Projeto</h2>
            <p className="section-desc">
              {/* Texto explicativo opcional */}
            </p>
          </div>

          <div className="grid-2">
            <div className="card">
              <span className="badge">Contexto</span>
              <h3>Desafio</h3>
              <p className="muted">O sistema foi desenvolvido após identificar diversos desafios enfrentados por clínicas médicas, como dificuldades de acesso a consultas especializadas, falhas na infraestrutura, problemas de agendamento, limitações na telemedicina e ineficiências em sistemas já existentes. Com isso, o foco atual está no aperfeiçoamento do módulo de gestão de filas e confirmação de presença, complementando funcionalidades do sistema para melhorar a organização dos atendimentos e o controle das filas de espera.
O tema foi escolhido em consenso pela relevância para empresas da área da saúde, oferecendo uma solução que otimiza tempo, aumenta a produtividade, melhora a gestão administrativa e garante segurança dos dados. O sistema se consolida não apenas como uma plataforma de gestão, mas como um recurso que permite às clínicas focarem no atendimento humanizado e de maior qualidade ao paciente.</p>

              <h3>Objetivos</h3>
              <ul className="muted">
                <li>Reduzir tempo médio de espera</li>
                <li>Melhorar visibilidade das filas</li>
                <li>Mensurar satisfação com NPS</li>
              </ul>
            </div>
            <div className="card-image">
              <div className="media-placeholder" style={{ height: 580 }}>
                <img src="/Diagrama.png"alt="Mockup do sistema"className="hero-image"/>
              </div>
            </div>
          </div>
            <hr />
          <div className="grid-1  ">
            <div className="card">
              <h3>Desensolvimento</h3>
              <p className="muted">O sistema foi desenvolvido para resolver problemas comuns em clínicas, como desorganização de filas, atrasos, falta de controle de presença e baixa eficiência no atendimento. A partir do levantamento de requisitos e análises de fluxos, o projeto evoluiu para a criação de um módulo de Gestão de Filas e NPS totalmente integrado.

No front-end, foram implementadas interfaces responsivas em React/TypeScript, permitindo que pacientes confirmem presença e acompanhem a fila em tempo real, enquanto funcionários gerenciam atendimentos, prioridades e métricas operacionais.

No back-end, a arquitetura serverless da AWS (API Gateway, Lambda e DynamoDB) garantiu escalabilidade, segurança e baixo custo, com autenticação por UUID e lógica otimizada de atualização da fila. O banco foi modelado para consultas rápidas e armazenamento flexível.

Foram implementados também dashboards com métricas como tempo de espera, taxa de ausência e NPS, permitindo análises gerenciais imediatas. O resultado é um sistema ágil, seguro e voltado a melhorar a experiência do paciente e a eficiência operacional das clínicas.</p>
            </div>
          </div>
        </section>

        {/* MÓDULOS */}
        <section id="modulos">
          <div className="section-head">
            <h2 className="section-title">Módulos</h2>
          </div>

          <div className="grid-2">
            <div className="card">
              <span className="badge">Módulo</span>
              <h3>Gerenciamento de Filas</h3>
              <p className="muted"></p>
              {/* LINK: agora usa navigate para /filas */}
              <button className="link asbtn" onClick={goToFilas}>Ir para o módulo →</button>
            </div>

            <div className="card">
              <span className="badge">Módulo</span>
              <h3>NPS</h3>
              <p className="muted"></p>
              <button className="link asbtn" onClick={() => goToAnchor('galeria')}>Explorar relatórios →</button>
            </div>
          </div>
        </section>

        {/* GALERIA */}
        <section id="galeria">
          <div className="section-head">
            <h2 className="section-title">Galeria</h2>
            <p className="section-desc">Insira aqui capturas de tela do sistema.</p>
          </div>

          <div className="gallery">
            <div className="shot">[ Screenshot 1 ]</div>
            <div className="shot">[ Screenshot 2 ]</div>
            <div className="shot">[ Screenshot 3 ]</div>
            <div className="shot">[ Screenshot 4 ]</div>
          </div>
        </section>

        {/* TIME */}
        <section id="time">
          <div className="section-head">
            <h2 className="section-title">Time</h2>
            <p className="section-desc">Conheça os envolvidos no projeto.</p>
          </div>

          <div className="grid-4">
            <div className="card member">
              <div className="avatar">
              <img src="/ana.png" alt="Mockup do sistema" className="hero-image"/>
              </div>
              <h3>Ana Beatriz</h3>
              <div className="role"></div>
            </div>

            <div className="card member">
              <div className="avatar"><img src="/yuichi.png" alt="Mockup do sistema" className="hero-image"/></div>
              <h3>Carlos Yuichi</h3>
              <div className="role"></div>
            </div>

            <div className="card member">
              <div className="avatar"><img src="/lucas.png" alt="Mockup do sistema" className="hero-image"/></div>
              <h3>Lucas Eleuterio</h3>
              <div className="role"></div>
            </div>

            <div className="card member">
              <div className="avatar"><img src="/sabrina.png" alt="Mockup do sistema" className="hero-image"/></div>
              <h3>Sabrina Arfelli</h3>
              <div className="role"></div>
            </div>
          </div>
        </section>

        {/* CONTATO */}
        <section id="contato">
          <div className="card">
            <h3>Contato</h3>
            <p className="muted">
              Email: lucaseleuterio95@gmail.com
            </p>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-inner">
          <div>© {new Date().getFullYear()} PsicoSoft - Módulo de Gerenciamento de Filas &amp; NPS</div>
          <div>
            <span className="muted">Fam - Faculdade das Américas</span> ·{" "}
            <span className="muted">Ciência da Computação </span> ·{" "}
            <span className="muted">8º Semestre</span> ·{" "}
            <span className="muted">Trabalho de Conclusão de Curso</span> ·{" "}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;