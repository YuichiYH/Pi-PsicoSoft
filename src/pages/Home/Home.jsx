import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Link as MuiLink,
} from "@mui/material";
import {
  Assessment,
  QueuePlayNext,
  Email,
} from "@mui/icons-material";


function Home() {
  const navigate = useNavigate();

  const goToFilas = () => navigate("/filas");

  const teamMembers = [
    { name: "Ana Beatriz", role: "" },
    { name: "Carlos Yuichi", role: "" },
    { name: "Lucas Eleuterio", role: "" },
    { name: "Sabrina Arfelli", role: "" },
  ];

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* HERO */}
        <Box id="home" sx={{ py: 8, bgcolor: "background.paper" }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Chip label="Apresentação do Projeto" color="primary" size="small" sx={{ mb: 2 }} />
                <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                  PsicoSoft – Módulo de Gerenciamento de Filas &amp; NPS
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph>
                  Otimize o atendimento com filas inteligentes e mensure a satisfação com NPS integrado — simples, visual e acessível.
                </Typography>
                <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<QueuePlayNext />}
                    onClick={goToFilas}
                  >
                    Ir para o Gerenciamento de Filas
                  </Button>
                  <Button variant="outlined" size="large" onClick={() => goToAnchor("modulos")}>
                    Explorar Módulos
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    height: 400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "action.hover",
                  }}
                >
                  <Typography color="text.secondary">
                    [ Espaço para imagem do sistema / mockup ]
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* SOBRE */}
        <Box id="sobre" sx={{ py: 8 }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" gutterBottom textAlign="center" fontWeight="bold">
              Sobre o Projeto
            </Typography>

            <Grid container spacing={4} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Chip label="Contexto" color="secondary" size="small" sx={{ mb: 2 }} />
                    <Typography variant="h5" component="h3" gutterBottom>
                      Desafio
                    </Typography>
                    <Typography color="text.secondary" paragraph></Typography>

                    <Typography variant="h5" component="h3" gutterBottom>
                      Objetivos
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText primary="Reduzir tempo médio de espera" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Melhorar visibilidade das filas" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Mensurar satisfação com NPS" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Chip label="Imagem" size="small" sx={{ mb: 2 }} />
                    <Paper
                      sx={{
                        height: 280,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "action.hover",
                      }}
                    >
                      <Typography color="text.secondary">
                        [ Espaço para diagrama/fluxo ]
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* MÓDULOS */}
        <Box id="modulos" sx={{ py: 8, bgcolor: "background.paper" }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" gutterBottom textAlign="center" fontWeight="bold">
              Módulos
            </Typography>

            <Grid container spacing={4} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Chip label="Módulo" color="primary" size="small" sx={{ mb: 2 }} />
                    <Typography variant="h5" component="h3" gutterBottom>
                      Gerenciamento de Filas
                    </Typography>
                    <Typography color="text.secondary" paragraph></Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      endIcon={<QueuePlayNext />}
                      onClick={goToFilas}
                    >
                      Ir para o módulo
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Chip label="Módulo" color="primary" size="small" sx={{ mb: 2 }} />
                    <Typography variant="h5" component="h3" gutterBottom>
                      NPS
                    </Typography>
                    <Typography color="text.secondary" paragraph></Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      endIcon={<Assessment />}
                      onClick={() => goToAnchor("galeria")}
                    >
                      Explorar relatórios
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* GALERIA */}
        <Box id="galeria" sx={{ py: 8 }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" gutterBottom textAlign="center" fontWeight="bold">
              Galeria
            </Typography>
            <Typography color="text.secondary" textAlign="center" paragraph>
              Insira aqui capturas de tela do sistema.
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              {[1, 2, 3, 4].map((num) => (
                <Grid item xs={12} sm={6} key={num}>
                  <Paper
                    sx={{
                      height: 250,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "action.hover",
                    }}
                  >
                    <Typography color="text.secondary">
                      [ Screenshot {num} ]
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* TIME */}
        <Box id="time" sx={{ py: 8, bgcolor: "background.paper" }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" gutterBottom textAlign="center" fontWeight="bold">
              Time
            </Typography>
            <Typography color="text.secondary" textAlign="center" paragraph>
              Conheça os envolvidos no projeto.
            </Typography>

            <Grid container spacing={4} sx={{ mt: 2 }}>
              {teamMembers.map((member) => (
                <Grid item xs={12} sm={6} md={3} key={member.name}>
                  <Card sx={{ textAlign: "center" }}>
                    <CardContent>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          mx: "auto",
                          mb: 2,
                          bgcolor: "primary.main",
                        }}
                      >
                        {member.name.charAt(0)}
                      </Avatar>
                      <Typography variant="h6" gutterBottom>
                        {member.name}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {member.role}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* CONTATO */}
        <Box id="contato" sx={{ py: 8 }}>
          <Container maxWidth="md">
            <Card>
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <Email sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  Contato
                </Typography>
                <Typography color="text.secondary">
                  Email:{" "}
                  <MuiLink href="mailto:lucaseleuterio95@gmail.com">
                    lucaseleuterio95@gmail.com
                  </MuiLink>
                </Typography>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </Box>

      {/* FOOTER */}
      <Box component="footer" sx={{ py: 4, bgcolor: "background.paper", borderTop: 1, borderColor: "divider" }}>
        <Container maxWidth="lg">
          <Typography variant="body2" textAlign="center" gutterBottom>
            © {new Date().getFullYear()} PsicoSoft - Módulo de Gerenciamento de Filas &amp; NPS
          </Typography>
          <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
            Fam - Faculdade das Américas · Ciência da Computação · 8º Semestre · Trabalho de Conclusão de Curso
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default Home;