import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// APIs
import { getHuDisponibles, solicitarHu } from "../../api/huApi";
import { getSedes } from "../../api/sedeApi";

// Componentes UI de Material UI
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
    Divider
} from "@mui/material";

// Iconos
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import StoreIcon from "@mui/icons-material/Store";
import EventIcon from "@mui/icons-material/Event";

// Tu componente tabla reutilizable
import TablaLista from "../../components/TablaLista";

const MySwal = withReactContent(Swal);

const PedidoMercaderia = () => {
    const queryClient = useQueryClient();

    // --- Estados Locales ---
    const [openDrawer, setOpenDrawer] = useState(false);
    const [huSeleccionada, setHuSeleccionada] = useState(null);

    // Datos del formulario
    const [idSedeDestino, setIdSedeDestino] = useState("");
    const [fechaSolicitada, setFechaSolicitada] = useState("");

    // --- 1. Carga de Datos (Queries) ---

    // Obtener HUs Disponibles
    const {
        data: hus = [],
        isLoading: loadingHus,
        refetch
    } = useQuery({
        queryKey: ["huDisponibles"],
        queryFn: () => getHuDisponibles(),
    });

    // Obtener Sedes (Para el destino)
    const { data: sedes = [] } = useQuery({
        queryKey: ["sedes"],
        queryFn: getSedes,
    });

    // --- 2. Mutación (Enviar Solicitud) ---
    const solicitarMutation = useMutation({
        mutationFn: (payload) => solicitarHu(huSeleccionada.id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries(["huDisponibles"]); // Refrescar tabla
            handleCloseDrawer();
            MySwal.fire({
                title: "¡Pedido Enviado!",
                text: `La HU ${huSeleccionada?.codHu} ha sido solicitada correctamente.`,
                icon: "success",
                timer: 3000,
                showConfirmButton: false
            });
        },
        onError: (err) => {
            const msg = err.response?.data?.message || "Error al procesar la solicitud";
            MySwal.fire("Error", msg, "error");
        }
    });

    // --- 3. Manejadores ---

    const handleClickSolicitar = (huRow) => {
        setHuSeleccionada(huRow);
        setOpenDrawer(true);
        // Reiniciar formulario
        setIdSedeDestino("");
        setFechaSolicitada("");
    };

    const handleCloseDrawer = () => {
        setOpenDrawer(false);
        setTimeout(() => setHuSeleccionada(null), 200); // Pequeño delay para que no parpadee al cerrar
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

    // --- 4. Configuración de Tabla ---

    const getStatusColor = (estado) => {
        switch (estado) {
            case "COMPLETO": return "success";
            case "DISPONIBLE": return "success";
            case "EN_CONSTRUCCION": return "info";
            case "QUIEBRE": return "error";
            default: return "default";
        }
    };

    const columns = [
        { field: "codHu", headerName: "Código HU", width: 140, renderCell: (p) => <b>{p.value}</b> },
        { field: "almacen", headerName: "Almacén Origen", width: 180, valueGetter: (p) => p.row.almacen?.nombreSede || "N/A" },
        { field: "tipoIndicador", headerName: "Tipo Carga", width: 130 },
        {
            field: "fechaVencimiento",
            headerName: "Vencimiento",
            width: 120,
            valueFormatter: (p) => p.value ? new Date(p.value).toLocaleDateString() : "---"
        },
        {
            field: "estado",
            headerName: "Estado",
            width: 140,
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
            headerName: "Pedir",
            type: "actions",
            width: 100,
            getActions: (params) => {
                // Regla: Solo se pide si está COMPLETO o DISPONIBLE
                const puedePedir = params.row.estado === "COMPLETO" || params.row.estado === "DISPONIBLE";

                return [
                    <Tooltip title={puedePedir ? "Pedir esta HU" : "No disponible para pedir"}>
                        <span>
                            <IconButton
                                color="primary"
                                disabled={!puedePedir}
                                onClick={() => handleClickSolicitar(params.row)}
                                sx={{
                                    bgcolor: puedePedir ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                                    '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.2)' }
                                }}
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

            {/* --- DRAWER LATERAL (Solicitud) --- */}
            <Drawer
                anchor="right"
                open={openDrawer}
                onClose={handleCloseDrawer}
                // ✅ CORRECCIÓN DE SUPERPOSICIÓN:
                // zIndex alto asegura que esté por encima del Sidebar/Footer del Dashboard
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1000,
                }}
                PaperProps={{
                    sx: {
                        width: { xs: "100%", sm: 400 }, // Full screen en móvil, 400px en escritorio
                        p: 0,
                        boxShadow: "-4px 0px 20px rgba(0,0,0,0.2)"
                    }
                }}
            >
                {/* Cabecera */}
                <Box sx={{ p: 3, bgcolor: "primary.main", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <AddShoppingCartIcon />
                        <Typography variant="h6" fontWeight="bold">
                            Confirmar Pedido
                        </Typography>
                    </Box>
                    <IconButton onClick={handleCloseDrawer} sx={{ color: "white" }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Cuerpo del Formulario */}
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3, flex: 1, overflowY: "auto" }}>

                    {/* Resumen de la HU */}
                    <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 2, border: "1px solid #e0e0e0" }}>
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

                    {/* Selector Sede Destino */}
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
                        >
                            {sedes.map((sede) => (
                                <MenuItem key={sede.idSede} value={sede.idSede}>
                                    {sede.nombreSede}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    {/* Selector Fecha */}
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

                {/* Pie de Página (Botones) */}
                <Box sx={{ p: 3, borderTop: "1px solid #e0e0e0", bgcolor: "#fafafa" }}>
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<SendIcon />}
                        onClick={handleConfirmarPedido}
                        disabled={solicitarMutation.isPending}
                        sx={{ py: 1.5, mb: 1.5, fontWeight: "bold" }}
                    >
                        {solicitarMutation.isPending ? "Procesando..." : "Confirmar Pedido"}
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        color="inherit"
                        onClick={handleCloseDrawer}
                    >
                        Cancelar
                    </Button>
                </Box>
            </Drawer>
        </>
    );
};

export default PedidoMercaderia;