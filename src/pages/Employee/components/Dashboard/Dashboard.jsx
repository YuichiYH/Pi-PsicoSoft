import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingIcon,
  Warning as AlertIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

function Dashboard() {
  // Dados de exemplo
  const stats = {
    pacientesHoje: 45,
    tempoMedioEspera: '25min',
    ocupacao: 75,
    alertas: 3
  };

  // Dados para o gráfico de linha (Tempo médio de espera por hora)
  const tempoEsperaData = [
    { hora: '08:00', tempo: 15 },
    { hora: '09:00', tempo: 25 },
    { hora: '10:00', tempo: 30 },
    { hora: '11:00', tempo: 20 },
    { hora: '12:00', tempo: 10 },
    { hora: '13:00', tempo: 15 },
    { hora: '14:00', tempo: 35 },
    { hora: '15:00', tempo: 25 },
  ];

  // Dados para o gráfico de barras (Pacientes por tipo de consulta)
  const tiposConsultaData = [
    { tipo: 'Regular', quantidade: 30 },
    { tipo: 'Urgente', quantidade: 15 },
    { tipo: 'Renovação', quantidade: 25 },
    { tipo: 'Primeira', quantidade: 20 },
  ];

  // Dados para o gráfico de pizza (Distribuição de status)
  const statusData = [
    { name: 'Em Espera', value: 30, color: '#2196f3' },
    { name: 'Em Atendimento', value: 15, color: '#4caf50' },
    { name: 'Atendidos', value: 45, color: '#ff9800' },
    { name: 'Cancelados', value: 10, color: '#f44336' },
  ];

  const filaAtual = [
    { nome: 'João Silva', tipo: 'Urgente', tempo: '5min' },
    { nome: 'Maria Santos', tipo: 'Regular', tempo: '15min' },
    { nome: 'Pedro Costa', tipo: 'Renovação', tempo: '20min' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <PeopleIcon sx={{ color: 'white', fontSize: 40 }} />
                <Box>
                  <Typography color="white" variant="h4">
                    {stats.pacientesHoje}
                  </Typography>
                  <Typography color="white" variant="subtitle2">
                    Pacientes Hoje
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <TimeIcon sx={{ color: 'white', fontSize: 40 }} />
                <Box>
                  <Typography color="white" variant="h4">
                    {stats.tempoMedioEspera}
                  </Typography>
                  <Typography color="white" variant="subtitle2">
                    Tempo Médio de Espera
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.light' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <TrendingIcon sx={{ color: 'white', fontSize: 40 }} />
                <Box>
                  <Typography color="white" variant="h4">
                    {stats.ocupacao}%
                  </Typography>
                  <Typography color="white" variant="subtitle2">
                    Ocupação
                  </Typography>
                </Box>
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={stats.ocupacao} 
                sx={{ mt: 2, bgcolor: 'white' }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <AlertIcon sx={{ color: 'white', fontSize: 40 }} />
                <Box>
                  <Typography color="white" variant="h4">
                    {stats.alertas}
                  </Typography>
                  <Typography color="white" variant="subtitle2">
                    Alertas
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Gráfico de Linha - Tempo de Espera */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Tempo Médio de Espera por Hora
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={tempoEsperaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="tempo"
                    stroke="#2196f3"
                    strokeWidth={2}
                    name="Minutos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Gráfico de Pizza - Distribuição de Status */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Distribuição de Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Gráfico de Barras - Tipos de Consulta */}
        <Grid item xs={12}>
          <Paper elevation={3}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Pacientes por Tipo de Consulta
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tiposConsultaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tipo" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="quantidade"
                    fill="#4caf50"
                    name="Quantidade de Pacientes"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Lista de Fila Atual */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Fila Atual
              </Typography>
              <List>
                {filaAtual.map((paciente, index) => (
                  <Box key={index}>
                    <ListItem>
                      <ListItemText
                        primary={paciente.nome}
                        secondary={
                          <Typography variant="body2" component="span">
                            {paciente.tipo} • Espera: {paciente.tempo}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < filaAtual.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;