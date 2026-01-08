import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { getHuById, updateHu } from "../../api/huApi";
import { getProductos } from "../../api/productoApi";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Button,
    Autocomplete,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Divider,
    MenuItem,
    Chip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import LayoutDashboard from "../../components/Layouts/LayoutDashboard";

const MySwal = withReactContent(Swal);

const ActualizarHu = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [cantidad, setCantidad] = useState("");
    const [nuevosDetalles, setNuevosDetalles] = useState([]);
    const [nuevoEstado, setNuevoEstado] = useState("");
    const [nuevoTipo, setNuevoTipo] = useState(""); // Estado para tipo de carga
    const [nuevaFechaVencimiento, setNuevaFechaVencimiento] = useState(""); // Estado para fecha de vencimiento

    const [datosCargados, setDatosCargados] = useState(false);

    // --- 1. CARGA DE DATOS ---
    const { data: huData, isLoading: isLoadingHu } = useQuery({
        queryKey: ["hu", id],
        queryFn: () => getHuById(id),
    });

    const { data: productosData, isLoading: isLoadingProductos } = useQuery({
        queryKey: ["productos"],
        queryFn: getProductos,
    });

    const listaProductos = productosData || [];
    useEffect(() => {
        if (huData && !datosCargados) {
            if (huData.estado) setNuevoEstado(huData.estado);
            if (huData.tipoIndicador) setNuevoTipo(huData.tipoIndicador); // Cargar tipo
            if (huData.fechaVencimiento) setNuevaFechaVencimiento(huData.fechaVencimiento); // Cargar fecha
            const listaBackend = huData.detalle || [];

            if (listaBackend.length > 0) {
                const detallesFormateados = listaBackend.map(d => ({
                    idProducto: d.producto.id_producto,
                    nombreProducto: d.producto.nombre,
                    sku: d.producto.sku,
                    cantidad: d.cantidad
                }));
                setNuevosDetalles(detallesFormateados);
            }

            // Marcamos como cargado para que no se sobrescriban cambios futuros
            setDatosCargados(true);
        }
    }, [huData, datosCargados]);
    const updateHuMutation = useMutation({
        mutationFn: (payload) => updateHu(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries(["hus"]);
            queryClient.invalidateQueries(["hu", id]);

            const isDark = document.body.classList.contains('dark-mode') || document.body.getAttribute('data-theme') === 'dark';

            MySwal.fire({
                title: "Actualizado",
                text: "La HU se ha actualizado correctamente",
                icon: "success",
                background: isDark ? '#1e1e1e' : '#fff',
                color: isDark ? '#fff' : '#545454'
            }).then(() => {
                navigate("/hu/gestion");
            });
        },
        onError: (err) => {
            MySwal.fire("Error", "No se pudo actualizar la HU", "error");
            console.error(err);
        },
    });

    const handleAgregarProducto = () => {
        if (!productoSeleccionado || !cantidad || Number(cantidad) <= 0) {
            MySwal.fire("Atención", "Seleccione un producto y una cantidad válida", "warning");
            return;
        }

        const cantAAgregar = parseInt(cantidad, 10);

        // Buscar si ya existe en la lista local
        const indexExistente = nuevosDetalles.findIndex(d => d.idProducto === productoSeleccionado.id_producto);

        if (indexExistente >= 0) {
            // SUMAR
            const listaActualizada = [...nuevosDetalles];
            listaActualizada[indexExistente].cantidad += cantAAgregar;
            setNuevosDetalles(listaActualizada);

            const isDark = document.body.classList.contains('dark-mode');
            MySwal.fire({
                icon: 'success',
                title: 'Cantidad Actualizada',
                text: `Se sumaron ${cantAAgregar} unidades.`,
                timer: 1500,
                showConfirmButton: false,
                background: isDark ? '#1e1e1e' : '#fff',
                color: isDark ? '#fff' : '#545454'
            });
        } else {
            // AGREGAR
            const nuevoDetalle = {
                idProducto: productoSeleccionado.id_producto,
                nombreProducto: productoSeleccionado.nombre,
                sku: productoSeleccionado.sku,
                cantidad: cantAAgregar,
            };
            setNuevosDetalles([...nuevosDetalles, nuevoDetalle]);
        }

        setProductoSeleccionado(null);
        setCantidad("");
    };
    const handleUpdateCantidadFila = (idProducto, delta) => {
        setNuevosDetalles(currentDetails =>
            currentDetails.map(item => {
                if (item.idProducto === idProducto) {
                    const nuevaCantidad = Math.max(1, item.cantidad + delta);
                    return { ...item, cantidad: nuevaCantidad };
                }
                return item;
            })
        );
    };

    const handleEliminarFila = (idProducto) => {
        setNuevosDetalles(nuevosDetalles.filter((item) => item.idProducto !== idProducto));
    };

    const handleGuardar = () => {
        const payload = {
            tipoIndicador: nuevoTipo,
            fechaVencimiento: nuevaFechaVencimiento || null,
            estado: nuevoEstado,
            detalles: nuevosDetalles
        };

        updateHuMutation.mutate(payload);
    };

    if (isLoadingHu) return <Typography sx={{ p: 3 }}>Cargando información de HU...</Typography>;

    return (
        <LayoutDashboard>
            {/* CAMBIO 1: width 100% para llenar la pantalla */}
            <Box sx={{ p: 3, width: "100%", boxSizing: "border-box" }}>

                {/* Encabezado */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate("/hu/gestion")}
                        variant="outlined"
                    >
                        Volver
                    </Button>
                    <Typography variant="h5" fontWeight="bold">
                        Actualizar HU: {huData?.codHu}
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* CAMBIO 2: Reducimos el panel izquierdo a md={3} */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={3} sx={{ height: "100%" }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Información General</Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="textSecondary">Almacén Origen</Typography>
                                    <Typography variant="body1">{huData?.almacen?.nombreSede || "N/A"}</Typography>
                                </Box>

                                {/* Campo Editable: Tipo Indicador */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        select
                                        label="Tipo de Carga"
                                        fullWidth
                                        size="small"
                                        value={nuevoTipo}
                                        onChange={(e) => setNuevoTipo(e.target.value)}
                                    >
                                        <MenuItem value="Estándar">Estándar</MenuItem>
                                        <MenuItem value="Frágil">Frágil</MenuItem>
                                        <MenuItem value="Refrigerado">Refrigerado</MenuItem>
                                        <MenuItem value="Alto Valor">Alto Valor</MenuItem>
                                        <MenuItem value="Medio HU">Medio HU</MenuItem>
                                        <MenuItem value="Mixto">Mixto</MenuItem>
                                        <MenuItem value="Monoproducto">Monoproducto</MenuItem>
                                    </TextField>
                                </Box>

                                {/* Campo Editable: Fecha Vencimiento */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        label="Fecha Vencimiento"
                                        type="date"
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                        value={nuevaFechaVencimiento}
                                        onChange={(e) => setNuevaFechaVencimiento(e.target.value)}
                                    />
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" color="textSecondary">Estado Actual</Typography>
                                    <Chip label={huData?.estado} color="primary" variant="outlined" sx={{ mt: 0.5 }} />
                                </Box>

                                <Typography variant="h6" gutterBottom color="primary">Cambiar Estado</Typography>
                                <TextField
                                    select
                                    label="Nuevo Estado"
                                    fullWidth
                                    value={nuevoEstado}
                                    onChange={(e) => setNuevoEstado(e.target.value)}
                                    helperText="Seleccione para cambiar el estado actual"
                                >
                                    <MenuItem value="EN_CONSTRUCCION">EN CONSTRUCCIÓN</MenuItem>
                                    <MenuItem value="COMPLETO">COMPLETO</MenuItem>
                                    <MenuItem value="QUIEBRE">QUIEBRE (Faltantes)</MenuItem>
                                    <MenuItem value="DISPONIBLE">DISPONIBLE</MenuItem>
                                </TextField>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* CAMBIO 3: Aumentamos el panel derecho a md={9} para que use el espacio sobrante */}
                    <Grid item xs={12} md={24}>
                        <Card elevation={3} sx={{ height: "100%" , width: "190%"}}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Contenido de la Paleta</Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                    Gestione los productos contenidos en esta HU.
                                </Typography>
                                <Divider sx={{ mb: 3 }} />

                                {/* Formulario de Adición */}
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={6} sx={{ width: "50%" }}>
                                        <Autocomplete
                                            options={listaProductos}
                                            getOptionLabel={(option) => `${option.nombre} (SKU: ${option.sku || 'N/A'})`}
                                            value={productoSeleccionado}
                                            onChange={(event, newValue) => setProductoSeleccionado(newValue)}
                                            loading={isLoadingProductos}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Buscar Producto" variant="outlined" size="small" />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <TextField
                                            label="Cantidad"
                                            type="number"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            value={cantidad}
                                            onChange={(e) => setCantidad(e.target.value)}
                                            InputProps={{ inputProps: { min: 1 } }}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            fullWidth
                                            startIcon={<AddCircleOutlineIcon />}
                                            onClick={handleAgregarProducto}
                                        >
                                            Agregar Productos
                                        </Button>
                                    </Grid>
                                </Grid>

                                {/* Tabla de Productos */}
                                <TableContainer component={Paper} variant="outlined" sx={{ mt: 3, maxHeight: 300 }}>
                                    <Table size="small">
                                        <TableHead sx={(theme) => ({
                                            bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : '#f5f5f5'
                                        })}>
                                            <TableRow>
                                                <TableCell>SKU</TableCell>
                                                <TableCell>Producto</TableCell>
                                                <TableCell align="center">Cantidad Total</TableCell>
                                                <TableCell align="center">Acción</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {nuevosDetalles.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                                                        La paleta está vacía.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                nuevosDetalles.map((detalle, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{detalle.sku || "---"}</TableCell>
                                                        <TableCell>{detalle.nombreProducto || "---"}</TableCell>
                                                        <TableCell align="center">
                                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                                                {/* Botón Restar */}
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleUpdateCantidadFila(detalle.idProducto, -1)}
                                                                    disabled={detalle.cantidad <= 1} // Opcional: deshabilita si es 1
                                                                    sx={{ border: '1px solid', borderColor: 'divider' }}
                                                                >
                                                                    <RemoveIcon fontSize="small" />
                                                                </IconButton>

                                                                <Typography fontWeight="bold" sx={{ minWidth: '30px', textAlign: 'center' }}>
                                                                    {detalle.cantidad}
                                                                </Typography>

                                                                {/* Botón Sumar */}
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleUpdateCantidadFila(detalle.idProducto, 1)}
                                                                    sx={{ border: '1px solid', borderColor: 'divider' }}
                                                                >
                                                                    <AddIcon fontSize="small" />
                                                                </IconButton>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <IconButton
                                                                color="error"
                                                                size="small"
                                                                onClick={() => handleEliminarFila(detalle.idProducto)}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                            </CardContent>
                        </Card>

                        {/* Botón de Guardar General */}
                        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", width: "190%" }}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                startIcon={<SaveIcon />}
                                onClick={handleGuardar}
                                disabled={updateHuMutation.isPending}
                            >
                                {updateHuMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </LayoutDashboard>
    );
};

export default ActualizarHu;