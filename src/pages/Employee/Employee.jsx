import { useState } from 'react'
import {
    Container,
    Grid,
    Tabs,
    Tab,
    Box
} from '@mui/material';
// Imports temporários para teste
const QueueManagement = () => <div>Gestão de Filas em Construção</div>;
const MetricsPanel = () => <div>Métricas em Construção</div>;
const Dashboard = () => <div>Dashboard em Construção</div>;

function Employee() {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange}
                        aria-label="employee tabs"
                    >
                        <Tab label="Gestão de Filas" />
                        <Tab label="Métricas" />
                        <Tab label="Dashboard" />
                    </Tabs>
                </Box>

                <Box sx={{ mt: 3 }}>
                    {activeTab === 0 && <QueueManagement />}
                    {activeTab === 1 && <MetricsPanel />}
                    {activeTab === 2 && <Dashboard />}
                </Box>
            </Box>
        </Container>
    );
}

export default Employee;