import { Container, Grid } from "@mui/material";

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