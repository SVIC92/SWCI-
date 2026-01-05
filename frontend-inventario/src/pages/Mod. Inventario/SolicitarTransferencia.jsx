import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Grid, TextField, MenuItem, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Card, CardContent, Divider, Box, Tooltip,
    useTheme
} from '@mui/material';
import {
    AddCircle as AddIcon,
    Delete as DeleteIcon,
    Send as SendIcon,
    Inventory as InventoryIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

import { getSedes } from '../../api/sedeApi';
import { getProductos } from '../../api/productoApi';
import { solicitarTransferencia } from '../../api/transferenciaApi';
import LayoutDashboard from '../../components/Layouts/LayoutDashboard';

const SolicitarTransferencia = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [sedes, setSedes] = useState([]);
    const [productos, setProductos] = useState([]);

    const [cabecera, setCabecera] = useState({
        sedeOrigen: '',
        sedeDestino: ''
    });

    const [itemActual, setItemActual] = useState({
        productoId: '',
        cantidad: ''
    });

    const [listaProductos, setListaProductos] = useState([]);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resSedes, resProductos] = await Promise.all([
                    getSedes(),
                    getProductos()
                ]);

                const listaSedes = Array.isArray(resSedes) ? resSedes : (resSedes?.data || []);
                const listaProductos = Array.isArray(resProductos) ? resProductos : (resProductos?.data || []);

                setSedes(listaSedes);
                setProductos(listaProductos);

            } catch (error) {
                console.error("Error cargando datos:", error);
                setSedes([]);
                setProductos([]);
                Swal.fire('Error', 'No se pudieron cargar las listas necesarias', 'error');
            }
        };
        cargarDatos();
    }, []);

    const handleCabeceraChange = (e) => {
        setCabecera({ ...cabecera, [e.target.name]: e.target.value });
    };

    const handleItemChange = (e) => {
        setItemActual({ ...itemActual, [e.target.name]: e.target.value });
    };

    const agregarAlCarrito = () => {
        if (!itemActual.productoId) {
            Swal.fire('Atención', 'Selecciona un producto', 'warning');
            return;
        }
        if (!itemActual.cantidad || parseInt(itemActual.cantidad) <= 0) {
            Swal.fire('Atención', 'La cantidad debe ser mayor a 0', 'warning');
            return;
        }

        if (listaProductos.find(item => item.productoId === itemActual.productoId)) {
            Swal.fire('Duplicado', 'Este producto ya está en la lista', 'info');
            return;
        }

        const productoInfo = productos.find(p => p.id_producto === itemActual.productoId) || {};

        const nuevoItem = {
            productoId: itemActual.productoId,
            nombre: productoInfo.nombre || 'Desconocido',
            codigo: productoInfo.sku || '---',
            cantidad: parseInt(itemActual.cantidad)
        };

        setListaProductos([...listaProductos, nuevoItem]);
        setItemActual({ productoId: '', cantidad: '' });
    };

    const eliminarDelCarrito = (index) => {
        const nuevaLista = listaProductos.filter((_, i) => i !== index);
        setListaProductos(nuevaLista);
    };

    const enviarSolicitud = async () => {
        if (!cabecera.sedeOrigen || !cabecera.sedeDestino) {
            Swal.fire('Faltan Datos', 'Selecciona la Sede de Origen y Destino', 'warning');
            return;
        }
        if (cabecera.sedeOrigen === cabecera.sedeDestino) {
            Swal.fire('Error', 'La sede de origen y destino no pueden ser la misma', 'error');
            return;
        }
        if (listaProductos.length === 0) {
            Swal.fire('Lista Vacía', 'Agrega al menos un producto a la transferencia', 'warning');
            return;
        }

        const payload = {
            sedeOrigenId: cabecera.sedeOrigen,
            sedeDestinoId: cabecera.sedeDestino,
            items: listaProductos.map(item => ({
                productoId: item.productoId,
                cantidad: item.cantidad
            }))
        };

        try {
            await solicitarTransferencia(payload);

            await Swal.fire({
                title: '¡Solicitud Enviada!',
                text: 'La transferencia ha sido registrada y está pendiente de aprobación.',
                icon: 'success',
                confirmButtonText: 'Ir al Historial'
            });

            navigate('/inventario/transferencia/gestion');

        } catch (error) {
            console.error(error);
            Swal.fire('Error', error.response?.data?.message || 'No se pudo registrar la solicitud', 'error');
        }
    };

    return (
        <LayoutDashboard>
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        bgcolor: 'background.paper',
                        borderRadius: 2
                    }}
                >
                    <Box display="flex" alignItems="center" mb={3}>
                        <Tooltip title="Volver">
                            <IconButton
                                onClick={() => navigate("/dashboard-sedes")}
                                sx={{ mr: 2, color: 'text.secondary' }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                        </Tooltip>
                        <InventoryIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                        <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
                            Nueva Transferencia
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Card
                        variant="outlined"
                        sx={{
                            mb: 3,
                            bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f9f9f9'
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="textSecondary">
                                Datos de Traslado
                            </Typography>
                            {/* CAMBIO: Grid container con full width */}
                            <Grid container spacing={2}>
                                {/* Sede Origen: xs=12 para que ocupe toda la fila */}
                                <Grid item xs={12}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Sede Origen (Desde)"
                                        name="sedeOrigen"
                                        value={cabecera.sedeOrigen}
                                        onChange={handleCabeceraChange}
                                        variant="outlined"
                                        // Forzamos un minWidth para evitar el colapso visual
                                        sx={{ minWidth: 200 }}
                                    >
                                        {sedes.map((sede) => (
                                            <MenuItem key={sede.idSede} value={sede.idSede}>
                                                {sede.nombreSede}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                {/* Sede Destino: xs=12 para que ocupe toda la fila */}
                                <Grid item xs={12}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Sede Destino (Hacia)"
                                        name="sedeDestino"
                                        value={cabecera.sedeDestino}
                                        onChange={handleCabeceraChange}
                                        variant="outlined"
                                        sx={{ minWidth: 200 }}
                                    >
                                        {sedes.map((sede) => (
                                            <MenuItem key={sede.idSede} value={sede.idSede}>
                                                {sede.nombreSede}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Fila de Selección de Producto */}
                    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Seleccionar Producto"
                                name="productoId"
                                value={itemActual.productoId}
                                onChange={handleItemChange}
                                size="small"
                                // Esto arregla el problema de la "caja diminuta"
                                sx={{ minWidth: 200 }}
                            >
                                {productos.map((prod) => (
                                    <MenuItem key={prod.id_producto} value={prod.id_producto}>
                                        {prod.sku} - {prod.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                type="number"
                                fullWidth
                                label="Cantidad"
                                name="cantidad"
                                value={itemActual.cantidad}
                                onChange={handleItemChange}
                                size="small"
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Button
                                variant="contained"
                                color="secondary"
                                fullWidth
                                startIcon={<AddIcon />}
                                onClick={agregarAlCarrito}
                                sx={{ height: 40 }} // Altura fija para alinear con inputs
                            >
                                Agregar
                            </Button>
                        </Grid>
                    </Grid>

                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
                        <Table size="small">
                            <TableHead sx={{
                                bgcolor: theme.palette.mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.05)'
                                    : '#eee'
                            }}>
                                <TableRow>
                                    <TableCell><strong>Producto</strong></TableCell>
                                    <TableCell><strong>SKU</strong></TableCell>
                                    <TableCell align="center"><strong>Cantidad</strong></TableCell>
                                    <TableCell align="center"><strong>Acción</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {listaProductos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                            <Typography variant="body2" color="textSecondary">
                                                No hay productos agregados.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    listaProductos.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.nombre}</TableCell>
                                            <TableCell>{item.codigo}</TableCell>
                                            <TableCell align="center">{item.cantidad}</TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Eliminar">
                                                    <IconButton size="small" color="error" onClick={() => eliminarDelCarrito(index)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box display="flex" justifyContent="flex-end">
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={<SendIcon />}
                            onClick={enviarSolicitud}
                            disabled={listaProductos.length === 0}
                        >
                            Confirmar Solicitud
                        </Button>
                    </Box>

                </Paper>
            </Container>
        </LayoutDashboard>
    );
};

export default SolicitarTransferencia;