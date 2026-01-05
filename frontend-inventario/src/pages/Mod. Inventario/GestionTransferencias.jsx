import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Tabs, Tab, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Button, IconButton,
    Chip, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Grid,
    useTheme, alpha
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    Info as InfoIcon,
    Visibility as VisibilityIcon,
    AddCircleOutline as AddIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { listarPendientes, aprobarTransferencia, rechazarTransferencia, listarHistorial } from '../../api/transferenciaApi';
import LayoutDashboard from '../../components/Layouts/LayoutDashboard';

const GestionTransferencias = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [pendientes, setPendientes] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [tabActual, setTabActual] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, [tabActual]);

    const cargarDatos = async () => {
        try {
            if (tabActual === 0) {
                const res = await listarPendientes();
                setPendientes(res.data);
            } else {
                const res = await listarHistorial();
                setHistorial(res.data);
            }
        } catch (error) {
            console.error("Error cargando datos", error);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabActual(newValue);
    };

    const irASolicitud = () => {
        navigate('/inventario/transferencia/solicitar');
    };

    const handleAprobar = async (id) => {
        const result = await Swal.fire({
            title: '¿Aprobar Transferencia?',
            text: "Se moverá el inventario automáticamente.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: theme.palette.success.main,
            cancelButtonColor: theme.palette.error.main,
            confirmButtonText: 'Sí, aprobar',
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
            color: theme.palette.text.primary
        });

        if (result.isConfirmed) {
            try {
                await aprobarTransferencia(id);
                Swal.fire({
                    title: '¡Aprobar!',
                    text: 'Transferencia exitosa.',
                    icon: 'success',
                    background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
                    color: theme.palette.text.primary
                });
                cargarDatos();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Error.', 'error');
            }
        }
    };

    const handleRechazar = async (id) => {
        const { value: motivo } = await Swal.fire({
            title: 'Rechazar Solicitud',
            input: 'textarea',
            inputLabel: 'Motivo',
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
            color: theme.palette.text.primary,
            confirmButtonColor: theme.palette.error.main,
            showCancelButton: true,
            inputValidator: (value) => !value && '¡Escribe un motivo!'
        });

        if (motivo) {
            try {
                await rechazarTransferencia(id, motivo);
                Swal.fire({
                    title: 'Rechazado',
                    icon: 'success',
                    background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
                    color: theme.palette.text.primary
                });
                cargarDatos();
            } catch (error) {
                Swal.fire('Error', 'No se pudo rechazar.', 'error');
            }
        }
    };

    const verDetalles = (solicitud) => {
        setSolicitudSeleccionada(solicitud);
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setSolicitudSeleccionada(null);
    };

    const getEstadoChip = (estado) => {
        const colores = {
            'APROBADO': 'success',
            'RECHAZADO': 'error',
            'PENDIENTE': 'warning'
        };
        return <Chip label={estado} color={colores[estado] || 'default'} size="small" variant="outlined" />;
    };

    return (
        <>
            <LayoutDashboard>
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Gestión de Transferencias
                        </Typography>

                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={irASolicitud}
                            sx={{ textTransform: 'none', fontWeight: 'bold' }}
                        >
                            Nueva Solicitud
                        </Button>
                    </Box>

                    <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
                        <Tabs
                            value={tabActual}
                            onChange={handleTabChange}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="fullWidth"
                            sx={{ borderBottom: 1, borderColor: 'divider' }}
                        >
                            <Tab label="Pendientes de Aprobación" />
                            <Tab label="Historial Completo" />
                        </Tabs>

                        <TableContainer component={Box} sx={{ maxHeight: 600 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow sx={{
                                        '& th': {
                                            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.action.hover : '#f5f5f5',
                                            fontWeight: 'bold'
                                        }
                                    }}>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Origen</TableCell>
                                        <TableCell>Destino</TableCell>
                                        <TableCell>Solicitante</TableCell>
                                        {tabActual === 1 && <TableCell>Estado</TableCell>}
                                        <TableCell align="center">Items</TableCell>
                                        <TableCell align="center">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(tabActual === 0 ? pendientes : historial).length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                                <Typography color="textSecondary">
                                                    No hay registros.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        (tabActual === 0 ? pendientes : historial).map((sol) => (
                                            <TableRow key={sol.id} hover>
                                                <TableCell>#{sol.id}</TableCell>
                                                <TableCell>
                                                    {new Date(
                                                        sol.fechaSolicitud.endsWith('Z') ? sol.fechaSolicitud : sol.fechaSolicitud + 'Z'
                                                    ).toLocaleString('es-PE', {
                                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit', hour12: true
                                                    })}
                                                </TableCell>
                                                <TableCell>{sol.sedeOrigen?.nombreSede}</TableCell>
                                                <TableCell>{sol.sedeDestino?.nombreSede}</TableCell>
                                                <TableCell>{sol.usuarioSolicitante?.nombre_u}</TableCell>

                                                {tabActual === 1 && (
                                                    <TableCell>{getEstadoChip(sol.estado)}</TableCell>
                                                )}

                                                <TableCell align="center">
                                                    <Button
                                                        variant="outlined" size="small"
                                                        startIcon={<VisibilityIcon />}
                                                        onClick={() => verDetalles(sol)}
                                                    >
                                                        Ver
                                                    </Button>
                                                </TableCell>

                                                <TableCell align="center">
                                                    {tabActual === 0 ? (
                                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                            <Tooltip title="Aprobar">
                                                                <IconButton color="success" onClick={() => handleAprobar(sol.id)}>
                                                                    <CheckIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Rechazar">
                                                                <IconButton color="error" onClick={() => handleRechazar(sol.id)}>
                                                                    <CancelIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    ) : (
                                                        sol.estado === 'RECHAZADO' && (
                                                            <Tooltip title="Ver Motivo">
                                                                <IconButton color="info" onClick={() => Swal.fire({
                                                                    title: 'Motivo',
                                                                    text: sol.motivoRechazo,
                                                                    background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
                                                                    color: theme.palette.text.primary
                                                                })}>
                                                                    <InfoIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    <Dialog
                        open={modalOpen}
                        onClose={cerrarModal}
                        maxWidth="md"
                        fullWidth
                    >
                        <DialogTitle sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            bgcolor: theme.palette.background.default
                        }}>
                            Detalles de Solicitud #{solicitudSeleccionada?.id}
                        </DialogTitle>
                        <DialogContent sx={{ mt: 2 }}>
                            {solicitudSeleccionada && (
                                <>
                                    <Box sx={{
                                        mb: 3, p: 2, borderRadius: 1,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                                    }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2" color="textSecondary">Desde:</Typography>
                                                <Typography variant="body1" fontWeight="bold">{solicitudSeleccionada.sedeOrigen?.nombreSede}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2" color="textSecondary">Hacia:</Typography>
                                                <Typography variant="body1" fontWeight="bold">{solicitudSeleccionada.sedeDestino?.nombreSede}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    <Typography variant="h6" gutterBottom>Productos Solicitados</Typography>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                                                    <TableCell>Producto</TableCell>
                                                    <TableCell>Código</TableCell>
                                                    <TableCell align="right">Cantidad</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {solicitudSeleccionada.detalles?.map((det, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{det.producto?.nombre}</TableCell>
                                                        <TableCell>{det.producto?.sku}</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{det.cantidad}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={cerrarModal} color="inherit">
                                Cerrar
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Container>
            </LayoutDashboard>
        </>
    );
};

export default GestionTransferencias;