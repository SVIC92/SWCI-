import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "@mui/material";
import { getReporteDiferencias } from "../../api/reporteApi";
import TablaLista from "../../components/TablaLista";

const formatearMoneda = (valor) =>
  `S/ ${(Number(valor) || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return "-";
  const fechaUTC = fechaStr.endsWith("Z") ? fechaStr : fechaStr + "Z";
  return new Date(fechaUTC).toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

function ReporteDiferencias() {
  const navigate = useNavigate();

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ["reporteDiferencias"],
    queryFn: getReporteDiferencias,
    initialData: { data: [] },
    select: (response) => response.data
  });

  const filas = useMemo(
    () => (response || []).map((f, index) => ({ ...f, rowId: `${f.idHoja}-${f.skuProducto}-${index}` })),
    [response]
  );

  const columns = [
    { field: "idHoja", headerName: "Hoja #", width: 90 },
    {
      field: "fechaAprobacion",
      headerName: "Fecha Aprobación",
      width: 170,
      renderCell: (params) => formatearFecha(params.value)
    },
    { field: "nombreSede", headerName: "Sede", width: 150 },
    { field: "skuProducto", headerName: "SKU", width: 120 },
    { field: "nombreProducto", headerName: "Producto", flex: 1, minWidth: 180 },
    { field: "stockSistema", headerName: "Stock Sistema", width: 130, align: "center", headerAlign: "center" },
    { field: "stockContado", headerName: "Stock Contado", width: 130, align: "center", headerAlign: "center" },
    {
      field: "diferencia",
      headerName: "Diferencia",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Typography
          fontWeight={700}
          color={params.value > 0 ? "info.main" : params.value < 0 ? "error.main" : "success.main"}
        >
          {params.value > 0 ? `+${params.value}` : params.value}
        </Typography>
      )
    },
    {
      field: "valorDiferencia",
      headerName: "Valor Diferencia",
      width: 150,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <Typography color={params.value < 0 ? "error.main" : "info.main"}>
          {formatearMoneda(params.value)}
        </Typography>
      )
    }
  ];

  return (
    <TablaLista
      title="Reporte de Diferencias de Inventario"
      columns={columns}
      data={filas}
      isLoading={isLoading}
      onBack={() => navigate("/dashboard-reportes")}
      onRefresh={refetch}
      getRowId={(row) => row.rowId}
      showAddButton={false}
    />
  );
}

export default ReporteDiferencias;
