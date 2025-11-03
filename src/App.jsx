import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Button } from '@mui/material'
import Profile from './pages/Profile'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        {/* botão para navegar para o perfil */}
        <Link to="/profile" style={{ textDecoration: 'none' }}>
          <Button variant="contained" color="primary" sx={{ m: 2 }}>
            Ir para Perfil
          </Button>
        </Link>

        {/* configuração das rotas */}
        <Routes>
          <Route path="/" element={<div>Página Inicial</div>} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
