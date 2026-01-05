import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Grid,
    TextField,
    MenuItem,
    Button,
    Chip
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import { useTheme } from '@mui/material';
import TablaLista from '../../components/TablaLista';
import { filtrarActividades } from '../../api/historialActividadApi';
import { getUsuarios } from '../../api/usuarioApi';

const AuditoriaActividadUsuario = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [filtros, setFiltros] = useState({
        fechaInicio: '',
        fechaFin: '',
        usuarioId: '',
        modulo: ''
    });

    const [filtrosAplicados, setFiltrosAplicados] = useState({});

    const { data: listaUsuarios = [] } = useQuery({
        queryKey: ['usuarios'],
        queryFn: getUsuarios,
        staleTime: 1000 * 60 * 10,
        initialData: []
    });

    const {
        data: actividades = [],
        isLoading,
        refetch
    } = useQuery({
        queryKey: ['auditoria', filtrosAplicados],
        queryFn: () => filtrarActividades(filtrosAplicados),
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    const handleBuscar = () => {
        const params = {};
        if (filtros.usuarioId) params.usuarioId = filtros.usuarioId;
        if (filtros.modulo) params.modulo = filtros.modulo;
        if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
        if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;

        setFiltrosAplicados(params);
    };

    const handleLimpiar = () => {
        const estadoInicial = {
            fechaInicio: '',
            fechaFin: '',
            usuarioId: '',
            modulo: ''
        };
        setFiltros(estadoInicial);
        setFiltrosAplicados({});
    };

    const columns = useMemo(() => [
        {
            field: 'fechaHora',
            headerName: 'Fecha y Hora',
            width: 200,
            valueFormatter: (params) => {
                if (!params) return '';

                const fechaUTC = params.endsWith('Z') ? params : params + 'Z';

                return new Date(fechaUTC).toLocaleString('es-PE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                });
            }
        },
        { field: 'nombreUsuario', headerName: 'Usuario', width: 100 },
        {
            field: 'rolUsuario',
            headerName: 'Rol',
            width: 120,
            renderCell: (params) => (
                <Chip label={params.value} size="small" variant="outlined" color="primary" />
            )
        },
        {
            field: 'tipoAccion',
            headerName: 'Acción',
            width: 120,
            renderCell: (params) => {
                let color = 'default';
                if (params.value === 'CREACIÓN') color = 'success';
                if (params.value === 'ACTUALIZACIÓN') color = 'primary';
                if (params.value === 'ELIMINACIÓN') color = 'error';
                if (params.value === 'LOGIN') color = 'info';
                if (params.value === 'ACTIVACIÓN') {
                    return <Chip label={params.value} sx={{ bgcolor: 'green', color: 'white', fontWeight: 'bold' }} />;
                }
                if (params.value === 'DESACTIVACIÓN') {
                    return <Chip label={params.value} sx={{ bgcolor: 'yellow', color: 'black', fontWeight: 'bold' }} />;
                }
                if (params.value === 'RECEPCIÓN') {
                    return <Chip label={params.value} sx={{ bgcolor: 'orange', color: 'black', fontWeight: 'bold' }} />;
                }

                return <Chip label={params.value} color={color} size="small" sx={{ fontWeight: 'bold', }} />;
            }
        },
        { field: 'modulo', headerName: 'Módulo', width: 130 },
        { field: 'entidadAfectada', headerName: 'Entidad', width: 120 },
        { field: 'descripcion', headerName: 'Descripción', flex: 1, minWidth: 250 },
        { field: 'ipDireccion', headerName: 'IP', width: 130 },
    ], []);

    return (
        <TablaLista
            title="Reporte de Auditoría"
            columns={columns}
            data={actividades}
            isLoading={isLoading}
            onRefresh={refetch}
            getRowId={(row) => row.id}
            onBack={() => navigate('/dashboard-reportes')}
        >
            <Box sx={{ p: 2, m: { xs: 1, sm: 2, md: 3 }, mb: 0, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            label="Desde"
                            type="datetime-local"
                            name="fechaInicio"
                            value={filtros.fechaInicio}
                            onChange={handleInputChange}
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                '& input::-webkit-calendar-picker-indicator': {
                                    filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
                                    cursor: 'pointer'
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="Hasta"
                            type="datetime-local"
                            name="fechaFin"
                            value={filtros.fechaFin}
                            onChange={handleInputChange}
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                '& input::-webkit-calendar-picker-indicator': {
                                    filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
                                    cursor: 'pointer'
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            select
                            label="Usuario"
                            name="usuarioId"
                            value={filtros.usuarioId}
                            onChange={handleInputChange}
                            fullWidth
                            size="small"
                            sx={{ minWidth: { xs: '100%', sm: 260, md: 280 } }}
                        >
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {listaUsuarios.map((user) => (
                                <MenuItem key={user.id_u} value={user.id_u}>
                                    {user.nombre_u} {user.apellido_pat}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            select
                            label="Módulo"
                            name="modulo"
                            value={filtros.modulo}
                            onChange={handleInputChange}
                            fullWidth
                            size="small"
                            sx={{ minWidth: { xs: '100%', sm: 220, md: 240 } }}
                        >
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            <MenuItem value="INVENTARIO">INVENTARIO</MenuItem>
                            <MenuItem value="INICIO SESIÓN">INICIO SESIÓN</MenuItem>
                            <MenuItem value="USUARIO">USUARIO</MenuItem>
                            <MenuItem value="PRODUCTO">PRODUCTO</MenuItem>
                            <MenuItem value="AREA">AREA</MenuItem>
                            <MenuItem value="CATEGORIA">CATEGORIA</MenuItem>
                            <MenuItem value="SEDES">SEDE</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={2} sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            startIcon={<SearchIcon />}
                            onClick={handleBuscar}
                            disabled={isLoading}
                            fullWidth
                        >
                            Buscar
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={handleLimpiar}>
                            <CleaningServicesIcon />
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </TablaLista>
    );
};

export default AuditoriaActividadUsuario;