import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Chip, Typography } from "@mui/material";
import { getInventarioActual } from "../../api/InventarioApi";
import TablaLista from "../../components/TablaLista";

function ListaInventario() {
  const navigate = useNavigate();

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ["inventarioActual"],
    queryFn: getInventarioActual,
    initialData: { data: [] },
    select: (response) => response.data,
  });

  const inventarioProcesado = useMemo(() => {
    if (!response) return [];
    return response.map(inv => {
      const fechaStr = inv.ultimaActualizacion;
      if (!fechaStr) return { ...inv, ultimaActualizacionFormateada: '-' };

      const fechaUTC = fechaStr.endsWith('Z') ? fechaStr : fechaStr + 'Z';

      return {
        ...inv,
        ultimaActualizacionFormateada: format(new Date(fechaUTC), "dd/MM/yyyy HH:mm:ss")
      };
    });
  }, [response]);

  const columns = [
    { field: "idInventario", headerName: "ID", width: 80 },
    { field: "skuProducto", headerName: "SKU", width: 120 },
    { field: "nombreProducto", headerName: "Producto", flex: 1, minWidth: 150 },
    { field: "nombreSede", headerName: "Sede", width: 150 },
    { 
      field: "stockActual", 
      headerName: "Stock Actual", 
      width: 120, 
      align: 'center', 
      headerAlign: 'center',
      type: 'number',
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small"
          color={params.value > 10 ? 'success' : (params.value > 0 ? 'warning' : 'error')}
        />
      )
    },
    { 
      field: "ultimaActualizacionFormateada", 
      headerName: "Última Actualización", 
      width: 200 
    }
  ];

  return (
    <TablaLista
      title="Lista de Inventario (Stock Actual)"
      columns={columns}
      data={inventarioProcesado}
      isLoading={isLoading}
      onBack={() => navigate("/dashboard-inventario")}
      onRefresh={refetch}
      getRowId={(row) => row.idInventario}
      showAddButton={false}
    />
  );
}

export default ListaInventario;