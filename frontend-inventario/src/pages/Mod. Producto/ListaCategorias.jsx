import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategorias,
  deleteCategoria,
  updateCategoria,
} from "../../api/categoriaApi";
import { getAreas } from "../../api/areaApi";
import {
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TablaLista from "../../components/TablaLista";
import FormularioDialogo from "../../components/FomularioDialogo";
import { categoriaSchema } from "../../Utils/productoSchema";

const MySwal = withReactContent(Swal);

const ListaCategorias = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const {
		data: categoriasData,
		isLoading: isLoadingCategorias,
		isError: isErrorCategorias,
		error: errorCategorias,
		refetch: refetchCategorias,
	} = useQuery({
		queryKey: ["categorias"],
		queryFn: getCategorias,
	});
	const {
		data: areasData,
		isLoading: isLoadingAreas,
		isError: isErrorAreas,
		error: errorAreas,
		refetch: refetchAreas,
	} = useQuery({
		queryKey: ["areas"],
		queryFn: getAreas,
    initialData: [],
	});
  const isLoading = isLoadingCategorias || isLoadingAreas;
  const areas = areasData;
  const categoriasEnriquecidas = useMemo(() => {
    const areasMap = new Map(
      areas.map((area) => [area.id_area, area.nombreArea])
    );

    return (categoriasData || []).map((categoria) => ({
      id: categoria.id_cat,
      ...categoria,
      nombreArea: areasMap.get(categoria.area?.id_area) || "Sin área",
    }));
  }, [categoriasData, areas]);
  const categoriasFields = [
    { name: "nombreCat", label: "Nombre de la Categoría", type: "text" },
    { name: "area", label: "Área", type: "select", options: areas.map(area => ({ value: String(area.id_area), label: area.nombreArea })) },
  ];
  const deleteCategoriaMutation = useMutation({
		mutationFn: deleteCategoria,
		onSuccess: () => {
			queryClient.invalidateQueries(["categorias"]);
			MySwal.fire(
				"Eliminado",
				"La categoría fue eliminada correctamente",
				"success"
			);
		},
		onError: (err) => {
			let errorMessage = "No se pudo eliminar la categoría.";
			if (err.response?.data?.message) {
				errorMessage = err.response.data.message;
			}
			console.error("Error al eliminar categoría:", err);
			MySwal.fire("Error", errorMessage, "error");
		},
	});
  const updateCategoriaMutation = useMutation({
		mutationFn: (variables) => updateCategoria(variables.id, variables.data),
		onSuccess: () => {
			queryClient.invalidateQueries(["categorias"]);
      queryClient.invalidateQueries(["areas"]);
      setOpenEditDialog(false);
			MySwal.fire(
				"Actualizado",
				"La categoría se actualizó correctamente",
				"success"
			);
		},
		onError: (err) => {
			console.error("Error al actualizar categoría:", err);
			const mensaje =
				err.response?.data?.message || "No se pudo actualizar la categoría";
			MySwal.fire("Error", mensaje, "error");
		},
	});
  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: "¿Eliminar categoría?",
      text: "Esta acción eliminará la categoría de manera permanente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    deleteCategoriaMutation.mutate(id);
  };
  const handleEdit = async (categoria) => {
    setCategoriaSeleccionada({
      id_cat: categoria.id_cat,
      nombreCat: categoria.nombreCat,
      area: categoria.area?.id_area ? String(categoria.area.id_area) : '',
    });
    setOpenEditDialog(true);
  };
  const onSaveEdit = (formData) => {
    const payload = {
      nombreCat: formData.nombreCat,
      area: { id_area: parseInt(formData.area) },
    };
    updateCategoriaMutation.mutate({
      id: categoriaSeleccionada.id_cat,
      data: payload,
    });
  };
  const handleRefresh = () => {
    refetchCategorias();
    refetchAreas();
  };
  const columns = [
    { 
      field: "id_cat", 
      headerName: "ID", 
      width: 100 
    },
    { 
      field: "nombreCat", 
      headerName: "Nombre Categoría", 
      flex: 1, 
      minWidth: 200 
    },
    {
      field: "nombreArea", 
      headerName: "Área",
      flex: 1,
      minWidth: 200,
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
              onClick={() => handleDelete(params.row.id_cat)}
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
        title="Lista de Categorías"
        columns={columns}
        data={categoriasEnriquecidas}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        onAdd={() => navigate("/categorias/nuevo")}
        onBack={() => navigate("/dashboard-productos")}
        getRowId={(row) => row.id_cat}
        addButtonLabel="Ingresar Nueva Categoría"
      />
      <FormularioDialogo
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        title="Editar Categoría"
        fields={categoriasFields}
        validationSchema={categoriaSchema}
        initialValues={categoriaSeleccionada}
        onConfirm={onSaveEdit}
        isSaving={updateCategoriaMutation.isPending}
      />
    </>
    
  );
};

export default ListaCategorias;
