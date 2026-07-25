import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Chip } from "@mui/material";
import { getReporteQuiebreStock } from "../../api/reporteApi";
import TablaLista from "../../components/TablaLista";

function ReporteQuiebreStock() {
  const navigate = useNavigate();

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ["reporteQuiebreStock"],
    queryFn: getReporteQuiebreStock,
    initialData: { data: [] },
    select: (response) => response.data
  });

  const filas = useMemo(() => response || [], [response]);

  const columns = [
    { field: "idInventario", headerName: "ID", width: 80 },
    { field: "skuProducto", headerName: "SKU", width: 120 },
    { field: "nombreProducto", headerName: "Producto", flex: 1, minWidth: 180 },
    { field: "nombreSede", headerName: "Sede", width: 150 },
    {
      field: "stockActual",
      headerName: "Stock Actual",
      width: 130,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value}
          color={params.value <= 0 ? "error" : "warning"}
        />
      )
    },
    { field: "stockMinimo", headerName: "Stock Mínimo", width: 130, align: "center", headerAlign: "center" },
    { field: "stockIdeal", headerName: "Stock Ideal", width: 120, align: "center", headerAlign: "center" },
    {
      field: "cantidadSugerida",
      headerName: "Sugerido a Pedir",
      width: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params) =>
        params.value != null ? (
          <Chip size="small" label={params.value > 0 ? params.value : 0} color="info" variant="outlined" />
        ) : (
          "-"
        )
    }
  ];

  return (
    <TablaLista
      title="Reporte de Quiebres de Stock"
      columns={columns}
      data={filas}
      isLoading={isLoading}
      onBack={() => navigate("/dashboard-reportes")}
      onRefresh={refetch}
      getRowId={(row) => row.idInventario}
      showAddButton={false}
    />
  );
}

export default ReporteQuiebreStock;
