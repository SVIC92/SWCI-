import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardHeader,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Chip
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LayoutDashboard from '../../components/Layouts/LayoutDashboard';

import { getUltimosAccesos } from '../../api/historialActividadApi';

const HistorialAccesos = () => {
    const [accesos, setAccesos] = useState([]);

    useEffect(() => {
        cargarAccesos();
    }, []);

    const cargarAccesos = async () => {
        try {
            const data = await getUltimosAccesos();
            setAccesos(data);
        } catch (error) {
            console.error("Error al cargar historial de accesos", error);
        }
    };

    return (
        <>
        <LayoutDashboard>
                <Box sx={{ p: 3 }}>
                    <Card elevation={3}>
                        <CardHeader
                            title={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <AccessTimeIcon color="primary" />
                                    <Typography variant="h6">Último Inicio de Sesión por Usuario</Typography>
                                </Box>
                            }
                        />
                        <CardContent>
                            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                                <Table>
                                    <TableHead 
                                        sx={{
                                            backgroundColor: (theme) =>
                                                theme.palette.mode === 'dark' ? '#343535ff' : '#f5f5f5',
                                            '& .MuiTableCell-root': {
                                                color: (theme) =>
                                                    theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
                                            }
                                        }}>
                                        <TableRow>
                                            <TableCell><strong>Usuario</strong></TableCell>
                                            <TableCell><strong>Rol</strong></TableCell>
                                            <TableCell><strong>Última Conexión</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {accesos.length > 0 ? (
                                            accesos.map((fila, index) => (
                                                <TableRow key={index} hover>
                                                    <TableCell>{fila.nombreCompleto}</TableCell>
                                                    <TableCell>
                                                        <Chip label={fila.rol} size="small" color="primary" variant="outlined" />
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(
                                                            fila.ultimaFecha.endsWith('Z') ? fila.ultimaFecha : fila.ultimaFecha + 'Z'
                                                        ).toLocaleString('es-PE', {
                                                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                                                        })}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center">No hay registros de accesos</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Box>
        </LayoutDashboard>
        </>
    );
};

export default HistorialAccesos;