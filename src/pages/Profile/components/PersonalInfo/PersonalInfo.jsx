import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const PersonalInfo = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [personalData, setPersonalData] = useState({
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 98765-4321',
    cpf: '123.456.789-00',
    birthdate: '1990-01-01',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    cep: '01234-567'
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Aqui você implementaria a chamada à API para salvar os dados
    setIsEditing(false);
    setShowSuccess(true);
  };

  const handleChange = (field) => (event) => {
    setPersonalData({
      ...personalData,
      [field]: event.target.value
    });
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Informações Pessoais
          </Typography>
          <Button
            variant="contained"
            color={isEditing ? "success" : "primary"}
            startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
            onClick={isEditing ? handleSave : handleEdit}
          >
            {isEditing ? 'Salvar' : 'Editar'}
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nome Completo"
              value={personalData.name}
              onChange={handleChange('name')}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              value={personalData.email}
              onChange={handleChange('email')}
              disabled={!isEditing}
              type="email"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Telefone"
              value={personalData.phone}
              onChange={handleChange('phone')}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="CPF"
              value={personalData.cpf}
              onChange={handleChange('cpf')}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Data de Nascimento"
              value={personalData.birthdate}
              onChange={handleChange('birthdate')}
              disabled={!isEditing}
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Endereço"
              value={personalData.address}
              onChange={handleChange('address')}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cidade"
              value={personalData.city}
              onChange={handleChange('city')}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Estado"
              value={personalData.state}
              onChange={handleChange('state')}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="CEP"
              value={personalData.cep}
              onChange={handleChange('cep')}
              disabled={!isEditing}
            />
          </Grid>
        </Grid>
      </CardContent>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Informações atualizadas com sucesso!
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default PersonalInfo;