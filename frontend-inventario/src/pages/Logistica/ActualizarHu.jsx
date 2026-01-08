import React, { useState } from "react";
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

const MySwal = withReactContent(Swal);

const ActualizarHu = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [cantidad, setCantidad] = useState("");
    const [nuevosDetalles, setNuevosDetalles] = useState([]);
    const [nuevoEstado, setNuevoEstado] = useState("");
    const { data: huData, isLoading: isLoadingHu } = useQuery({
        queryKey: ["hu", id],
        queryFn: () => getHuById(id),
        onSuccess: (data) => {
            if (!nuevoEstado) setNuevoEstado(data.estado);
        }
    });
    const { data: productosData, isLoading: isLoadingProductos } = useQuery({
        queryKey: ["productos"],
        queryFn: getProductos,
    });

    const listaProductos = productosData || [];

    const updateHuMutation = useMutation({
        mutationFn: (payload) => updateHu(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries(["hus"]);
            queryClient.invalidateQueries(["hu", id]);
            MySwal.fire("Actualizado", "La HU se ha actualizado correctamente", "success").then(() => {
                navigate("/gestion-hu");
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

        const existe = nuevosDetalles.find(d => d.idProducto === productoSeleccionado.id_producto);
        if (existe) {
            MySwal.fire("Atención", "Este producto ya está en la lista de agregados", "warning");
            return;
        }

        const nuevoDetalle = {
            idProducto: productoSeleccionado.id_producto,
            nombreProducto: productoSeleccionado.nombreProducto,
            cantidad: parseInt(cantidad, 10),
        };

        setNuevosDetalles([...nuevosDetalles, nuevoDetalle]);
        setProductoSeleccionado(null);
        setCantidad("");
    };

    const handleEliminarFila = (idProducto) => {
        setNuevosDetalles(nuevosDetalles.filter((item) => item.idProducto !== idProducto));
    };

    const handleGuardar = () => {
        if (nuevosDetalles.length === 0 && nuevoEstado === huData?.estado) {
            MySwal.fire("Sin cambios", "No has realizado ninguna modificación", "info");
            return;
        }

        const payload = {
            estado: nuevoEstado,
            detalles: nuevosDetalles.length > 0 ? nuevosDetalles : null
        };

        updateHuMutation.mutate(payload);
    };

    if (isLoadingHu) return <Typography>Cargando información de HU...</Typography>;

    return (
        <Box sx={{ p: 3 }}>
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
                <Grid item xs={12} md={4}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Información General</Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="textSecondary">Almacén Origen</Typography>
                                <Typography variant="body1">{huData?.almacen?.nombreSede || "N/A"}</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="textSecondary">Tipo Indicador</Typography>
                                <Typography variant="body1">{huData?.tipoIndicador || "Estándar"}</Typography>
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
                                <MenuItem value="QUIEBRE">QUIEBRE</MenuItem>
                            </TextField>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Añadir Nuevos Productos</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                Los productos agregados aquí se sumarán al contenido existente de la paleta.
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={6}>
                                    <Autocomplete
                                        options={listaProductos}
                                        getOptionLabel={(option) => `${option.nombreProducto} (SKU: ${option.sku || 'N/A'})`}
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
                                        Agregar
                                    </Button>
                                </Grid>
                            </Grid>
                            <TableContainer component={Paper} variant="outlined" sx={{ mt: 3, maxHeight: 300 }}>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                                        <TableRow>
                                            <TableCell>Producto</TableCell>
                                            <TableCell align="center">Cant. a Añadir</TableCell>
                                            <TableCell align="center">Acción</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {nuevosDetalles.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center" sx={{ py: 3, color: "text.secondary" }}>
                                                    No hay productos nuevos en la lista
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            nuevosDetalles.map((detalle, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{detalle.nombreProducto}</TableCell>
                                                    <TableCell align="center">
                                                        <Typography fontWeight="bold" color="success.main">
                                                            +{detalle.cantidad}
                                                        </Typography>
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
                    <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
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
    );
};

export default ActualizarHu;