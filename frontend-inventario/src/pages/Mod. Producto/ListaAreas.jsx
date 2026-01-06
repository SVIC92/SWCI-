import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAreas, deleteArea, updateArea } from "../../api/areaApi";
import {
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TablaLista from "../../components/TablaLista";
import FormularioDialogo from "../../components/FomularioDialogo";
import { areaSchema } from "../../Utils/productoSchema";


const MySwal = withReactContent(Swal);

const AreaList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [areaSeleccionada, setAreaSeleccionada] = useState(null);
  const {
		data: areasData,
		isLoading,
		isError,
		error,
		refetch, 
	} = useQuery({
		queryKey: ["areas"],
		queryFn: getAreas,
	});
  const areas = areasData || [];
  const areaFields = [{ name: "nombreArea", label: "Área", type: "text" }];
  const deleteAreaMutation = useMutation({
		mutationFn: deleteArea,
		onSuccess: () => {
			queryClient.invalidateQueries(["areas"]);
			MySwal.fire("Eliminado", "El área fue eliminada correctamente", "success");
		},
		onError: (err) => {
			let errorMessage = "No se pudo eliminar el área.";
			if (err.response?.data?.message) {
				errorMessage = err.response.data.message;
			}
			console.error("Error al eliminar área:", err);
			MySwal.fire("Error", errorMessage, "error");
		},
	});
  const updateAreaMutation = useMutation({
		mutationFn: (variables) => updateArea(variables.id, variables.data),
		onSuccess: () => {
			queryClient.invalidateQueries(["areas"]);
      setOpenEditDialog(false);
			MySwal.fire(
				"Actualizado",
				"El área se actualizó correctamente",
				"success"
			);
		},
		onError: (err) => {
			console.error("Error al actualizar área:", err);
			const mensaje =
				err.response?.data?.message || "No se pudo actualizar el área";
			MySwal.fire("Error", mensaje, "error");
		},
	});
  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: "¿Eliminar área?",
      text: "Esta acción eliminará el área seleccionada de manera permanente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    deleteAreaMutation.mutate(id);
  };
  const handleEdit = async (area) => {
    setAreaSeleccionada({
      id_area: area.id_area,
      nombreArea: area.nombreArea,
    });
    setOpenEditDialog(true);
  };
  const onSaveEdit = (formData) => {
    const payload = {
      nombreArea: formData.nombreArea,
    };
    updateAreaMutation.mutate({
      id: areaSeleccionada.id_area,
      data: payload,
    });
  };
  const columns = [
    { 
      field: "id_area", 
      headerName: "ID", 
      width: 100 
    },
    { 
      field: "nombreArea", 
      headerName: "Nombre del Área", 
      flex: 1, 
      minWidth: 250 
    },
    {
      field: "acciones",
      headerName: "Acciones",
      type: "actions",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} justifyContent="center">
          <Tooltip title="Editar">
            <IconButton
              size="small"
              color="info"
              onClick={() => handleEdit(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id_area)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];
  return (
    <>
      <TablaLista
        title="Lista de Áreas"
        columns={columns}
        data={areas}
        isLoading={isLoading}
        onRefresh={() => refetch()}
        onAdd={() => navigate("/areas/nuevo")}
        onBack={() => navigate("/dashboard-productos")}
        getRowId={(row) => row.id_area}
        addButtonLabel="Ingresar Nueva Área"
      />
      <FormularioDialogo
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        title="Editar Área"
        fields={areaFields}
        validationSchema={areaSchema}
        initialValues={areaSeleccionada}
        onConfirm={onSaveEdit}
        isSaving={updateAreaMutation.isPending}
      />
    </>
    
  );
};

export default AreaList;