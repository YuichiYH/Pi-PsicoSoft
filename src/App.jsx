// src/App.jsx

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link as RouterLink, // Renomeado para evitar conflito
  useLocation
} from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Queue as QueueIcon,
  Person as PersonIcon
} from '@mui/icons-material';

// 1. Importe as páginas
// (Assumindo a nova estrutura de pastas)
// import Home from './pages/Home';
// import Profile from './pages/Profile';
import Dashboard from './pages/Employee/components/Dashboard/Dashboard';
import QueueManagement from './pages/Employee/components/QueueManagement/QueueManagement';

import './App.css';

const drawerWidth = 240;

// Componente de layout principal
function AppLayout() {
  const location = useLocation();

  const menuItems = [
    { text: 'Início', icon: <HomeIcon />, path: '/' },
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Minhas Consultas', icon: <PersonIcon />, path: '/profile' },
    { text: 'Gestão de Filas', icon: <QueueIcon />, path: '/queue' },
  ];

  // Determina o título da página com base no path
  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.text : 'Psicosoft';
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Barra Superior */}
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          backgroundColor: 'background.paper', // Usa cor do tema
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            {getPageTitle()}
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
            color: '#fff8d4', // Cor clara da sua paleta
            borderRight: 'none',
          },
        }}
      >
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '64px' }}>
          <Typography variant="h5" sx={{ color: '#ffb884', fontWeight: 600 }}>
            Psicosoft
          </Typography>
        </Toolbar>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ padding: '0 8px' }}>
              <ListItemButton
                component={RouterLink} // Usa o Link do Router
                to={item.path}         // Define o destino
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: '8px',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 184, 132, 0.25)', // #ffb884 com opacidade
                    color: '#ffb884',
                    '& .MuiListItemIcon-root': {
                        color: '#ffb884',
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 184, 132, 0.1)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: '#fff8d4', minWidth: '40px' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Conteúdo Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default', // Cor de fundo do seu tema (#fff8d4)
          p: 3,
          width: `calc(100% - ${drawerWidth}px)`,
          minHeight: '100vh',
        }}
      >
        <Toolbar /> {/* Espaçador para o conteúdo ficar abaixo do AppBar */}
        
        {/* As rotas são renderizadas aqui */}
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          {/* <Route path="/profile" element={<Profile />} /> */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/queue" element={<QueueManagement />} />
        </Routes>
      </Box>
    </Box>
  );
}

// O componente App agora só configura o Router
function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;