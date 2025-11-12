import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import App from './App'
import './styles/globals.css'

// 1. Definição do tema com a paleta de cores solicitada
const theme = createTheme({
  palette: {
    primary: {
      main: '#5ac7aa', // Cor de destaque e botões principais
      contrastText: '#332e1d',
    },
    secondary: {
      main: '#9adcb9', // Tons intermediários / gráficos
    },
    background: {
      default: '#fafcd3', // Cor de fundo clara
      paper: '#efeba9',   // Detalhes, realces e fundos de cards
    },
    text: {
      primary: '#332e1d', // Cor primária (tons escuros)
    },
  },
  typography: {
    fontFamily: 'Arial, Helvetica, sans-serif',
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 2. Aplicação do tema e CSS Baseline */}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)