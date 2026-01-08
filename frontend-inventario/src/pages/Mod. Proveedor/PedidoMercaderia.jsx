import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { alpha } from "@mui/material/styles";

// APIs
import { getHuDisponibles, solicitarHu } from "../../api/huApi";
import { getSedes } from "../../api/sedeApi";

// Componentes UI
import {
    Box,
    Typography,
    Chip,
    Tooltip,
    IconButton,
    Drawer,
    Button,
    TextField,
    MenuItem,
    Stack,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from "@mui/material";

import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import StoreIcon from "@mui/icons-material/Store";
import EventIcon from "@mui/icons-material/Event";
import InfoIcon from "@mui/icons-material/Info";

import TablaLista from "../../components/TablaLista";

const MySwal = withReactContent(Swal);

const PedidoMercaderia = () => {
    const queryClient = useQueryClient();

    // --- Estados para Solicitud (Drawer) ---
    const [openDrawer, setOpenDrawer] = useState(false);
    const [huSeleccionada, setHuSeleccionada] = useState(null);
    const [idSedeDestino, setIdSedeDestino] = useState("");
    const [fechaSolicitada, setFechaSolicitada] = useState("");

    // --- Estados para Detalle (Modal) ---
    const [openDetalle, setOpenDetalle] = useState(false);
    const [detalleData, setDetalleData] = useState(null);

    // --- Queries ---
    const {
        data: hus = [],
        isLoading: loadingHus,
        refetch
    } = useQuery({
        queryKey: ["huDisponibles"],
        queryFn: () => getHuDisponibles(),
    });

    const { data: sedes = [] } = useQuery({
        queryKey: ["sedes"],
        queryFn: getSedes,
    });

    // --- Mutación Solicitud ---
    const solicitarMutation = useMutation({
        mutationFn: (payload) => solicitarHu(huSeleccionada.id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries(["huDisponibles"]);
            handleCloseDrawer();
            const isDark = document.body.classList.contains('dark-mode');
            MySwal.fire({
                title: "¡Pedido Enviado!",
                text: `La HU ${huSeleccionada?.codHu} ha sido solicitada correctamente.`,
                icon: "success",
                timer: 3000,
                showConfirmButton: false,
                background: isDark ? '#1e1e1e' : '#fff',
                color: isDark ? '#fff' : '#545454'
            });
        },
        onError: (err) => {
            const msg = err.response?.data?.message || "Error al procesar la solicitud";
            MySwal.fire("Error", msg, "error");
        }
    });

    // --- Manejadores ---

    const handleClickSolicitar = (huRow) => {
        setHuSeleccionada(huRow);
        setOpenDrawer(true);
        setIdSedeDestino("");
        setFechaSolicitada("");
    };

    const handleCloseDrawer = () => {
        setOpenDrawer(false);
        setTimeout(() => setHuSeleccionada(null), 200);
    };

    // Nuevo: Ver Detalle
    const handleVerDetalle = (huRow) => {
        setDetalleData(huRow);
        setOpenDetalle(true);
    };

    const handleCloseDetalle = () => {
        setOpenDetalle(false);
        setTimeout(() => setDetalleData(null), 200);
    };

    const handleConfirmarPedido = () => {
        if (!idSedeDestino || !fechaSolicitada) {
            MySwal.fire("Faltan datos", "Por favor seleccione la sede de destino y la fecha de entrega.", "warning");
            return;
        }
        const payload = {
            idSedeDestino: idSedeDestino,
            fechaSolicitada: fechaSolicitada,
        };
        solicitarMutation.mutate(payload);
    };

    const getStatusColor = (estado) => {
        switch (estado) {
            case "COMPLETO": return "success";
            case "DISPONIBLE": return "success";
            case "EN_CONSTRUCCION": return "info";
            case "QUIEBRE": return "error";
            default: return "default";
        }
    };

    // --- Definición de Columnas ---
    const columns = [
        { field: "codHu", headerName: "Código HU", width: 140, renderCell: (p) => <b>{p.value}</b> },
        { field: "almacen", headerName: "Almacén Origen", width: 180, valueGetter: (value, row) => row?.almacen?.nombreSede || "N/A" },
        { field: "tipoIndicador", headerName: "Tipo Carga", width: 130 },
        {
            field: "fechaVencimiento", headerName: "Vencimiento", width: 120,
            valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : "---"
        },
        {
            field: "estado", headerName: "Estado", width: 140,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={getStatusColor(params.value)}
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: "bold" }}
                />
            )
        },
        {
            field: "acciones",
            headerName: "Acciones", // Cambié el nombre para ser más genérico
            type: "actions",
            width: 120, // Aumenté un poco el ancho
            getActions: (params) => {
                const puedePedir = params.row.estado === "COMPLETO" || params.row.estado === "QUIEBRE";

                return [
                    // Botón 1: Ver Información (Nuevo)
                    <Tooltip title="Ver contenido y detalles">
                        <IconButton
                            onClick={() => handleVerDetalle(params.row)}
                            sx={(theme) => ({
                                color: theme.palette.info.main,
                                '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.1) }
                            })}
                        >
                            <InfoIcon />
                        </IconButton>
                    </Tooltip>,

                    // Botón 2: Pedir (Carrito)
                    <Tooltip title={puedePedir ? "Pedir esta HU" : "No disponible"}>
                        <span>
                            <IconButton
                                color="primary"
                                disabled={!puedePedir}
                                onClick={() => handleClickSolicitar(params.row)}
                                sx={(theme) => ({
                                    bgcolor: puedePedir ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                    '&:hover': { bgcolor: puedePedir ? alpha(theme.palette.primary.main, 0.2) : 'transparent' }
                                })}
                            >
                                <AddShoppingCartIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                ];
            }
        }
    ];

    return (
        <>
            <TablaLista
                title="Mercadería Disponible"
                subtitle="Seleccione las paletas disponibles en almacén central"
                columns={columns}
                data={hus}
                isLoading={loadingHus}
                onRefresh={refetch}
                getRowId={(row) => row.id}
            />

            {/* --- MODAL DE DETALLE (Información) --- */}
            <Dialog
                open={openDetalle}
                onClose={handleCloseDetalle}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: "background.paper", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <InfoIcon color="info" />
                        <Typography variant="h6">Detalle de Paleta: {detalleData?.codHu}</Typography>
                    </Box>
                    <IconButton onClick={handleCloseDetalle} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ bgcolor: "background.default" }}>
                    {/* Datos Generales */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="caption" color="text.secondary">Almacén de Origen</Typography>
                            <Typography variant="body1" fontWeight="bold">
                                {detalleData?.almacen?.nombreSede || "---"}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="caption" color="text.secondary">Tipo de Carga</Typography>
                            <Typography variant="body1" fontWeight="bold">
                                {detalleData?.tipoIndicador}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="caption" color="text.secondary">Estado</Typography>
                            <Box>
                                <Chip
                                    label={detalleData?.estado}
                                    color={getStatusColor(detalleData?.estado)}
                                    size="small"
                                    variant="outlined"
                                />
                            </Box>
                        </Grid>
                    </Grid>

                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                        Lista de Productos
                    </Typography>

                    {/* Tabla de Productos dentro del Modal */}
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead sx={(theme) => ({ bgcolor: theme.palette.action.hover })}>
                                <TableRow>
                                    <TableCell><strong>SKU</strong></TableCell>
                                    <TableCell><strong>Producto</strong></TableCell>
                                    <TableCell align="center"><strong>Cantidad</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* Asumimos que el backend devuelve un array 'detalles' dentro del objeto HU. 
                                    Si no es así, tendrías que hacer una query extra aquí. */}
                                {detalleData?.detalle && detalleData.detalle.length > 0 ? (
                                    detalleData.detalle.map((det, index) => (
                                        <TableRow key={index}>
                                            {/* Ajusta 'det.producto.sku' según tu estructura real */}
                                            <TableCell>{det.producto?.sku || "---"}</TableCell>
                                            <TableCell>{det.producto?.nombre || "Producto desconocido"}</TableCell>
                                            <TableCell align="center">
                                                <Typography fontWeight="bold">{det.cantidad}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center" sx={{ py: 3, color: "text.secondary" }}>
                                            No hay detalles de productos disponibles.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>

                <DialogActions sx={{ bgcolor: "background.paper", p: 2 }}>
                    <Button onClick={handleCloseDetalle} color="inherit" variant="outlined">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- DRAWER LATERAL (Solicitud) --- */}
            <Drawer
                anchor="right"
                open={openDrawer}
                onClose={handleCloseDrawer}
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1000,
                }}
                PaperProps={{
                    sx: {
                        width: { xs: "100%", sm: 400 },
                        p: 0,
                        boxShadow: (theme) => theme.shadows[10],
                    }
                }}
            >
                {/* ... (Todo el contenido de tu Drawer anterior se mantiene igual) ... */}
                {/* Cabecera */}
                <Box sx={{ p: 3, bgcolor: "primary.main", color: "primary.contrastText", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <AddShoppingCartIcon />
                        <Typography variant="h6" fontWeight="bold">
                            Confirmar Pedido
                        </Typography>
                    </Box>
                    <IconButton onClick={handleCloseDrawer} sx={{ color: "inherit" }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3, flex: 1, overflowY: "auto" }}>
                    {/* Resumen */}
                    <Box sx={(theme) => ({
                        bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : '#f5f5f5',
                        p: 2, borderRadius: 2, border: 1, borderColor: 'divider'
                    })}>
                        <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight="bold">
                            Paleta Seleccionada
                        </Typography>
                        <Typography variant="h5" color="primary.main" fontWeight="bold" sx={{ mt: 0.5 }}>
                            {huSeleccionada?.codHu}
                        </Typography>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack spacing={1}>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">Origen:</Typography>
                                <Chip label={huSeleccionada?.almacen?.nombreSede} size="small" variant="outlined" icon={<StoreIcon />} />
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">Tipo:</Typography>
                                <Chip label={huSeleccionada?.tipoIndicador || "Estándar"} size="small" />
                            </Box>
                        </Stack>
                    </Box>

                    <Divider>DATOS DE ENVÍO</Divider>

                    <Box display="flex" alignItems="flex-end" gap={2}>
                        <StoreIcon color="action" sx={{ mb: 0.5 }} />
                        <TextField
                            select
                            fullWidth
                            variant="standard"
                            label="Sede de Destino"
                            value={idSedeDestino}
                            onChange={(e) => setIdSedeDestino(e.target.value)}
                            helperText="Seleccione la tienda que recibe"
                            SelectProps={{
                                MenuProps: { sx: { zIndex: (theme) => theme.zIndex.drawer + 1002 } }
                            }}
                        >
                            {sedes.map((sede) => (
                                <MenuItem key={sede.idSede} value={sede.idSede}>
                                    {sede.nombreSede}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    <Box display="flex" alignItems="flex-end" gap={2}>
                        <EventIcon color="action" sx={{ mb: 0.5 }} />
                        <TextField
                            type="datetime-local"
                            fullWidth
                            variant="standard"
                            label="Fecha Requerida de Entrega"
                            InputLabelProps={{ shrink: true }}
                            value={fechaSolicitada}
                            onChange={(e) => setFechaSolicitada(e.target.value)}
                            helperText="¿Cuándo necesita la mercadería?"
                        />
                    </Box>
                </Box>

                <Box sx={(theme) => ({
                    p: 3, borderTop: 1, borderColor: 'divider',
                    bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#fafafa'
                })}>
                    <Button
                        fullWidth variant="contained" size="large" startIcon={<SendIcon />}
                        onClick={handleConfirmarPedido} disabled={solicitarMutation.isPending}
                        sx={{ py: 1.5, mb: 1.5, fontWeight: "bold" }}
                    >
                        {solicitarMutation.isPending ? "Procesando..." : "Confirmar Pedido"}
                    </Button>
                    <Button
                        fullWidth variant="outlined" color="inherit" onClick={handleCloseDrawer}
                        sx={{ borderColor: 'divider' }}
                    >
                        Cancelar
                    </Button>
                </Box>
            </Drawer>
        </>
    );
};

export default PedidoMercaderia;