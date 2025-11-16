import React from "react";
import { useEffect, useState } from "react";
import { 
    AppBar, 
    Toolbar, 
    Box, 
    Typography, 
    Button, 
    IconButton, 
    Chip, 
    Avatar,
    useTheme, 
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";

const APP_NAME = import.meta.env.VITE_APP_NAME || "PsicoSoft MGF";
const API_URL = import.meta.env.VITE_API_URL;

function Navbar() {
    const navigate = useNavigate();
    const [me, setMe] = useState(null);
    
    const goToHome = () => window.scrollTo({ top: 0, behavior: "smooth" });
    const goToFilas = () => navigate("/filas");
    const goToAnchor = (id) =>
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

    const handleBackToLogin = () => navigate("/");

    
    useEffect(() => {
    fetch(`${API_URL}/me`, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => setMe(data))
        .catch(() => {});
    }, []);
    

    return (
        <AppBar position="sticky" color="default" elevation={1}>
            <Toolbar sx={{ gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={goToHome}>
                <DashboardIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="div" sx={{ whiteSpace: "nowrap" }}>
                {APP_NAME}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: { xs: 'none', md: 'block' } }}>
                — módulo de gerenciamento de filas
                </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1, justifyContent: "center" }}>
                <Button onClick={() => goToAnchor("home")}>Home</Button>
                <Button onClick={() => goToAnchor("modulos")}>Módulos</Button>
                <Button onClick={() => goToAnchor("sobre")}>Sobre</Button>
                <Button onClick={() => goToAnchor("time")}>Time</Button>
                <Button onClick={() => goToAnchor("contato")}>Contato</Button>
                <Button onClick={goToFilas} color="primary">Filas</Button>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

                {me?.user ? (
                <Chip
                    avatar={<Avatar src={me.user.picture} alt={me.user.name} />}
                    label={me.user.name}
                    title={me.user.email}
                />
                ) : (
                <Button variant="outlined" onClick={handleBackToLogin}>
                    Sair
                </Button>
                )}
            </Box>
            </Toolbar>
        </AppBar>
  );
}

export default Navbar;