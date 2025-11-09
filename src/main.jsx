// src/main.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles' // 1. Importar
import CssBaseline from '@mui/material/CssBaseline'   // 2. Importar
import theme from './theme'                         // 3. Importar seu tema

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 4. Envolver o App com o Provider e o CssBaseline */}
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)