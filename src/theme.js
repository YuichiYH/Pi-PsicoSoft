// src/theme.js

import { createTheme } from '@mui/material/styles';

// Sua paleta de cores:
// #023E8A (Pêssego/Laranja claro)
// #f5df98 (Amarelo claro)
// #F5F7FB (Creme/Off-white)
// #c0d1c2 (Verde/Cinza Mute)
// #0B1221 (Azul/Cinza Escuro)

const theme = createTheme({
  palette: {
    // Modo 'light' é o padrão
    primary: {
      main: '#023E8A', // Cor principal de ações (botões, links)
      contrastText: '#ffffff', // Texto para usar sobre a cor primária
    },
    secondary: {
      main: '#c0d1c2', // Cor secundária (ações menos importantes)
      contrastText: '#0B1221',
    },
    background: {
      default: '#F5F7FB', // Cor de fundo da página
      paper: '#0077B6',   // Cor de fundo dos 'Cards', 'Dialogs', 'Menus'
    },
    text: {
      primary: '#0B1221',   // Cor principal de texto
      secondary: '#5a7175', // Cor de texto secundário (um pouco mais clara)
    },
    info: {
      main: '#f5df98', // Usada para componentes de 'Alert' (info)
    },
    // Você pode usar as cores restantes para 'success', 'warning', 'error'
    // Ex:
    // success: {
    //   main: '#c0d1c2', 
    // },
  },
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    }
  },
  components: {
    // Sobrescrevendo estilos globais de componentes
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Bordas mais arredondadas para um look moderno
          boxShadow: '0 6px 16px rgba(46, 67, 71, 0.08)', // Sombra suave
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Bordas arredondadas (como no seu index.css)
          textTransform: 'none', // Botões sem CAIXA ALTA
          fontWeight: 600,
        }
      }
    }
  }
});

export default theme;