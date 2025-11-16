import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Profile from './pages/Profile'
import Employee from './pages/Employee'
import './App.css'
import Home from './pages/Home'
import Navbar from './components/navbar'


// O componente App agora só configura o Router
function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/home" element={<Home/>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/employee" element={<Employee />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;