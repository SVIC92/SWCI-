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
    AddCircleOutline as AddIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
    listarDevolucionesPendientes,
    aprobarDevolucion,
    rechazarDevolucion,
    listarHistorialDevoluciones
} from '../../api/devolucionApi';
import LayoutDashboard from '../../components/Layouts/LayoutDashboard';

const destinoTexto = (sol) =>
    sol?.tipoDestino === 'PROVEEDOR'
        ? `Proveedor: ${sol.proveedor?.nombre_proveedor ?? '-'}`
        : `Sede: ${sol?.sedeDestino?.nombreSede ?? '-'}`;

const ESTADO_LABEL = {
    PENDIENTE: 'Solicitado',
    APROBADO: 'Aprobado',
    RECHAZADO: 'Rechazado'
};

const GestionDevoluciones = () => {
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
                const res = await listarDevolucionesPendientes();
                setPendientes(res.data);
            } else {
                const res = await listarHistorialDevoluciones();
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
        navigate('/devolucion-mercaderia');
    };

    const handleAprobar = async (id) => {
        const result = await Swal.fire({
            title: '¿Aprobar devolución?',
            text: "Se descontará el stock de la sede que devuelve (y se sumará a la sede destino si corresponde). Quedará en el Kardex.",
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
                await aprobarDevolucion(id);
                Swal.fire({
                    title: '¡Aprobada!',
                    text: 'Devolución ejecutada exitosamente.',
                    icon: 'success',
                    background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
                    color: theme.palette.text.primary
                });
                cargarDatos();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'No se pudo aprobar la solicitud.', 'error');
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
                await rechazarDevolucion(id, motivo);
                Swal.fire({
                    title: 'Rechazada',
                    icon: 'success',
                    background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
                    color: theme.palette.text.primary
                });
                cargarDatos();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'No se pudo rechazar.', 'error');
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
        return <Chip label={ESTADO_LABEL[estado] || estado} color={colores[estado] || 'default'} size="small" variant="outlined" />;
    };

    return (
        <>
            <LayoutDashboard>
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Tooltip title="Volver">
                            <IconButton onClick={() => navigate(-1)} color="primary">
                                <ArrowBackIcon />
                            </IconButton>
                        </Tooltip>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Aprobación de Devoluciones
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
                            <Tab label="Solicitadas (Pendientes)" />
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
                                        <TableCell>Sede que devuelve</TableCell>
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
                                                <TableCell>{destinoTexto(sol)}</TableCell>
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
                            Detalles de Devolución #{solicitudSeleccionada?.id}
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
                                                <Typography variant="subtitle2" color="textSecondary">Sede que devuelve:</Typography>
                                                <Typography variant="body1" fontWeight="bold">{solicitudSeleccionada.sedeOrigen?.nombreSede}</Typography>
                                                <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>Destino:</Typography>
                                                <Typography variant="body1" fontWeight="bold">{destinoTexto(solicitudSeleccionada)}</Typography>
                                                {solicitudSeleccionada.referencia && (
                                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Ref: {solicitudSeleccionada.referencia}</Typography>
                                                )}
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2" color="textSecondary">Estado:</Typography>
                                                {getEstadoChip(solicitudSeleccionada.estado)}
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    <Typography variant="h6" gutterBottom>Productos a Devolver</Typography>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                                                    <TableCell>Producto</TableCell>
                                                    <TableCell>Código</TableCell>
                                                    <TableCell align="right">Cantidad</TableCell>
                                                    <TableCell>Motivo</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {solicitudSeleccionada.detalles?.map((det, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{det.producto?.nombre}</TableCell>
                                                        <TableCell>{det.producto?.sku}</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{det.cantidad}</TableCell>
                                                        <TableCell>{det.motivo}</TableCell>
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

export default GestionDevoluciones;
