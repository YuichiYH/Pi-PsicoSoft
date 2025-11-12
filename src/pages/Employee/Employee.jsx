import { useState } from 'react'
import {
    Container,
    Grid,
    Tabs,
    Tab,
    Box
} from '@mui/material';
import QueueManagement from './components/QueueManagement';
import MetricsPanel from './components/MetricsPanel';
import Dashboard from './components/Dashboard';
import styles from './Employee.module.css';

function Employee() {
    // Alterado para '2' para que o Dashboard seja a aba padrão
    const [activeTab, setActiveTab] = useState(2);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <div className={styles.principal}>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange}
                        aria-label="employee tabs"
                        textColor="primary"
                        indicatorColor="primary"
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
        </div>
    );
}

export default Employee;