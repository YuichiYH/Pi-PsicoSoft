import { Card, CardContent, Typography, Grid } from '@mui/material';

function DetailedMetrics({ categories }) {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Métricas Detalhadas
                </Typography>
                <Grid container spacing={2}>
                    {Object.entries(categories).map(([category, stats]) => (
                        <Grid item xs={12} md={4} key={category}>
                            <Typography variant="subtitle1" gutterBottom>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </Typography>
                            <Typography variant="body2">
                                Mensal: {stats.monthly}
                            </Typography>
                            <Typography variant="body2">
                                Tendência: {stats.trend}
                            </Typography>
                            <Typography variant="body2">
                                Tempo médio de espera: {stats.avgWaitTime}
                            </Typography>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
}

export default DetailedMetrics;