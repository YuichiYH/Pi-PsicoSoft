import { Container, Card, CardContent, Typography, Grid, Box } from "@mui/material";
import styles from '../styles/Home.module.css';

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
                  <Card elevation={3}>
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
                  {/* Add the rest of your cards here */}
                </div>
              </Container>
            </div>
          </Box>
        </div>
      </main>
    </div>
  );
}