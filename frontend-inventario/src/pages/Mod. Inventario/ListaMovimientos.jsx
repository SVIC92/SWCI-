import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Chip, Typography } from "@mui/material";
import { format } from "date-fns";
import { listarMovimientos } from "../../api/InventarioApi";
import TablaLista from "../../components/TablaLista";

function ListaMovimientos() {
  const navigate = useNavigate();

  const { data: response, isLoading } = useQuery({
    queryKey: ["movimientos"],
    queryFn: listarMovimientos,
    initialData: { data: [] },
  });
  
  const movimientosProcesados = useMemo(() => {
    if (!response || !response.data) return [];

    return response.data.map(mov => {
      const fechaStr = mov.fecha;
      const fechaUTC = fechaStr && !fechaStr.endsWith('Z') ? fechaStr + 'Z' : fechaStr;

      return {
        ...mov,
        fechaFormateada: fechaUTC ? format(new Date(fechaUTC), "dd/MM/yyyy HH:mm:ss") : '-'
      };
    });
  }, [response.data]);

  const columns = [
    { field: "idMovimiento", headerName: "ID", width: 80 },
    { field: "skuProducto", headerName: "SKU", width: 100 },
    { field: "nombreProducto", headerName: "Producto", flex: 1, minWidth: 150 },
    { field: "nombreSede", headerName: "Sede", width: 130 },
    { field: "nombreCompletoUsuario", headerName: "Usuario", width: 160 },
    { field: "nombreRolUsuario", headerName: "Rol", width: 130 },
    { 
      field: "tipoMovimiento", 
      headerName: "Tipo", 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small"
          color={params.value.startsWith('Recep') || params.value.startsWith('Devol') ? 'success' : 'error'} 
          variant="outlined"
        />
      )
    },
    { 
      field: "cantidad", 
      headerName: "Cantidad", 
      width: 90, 
      align: 'center', 
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 'bold', color: params.value > 0 ? 'success.main' : 'error.main' }}>
          {params.value > 0 ? `+${params.value}` : params.value}
        </Typography>
      )
    },
    {
      field: "fechaFormateada",
      headerName: "Fecha/Hora", 
      width: 170
    },
    { field: "observaciones", headerName: "Observaciones", flex: 2, minWidth: 200 },
  ];

  return (
    <TablaLista
      title="KARDEX (Historial de Movimientos)"
      columns={columns}
      data={movimientosProcesados}
      isLoading={isLoading}
      onBack={() => navigate("/dashboard-inventario")}
      getRowId={(row) => row.idMovimiento}
      showAddButton={false}
      showRefreshButton={true}
    />
  );
}

export default ListaMovimientos;