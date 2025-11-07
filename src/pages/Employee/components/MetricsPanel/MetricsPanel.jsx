import { Container, Grid } from "@mui/material";
import MetricCard from './components/MetricCard';
import TimeLineChart from './components/TimeLineChart';
import BarChart from './components/BarChart';
import PieChart from './components/PieChart';
import DetailedMetrics from './components/DetailedMetrics';

// Dados de exemplo para os gráficos
const waitTimeData = [
    { time: '9h', value: 12 },
    { time: '10h', value: 15 },
    { time: '11h', value: 18 },
    { time: '12h', value: 20 },
    { time: '13h', value: 15 },
    { time: '14h', value: 10 },
];

const flowData = [
    { time: '9h', value: 8 },
    { time: '10h', value: 12 },
    { time: '11h', value: 15 },
    { time: '12h', value: 10 },
    { time: '13h', value: 8 },
    { time: '14h', value: 14 },
];

function MetricsPanel() {
    return (
        <Container>
            <Grid container spacing={3}>
                {/* métricas de tempo para NPS*/}
                <Grid item xs={12} md={4}>
                    <MetricCard 
                        title="Tempo Médio de Espera"
                        value="15min"
                        trend="2min"
                        chart={<TimeLineChart data={waitTimeData} />}
                    />
                </Grid>

                {/* métricas de fluxo */}
                <Grid item xs={12} md={4}>
                    <MetricCard 
                        title="Pacientes por Hora"
                        value="12"
                        trend="-2"
                        chart={<BarChart data={flowData} />}
                    />
                </Grid>

                {/* distinção por tipo */}
                <Grid item xs={12} md={4}>
                    <MetricCard 
                        title="Distribuição de Atendimentos"
                        chart={<PieChart 
                            data={{
                            renewal: 40,
                            urgent: 15,
                            newPatient: 25,
                            regular: 20
                        }} 
                        />}
                    />
                </Grid>

                {/* relatórios detalhados */}
                <Grid item xs={12}>
                    <DetailedMetrics
                    categories={{
                        newPatients: {
                            monthly: 40,
                            trend: '+12%',
                            avgWaitTime: '30min'
                        },
                        recurring: {
                            monthly: 120,
                            trend: 'stable',
                            avgWaitTime: '15min'
                        },
                        urgent: {
                            monthly: 25,
                            trend: '-5%',
                            avgWaitTime: '10min'
                        }
                    }}
                    />
                </Grid>
            </Grid>
        </Container>
    );
}

export default MetricsPanel;