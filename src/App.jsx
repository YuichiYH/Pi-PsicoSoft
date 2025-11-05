import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Profile from './pages/Profile'
import Employee from './pages/Employee'
import './App.css'

// Componente para os botões de navegação
function NavigationButtons() {
  const location = useLocation()
  const navigate = useNavigate()

  // Se estiver na página inicial, mostra os botões de Cliente e Funcionário
  if (location.pathname === '/') {
    return (
      <nav>
        <Link to="/profile" style={{ textDecoration: 'none' }}>
          <Button variant="contained" color="primary" sx={{ m: 2 }}>
            Sou Cliente
          </Button>
        </Link>

        <Link to="/employee" style={{ textDecoration: 'none' }}>
          <Button variant="contained" color="primary" sx={{ m: 2 }}>
            Sou Funcionário
          </Button>
        </Link>
      </nav>
    )
  }

  // Se estiver em qualquer outra página, mostra apenas o botão de voltar
  return (
    <nav>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ m: 2 }}
      >
        Voltar para Início
      </Button>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <div className="App">
        <NavigationButtons />

        <Routes>
          <Route path="/" element={<div>Página Inicial</div>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/employee" element={<Employee />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
