import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSugerenciasReabastecimiento } from '../../api/productoApi';
import {
    Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, Alert, Chip, Box
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const WidgetReabastecimiento = ({ idSede }) => {
    const { data: sugerencias = [], isLoading, isError } = useQuery({
        queryKey: ['sugerenciasReabastecimiento', idSede],
        queryFn: () => getSugerenciasReabastecimiento(idSede),
        enabled: !!idSede,
    });

    if (!idSede) return <Alert severity="info">Seleccione una sede para ver alertas de stock.</Alert>;
    if (isLoading) return <Typography>Cargando sugerencias...</Typography>;
    if (isError) return <Alert severity="error">Error al cargar sugerencias.</Alert>;

    if (sugerencias.length === 0) {
        return (
            <Paper
                sx={{
                    p: 2,
                    textAlign: 'center',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 0
                }}
            >
                <Typography variant="h6" color="success.main">¡Todo en orden!</Typography>
                <Typography variant="body2" color="text.secondary">
                    No hay productos con stock crítico en esta sede.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper
            sx={{
                p: 2,
                mt: 2,
                bgcolor: 'background.paper',
                backgroundImage: 'none', // Evita el overlay blanco en modo oscuro
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',  // Borde sutil para contraste en modo oscuro
                boxShadow: 1 // Sombra suave para modo claro
            }}
        >
            <Box display="flex" alignItems="center" mb={2}>
                <WarningAmberIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" color="text.primary">
                    Sugerencias de Compra (Stock Crítico)
                </Typography>
            </Box>

            <TableContainer sx={{ maxHeight: 300 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            {/* bgcolor en header para que al hacer scroll no sea transparente */}
                            <TableCell sx={{ bgcolor: 'background.paper' }}>Producto</TableCell>
                            <TableCell align="center" sx={{ bgcolor: 'background.paper' }}>Actual</TableCell>
                            <TableCell align="center" sx={{ bgcolor: 'background.paper' }}>Ideal</TableCell>
                            <TableCell align="center" sx={{ bgcolor: 'background.paper' }}>A Comprar</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sugerencias.map((item) => (
                            <TableRow key={item.idProducto} hover>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="bold" color="text.primary">
                                        {item.nombre}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {item.proveedor}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Chip label={item.stockActual} color="error" size="small" />
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2" color="text.primary">
                                        {item.stockIdeal}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography color="primary.main" fontWeight="bold">
                                        +{item.cantidadSugerida}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default WidgetReabastecimiento;