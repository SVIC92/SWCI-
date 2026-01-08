import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// APIs
import { createHu } from "../../api/huApi";
import { getAlmacenes } from "../../api/sedeApi";
import { getProductos } from "../../api/productoApi";

// Utils
import { huSchema } from "../../Utils/huShema"; // Asegúrate de que el nombre del archivo sea correcto

// MUI Components
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
    MenuItem
} from "@mui/material";

// Icons
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";

const MySwal = withReactContent(Swal);

const CrearHu = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Estados locales
    const [detalles, setDetalles] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [cantidadInput, setCantidadInput] = useState("");

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(huSchema),
        defaultValues: {
            idAlmacen: "",
            tipoIndicador: "Estándar",
            fechaSolicitada: "",
            fechaVencimiento: "",
        },
    });

    // Queries
    const { data: almacenes = [] } = useQuery({
        queryKey: ["almacenes"],
        queryFn: getAlmacenes,
    });

    const { data: productos = [], isLoading: loadingProductos } = useQuery({
        queryKey: ["productos"],
        queryFn: getProductos,
    });

    // Mutación
    const createHuMutation = useMutation({
        mutationFn: createHu,
        onSuccess: (data) => { // Recibimos 'data' del backend
            queryClient.invalidateQueries(["hus"]);
            MySwal.fire({
                title: "¡Creado!",
                // Mostramos el código generado por el servidor
                text: `La HU se registró correctamente con el código: ${data.codHu}`,
                icon: "success",
                confirmButtonText: "Ok",
            }).then(() => {
                navigate("/gestion-hu");
            });
        },
        onError: (error) => {
            const msg = error.response?.data?.message || "No se pudo crear la HU";
            MySwal.fire("Error", msg, "error");
        },
    });

    // Handlers
    const handleAgregarProducto = () => {
        if (!productoSeleccionado) {
            MySwal.fire("Atención", "Seleccione un producto", "warning");
            return;
        }
        const cant = parseInt(cantidadInput, 10);
        if (!cant || cant <= 0) {
            MySwal.fire("Atención", "Ingrese una cantidad válida mayor a 0", "warning");
            return;
        }

        const existe = detalles.find((d) => d.idProducto === productoSeleccionado.id_producto);
        if (existe) {
            MySwal.fire("Producto duplicado", "Este producto ya está en la lista.", "info");
            return;
        }

        const nuevoDetalle = {
            idProducto: productoSeleccionado.id_producto,
            nombre: productoSeleccionado.nombre,
            sku: productoSeleccionado.sku,
            cantidad: cant,
        };

        setDetalles([...detalles, nuevoDetalle]);
        setProductoSeleccionado(null);
        setCantidadInput("");
    };

    const handleEliminarDetalle = (idProd) => {
        setDetalles(detalles.filter((d) => d.idProducto !== idProd));
    };

    const onSubmit = (data) => {
        const payload = {
            ...data,
            fechaSolicitada: data.fechaSolicitada || null,
            fechaVencimiento: data.fechaVencimiento || null,
            detalles: detalles.map((d) => ({
                idProducto: d.idProducto,
                cantidad: d.cantidad,
            })),
        };

        createHuMutation.mutate(payload);
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/hu/gestion")} // Corregí la ruta de retorno
                >
                    Volver
                </Button>
                <Typography variant="h5" fontWeight="bold">
                    Crear Nueva Paleta (HU)
                </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                    {/* PANEL IZQUIERDO: CABECERA */}
                    <Grid item xs={12} md={5}>
                        <Card elevation={3}>
                            <CardContent>
                                <Typography variant="h6" color="primary" gutterBottom>
                                    Datos Generales
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Grid container spacing={2}>
                                    {/* Código HU (Autogenerado) */}
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Código HU"
                                            value="Autogenerado al guardar"
                                            disabled
                                            variant="filled"
                                            helperText="El sistema asignará el correlativo automáticamente."
                                        />
                                    </Grid>

                                    {/* Almacén Origen */}
                                    <Grid item xs={12}>
                                        <Controller
                                            name="idAlmacen"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    select
                                                    fullWidth
                                                    label="Almacén de Origen"
                                                    error={!!errors.idAlmacen}
                                                    helperText={errors.idAlmacen?.message}
                                                >
                                                    {almacenes.map((sede) => (
                                                        <MenuItem key={sede.idSede} value={sede.idSede}>
                                                            {sede.nombreSede}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            )}
                                        />
                                    </Grid>

                                    {/* Tipo Indicador */}
                                    <Grid item xs={12}>
                                        <TextField
                                            select
                                            fullWidth
                                            label="Tipo de Contenido"
                                            {...register("tipoIndicador")}
                                            defaultValue="Estándar"
                                        >
                                            <MenuItem value="Estándar">Estándar</MenuItem>
                                            <MenuItem value="Frágil">Frágil</MenuItem>
                                            <MenuItem value="Refrigerado">Refrigerado</MenuItem>
                                            <MenuItem value="Alto Valor">Alto Valor</MenuItem>
                                            <MenuItem value="Medio HU">Medio HU</MenuItem>
                                            <MenuItem value="Mixto">Mixto</MenuItem>
                                            <MenuItem value="Monoproducto">Monoproducto</MenuItem>
                                        </TextField>
                                    </Grid>

                                    {/* Fechas */}
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            type="datetime-local"
                                            label="Fecha Solicitada"
                                            InputLabelProps={{ shrink: true }}
                                            {...register("fechaSolicitada")}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            type="date"
                                            label="Fecha Vencimiento"
                                            InputLabelProps={{ shrink: true }}
                                            {...register("fechaVencimiento")}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* PANEL DERECHO: PRODUCTOS */}
                    <Grid item xs={12} md={7}>
                        <Card elevation={3} sx={{ height: "100%" }}>
                            <CardContent>
                                <Typography variant="h6" color="primary" gutterBottom>
                                    Contenido de la Paleta
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                {/* Formulario Productos */}
                                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mb: 3, flexDirection: { xs: "column", sm: "row" } }}>
                                    <Autocomplete
                                        options={productos}
                                        getOptionLabel={(option) => `${option.nombreProducto} (SKU: ${option.sku})`}
                                        value={productoSeleccionado}
                                        onChange={(_, newValue) => setProductoSeleccionado(newValue)}
                                        loading={loadingProductos}
                                        sx={{ flex: 2, width: "100%" }}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Buscar Producto" placeholder="Nombre o SKU" />
                                        )}
                                    />

                                    <TextField
                                        label="Cant."
                                        type="number"
                                        sx={{ width: { xs: "100%", sm: "100px" } }}
                                        value={cantidadInput}
                                        onChange={(e) => setCantidadInput(e.target.value)}
                                    />

                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        sx={{ height: 56, minWidth: 100 }}
                                        onClick={handleAgregarProducto}
                                        startIcon={<AddCircleOutlineIcon />}
                                    >
                                        Añadir
                                    </Button>
                                </Box>

                                {/* Tabla Productos */}
                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>SKU</TableCell>
                                                <TableCell>Producto</TableCell>
                                                <TableCell align="center">Cantidad</TableCell>
                                                <TableCell align="center">Acción</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {detalles.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                                                        No hay productos agregados aún.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                detalles.map((item) => (
                                                    <TableRow key={item.idProducto}>
                                                        <TableCell>{item.sku}</TableCell>
                                                        <TableCell>{item.nombre}</TableCell>
                                                        <TableCell align="center">
                                                            <Typography fontWeight="bold">{item.cantidad}</Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <IconButton
                                                                color="error"
                                                                size="small"
                                                                onClick={() => handleEliminarDetalle(item.idProducto)}
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
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={<SaveIcon />}
                        disabled={createHuMutation.isPending}
                        sx={{ px: 5, py: 1.5, fontSize: "1.1rem" }}
                    >
                        {createHuMutation.isPending ? "Procesando..." : "Crear HU"}
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default CrearHu;