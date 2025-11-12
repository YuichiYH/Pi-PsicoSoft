import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Paper,
  Stack
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  AccessTime as TimeIcon,
  Domain as UnitIcon, // Ícone para Ocupação da Unidade
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

// Cores da nova paleta para os gráficos
const CHART_COLOR_1 = '#5ac7aa'; // Cor de destaque
const CHART_COLOR_2 = '#9adcb9'; // Tom intermediário
const CHART_COLOR_3 = '#332e1d'; // Tom escuro
const CHART_COLOR_4 = '#efeba9'; // Tom de card

function Dashboard() {
  // Dados de exemplo
  const stats = {
    pacientesHoje: 45,
    tempoMedioEspera: '25min', // Usado para "Tempo de Atendimento"
    ocupacao: 75,
    alertas: 3
  };

  // Gráfico de linha (Tempo médio de espera por Hora)
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

  // Gráfico de barras (Pacientes por tipo de consulta)
  const tiposConsultaData = [
    { tipo: 'Regular', quantidade: 30 },
    { tipo: 'Urgente', quantidade: 15 },
    { tipo: 'Renovação', quantidade: 25 },
    { tipo: 'Primeira', quantidade: 20 },
  ];

  // Gráfico de pizza (Distribuição de status)
  const statusData = [
    { name: 'Em Espera', value: 30 },
    { name: 'Em Atendimento', value: 15 },
    { name: 'Atendidos', value: 45 },
    { name: 'Cancelados', value: 10 },
  ];
  const statusColors = [CHART_COLOR_1, CHART_COLOR_2, CHART_COLOR_3, CHART_COLOR_4];

  // Gráfico de barras horizontais (Fila Atual)
  const filaAtualData = [
    { nome: 'João Silva', tempo: 5 },
    { nome: 'Maria Santos', tempo: 15 },
    { nome: 'Pedro Costa', tempo: 20 },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Cards de Estatísticas (Big Numbers) - Nomenclatura atualizada */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    {stats.pacientesHoje}
                  </Typography>
                  <Typography variant="subtitle2">
                    Pacientes para Hoje
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <TimeIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    {stats.tempoMedioEspera}
                  </Typography>
                  <Typography variant="subtitle2">
                    Tempo de Atendimento
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <UnitIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    {stats.ocupacao}%
                  </Typography>
                  <Typography variant="subtitle2">
                    Ocupação da Unidade
                  </Typography>
                </Box>
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={stats.ocupacao} 
                sx={{ mt: 2 }}
                color="primary"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <AlertIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    {stats.alertas}
                  </Typography>
                  <Typography variant="subtitle2">
                    Alertas das Clínicas
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos Dinâmicos */}
      <Grid container spacing={3}>
        {/* Gráfico de Linha - Tempo Médio de Espera por Hora */}
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
                    stroke={CHART_COLOR_1} // Cor atualizada
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
                      <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Gráfico de Barras - Pacientes por Tipo de Consulta */}
        <Grid item xs={12} md={6}>
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
                    fill={CHART_COLOR_1} // Cor atualizada
                    name="Quantidade de Pacientes"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* NOVO: Gráfico de Barras Horizontais - Fila Atual */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Fila Atual
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filaAtualData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="nome" 
                    type="category" 
                    width={100} 
                    tick={{ fontSize: 12 }} 
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="tempo"
                    fill={CHART_COLOR_2} // Cor atualizada
                    name="Tempo de Espera (min)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}

export default Dashboard;