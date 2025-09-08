import Image from "next/image";
import Link from "next/link";
import { Container, Card, CardContent, Typography, Grid, Box } from "@mui/material";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Box className={styles.titlebox}>
          <img
            src="/images/medico.jpeg"
            className={styles.logo}
            alt=""
          />
          <Box className={styles.titletext}>
            <h1 className={styles.title}>PSICOSOFT</h1>
            <p className={styles.description}>
              Software para gerenciamento de clínicas
            </p>
          </Box>
        </Box>
        <div className={styles.container}>
          <Box className={styles.containerinicial}>
            <Container>
              <Typography variant="h2" gutterBottom>
                Bem-vindo ao PSICOSOFT!
              </Typography>
              <Typography variant="subtitle1">
                Moldando o futuro da saúde com o sistema que se encaixa junto com a
                sua necessidade.
              </Typography>
            </Container>

            <div className={styles.containerdescription}>
              <Container>
                <div className={styles.cardGrid}>
                  <Card elevation={4}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        O PSICOSOFT é um projeto em constante evolução
                      </Typography>
                      <Typography variant="body1">
                        Liderado por um grupo dedicado de sete alunos do curso de
                        Ciências da Computação. Nossa missão é transformar a forma
                        como as consultas e exames médicos são agendados,
                        otimizando a eficiência e a qualidade do atendimento no
                        campo sensível da medicina.
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card elevation={4}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        Estamos atualmente na fase final de desenvolvimento
                      </Typography>
                      <Typography variant="body1">
                        Aplicando as melhores práticas e tecnologias para garantir que o PSICOSOFT 
                        seja uma solução robusta, segura e fácil de usar, pensada especialmente 
                        para clínicas e consultórios.
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card elevation={4}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        Nosso objetivo é simplificar o agendamento
                      </Typography>
                      <Typography variant="body1">
                        economizar tempo e elevar os padrões de atendimento na área da saúde, 
                        oferecendo uma experiência mais ágil tanto para os profissionais 
                        quanto para os pacientes.
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card elevation={4}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        Seguimos aperfeiçoando o projeto
                      </Typography>
                      <Typography variant="body1">
                        Contamos com o apoio e o feedback de parceiros e usuários
                        para continuar evoluindo e contribuindo com melhorias 
                        reais na assistência médica.
                      </Typography>
                    </CardContent>
                  </Card>
                </div>
              </Container>
            </div>
          </Box>
        </div>
        <ol>
          <li>
            Get started by editing <code>src/app/page.tsx</code>.
          </li>
          <li>Save and see your changes instantly.</li>
          <li>
            <Link href="/page1">Go to Page 1</Link>
          </li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
