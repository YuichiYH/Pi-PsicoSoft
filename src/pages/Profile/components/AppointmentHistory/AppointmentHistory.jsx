import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TablePagination,
  Box
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import ReceiptIcon from '@mui/icons-material/Receipt';

const AppointmentHistory = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // dados de exemplo - substituir por dados reais da API
  const appointments = [
    {
      id: 1,
      date: '28/10/2025',
      time: '14:30',
      professional: 'Dra. Maria Silva',
      status: 'Realizada',
      type: 'Consulta Regular',
      payment: 'Confirmado'
    },
    {
      id: 2,
      date: '15/10/2025',
      time: '10:00',
      professional: 'Dr. João Santos',
      status: 'Cancelada',
      type: 'Primeira Consulta',
      payment: 'Reembolsado'
    },
    {
      id: 3,
      date: '01/10/2025',
      time: '16:45',
      professional: 'Dra. Ana Oliveira',
      status: 'Realizada',
      type: 'Retorno',
      payment: 'Confirmado'
    },
      ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'realizada':
        return 'success';
      case 'cancelada':
        return 'error';
      case 'agendada':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Histórico de Consultas
        </Typography>

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Horário</TableCell>
                <TableCell>Profissional</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Pagamento</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.date}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>{appointment.professional}</TableCell>
                  <TableCell>{appointment.type}</TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.status}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{appointment.payment}</TableCell>
                  <TableCell align="center">
                    <Box>
                      <IconButton
                        size="small"
                        title="Reagendar"
                        onClick={() => {/* implementar reagendamento */}}
                      >
                        <EventIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="Ver recibo"
                        onClick={() => {/* implementar visualização de recibo */}}
                      >
                        <ReceiptIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={appointments.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Itens por página:"
        />
      </CardContent>
    </Card>
  );
};

export default AppointmentHistory;