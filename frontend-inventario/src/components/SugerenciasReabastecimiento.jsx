import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getSugerenciasReabastecimiento } from '../api/productoApi';
import { getSedes } from '../api/sedeApi';
import TablaLista from './TablaLista';
import { Box, FormControl, InputLabel, Select, MenuItem, Chip, Alert, Typography } from '@mui/material';
import BuscadorInteligente from './BuscadorInteligente';
// 1. IMPORTANTE: Volvemos a importar el Layout para usarlo cuando no hay tabla
import LayoutDashboard from './Layouts/LayoutDashboard';

const SugerenciasReabastecimiento = () => {
    const navigate = useNavigate();
    const [idSede, setIdSede] = useState('');

    const { data: sedes = [], isLoading: loadingSedes } = useQuery({
        queryKey: ['sedes'],
        queryFn: getSedes
    });

    const {
        data: sugerenciasData,
        isLoading: loadingSugerencias,
        refetch
    } = useQuery({
        queryKey: ['sugerenciasReabastecimiento', idSede],
        queryFn: () => getSugerenciasReabastecimiento(idSede),
        enabled: !!idSede,
    });

    const datosTabla = sugerenciasData || [];
    const isLoading = loadingSedes || (!!idSede && loadingSugerencias);

    const columns = [
        { field: 'idProducto', headerName: 'ID', width: 50 },
        { field: 'nombre', headerName: 'Producto', flex: 1, minWidth: 150 },
        { field: 'proveedor', headerName: 'Proveedor Sugerido', flex: 1, minWidth: 150 },
        {
            field: 'stockActual',
            headerName: 'Stock Actual',
            width: 110,
            align: 'center',
            renderCell: (params) => (
                <Chip label={params.value} color="error" size="small" variant="outlined" />
            )
        },
        { field: 'stockMinimo', headerName: 'Mínimo', width: 90, align: 'center' },
        { field: 'stockIdeal', headerName: 'Ideal', width: 90, align: 'center' },
        {
            field: 'cantidadSugerida',
            headerName: 'A Comprar',
            width: 130,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Chip
                    label={`+ ${params.value}`}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                />
            )
        },
    ];

    // Contenido de los filtros (reutilizable)
    const filtrosContent = (
        <Box
            sx={{
                mb: 3,
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3,
                alignItems: 'center',
                justifyContent: 'space-between'
            }}
        >
            <Box sx={{ width: { xs: '100%', md: '400px' } }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Búsqueda Rápida de Productos:
                </Typography>
                <BuscadorInteligente />
            </Box>

            <Box sx={{ width: { xs: '100%', md: '300px' } }}>
                <FormControl fullWidth size="small">
                    <InputLabel>Filtrar Alertas por Sede</InputLabel>
                    <Select
                        value={idSede}
                        label="Filtrar Alertas por Sede"
                        onChange={(e) => setIdSede(e.target.value)}
                    >
                        {sedes.map((sede) => (
                            <MenuItem key={sede.idSede} value={sede.idSede}>
                                {sede.nombreSede}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        </Box>
    );

    // 2. LÓGICA CONDICIONAL PARA EL RETURN

    // CASO A: Si NO hay sede seleccionada, usamos LayoutDashboard manualmente
    if (!idSede) {
        return (
            <LayoutDashboard>
                <Box sx={{ p: 2 }}>
                    {filtrosContent}
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Por favor, seleccione una sede arriba para ver las sugerencias de compra.
                    </Alert>
                </Box>
            </LayoutDashboard>
        );
    }

    // CASO B: Si HAY sede, usamos TablaLista (que ya trae el LayoutDashboard por dentro)
    return (
        <TablaLista
            title={`Sugerencias de Compra - ${sedes.find(s => s.idSede === idSede)?.nombreSede || ''}`}
            columns={columns}
            data={datosTabla}
            isLoading={isLoading}
            onRefresh={refetch}
            onBack={() => navigate('/dashboard-productos')}
            getRowId={(row) => row.idProducto}
            addButtonLabel=""
            onAdd={null}
        >
            {/* Pasamos los filtros como hijo para que se vean dentro de la tabla */}
            {filtrosContent}
        </TablaLista>
    );
};

export default SugerenciasReabastecimiento;