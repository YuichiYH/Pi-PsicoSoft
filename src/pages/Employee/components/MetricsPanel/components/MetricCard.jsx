import { Card, CardContent, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

function MetricCard({ title, value, trend, chart }) {
    const isTrendPositive = trend && parseFloat(trend) > 0;

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                {value && (
                    <Box display="flex" alignItems="center" mb={2}>
                        <Typography variant="h4" component="div">
                            {value}
                        </Typography>
                        {trend && (
                            <Box display="flex" alignItems="center" ml={1}>
                                {isTrendPositive ? (
                                    <TrendingUpIcon color="success" />
                                ) : (
                                    <TrendingDownIcon color="error" />
                                )}
                                <Typography
                                    variant="body2"
                                    color={isTrendPositive ? "success.main" : "error.main"}
                                >
                                    {trend}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}
                {chart && (
                    <Box mt={2}>
                        {chart}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

export default MetricCard;