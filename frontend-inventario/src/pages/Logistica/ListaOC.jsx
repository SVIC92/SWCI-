import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import {
    Box,
    Typography,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Grid,
    Divider
} from "@mui/material";

// Iconos
import VisibilityIcon from '@mui/icons-material/Visibility';
import SendIcon from '@mui/icons-material/Send';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import TablaLista from "../../components/TablaLista";
import LayoutDashboard from "../../components/Layouts/LayoutDashboard";
import { getOrdenes, enviarOrdenCorreo } from "../../api/comprasApi";

const MySwal = withReactContent(Swal);

const ListaOC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [openDetalle, setOpenDetalle] = useState(false);
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
    const { data: ordenes = [], isLoading } = useQuery({
        queryKey: ["ordenesCompra"],
        queryFn: getOrdenes,
        staleTime: 1000 * 60 * 5,
    });

    const enviarMutation = useMutation({
        mutationFn: enviarOrdenCorreo,
        onSuccess: () => {
            MySwal.fire("Enviada", "La orden de compra ha sido enviada por correo al proveedor.", "success");
            queryClient.invalidateQueries(["ordenesCompra"]);
        },
        onError: (err) => {
            MySwal.fire("Error", err.response?.data?.message || "No se pudo enviar el correo.", "error");
        }
    });

    const handleVerDetalle = (orden) => {
        setOrdenSeleccionada(orden);
        setOpenDetalle(true);
    };

    const handleCloseDetalle = () => {
        setOpenDetalle(false);
        setOrdenSeleccionada(null);
    };

    const handleEnviarCorreo = (orden) => {
        if (!orden.proveedor?.email) {
            MySwal.fire("Sin Email", "El proveedor no tiene un correo registrado.", "warning");
            return;
        }

        MySwal.fire({
            title: `¿Enviar Orden ${orden.codigoOrden}?`,
            text: `Se enviará un correo a ${orden.proveedor.nombre_proveedor} (${orden.proveedor.email}) con el detalle del pedido.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, Enviar",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                enviarMutation.mutate(orden.id);
            }
        });
    };

    const getStatusColor = (estado) => {
        switch (estado) {
            case "PENDIENTE": return "warning";
            case "ENVIADA": return "info";
            case "PARCIAL": return "secondary"; // Morado para recepción parcial
            case "COMPLETADA": return "success";
            case "CANCELADA": return "error";
            default: return "default";
        }
    };

    const columns = [
        { field: "codigoOrden", headerName: "Código", width: 180, renderCell: (p) => <b>{p.value}</b> },
        { field: "proveedor", headerName: "Proveedor", width: 200, valueGetter: (v) => v?.nombre_proveedor || "---" },
        { field: "sedeDestino", headerName: "Sede Destino", width: 200, valueGetter: (v) => v?.nombreSede || "---" },
        {
            field: "fechaEmision", headerName: "Fecha Emisión", width: 150,
            valueFormatter: (v) => v ? format(new Date(v), "dd/MM/yyyy", { locale: es }) : ""
        },
        {
            field: "totalEstimado", headerName: "Total (Est.)", width: 120,
            renderCell: (p) => `S/ ${parseFloat(p.value).toFixed(2)}`
        },
        {
            field: "estado", headerName: "Estado", width: 130,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={getStatusColor(params.value)}
                    size="small"
                    variant={params.value === "ENVIADA" ? "filled" : "outlined"}
                    icon={params.value === "ENVIADA" ? <EmailIcon fontSize="small" /> : undefined}
                />
            )
        },
        {
            field: "acciones", headerName: "Acciones", type: "actions", width: 150,
            getActions: (params) => {
                const isPendiente = params.row.estado === "PENDIENTE";

                return [
                    <Tooltip title="Ver Detalle" key="ver">
                        <IconButton onClick={() => handleVerDetalle(params.row)} color="primary">
                            <VisibilityIcon />
                        </IconButton>
                    </Tooltip>,

                    <Tooltip title={isPendiente ? "Enviar al Proveedor" : "Reenviar Correo"} key="enviar">
                        <IconButton
                            onClick={() => handleEnviarCorreo(params.row)}
                            color={isPendiente ? "warning" : "default"}
                            disabled={params.row.estado === "CANCELADA"}
                        >
                            <SendIcon />
                        </IconButton>
                    </Tooltip>
                ];
            }
        }
    ];

    return (
        <>
            <TablaLista
                title="Gestión de Órdenes de Compra"
                subtitle="Monitoreo y envío de pedidos a proveedores"
                columns={columns}
                data={ordenes}
                isLoading={isLoading}
                onRefresh={() => queryClient.invalidateQueries(["ordenesCompra"])}
                getRowId={(row) => row.id}
                onAdd={() => navigate("/logistica/oc/generar")}
                onBack={() => navigate("/dashboard-logistica")}
            />

            {/* --- MODAL DE DETALLE --- */}
            <Dialog
                open={openDetalle}
                onClose={handleCloseDetalle}
                maxWidth="md"
                fullWidth
            >
                {ordenSeleccionada && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'white' }}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="h6">Orden #{ordenSeleccionada.codigoOrden}</Typography>
                                <Chip
                                    label={ordenSeleccionada.estado}
                                    size="small"
                                    sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold' }}
                                />
                            </Box>
                            <IconButton onClick={handleCloseDetalle} sx={{ color: 'white' }}>
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent dividers>
                            {/* Cabecera del Documento */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Proveedor</Typography>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {ordenSeleccionada.proveedor?.nombre_proveedor}
                                    </Typography>
                                    <Typography variant="body2">
                                        RUC: {ordenSeleccionada.proveedor?.ruc || "N/A"}
                                    </Typography>
                                    <Typography variant="body2">
                                        Email: {ordenSeleccionada.proveedor?.email}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" color="text.secondary">Destino</Typography>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {ordenSeleccionada.sedeDestino?.nombreSede}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                        Fecha: {format(new Date(ordenSeleccionada.fechaEmision), "PPP p", { locale: es })}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                        Solicitante: {ordenSeleccionada.usuarioSolicitante?.nombre_u}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Divider sx={{ mb: 2 }}>DETALLE DE PRODUCTOS</Divider>

                            {/* Tabla Interna */}
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                                        <TableRow>
                                            <TableCell>Producto</TableCell>
                                            <TableCell>SKU</TableCell>
                                            <TableCell align="right">Costo Unit.</TableCell>
                                            <TableCell align="center">Cant. Solicitada</TableCell>
                                            <TableCell align="center">Cant. Recibida</TableCell>
                                            <TableCell align="right">Subtotal</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {ordenSeleccionada.detalles?.map((det) => (
                                            <TableRow key={det.id}>
                                                <TableCell>{det.producto?.nombre}</TableCell>
                                                <TableCell>{det.producto?.sku}</TableCell>
                                                <TableCell align="right">S/ {det.costoUnitarioPactado.toFixed(2)}</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                                    {det.cantidadSolicitada}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {det.cantidadRecibida > 0 ? (
                                                        <Chip label={det.cantidadRecibida} color="success" size="small" />
                                                    ) : "-"}
                                                </TableCell>
                                                <TableCell align="right">
                                                    S/ {(det.cantidadSolicitada * det.costoUnitarioPactado).toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {/* Fila Total */}
                                        <TableRow sx={{ bgcolor: 'action.selected' }}>
                                            <TableCell colSpan={5} align="right"><strong>TOTAL ESTIMADO:</strong></TableCell>
                                            <TableCell align="right">
                                                <strong>S/ {ordenSeleccionada.totalEstimado?.toFixed(2)}</strong>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </DialogContent>

                        <DialogActions sx={{ p: 2 }}>
                            {ordenSeleccionada.estado === "PENDIENTE" && (
                                <Button
                                    variant="contained"
                                    color="warning"
                                    startIcon={<SendIcon />}
                                    onClick={() => handleEnviarCorreo(ordenSeleccionada)}
                                    disabled={enviarMutation.isPending}
                                >
                                    Enviar Ahora
                                </Button>
                            )}
                            <Button onClick={handleCloseDetalle} color="inherit">Cerrar</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </>
    );
};

export default ListaOC;