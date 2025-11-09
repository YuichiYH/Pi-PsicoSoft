import { useState } from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    CssBaseline,
    AppBar, // Opcional, para um cabeçalho
    Toolbar,  // Opcional
    Typography // Opcional
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Queue as QueueIcon
} from '@mui/icons-material';

// Importamos os componentes que serão as "páginas"
import MetricsPanel from './components/MetricsPanel';
import QueueManagement from './components/QueueManagement';

const drawerWidth = 240; // Largura do menu lateral

function Employee() {
    // Estado para controlar qual view está ativa
    const [activeView, setActiveView] = useState('dashboard');

    const menuItems = [
        {
            text: 'Dashboard',
            icon: <DashboardIcon />,
            view: 'dashboard'
        },
        {
            text: 'Gestão de Filas',
            icon: <QueueIcon />,
            view: 'queue'
        }
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            
            {/* Opcional: Cabeçalho superior como na imagem */}
            <AppBar
                position="fixed"
                sx={{
                    width: `calc(100% - ${drawerWidth}px)`,
                    ml: `${drawerWidth}px`,
                    backgroundColor: 'background.paper', // Usa cor do tema
                    color: 'text.primary',
                    boxShadow: '0 1px 4px 0 rgba(0,0,0,0.1)'
                }}
            >
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        {activeView === 'dashboard' ? 'Dashboard' : 'Gestão de Filas'}
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Menu Lateral Fixo (Sidebar) */}
            <Drawer
                variant="permanent"
                anchor="left"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        backgroundColor: '#2e4347', // Cor escura da sua paleta
                        color: '#fff8d4' // Cor clara da sua paleta
                    },
                }}
            >
                <Toolbar /> {/* Espaçador para ficar abaixo do AppBar */}
                <List>
                    {menuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                selected={activeView === item.view}
                                onClick={() => setActiveView(item.view)}
                                sx={{
                                    '&.Mui-selected': {
                                        backgroundColor: 'rgba(255, 184, 132, 0.2)', // Tom da sua cor primária
                                    },
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 184, 132, 0.1)',
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ color: '#fff8d4' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            {/* Conteúdo Principal (onde os gráficos aparecem) */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: 'background.default', // Cor de fundo do seu tema
                    p: 3,
                    width: `calc(100% - ${drawerWidth}px)`
                }}
            >
                <Toolbar /> {/* Espaçador para o conteúdo ficar abaixo do AppBar */}
                
                {/* Renderização condicional da página */}
                {activeView === 'dashboard' && <MetricsPanel />}
                {activeView === 'queue' && <QueueManagement />}
            </Box>
        </Box>
    );
}

export default Employee;