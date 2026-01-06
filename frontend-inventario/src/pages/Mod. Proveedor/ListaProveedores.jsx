import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProveedores,
  deleteProveedor,
  updateProveedor,
  activarProveedor,
  desactivarProveedor,
} from "../../api/proveedorApi";
import {
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import TablaLista from "../../components/TablaLista";
import FormularioDialogo from "../../components/FomularioDialogo";
import { proveedorSchema } from "../../Utils/proveedorSchema";
const MySwal = withReactContent(Swal);
const ListaProveedores = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const {
		data: proveedoresData,
		isLoading,
		isError,  
		error,
		refetch,   
	} = useQuery({
		queryKey: ["proveedores"],
		queryFn: getProveedores,
	});
  const proveedores = proveedoresData || [];
  const proveedorFields = [
    { name: "ruc", label: "RUC", type: "text" },
    { name: "nombre_proveedor", label: "Razón Social", type: "text" },
    { name: "telefono", label: "Teléfono", type: "text" },
    { name: "email", label: "Email", type: "text" },
    { name: "direccion", label: "Dirección", type: "text" },
  ];
  const deleteProveedorMutation = useMutation({
		mutationFn: deleteProveedor,
		onSuccess: () => {
			queryClient.invalidateQueries(["proveedores"]);
			MySwal.fire("Eliminado", "El proveedor fue eliminado.", "success");
		},
		onError: (error) => {
			console.error("Error al eliminar proveedor:", error);
			const mensaje =
				error.response?.data?.message || "No se pudo eliminar el proveedor";
			MySwal.fire("Error", mensaje, "error");
		},
	});
  const toggleEstadoMutation = useMutation({
		mutationFn: (variables) =>
			variables.activar
				? activarProveedor(variables.id)
				: desactivarProveedor(variables.id),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries(["proveedores"]);
			const accion = variables.activar ? "Activado" : "Desactivado";
			MySwal.fire(accion, `El proveedor fue ${accion.toLowerCase()}.`, "success");
		},
		onError: (error, variables) => {
			const accion = variables.activar ? "activar" : "desactivar";
			console.error(`Error al ${accion} proveedor:`, error);
			MySwal.fire("Error", `No se pudo ${accion} el proveedor`, "error");
		},
	});
  const updateProveedorMutation = useMutation({
		mutationFn: (variables) => updateProveedor(variables.id, variables.data),
		onSuccess: () => {
			queryClient.invalidateQueries(["proveedores"]);
      setOpenEditDialog(false);
			MySwal.fire(
				"Actualizado",
				"Proveedor actualizado correctamente",
				"success"
			);
		},
		onError: (error) => {
			console.error("Error al actualizar proveedor:", error);
			const mensaje =
				error.response?.data?.message || "No se pudo actualizar el proveedor";
			MySwal.fire("Error", mensaje, "error");
		},
	});
  const handleEliminar = async (id) => {
    const result = await MySwal.fire({
      title: "¿Eliminar proveedor?",
      text: "Esta acción eliminará al proveedor permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }
    deleteProveedorMutation.mutate(id);
  };

  const handleDesactivar = async (id) => {
    const result = await MySwal.fire({
      title: "¿Desactivar proveedor?",
      text: "El proveedor no podrá interactuar mientras esté desactivado.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }
    toggleEstadoMutation.mutate({ id, activar: false });
  };

  const handleActivar = async (id) => {
    const result = await MySwal.fire({
      title: "¿Activar proveedor?",
      text: "El proveedor podrá interactuar después de activar la cuenta.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, activar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }
    toggleEstadoMutation.mutate({ id, activar: true });
  };

  const handleEditar = async (proveedor) => {
    setProveedorSeleccionado({
      id_proveedor: proveedor.id_proveedor,
      ruc: proveedor.ruc,
      nombre_proveedor: proveedor.nombre_proveedor,
      telefono: proveedor.telefono,
      email: proveedor.email,
      direccion: proveedor.direccion,
    });
    setOpenEditDialog(true);
  };
  const onSaveEdit = (formData) => {
    const payload = {
      ruc: formData.ruc,
      nombre_proveedor: formData.nombre_proveedor,
      telefono: formData.telefono,
      email: formData.email,
      direccion: formData.direccion,
    };
    updateProveedorMutation.mutate({
      id: proveedorSeleccionado.id_proveedor,
      data: payload,
    });
  };
  const columns = [
    { field: "id_proveedor", headerName: "ID", width: 50 },
    { field: "ruc", headerName: "RUC", width: 120 },
    { field: "nombre_proveedor", headerName: "Razón Social", flex: 1, minWidth: 200 },
    { field: "telefono", headerName: "Teléfono", width: 120 },
    { field: "email", headerName: "Email", minWidth: 200, flex: 1 },
    { field: "direccion", headerName: "Dirección", minWidth: 250, flex: 1.5 },
    /*{
      field: "estado",
      headerName: "Estado",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={getEstadoTexto(params.value)}
          color={params.value === 1 ? "success" : "default"}
          size="small"
        />
      ),
    },*/ 
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
          
          {params.row.estado === 1 ? (
            <Tooltip title="Desactivar">
              <IconButton
                size="small"
                color="warning"
                onClick={() => handleDesactivar(params.row.id_proveedor)}
              >
                <HighlightOffIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Activar">
              <IconButton
                size="small"
                color="success"
                onClick={() => handleActivar(params.row.id_proveedor)}
              >
                <CheckCircleOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleEliminar(params.row.id_proveedor)}
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
        title="Lista de Proveedores"
        columns={columns}
        data={proveedores}
        isLoading={isLoading}
        onRefresh={refetch}
        onAdd={() => navigate("/proveedores/nuevo")}
        onBack={() => navigate("/dashboard-proveedores")}
        getRowId={(row) => row.id_proveedor}
        addButtonLabel="Ingresar Nuevo Proveedor"
      />
      <FormularioDialogo
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        title="Editar Proveedor"
        fields={proveedorFields}
        validationSchema={proveedorSchema}
        initialValues={proveedorSeleccionado}
        onConfirm={onSaveEdit}
        isSaving={updateProveedorMutation.isPending}
      />
    </>
    
  );
};

export default ListaProveedores;
