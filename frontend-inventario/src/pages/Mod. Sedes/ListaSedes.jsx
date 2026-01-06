import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSedes, deleteSede, updateSede } from "../../api/sedeApi";
import {
  Stack,
  Tooltip, 
  IconButton, 
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete"; 
import TablaLista from "../../components/TablaLista";
import FormularioDialogo from "../../components/FomularioDialogo";
import { sedeSchema } from "../../Utils/sedeSchema";

const MySwal = withReactContent(Swal);

const ListaSedes = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [sedeSeleccionada, setSedeSeleccionada] = useState(null);

	const {
		data: sedesData,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["sedes"],
		queryFn: getSedes,
	});
	const sedes = sedesData || [];
	const sedeFields = [
		{ name: "nombreSede", label: "Sede", type: "text" },
		{ name: "direccion", label: "Dirección", type: "text" },
		{ name: "anexo", label: "Anexo", type: "text" },
	];
	const deleteSedeMutation = useMutation({
		mutationFn: deleteSede,
		onSuccess: () => {
			queryClient.invalidateQueries(["sedes"]);
			MySwal.fire("Eliminado", "La sede fue eliminada correctamente", "success");
		},
		onError: (err) => {
			console.error("Error al eliminar sede:", err);
			const mensaje = err.response?.data?.message || "No se pudo eliminar la sede";
			MySwal.fire("Error", mensaje, "error");
		},
	});
	const updateSedeMutation = useMutation({
		mutationFn: (variables) => updateSede(variables.id, variables.data),
		onSuccess: () => {
			queryClient.invalidateQueries(["sedes"]);
			setOpenEditDialog(false);
			MySwal.fire(
				"Actualizado",
				"La sede se actualizó correctamente",
				"success"
			);
		},
		onError: (err) => {
			console.error("Error al actualizar sede:", err);
			const mensaje =
				err.response?.data?.message || "No se pudo actualizar la sede";
			MySwal.fire("Error", mensaje, "error");
		},
	});
	const handleEliminar = async (id) => {
		const resultado = await MySwal.fire({
			title: "¿Eliminar sede?",
			text: "Esta acción eliminará la sede seleccionada.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Sí, eliminar",
			cancelButtonText: "Cancelar",
			reverseButtons: true,
		});

		if (!resultado.isConfirmed) {
			return;
		}
		deleteSedeMutation.mutate(id);
	};

	const handleEditar = async (sede) => {
		setSedeSeleccionada({
			idSede: sede.idSede,
			nombreSede: sede.nombreSede,
			direccion: sede.direccion,
			anexo: sede.anexo,
		});
		setOpenEditDialog(true);
	};
	const onSaveEdit = (formData) => {
		const payload = {
			nombreSede: formData.nombreSede,
			direccion: formData.direccion,
			anexo: formData.anexo,
		};
		updateSedeMutation.mutate({
			id: sedeSeleccionada.idSede,
			data: payload,
		});
	};
	const columns = [
		{ 
		field: "idSede", 
		headerName: "ID", 
		width: 80 
		},
		{ 
		field: "nombreSede", 
		headerName: "Sede", 
		minWidth: 200,
		flex: 1 
		},
		{
		field: "direccion", 
		headerName: "Dirección", 
		minWidth: 250,
		flex: 1
		},
		{ 
		field: "anexo", 
		headerName: "Anexo", 
		width: 120 
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
				onClick={() => handleEditar(params.row)} 
				>
				<EditIcon fontSize="small" />
				</IconButton>
			</Tooltip>
			<Tooltip title="Eliminar">
				<IconButton
				size="small"
				color="error"
				onClick={() => handleEliminar(params.row.idSede)}
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
				title="Lista de Sedes"
				columns={columns}
				data={sedes}
				isLoading={isLoading}
				onRefresh={refetch}
				onAdd={() => navigate("/sedes/nuevo")}
				onBack={() => navigate("/dashboard-sedes")}
				getRowId={(row) => row.idSede}
				addButtonLabel="Ingresar Nueva Sede"
			/>
			<FormularioDialogo
				open={openEditDialog}
				onClose={() => setOpenEditDialog(false)}
				title="Editar Sede"
				fields={sedeFields}
				validationSchema={sedeSchema}
				initialValues={sedeSeleccionada}
				onConfirm={onSaveEdit}
				isSaving={updateSedeMutation.isPending}
			/>
		</>
		
	);
};

export default ListaSedes;
