import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRoles, deleteRol, updateRol } from "../../api/rolApi";
import {
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TablaLista from "../../components/TablaLista";
import FormularioDialogo from "../../components/FomularioDialogo";
import { rolSchema } from "../../Utils/usuarioSchema";

const MySwal = withReactContent(Swal);

function ListaRoles() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const {
		data: rolesData,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["roles"],
		queryFn: getRoles,
	});
  const roles = rolesData || [];
  const rolesFields = [
    { name: "nombreRol", label: "Nombre del Rol", type: "text" },
  ];
  const deleteRolMutation = useMutation({
		mutationFn: deleteRol,
		onSuccess: () => {
			queryClient.invalidateQueries(["roles"]);
			MySwal.fire("Eliminado", "El rol fue eliminado correctamente.", "success");
		},
		onError: (error) => {
			console.error("Error al eliminar rol:", error);
			const mensaje =
				error.response?.data?.message || "No se pudo eliminar el rol.";
			MySwal.fire("Error", mensaje, "error");
		},
	});
  const updateRolMutation = useMutation({
		mutationFn: (variables) => updateRol(variables.id, variables.data),
		onSuccess: () => {
			queryClient.invalidateQueries(["roles"]);
      setOpenEditDialog(false);
			MySwal.fire(
				"Actualizado",
				"El rol fue actualizado correctamente.",
				"success"
			);
		},
		onError: (error) => {
			console.error("Error al actualizar rol:", error);
			const mensaje =
				error.response?.data?.message || "No se pudo actualizar el rol.";
			MySwal.fire("Error", mensaje, "error");
		},
	});
  const handleEliminar = async (id) => {
    const result = await MySwal.fire({
      title: "¿Eliminar rol?",
      text: "Esta acción eliminará el rol permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }
    deleteRolMutation.mutate(id);
  };

  const handleEditar = async (rol) => {
    setRolSeleccionado({
      id_rol: rol.id_rol,
      nombreRol: rol.nombreRol,
    });
    setOpenEditDialog(true);
  };
  const onSaveEdit = (formData) => {
    const payload = {
      nombreRol: formData.nombreRol,
    };
    updateRolMutation.mutate({
      id: rolSeleccionado.id_rol,
      data: payload,
    });
  };
  const columns = [
    { 
      field: "id_rol", 
      headerName: "ID", 
      width: 70 
    },
    { 
      field: "nombreRol", 
      headerName: "Nombre del Rol", 
      flex: 1, 
      minWidth: 150 
    },
    {
      field: "acciones",
      headerName: "Acciones",
      type: "actions",
      width: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} justifyContent="center">
          <Tooltip title="Editar">
            <IconButton
              size="small"
              color="info"
              onClick={() => handleEditar(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleEliminar(params.row.id_rol)}
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
        title="Lista de Roles"
        data={roles}
        columns={columns}
        isLoading={isLoading}
        getRowId={(row) => row.id_rol}
        onRefresh={refetch}
        onBack={() => navigate("/dashboard-usuarios")}
        onAdd={() => navigate("/roles/nuevo")}
        addButtonLabel="Ingresar Rol"
      />
      <FormularioDialogo
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        title="Editar Rol"
        fields={rolesFields}
        validationSchema={rolSchema}
        initialValues={rolSeleccionado}
        onConfirm={onSaveEdit}
        isSaving={updateRolMutation.isPending}
      />
    </>
  );
}

export default ListaRoles;
