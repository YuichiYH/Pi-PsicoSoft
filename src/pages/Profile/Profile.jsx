import { useState } from 'react'
import {
    Container,
    Grid,
    Tabs,
    Tab,
    Box
} from '@mui/material';
import ClientProfile from './components/ClientProfile'
import PersonalInfo from './components/PersonalInfo'
import AppointmentHistory from './components/AppointmentHistory'
import styles from './Profile.module.css';


 
function Profile() {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // dados de exemplo para o ClientProfile
    const sampleAppointment = {
        date: '28/10/2025',
        time: '14:30',
        professional: 'Dra. Maria Silva'
    };

    return (
        <div className={styles.principal}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange}
                        aria-label="profile tabs"
                    >
                        <Tab label="Próxima Consulta" />
                        <Tab label="Informações Pessoais" />
                        <Tab label="Histórico" />
                    </Tabs>
                </Box>

                <Box sx={{ mt: 3 }}>
                    {activeTab === 0 && <ClientProfile appointment={sampleAppointment} />}
                    {activeTab === 1 && <PersonalInfo />}
                    {activeTab === 2 && <AppointmentHistory />}
                </Box>
            </Box>
        </Container>
        </div>
    );
}

export default Profile;