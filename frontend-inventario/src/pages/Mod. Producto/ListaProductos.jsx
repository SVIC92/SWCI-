import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductos,
  deleteProducto,
  updateProducto,
  activarProducto,
  desactivarProducto,
} from "../../api/productoApi";
import { getAreas } from "../../api/areaApi";
import { getCategorias } from "../../api/categoriaApi";
import { getProveedores } from "../../api/proveedorApi";
import {
  Stack,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import TablaLista from "../../components/TablaLista";
import FormularioDialogoProducto from "../../components/FormularioDialogoProducto";

const MySwal = withReactContent(Swal);
const ListaProductos = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const {
    data: productosData,
    isLoading: isLoadingProductos,
    isError: isErrorProductos,
    error: errorProductos,
    refetch: refetchProductos,
  } = useQuery({
    queryKey: ["productos"],
    queryFn: getProductos,
  });
  const { data: areasData, isLoading: isLoadingAreas } = useQuery({
    queryKey: ["areas"],
    queryFn: getAreas,
    initialData: [],
  });
  const { data: categoriasData, isLoading: isLoadingCategorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
    initialData: [],
  });
  const { data: proveedoresData, isLoading: isLoadingProveedores } = useQuery({
    queryKey: ["proveedores"],
    queryFn: getProveedores,
    initialData: [],
  });

  const isLoading =
    isLoadingProductos || isLoadingAreas || isLoadingCategorias || isLoadingProveedores;
  const productos = productosData || [];
  const areas = areasData || [];
  const categorias = categoriasData || [];
  const proveedores = proveedoresData || [];

  const resolveProductoId = (producto) => producto.id_producto;

  const esEstadoActivo = (estado) => {
    if (typeof estado === "string") {
      const normalizado = estado.trim().toLowerCase();
      return normalizado === "1" || normalizado === "true" || normalizado === "activo";
    }
    if (typeof estado === "number") {
      return estado === 1;
    }
    return Boolean(estado);
  };

  const getEstadoTexto = (estado) =>
    (esEstadoActivo(estado) ? "Activo" : "Inactivo");

  const formatearPrecio = (valor) => {
    if (valor === null || valor === undefined || valor === "") {
      return "0.00";
    }
    const numero = Number(valor);
    if (Number.isNaN(numero)) {
      return "-";
    }
    return `S/ ${numero.toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
  
  const obtenerNombreCategoria = (producto) => {
    const categoriaId =
        producto.categoria?.id_cat || producto.categoria?.id_categoria || producto.id_cat;
    const categoria = categorias.find(
        (cat) => cat.id_cat === categoriaId
    );
    return categoria?.nombreCat || "Sin categoría";
  };
  
  const obtenerNombreProveedor = (producto) => {
    const proveedorId =
        producto.proveedor?.id_proveedor || producto.id_proveedor || producto.proveedorId;
    const proveedor = proveedores.find((prov) => prov.id_proveedor === proveedorId);
    return proveedor?.nombre_proveedor || "Sin proveedor";
  };
  const processedProductos = useMemo(() => {
    if (!productos) return [];

    return productos.map((u) => {
      const estado = u.estado ?? u.estado_producto ?? u.estadoProd;
      const estaActivo = esEstadoActivo(estado);

      return {
        ...u,
        id: resolveProductoId(u), 
        nombreProducto: u.nombre_producto || u.nombreProducto || u.nombre || "-",
        categoriaNombre: obtenerNombreCategoria(u),
        proveedorNombre: obtenerNombreProveedor(u),
        precioVentaFormatted: formatearPrecio(u.precio_venta ?? u.precioVenta),
        precioCompraFormatted: formatearPrecio(u.precio_compra ?? u.precioCompra),
        stockMinimo: u.stockMinimo ?? 0,
        stockIdeal: u.stockIdeal ?? 0,
        estadoProducto: estado,
        estaActivo: estaActivo,
      };
    });
  }, [productos, categorias, proveedores]);

  const deleteProductoMutation = useMutation({
    mutationFn: deleteProducto,
    onSuccess: () => {
      queryClient.invalidateQueries(['productos']);
      MySwal.fire("Eliminado", "El producto fue eliminado.", "success");
    },
    onError: (err) => {
      const mensaje = err.response?.data?.message || "No se pudo eliminar el producto";
      MySwal.fire("Error", mensaje, "error");
    }
  });

  const toggleEstadoMutation = useMutation({
    mutationFn: (variables) =>
      variables.activar ? activarProducto(variables.id) : desactivarProducto(variables.id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['productos']);
      const accion = variables.activar ? "Activado" : "Desactivado";
      MySwal.fire(accion, `El producto fue ${accion.toLowerCase()}.`, "success");
    },
    onError: (err, variables) => {
      const accion = variables.activar ? "activar" : "desactivar";
      MySwal.fire("Error", `No se pudo ${accion} el producto`, "error");
    }
  });

  const updateProductoMutation = useMutation({
    mutationFn: (variables) => updateProducto(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['productos']);
      setOpenEditDialog(false);
      MySwal.fire("Actualizado", "Producto actualizado correctamente", "success");
    },
    onError: (err) => {
      const mensaje = err.response?.data?.message || "No se pudo actualizar el producto";
      MySwal.fire("Error", mensaje, "error");
    }
  });

  const handleEliminar = async (producto) => {
    const productoId = resolveProductoId(producto);
    if (!productoId) {
      MySwal.fire("Error", "No se pudo determinar el producto a eliminar", "error");
      return;
    }
    const result = await MySwal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción eliminará el producto permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });
    if (!result.isConfirmed) {
      return;
    }
    deleteProductoMutation.mutate(productoId);
  };

  const handleDesactivar = async (producto) => {
    const productoId = resolveProductoId(producto);
    if (!productoId) {
      MySwal.fire("Error", "No se pudo determinar el producto a desactivar", "error");
      return;
    }
    const result = await MySwal.fire({
      title: "¿Desactivar producto?",
      text: "El producto no estará disponible mientras esté desactivado.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });
    if (!result.isConfirmed) {
      return;
    }
    toggleEstadoMutation.mutate({ id: productoId, activar: false });
  };

  const handleActivar = async (producto) => {
    const productoId = resolveProductoId(producto);
    if (!productoId) {
      MySwal.fire("Error", "No se pudo determinar el producto a activar", "error");
      return;
    }
    const result = await MySwal.fire({
      title: "¿Activar producto?",
      text: "El producto volverá a estar disponible tras la activación.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, activar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });
    if (!result.isConfirmed) {
      return;
    }
    toggleEstadoMutation.mutate({ id: productoId, activar: true });
  };

  const handleEditar = (producto) => {
    setProductoSeleccionado(producto);
    setOpenEditDialog(true);
  };
  const onSaveEdit = (formData) => {
    const payload = {
      id_producto: productoSeleccionado.id_producto,
      sku: formData.sku,
      codEan: formData.codEan,
      nombre: formData.nombre_producto,
      marca: formData.marca,
      uni_medida: formData.uni_medida,
      precio_venta: Number(formData.precio_venta),
      precio_compra: Number(formData.precio_compra),
      stockMinimo: Number(formData.stockMinimo),
      stockIdeal: Number(formData.stockIdeal),
      categoria: { id_cat: parseInt(formData.id_cat,10) },
      proveedor: { id_proveedor: parseInt(formData.id_proveedor,10) }
    };

    updateProductoMutation.mutate({
      id: productoSeleccionado.id_producto,
      data: payload
    }, {
      onSuccess: () => {
        setOpenEditDialog(false);
        setProductoSeleccionado(null);
      }
    });
  };


  const columns = [
	...(isDesktop ? [{ field: "id_producto", headerName: "ID", width: 30 },] : []),
    { field: "sku", headerName: "SKU", width: 90 },
    { field: "codEan", headerName: "EAN", width: 150 },
    { field: "nombreProducto", headerName: "Nombre", flex: 1, minWidth: 110 },
	...(isDesktop ? [{ field: "marca", headerName: "Marca", width: 100 },] : []),
    { field: "categoriaNombre", headerName: "Categoría", width: 150 },
    ...(isDesktop ? [{ field: "uni_medida", headerName: "Unidad", width: 70 },] : []),
    ...(isDesktop ? [{ 
        field: "precioVentaFormatted", 
        headerName: "P.V. (S/)", 
        width: 90,
        align: 'right',
        headerAlign: 'right'
    },
    { 
        field: "precioCompraFormatted", 
        headerName: "P.C. (S/)", 
        width: 90,
        align: 'right',
        headerAlign: 'right'
    }] : []),
    ...(isDesktop ? [
      {
        field: "stockMinimo",
        headerName: "S. Mín",
        width: 80,
        align: 'center',
        headerAlign: 'center'
      },
      {
        field: "stockIdeal",
        headerName: "S. Ideal",
        width: 80,
        align: 'center',
        headerAlign: 'center'
      },
    ] : []),
    {
      field: "estadoProducto",
      headerName: "Estado",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={getEstadoTexto(params.row.estadoProducto)}
          color={params.row.estaActivo ? "success" : "default"}
          size="small"
        />
      ),
    },
    { field: "proveedorNombre", headerName: "Proveedor", width: 150 },
    {
      field: "acciones",
      headerName: "Acciones",
      type: "actions",
      width: 180,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const producto = params.row;
        const productoId = producto.id_producto;
        const estaActivo = producto.estaActivo;

        return (
          <Stack direction="row" spacing={0.5} justifyContent="center">
            <Tooltip title="Ver Detalle">
              <IconButton
                size="small"
                color="primary"
                onClick={() => navigate(`/productos/detalle/${productoId}`)}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Editar">
              <IconButton
                size="small"
                color="info"
                onClick={() => handleEditar(producto)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {estaActivo ? (
              <Tooltip title="Desactivar">
                <IconButton
                  size="small"
                  color="warning"
                  onClick={() => handleDesactivar(producto)}
                >
                  <HighlightOffIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Activar">
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => handleActivar(producto)}
                >
                  <CheckCircleOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Eliminar">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleEliminar(producto)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  return (
    <>
      <TablaLista
        title="Lista de Productos"
        columns={columns}
        data={processedProductos}
        isLoading={isLoading}
        onRefresh={() => refetchProductos()}
        onAdd={() => navigate("/productos/nuevo")}
        onBack={() => navigate("/dashboard-productos")}
        getRowId={(row) => row.id_producto}
        addButtonLabel="Ingresar Nuevo Producto"
      />
      <FormularioDialogoProducto
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        title="Editar Producto"
        producto={productoSeleccionado}
        areas={areas}
        categorias={categorias}
        proveedores={proveedores}
        onConfirm={onSaveEdit}
        isSaving={updateProductoMutation.isPending}
      />
    </>
    
  );
};

export default ListaProductos;