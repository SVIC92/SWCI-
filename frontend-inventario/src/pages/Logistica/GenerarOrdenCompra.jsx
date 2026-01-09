import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
    Box,
    Paper,
    Typography,
    Grid,
    TextField,
    MenuItem,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Chip,
    CircularProgress,
    Divider,
    Alert
} from "@mui/material";
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import RefreshIcon from '@mui/icons-material/Refresh';
import LayoutDashboard from "../../components/Layouts/LayoutDashboard";
import { getSedes } from "../../api/sedeApi";
import { generarOrdenes } from "../../api/comprasApi";
import { getSugerenciasReabastecimiento } from "../../api/productoApi";

const MySwal = withReactContent(Swal);

const GenerarOrdenCompra = () => {
    const queryClient = useQueryClient();
    const [sedeSeleccionada, setSedeSeleccionada] = useState("");
    const [seleccionados, setSeleccionados] = useState({});
    const [proveedoresCount, setProveedoresCount] = useState(0);
    const { data: sedes = [], isLoading: loadingSedes } = useQuery({
        queryKey: ["sedes"],
        queryFn: getSedes,
    });

    const {
        data: sugerencias = [],
        isLoading: loadingSugerencias,
        isError,
        refetch: refetchSugerencias
    } = useQuery({
        queryKey: ["sugerencias", sedeSeleccionada],
        queryFn: () => getSugerenciasReabastecimiento(sedeSeleccionada),
        enabled: !!sedeSeleccionada,
        staleTime: 0,
    });
    useEffect(() => {
        if (!sugerencias.length) return;
        const proveedoresUnicos = new Set();
        Object.keys(seleccionados).forEach(idProd => {
            const item = sugerencias.find(s => s.idProducto.toString() === idProd);
            if (item && item.proveedor) {
                proveedoresUnicos.add(item.proveedor);
            }
        });
        setProveedoresCount(proveedoresUnicos.size);

    }, [seleccionados, sugerencias]);

    const handleSedeChange = (event) => {
        setSedeSeleccionada(event.target.value);
        setSeleccionados({});
    };

    const handleCheck = (idProducto, isChecked, cantidadSugerida) => {
        setSeleccionados(prev => {
            const nuevo = { ...prev };
            if (isChecked) {
                nuevo[idProducto] = cantidadSugerida;
            } else {
                delete nuevo[idProducto];
            }
            return nuevo;
        });
    };

    const handleCantidadChange = (idProducto, nuevaCantidad) => {
        if (nuevaCantidad < 1) return;
        setSeleccionados(prev => ({
            ...prev,
            [idProducto]: parseInt(nuevaCantidad)
        }));
    };

    const handleSelectAll = (isChecked) => {
        if (isChecked) {
            const todos = {};
            sugerencias.forEach(s => {
                todos[s.idProducto] = s.cantidadSugerida;
            });
            setSeleccionados(todos);
        } else {
            setSeleccionados({});
        }
    };

    const generarOrdenesMutation = useMutation({
        mutationFn: (items) => generarOrdenes(sedeSeleccionada, items),
        onSuccess: (response) => {
            MySwal.fire({
                title: "¡Órdenes Generadas!",
                html: `Se han creado exitosamente <b>${response.ordenes?.length || proveedoresCount}</b> órdenes de compra.<br>Revisa el módulo de "Gestión de Compras" para aprobarlas.`,
                icon: "success"
            });
            setSeleccionados({});
            queryClient.invalidateQueries(["sugerencias"]);
        },
        onError: (err) => {
            MySwal.fire("Error", err.response?.data?.message || "No se pudieron generar las órdenes", "error");
        }
    });

    const handleGenerar = () => {
        const itemsArray = Object.entries(seleccionados).map(([id, cant]) => ({
            idProducto: parseInt(id),
            cantidad: cant
        }));

        if (itemsArray.length === 0) return;

        MySwal.fire({
            title: "¿Confirmar Generación?",
            text: `Vas a generar órdenes para ${itemsArray.length} productos de ${proveedoresCount} proveedores distintos.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, generar",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                generarOrdenesMutation.mutate(itemsArray);
            }
        });
    };

    return (
        <LayoutDashboard>
            <Box sx={{ p: 3 }}>
                {/* Cabecera */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <div>
                        <Typography variant="h4" fontWeight="bold">Planificador de Compras</Typography>
                        <Typography variant="body1" color="text.secondary">
                            Generación masiva de órdenes basada en IA y puntos de reorden.
                        </Typography>
                    </div>
                    {seleccionados && Object.keys(seleccionados).length > 0 && (
                        <Paper elevation={3} sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
                            <Typography variant="subtitle2" fontWeight="bold">Resumen Preliminar</Typography>
                            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                                <Chip label={`${Object.keys(seleccionados).length} Productos`} size="small" sx={{ bgcolor: "white", color: "primary.main", fontWeight: "bold" }} />
                                <Chip label={`${proveedoresCount} Proveedores (OCs)`} size="small" sx={{ bgcolor: "warning.main", color: "black", fontWeight: "bold" }} />
                            </Box>
                        </Paper>
                    )}
                </Box>
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Seleccionar Sede para Reabastecimiento"
                                fullWidth
                                value={sedeSeleccionada}
                                onChange={handleSedeChange}
                                helperText="Las sugerencias se calculan en base al stock de esta sede."
                            >
                                {sedes.map((sede) => (
                                    <MenuItem key={sede.idSede} value={sede.idSede}>
                                        {sede.nombreSede} ({sede.tipo})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={() => refetchSugerencias()}
                                disabled={!sedeSeleccionada || loadingSugerencias}
                            >
                                Recalcular IA
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                startIcon={<ShoppingCartCheckoutIcon />}
                                disabled={Object.keys(seleccionados).length === 0 || generarOrdenesMutation.isPending}
                                onClick={handleGenerar}
                            >
                                {generarOrdenesMutation.isPending ? "Procesando..." : "Generar Órdenes de Compra"}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Área de Contenido */}
                {!sedeSeleccionada ? (
                    <Alert severity="info">Por favor, seleccione una sede para ver las sugerencias de compra.</Alert>
                ) : loadingSugerencias ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : isError ? (
                    <Alert severity="error">Error al cargar las sugerencias. Intente nuevamente.</Alert>
                ) : sugerencias.length === 0 ? (
                    <Alert severity="success">¡Todo en orden! No hay productos con stock crítico en esta sede.</Alert>
                ) : (
                    <TableContainer component={Paper} elevation={2}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: 'action.hover' }}>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            checked={sugerencias.length > 0 && Object.keys(seleccionados).length === sugerencias.length}
                                        />
                                    </TableCell>
                                    <TableCell><strong>Producto</strong></TableCell>
                                    <TableCell><strong>Proveedor</strong></TableCell>
                                    <TableCell align="center"><strong>Stock Actual</strong></TableCell>
                                    <TableCell align="center"><strong>Mínimo</strong></TableCell>
                                    <TableCell align="center"><strong>Sugerido (IA)</strong></TableCell>
                                    <TableCell align="center" width={150}><strong>A Pedir</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sugerencias.map((item) => {
                                    const isSelected = !!seleccionados[item.idProducto];
                                    return (
                                        <TableRow key={item.idProducto} hover selected={isSelected}>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={(e) => handleCheck(item.idProducto, e.target.checked, item.cantidadSugerida)}
                                                />
                                            </TableCell>
                                            <TableCell>{item.nombre}</TableCell>
                                            <TableCell>
                                                <Chip label={item.proveedor} size="small" variant="outlined" />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography color="error" fontWeight="bold">{item.stockActual}</Typography>
                                            </TableCell>
                                            <TableCell align="center">{item.stockMinimo}</TableCell>
                                            <TableCell align="center">
                                                <Chip label={item.cantidadSugerida} color="info" size="small" />
                                            </TableCell>
                                            <TableCell align="center">
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    disabled={!isSelected}
                                                    value={seleccionados[item.idProducto] || ""}
                                                    onChange={(e) => handleCantidadChange(item.idProducto, e.target.value)}
                                                    inputProps={{ min: 1, style: { textAlign: 'center' } }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </LayoutDashboard>
    );
};

export default GenerarOrdenCompra;