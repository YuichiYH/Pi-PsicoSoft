import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    TextField,
    Button,
    Container,
    Typography,
    Box
} from '@mui/material';
import styles from './Login.module.css';

// Componente da tela de Login
function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        // Lógica de autenticação (mock)
        // Em um app real, você chamaria sua API aqui
        if (email === 'admin@psicosoft.com' && password === '1234') {
            onLogin(); // Atualiza o estado no App.jsx
            navigate('/dashboard'); // Redireciona para o dashboard
        } else {
            alert('Usuário ou senha inválidos!');
        }
    };

    return (
        <Container className={styles.loginContainer} maxWidth="sm">
            <Card className={styles.loginCard}>
                <CardContent>
                    <Typography 
                        variant="h4" 
                        component="h1" 
                        gutterBottom 
                        align="center"
                        className={styles.title}
                    >
                        Psicosoft
                    </Typography>
                    <Typography 
                        variant="h6" 
                        component="h2" 
                        gutterBottom 
                        align="center"
                        className={styles.subtitle}
                    >
                        Painel de Gerenciamento
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Usuário (e-mail)"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Senha"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                        >
                            Entrar
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
}

export default Login;