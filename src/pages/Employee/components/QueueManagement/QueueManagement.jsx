import { useState } from 'react';
import {
    Container,
    Typography,
    Button,
    ButtonGroup,
    Card,
    CardContent,
    CardHeader,
    Grid,
    List,
    ListItem,
    ListItemText,
    Chip,
    Box
} from '@mui/material';
import {
    Queue as QueueIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    AccessTime as TimeIcon
} from '@mui/icons-material';

// Componente para exibir a lista de pacientes
const QueueList = ({ patients, estimatedWaitTime, priority }) => (
    <List>
        {patients.map((patient, index) => (
            <ListItem key={index} divider={index !== patients.length - 1}>
                <ListItemText
                    primary={patient.name}
                    secondary={
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip 
                                size="small"
                                label={priority}
                                color={priority === 'Alta' ? 'error' : 'primary'}
                            />
                            <Typography variant="body2">
                                Espera: {patient.waitTime} min
                            </Typography>
                        </Box>
                    }
                />
            </ListItem>
        ))}
    </List>
);

// Componente para monitorar status
const StatusMonitor = ({ currentlyServing, waitingTotal, averageWaitTime }) => (
    <Card>
        <CardContent>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Typography variant="h6">
                        Em Atendimento: {currentlyServing}
                    </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Typography variant="h6">
                        Total em Espera: {waitingTotal}
                    </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Typography variant="h6">
                        Tempo Médio: {averageWaitTime} min
                    </Typography>
                </Grid>
            </Grid>
        </CardContent>
    </Card>
);

function QueueManagement() {
    // Dados de exemplo
    const [queue, setQueue] = useState({
        regular: [
            { name: 'João Silva', waitTime: 10 },
            { name: 'Maria Santos', waitTime: 15 }
        ],
        renewal: [
            { name: 'Pedro Costa', waitTime: 5 },
            { name: 'Ana Oliveira', waitTime: 8 }
        ],
        urgent: [
            { name: 'Carlos Lima', waitTime: 2 },
            { name: 'Beatriz Souza', waitTime: 3 }
        ],
        currentlyServing: 3,
        totalWaiting: 6
    });

    return (
        <Container>
            <Grid container spacing={3}>
                {/* Painel de controle principal */}
                <Grid item xs={12}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" gutterBottom>
                            Gerenciamento de Filas
                        </Typography>
                        <ButtonGroup variant="contained">
                            <Button startIcon={<QueueIcon />}>
                                Chamar Próximo
                            </Button>
                            <Button color="warning" startIcon={<TimeIcon />}>
                                Pausar Fila
                            </Button>
                            <Button color="error" startIcon={<WarningIcon />}>
                                Emergência
                            </Button>
                        </ButtonGroup>
                    </Box>
                </Grid>

                {/* Filas separadas */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader 
                            title="Renovação de Consultas"
                            subheader="Prioridade: Média"
                        />
                        <CardContent>
                            <QueueList 
                                patients={queue.renewal}
                                estimatedWaitTime={15}
                                priority="Média"
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader 
                            title="Casos Urgentes"
                            subheader="Prioridade: Alta"
                            sx={{ color: 'error.main' }}
                        />
                        <CardContent>
                            <QueueList
                                patients={queue.urgent}
                                estimatedWaitTime={5}
                                priority="Alta"
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader 
                            title="Consultas Regulares"
                            subheader="Prioridade: Normal"
                        />
                        <CardContent>
                            <QueueList
                                patients={queue.regular}
                                estimatedWaitTime={20}
                                priority="Normal"
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Monitor de status */}
                <Grid item xs={12}>
                    <StatusMonitor
                        currentlyServing={queue.currentlyServing}
                        waitingTotal={queue.totalWaiting}
                        averageWaitTime={15}
                    />
                </Grid>
            </Grid>
        </Container>
    );
}

export default QueueManagement;
