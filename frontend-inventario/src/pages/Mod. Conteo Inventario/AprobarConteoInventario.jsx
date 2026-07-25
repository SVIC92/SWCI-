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
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
    listarConteosPendientes,
    listarHistorialConteo,
    aprobarConteo,
    rechazarConteo
} from '../../api/conteoApi';
import LayoutDashboard from '../../components/Layouts/LayoutDashboard';

const ESTADO_LABEL = {
    GENERADA: 'Generada',
    CONTADA: 'Contada',
    APROBADA: 'Aprobada',
    RECHAZADA: 'Rechazada'
};

const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '-';
    const fechaUTC = fechaStr.endsWith('Z') ? fechaStr : fechaStr + 'Z';
    return new Date(fechaUTC).toLocaleString('es-PE', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    });
};

const AprobarConteoInventario = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [pendientes, setPendientes] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [tabActual, setTabActual] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [hojaSeleccionada, setHojaSeleccionada] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, [tabActual]);

    const cargarDatos = async () => {
        try {
            if (tabActual === 0) {
                const res = await listarConteosPendientes();
                setPendientes(res.data);
            } else {
                const res = await listarHistorialConteo();
                setHistorial(res.data);
            }
        } catch (error) {
            console.error("Error cargando datos", error);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabActual(newValue);
    };

    const handleAprobar = async (id) => {
        const result = await Swal.fire({
            title: '¿Aprobar conteo?',
            text: "El stock del sistema se ajustará a lo contado físicamente para cada producto con diferencia.",
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
                await aprobarConteo(id);
                Swal.fire({
                    title: '¡Aprobado!',
                    text: 'El stock fue ajustado exitosamente.',
                    icon: 'success',
                    background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
                    color: theme.palette.text.primary
                });
                cargarDatos();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'No se pudo aprobar el conteo.', 'error');
            }
        }
    };

    const handleRechazar = async (id) => {
        const { value: motivo } = await Swal.fire({
            title: 'Rechazar Conteo',
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
                await rechazarConteo(id, motivo);
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

    const verDetalles = (hoja) => {
        setHojaSeleccionada(hoja);
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setHojaSeleccionada(null);
    };

    const getEstadoChip = (estado) => {
        const colores = {
            APROBADA: 'success',
            RECHAZADA: 'error',
            CONTADA: 'warning',
            GENERADA: 'default'
        };
        return <Chip label={ESTADO_LABEL[estado] || estado} color={colores[estado] || 'default'} size="small" variant="outlined" />;
    };

    const lista = tabActual === 0 ? pendientes : historial;

    return (
        <LayoutDashboard>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Tooltip title="Volver">
                        <IconButton onClick={() => navigate(-1)} color="primary">
                            <ArrowBackIcon />
                        </IconButton>
                    </Tooltip>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Aprobación de Conteos de Inventario
                    </Typography>
                    <Box sx={{ width: 40 }} />
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
                                    <TableCell>Sede</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Fecha Conteo</TableCell>
                                    <TableCell>Contado por</TableCell>
                                    {tabActual === 1 && <TableCell>Estado</TableCell>}
                                    <TableCell align="center">Detalle</TableCell>
                                    <TableCell align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {lista.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                            <Typography color="textSecondary">
                                                No hay registros.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    lista.map((hoja) => (
                                        <TableRow key={hoja.id} hover>
                                            <TableCell>#{hoja.id}</TableCell>
                                            <TableCell>{hoja.nombreSede}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={hoja.tipoConteo === 'SORPRESIVO' ? 'Sorpresivo' : 'Programado'}
                                                    color={hoja.tipoConteo === 'SORPRESIVO' ? 'warning' : 'info'}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>{formatearFecha(hoja.fechaConteo)}</TableCell>
                                            <TableCell>{hoja.nombreContador}</TableCell>

                                            {tabActual === 1 && (
                                                <TableCell>{getEstadoChip(hoja.estado)}</TableCell>
                                            )}

                                            <TableCell align="center">
                                                <Button
                                                    variant="outlined" size="small"
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => verDetalles(hoja)}
                                                >
                                                    Ver
                                                </Button>
                                            </TableCell>

                                            <TableCell align="center">
                                                {tabActual === 0 ? (
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                        <Tooltip title="Aprobar">
                                                            <IconButton color="success" onClick={() => handleAprobar(hoja.id)}>
                                                                <CheckIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Rechazar">
                                                            <IconButton color="error" onClick={() => handleRechazar(hoja.id)}>
                                                                <CancelIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                ) : (
                                                    hoja.estado === 'RECHAZADA' && (
                                                        <Tooltip title="Ver Motivo">
                                                            <IconButton color="info" onClick={() => Swal.fire({
                                                                title: 'Motivo',
                                                                text: hoja.motivoRechazo,
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
                        Detalle de Conteo #{hojaSeleccionada?.id}
                    </DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        {hojaSeleccionada && (
                            <>
                                <Box sx={{
                                    mb: 3, p: 2, borderRadius: 1,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                                }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="subtitle2" color="textSecondary">Sede:</Typography>
                                            <Typography variant="body1" fontWeight="bold">{hojaSeleccionada.nombreSede}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="subtitle2" color="textSecondary">Alcance:</Typography>
                                            <Typography variant="body1" fontWeight="bold">{hojaSeleccionada.alcanceDescripcion || "Toda la Sede"}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="subtitle2" color="textSecondary">Contado por:</Typography>
                                            <Typography variant="body1" fontWeight="bold">{hojaSeleccionada.nombreContador}</Typography>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Typography variant="h6" gutterBottom>Diferencias Encontradas</Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                                                <TableCell>Producto</TableCell>
                                                <TableCell>Código</TableCell>
                                                <TableCell align="right">Stock Sistema</TableCell>
                                                <TableCell align="right">Stock Contado</TableCell>
                                                <TableCell align="right">Diferencia</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {hojaSeleccionada.detalles?.map((det, index) => {
                                                const diferencia = det.stockContado - det.stockSistema;
                                                return (
                                                    <TableRow key={index}>
                                                        <TableCell>{det.nombreProducto}</TableCell>
                                                        <TableCell>{det.skuProducto}</TableCell>
                                                        <TableCell align="right">{det.stockSistema}</TableCell>
                                                        <TableCell align="right">{det.stockContado}</TableCell>
                                                        <TableCell
                                                            align="right"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                color: diferencia === 0
                                                                    ? 'success.main'
                                                                    : diferencia > 0
                                                                    ? 'info.main'
                                                                    : 'error.main'
                                                            }}
                                                        >
                                                            {diferencia > 0 ? `+${diferencia}` : diferencia}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
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
    );
};

export default AprobarConteoInventario;
