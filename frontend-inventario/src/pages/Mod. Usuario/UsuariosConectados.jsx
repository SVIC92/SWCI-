import React, { useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { Chip, Box } from "@mui/material";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import TablaLista from "../../components/TablaLista";
import { useGlobalStore } from '../../store/useGlobalStore';
import { getUsuariosConectados } from '../../api/usuarioApi';

const UsuariosConectados = () => {
    const navigate = useNavigate();

    const usuarios = useGlobalStore((state) => state.usuariosConectados);
    const setUsuariosConectados = useGlobalStore((state) => state.setUsuariosConectados);

    useEffect(() => {
        const fetchInicial = async () => {
            try {
                const data = await getUsuariosConectados();
                setUsuariosConectados(data);
            } catch (error) {
                console.error("Error cargando usuarios iniciales", error);
            }
        };
        fetchInicial();
    }, [setUsuariosConectados]);

    const rows = useMemo(() => {
        const lista = Array.isArray(usuarios) ? usuarios : [];
        return lista.map((email) => ({
            id: email,
            email: email,
            estado: 'online'
        }));
    }, [usuarios]);

    const columns = [
        {
            field: "email",
            headerName: "Usuario Conectado (Email)",
            flex: 1,
            minWidth: 200
        },
        {
            field: "estado",
            headerName: "Estado",
            width: 150,
            renderCell: () => (
                <Chip
                    icon={<FiberManualRecordIcon style={{ fontSize: 12 }} />}
                    label="En Línea"
                    color="success"
                    variant="outlined"
                    size="small"
                    sx={{
                        borderColor: 'transparent',
                        bgcolor: 'rgba(46, 125, 50, 0.1)',
                        fontWeight: 'bold'
                    }}
                />
            ),
        }
    ];

    return (
        <TablaLista
            title={`Usuarios en Tiempo Real (${usuarios.length})`}
            columns={columns}
            data={rows}
            isLoading={false}
            getRowId={(row) => row.id}
            onBack={() => navigate("/dashboard-usuarios")}
            onAdd={null}
            onRefresh={null}
        >
            <Box sx={{ mb: 2, px: 3 }}>
                <small style={{ color: 'gray' }}>
                    * Monitoreo global activo.
                </small>
            </Box>
        </TablaLista>
    );
};

export default UsuariosConectados;