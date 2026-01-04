import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getProducto, updateProducto } from '../../api/productoApi';
import { getAreas } from "../../api/areaApi";
import { getCategorias } from "../../api/categoriaApi";
import { getProveedores } from "../../api/proveedorApi";
import LayoutDashboard from '../../components/Layouts/LayoutDashboard';
import FormularioDialogoProducto from '../../components/FormularioDialogoProducto';

import {
    Box,
    Paper,
    Typography,
    Grid,
    Chip,
    Divider,
    Button,
    Stack,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Container,
    Avatar
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import QrCodeIcon from '@mui/icons-material/QrCode';

const DetalleProducto = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [openEditDialog, setOpenEditDialog] = useState(false);

    const { data: producto, isLoading, isError } = useQuery({
        queryKey: ['producto', id],
        queryFn: () => getProducto(id),
        enabled: !!id,
    });
    const { data: areas = [] } = useQuery({ queryKey: ["areas"], queryFn: getAreas });
    const { data: categorias = [] } = useQuery({ queryKey: ["categorias"], queryFn: getCategorias });
    const { data: proveedores = [] } = useQuery({ queryKey: ["proveedores"], queryFn: getProveedores });

    const updateProductoMutation = useMutation({
        mutationFn: (variables) => updateProducto(variables.id, variables.data),
        onSuccess: () => {
            queryClient.invalidateQueries(['producto', id]);
            queryClient.invalidateQueries(['productos']);
            setOpenEditDialog(false);
            MySwal.fire("Actualizado", "Producto actualizado correctamente", "success");
        },
        onError: (err) => {
            const mensaje = err.response?.data?.message || "No se pudo actualizar el producto";
            MySwal.fire("Error", mensaje, "error");
        }
    });
    const onSaveEdit = (formData) => {
        const payload = {
            id_producto: producto.id_producto,
            sku: formData.sku,
            codEan: formData.codEan,
            nombre: formData.nombre_producto,
            marca: formData.marca,
            uni_medida: formData.uni_medida,
            precio_venta: Number(formData.precio_venta),
            precio_compra: Number(formData.precio_compra),
            stockMinimo: Number(formData.stockMinimo),
            stockIdeal: Number(formData.stockIdeal),
            categoria: { id_cat: parseInt(formData.id_cat, 10) },
            proveedor: { id_proveedor: parseInt(formData.id_proveedor, 10) }
        };

        updateProductoMutation.mutate({
            id: producto.id_producto,
            data: payload
        });
    };
    const formatCurrency = (value) =>
        new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(value);


    const InfoCard = ({ title, icon, children }) => (
        <Card
            variant="outlined"
            sx={{
                height: '100%',
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
                border: '1px solid #e0e0e0',
            }}
        >
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main' }}>
                        {icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={700}>
                        {title}
                    </Typography>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {children}
                </Box>
            </CardContent>
        </Card>
    );

    const InfoRow = ({ label, value }) => (
        <Grid item xs={6}>
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    letterSpacing: 0.5,
                }}
            >
                {label}
            </Typography>
            <Typography variant="body1" fontWeight={500}>
                {value}
            </Typography>
        </Grid>
    );


    if (isLoading) {
        return (
            <LayoutDashboard>
                <Box sx={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress />
                </Box>
            </LayoutDashboard>
        );
    }

    if (isError || !producto) {
        return (
            <LayoutDashboard>
                <Container maxWidth="md" sx={{ mt: 4 }}>
                    <Alert
                        severity="error"
                        action={
                            <Button color="inherit" size="small" onClick={() => navigate('/lista-productos')}>
                                Volver
                            </Button>
                        }
                    >
                        No se pudo cargar la información del producto.
                    </Alert>
                </Container>
            </LayoutDashboard>
        );
    }
    return (
        <LayoutDashboard>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/lista-productos')}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Volver
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => setOpenEditDialog(true)}
                        sx={{ borderRadius: 2, textTransform: 'none', px: 3, boxShadow: 2 }}
                    >
                        Editar Producto
                    </Button>
                </Box>
                <Paper sx={{ borderRadius: 3, mb: 4, overflow: 'hidden' }}>
                    <Box
                        sx={{
                            background: 'linear-gradient(135deg, #0d47a1, #1976d2)',
                            color: 'white',
                            p: 4,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 2,
                        }}
                    >
                        <Stack direction="row" spacing={3} alignItems="center">
                            <Avatar sx={{ width: 80, height: 80, bgcolor: 'white', color: 'primary.main' }}>
                                <Inventory2Icon sx={{ fontSize: 40 }} />
                            </Avatar>

                            <Box>
                                <Typography variant="h4" fontWeight={800}>
                                    {producto.nombre}
                                </Typography>
                                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                                    {producto.marca} · {producto.categoria?.nombreCat || 'Sin categoría'}
                                </Typography>
                            </Box>
                        </Stack>

                        <Chip
                            label={producto.estado ? 'ACTIVO' : 'INACTIVO'}
                            sx={{
                                fontWeight: 'bold',
                                bgcolor: producto.estado ? 'success.main' : 'grey.600',
                                color: 'white',
                            }}
                        />
                    </Box>
                </Paper>
                <Grid container spacing={3} alignItems="stretch">
                    <Grid item xs={12} md={6}>
                        <InfoCard title="Identificación" icon={<QrCodeIcon />}>
                            <Grid container spacing={3}>
                                <InfoRow label="SKU" value={producto.sku} />
                                <InfoRow label="EAN" value={producto.codEan || '-'} />
                                <InfoRow label="Categoría" value={producto.categoria?.nombreCat || '-'} />
                                <InfoRow label="Unidad" value={producto.uni_medida} />
                            </Grid>
                        </InfoCard>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <InfoCard title="Precios y Costos" icon={<MonetizationOnIcon />}>
                            <Grid container spacing={3}>
                                <InfoRow label="Compra" value={formatCurrency(producto.precio_compra)} />
                                <InfoRow
                                    label="Venta"
                                    value={
                                        <Typography fontWeight={700} color="success.main">
                                            {formatCurrency(producto.precio_venta)}
                                        </Typography>
                                    }
                                />
                            </Grid>

                            <Box sx={{ mt: 'auto', pt: 3 }}>
                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    Margen: {formatCurrency(producto.precio_venta - producto.precio_compra)}
                                </Alert>
                            </Box>
                        </InfoCard>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <InfoCard title="Gestión de Stock" icon={<Inventory2Icon />}>
                            <Stack direction="row" justifyContent="space-evenly" sx={{ flex: 1 }}>
                                <Chip label={`Min: ${producto.stockMinimo ?? 0}`} color="warning" />
                                <Chip label={`Ideal: ${producto.stockIdeal ?? 0}`} color="success" />
                            </Stack>

                            <Box sx={{ mt: 2, width: '100%' }}>
                                <Alert
                                    severity="success"
                                    icon={<LocalShippingIcon fontSize="inherit" />}
                                    sx={{
                                        borderRadius: 2,
                                        width: '100%',
                                        justifyContent: 'center',
                                        '& .MuiAlert-message': { width: '100%', textAlign: 'center' }
                                    }}
                                >
                                    <Typography variant="subtitle2" fontWeight="800">
                                        Lote de Reposición: {((producto.stockIdeal || 0) - (producto.stockMinimo || 0))} u.
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ lineHeight: 1.2, opacity: 0.9 }}>
                                        Sugerencia de compra automática
                                    </Typography>
                                </Alert>
                            </Box>
                        </InfoCard>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <InfoCard title="Proveedor" icon={<LocalShippingIcon />}>
                            <Typography variant="h6">
                                {producto.proveedor?.nombre_proveedor || 'No asignado'}
                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            <Grid container spacing={2}>
                                <InfoRow label="Teléfono" value={producto.proveedor?.telefono || '-'} />
                                <InfoRow label="Email" value={producto.proveedor?.email || '-'} />
                            </Grid>
                        </InfoCard>
                    </Grid>
                </Grid>
                <FormularioDialogoProducto
                    open={openEditDialog}
                    onClose={() => setOpenEditDialog(false)}
                    title="Editar Producto"
                    producto={producto}
                    areas={areas}
                    categorias={categorias}
                    proveedores={proveedores}
                    onConfirm={onSaveEdit}
                    isSaving={updateProductoMutation.isPending}
                />
            </Container>
        </LayoutDashboard>
    );
};

export default DetalleProducto;
