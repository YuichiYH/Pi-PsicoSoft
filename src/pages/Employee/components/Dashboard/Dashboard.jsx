import {
  Box,
  Card,
  List,
  ListItem,
  ListItemText,
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
  Domain as UnitIcon,
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
const CHART_COLOR_4 = '#efeba9'; // Tom de card (substituído por #f2f0f0 no tema)

function Dashboard() {
  // ... (dados mockados permanecem os mesmos) ...
  const stats = {
    pacientesHoje: 45,
    tempoMedioEspera: '25min',
    ocupacao: 75,
    alertas: 3
  };
  const tempoEsperaData = [ { hora: '08:00', tempo: 15 }, /* ... */ { hora: '15:00', tempo: 25 }, ];
  const tiposConsultaData = [ { tipo: 'Regular', quantidade: 30 }, /* ... */ { tipo: 'Primeira', quantidade: 20 }, ];
  const statusData = [ { name: 'Em Espera', value: 30 }, /* ... */ { name: 'Cancelados', value: 10 }, ];
  const statusColors = [CHART_COLOR_1, CHART_COLOR_2, CHART_COLOR_3, '#FF8042'];
  const filaAtualData = [ { nome: 'João Silva', tempo: 5 }, /* ... */ { nome: 'Pedro Costa', tempo: 20 }, ];


  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Cards de Estatísticas (Big Numbers) - Layout 4x colunas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
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
          <Card sx={{ height: '100%' }}>
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
          <Card sx={{ height: '100%' }}>
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
          <Card sx={{ height: '100%' }}>
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

      {/* Gráficos Dinâmicos - Layout 2x colunas (md={6}) */}
      <Grid container spacing={3}>
        
        {/* Gráfico de Linha - Tempo Médio de Espera por Hora */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Tempo Médio de Espera por Hora
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={tempoEsperaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="tempo"
                  stroke={CHART_COLOR_1}
                  strokeWidth={2}
                  name="Minutos"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de Pizza - Distribuição de Status */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Distribuição de Status
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
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
          </Paper>
        </Grid>

        {/* Gráfico de Barras - Pacientes por Tipo de Consulta */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Pacientes por Tipo de Consulta
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={tiposConsultaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tipo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="quantidade"
                  fill={CHART_COLOR_1}
                  name="Quantidade de Pacientes"
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de Barras Horizontais - Fila Atual */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Fila Atual (Tempo de Espera)
            </Typography>
            <List>
                {filaAtualData.map((paciente, index) => (
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
                    {index < filaAtualData.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}

export default Dashboard;