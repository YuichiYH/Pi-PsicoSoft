import { useState } from 'react'
import {
    Container,
    Grid,
    Tabs,
    Tab,
    Box
} from '@mui/material' ;
import ClientProfile from '../../components/ClientProfile'
import PersonalInfo from './components/PersonalInfo/PersonalInfo'
import AppointmentHistory from './components/AppointmentHistory/AppointmentHistory'

function Profile() {
    const [selectedTab, setSelectedTab] = useState(0);

    return (
        <Container>
            <Box sx={{ width: '100%' }}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                    <Tab label="Próxima Consulta" />
                    <Tab label="Informações Pessoais" />
                    <Tab label="Histórico" />
                    <Tab label="Configurações" />
                </Tabs>

                <Box sx={{ mt: 3 }}>
                    {activeTab === 0 && <ClientProfile />}
                    {activeTab === 1 && <PersonalInfo />}
                    {activeTab === 2 && <AppointmentHistory />}
                </Box>
            </Box>
        </Container>
    );
}

export default Profile;