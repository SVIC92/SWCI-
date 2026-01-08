import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllHus, deleteHu } from "../../api/huApi";
import {
    Stack,
    Tooltip,
    IconButton,
    Chip,
    Box
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TablaLista from "../../components/TablaLista";

const MySwal = withReactContent(Swal);

const GestionHu = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const {
        data: husData,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["hus"],
        queryFn: getAllHus,
    });

    const hus = husData || [];

    const deleteHuMutation = useMutation({
        mutationFn: deleteHu,
        onSuccess: () => {
            queryClient.invalidateQueries(["hus"]);
            MySwal.fire("Eliminado", "La HU ha sido eliminada correctamente", "success");
        },
        onError: (err) => {
            console.error("Error al eliminar HU:", err);
            const mensaje = err.response?.data?.message || "No se pudo eliminar la HU. Verifique que no esté en proceso.";
            MySwal.fire("Error", mensaje, "error");
        },
    });
    const handleEliminar = async (id) => {
        const resultado = await MySwal.fire({
            title: "¿Eliminar HU?",
            text: "Esta acción no se puede deshacer. Solo se pueden eliminar HUs que no han sido enviadas.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
        });

        if (resultado.isConfirmed) {
            deleteHuMutation.mutate(id);
        }
    };
    const handleEditar = async (id) => {
        const resultado = await MySwal.fire({
            title: "¿Deseas modificar esta HU?",
            text: "Serás redirigido al formulario de edición para agregar productos o cambiar el estado.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, editar",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
        });

        if (resultado.isConfirmed) {
            navigate(`/hu/gestion/actualizar/${id}`);
        }
    };

    const handleVerDetalle = (id) => {
        navigate(`/hu/gestion/detalle/${id}`);
    }

    const getStatusColor = (estado) => {
        switch (estado) {
            case "COMPLETO": return "success";
            case "EN_CONSTRUCCION": return "info";
            case "VENCIDO": return "error";
            case "SOLICITADO": return "warning";
            case "QUIEBRE": return "primary";
            case "ENTREGADO": return "default";
            default: return "default";
        }
    };

    // 5. Definición de columnas
    const columns = [
        { field: "id", headerName: "ID", width: 70 },
        {
            field: "codHu",
            headerName: "Código HU",
            width: 150,
            renderCell: (params) => (
                <span style={{ fontWeight: "bold" }}>{params.value}</span>
            )
        },
        {
            field: "almacen",
            headerName: "Origen",
            width: 180,
            valueGetter: (value, row) => row.almacen?.nombreSede || "N/A",
        },
        {
            field: "sedeDestino",
            headerName: "Destino",
            width: 180,
            valueGetter: (value, row) => row.sedeDestino?.nombreSede || "---",
        },
        {
            field: "estado",
            headerName: "Estado",
            width: 150,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={getStatusColor(params.value)}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: "bold" }}
                />
            ),
        },
        {
            field: "tipoIndicador",
            headerName: "Tipo",
            width: 120,
        },
        {
            field: "fechaSolicitada",
            headerName: "Fecha Solicitada",
            width: 180,
            valueFormatter: (value) => {
                if (!value) return "---";
                return new Date(value).toLocaleString();
            },
        },
        {
            field: "acciones",
            headerName: "Acciones",
            type: "actions",
            width: 150,
            getActions: (params) => {
                const isLocked = ["SOLICITADO", "ENTREGADO", "VENCIDO", "QUIEBRE"].includes(params.row.estado);

                return [
                    <Tooltip title={isLocked ? "No editable" : "Actualizar HU"}>
                        <span>
                            <IconButton
                                size="small"
                                color="primary"
                                disabled={isLocked}
                                onClick={() => handleEditar(params.row.id)}
                            >
                                <EditIcon />
                            </IconButton>
                        </span>
                    </Tooltip>,

                    <Tooltip title={isLocked ? "No eliminable" : "Eliminar"}>
                        <span>
                            <IconButton
                                size="small"
                                color="error"
                                disabled={isLocked}
                                onClick={() => handleEliminar(params.row.id)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                ];
            },
        },
    ];

    return (
        <>
            <TablaLista
                title="Gestión de Paletas (HUs)"
                columns={columns}
                data={hus}
                isLoading={isLoading}
                onRefresh={refetch}
                onAdd={() => navigate("/hu/gestion/crear")}
                addButtonLabel="Crear HU"
                onBack={() => navigate("/dashboard-logistica")}
                getRowId={(row) => row.id}
            />
        </>
    );
};

export default GestionHu;