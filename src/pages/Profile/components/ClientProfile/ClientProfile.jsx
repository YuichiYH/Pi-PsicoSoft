import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ClientProfile = ({ appointment }) => { 
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirmClick = () => {
    setConfirmationOpen(true);
  };

  const handleConfirm = () => {
    // Aqui você chamaria a API para confirmar a presença
    setConfirmed(true);
    setConfirmationOpen(false);
    setShowSuccess(true);
    
    // Esconde a mensagem de sucesso após 3 segundos
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleCancel = () => {
    setConfirmationOpen(false);
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 2 }}>
      {showSuccess && (
        <Alert severity="success" sx={{ marginBottom: 2 }}>
          Presença confirmada com sucesso!
        </Alert>
      )}
      
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Próxima Consulta
          </Typography>
          
          <Typography color="textSecondary" gutterBottom>
            Data: {appointment?.date || 'Não agendado'}
          </Typography>
          
          <Typography color="textSecondary" gutterBottom>
            Horário: {appointment?.time || 'Não definido'}
          </Typography>
          
          <Typography color="textSecondary" gutterBottom>
            Profissional: {appointment?.professional || 'Não definido'}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CheckCircleIcon />}
              onClick={handleConfirmClick}
              disabled={confirmed}
              fullWidth
            >
              {confirmed ? 'Presença Confirmada' : 'Confirmar Presença'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Diálogo de confirmação */}
      <Dialog open={confirmationOpen} onClose={handleCancel}>
        <DialogTitle>Confirmar Presença</DialogTitle>
        <DialogContent>
          <Typography>
            Você está confirmando sua presença para a consulta. Ao confirmar, você se compromete a comparecer no horário agendado.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} color="primary" variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientProfile;