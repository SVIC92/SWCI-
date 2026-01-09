import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSedes, getAlmacenes, deleteSede, updateSede } from "../../api/sedeApi";
import {
	Stack,
	Tooltip,
	IconButton,
	Box,
	ToggleButton, 
	ToggleButtonGroup, 
	Paper    
} from "@mui/material";
import BusinessIcon from '@mui/icons-material/Business';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TablaLista from "../../components/TablaLista";
import FormularioDialogo from "../../components/FomularioDialogo";
import { sedeSchema } from "../../Utils/sedeSchema";

const MySwal = withReactContent(Swal);

const ListaSedes = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [mostrarAlmacenes, setMostrarAlmacenes] = useState(false);
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [sedeSeleccionada, setSedeSeleccionada] = useState(null);

	// --- MODIFICADO: Consulta dinámica según el switch ---
	const {
		data: sedesData,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["sedes", mostrarAlmacenes], // Agregamos la dependencia para refrescar al cambiar
		queryFn: mostrarAlmacenes ? getAlmacenes : getSedes, 
	});

	const sedes = sedesData || [];

	const sedeFields = [
		{ name: "nombreSede", label: "Nombre", type: "text" },
		{ name: "direccion", label: "Dirección", type: "text" },
		{ name: "anexo", label: "Anexo", type: "text" },
	];

	const deleteSedeMutation = useMutation({
		mutationFn: deleteSede,
		onSuccess: () => {
			queryClient.invalidateQueries(["sedes"]);
			MySwal.fire("Eliminado", "El registro fue eliminado correctamente", "success");
		},
		onError: (err) => {
			console.error("Error al eliminar:", err);
			const mensaje = err.response?.data?.message || "No se pudo eliminar";
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
				"Se actualizó correctamente",
				"success"
			);
		},
		onError: (err) => {
			console.error("Error al actualizar:", err);
			const mensaje =
				err.response?.data?.message || "No se pudo actualizar";
			MySwal.fire("Error", mensaje, "error");
		},
	});

	const handleEliminar = async (id) => {
		const resultado = await MySwal.fire({
			title: mostrarAlmacenes ? "¿Eliminar Almacén?" : "¿Eliminar Sede?",
			text: "Esta acción no se puede deshacer.",
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
			tipo: sede.tipo
		});
		setOpenEditDialog(true);
	};

	const onSaveEdit = (formData) => {
		const payload = {
			nombreSede: formData.nombreSede,
			direccion: formData.direccion,
			anexo: formData.anexo,
			tipo: mostrarAlmacenes ? "Almacén" : "Sede"
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
			headerName: mostrarAlmacenes ? "Almacén" : "Sede",
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
			<Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 4, pr: 3 }}>
				<Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
					<ToggleButtonGroup
						color="primary"
						value={mostrarAlmacenes ? "almacen" : "sede"}
						exclusive
						onChange={(e, nuevoValor) => {
							if (nuevoValor !== null) {
								setMostrarAlmacenes(nuevoValor === "almacen");
							}
						}}
						aria-label="Tipo de vista"
						size="small"
					>
						<ToggleButton value="sede" sx={{ px: 3, textTransform: 'none', fontWeight: 600 }}>
							<BusinessIcon sx={{ mr: 1 }} /> Sedes
						</ToggleButton>
						<ToggleButton value="almacen" sx={{ px: 3, textTransform: 'none', fontWeight: 600 }}>
							<WarehouseIcon sx={{ mr: 1 }} /> Almacenes
						</ToggleButton>
					</ToggleButtonGroup>
				</Paper>
			</Box>

			<TablaLista
				title={mostrarAlmacenes ? "Lista de Almacenes" : "Lista de Sedes"}
				columns={columns}
				data={sedes}
				isLoading={isLoading}
				onRefresh={refetch}
				onAdd={() => navigate("/sedes/nuevo")}
				onBack={() => navigate("/dashboard-sedes")}
				getRowId={(row) => row.idSede}
				addButtonLabel={mostrarAlmacenes ? "Ingresar Nuevo Almacén" : "Ingresar Nueva Sede"}
			/>
			<FormularioDialogo
				open={openEditDialog}
				onClose={() => setOpenEditDialog(false)}
				title={mostrarAlmacenes ? "Editar Almacén" : "Editar Sede"}
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