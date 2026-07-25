import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Grid, TextField, Button, Typography, Paper, Chip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getReporteStockMuerto } from "../../api/reporteApi";
import TablaLista from "../../components/TablaLista";

const formatearMoneda = (valor) =>
  `S/ ${(Number(valor) || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return "Sin movimientos";
  const fechaUTC = fechaStr.endsWith("Z") ? fechaStr : fechaStr + "Z";
  return new Date(fechaUTC).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
};

function ReporteStockMuerto() {
  const navigate = useNavigate();

  const [diasInput, setDiasInput] = useState(90);
  const [diasAplicados, setDiasAplicados] = useState(90);

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ["reporteStockMuerto", diasAplicados],
    queryFn: () => getReporteStockMuerto(diasAplicados),
    initialData: { data: [] },
    select: (response) => response.data
  });

  const filas = useMemo(
    () => (response || []).map((f, index) => ({ ...f, rowId: `${f.skuProducto}-${f.nombreSede}-${index}` })),
    [response]
  );

  const totalInmovilizado = useMemo(
    () => filas.reduce((acc, f) => acc + (Number(f.valorInmovilizado) || 0), 0),
    [filas]
  );

  const handleBuscar = () => {
    const dias = Number(diasInput);
    setDiasAplicados(Number.isFinite(dias) && dias > 0 ? dias : 90);
  };

  const columns = [
    { field: "skuProducto", headerName: "SKU", width: 120 },
    { field: "nombreProducto", headerName: "Producto", flex: 1, minWidth: 180 },
    { field: "nombreSede", headerName: "Sede", width: 150 },
    { field: "stockActual", headerName: "Stock Actual", width: 120, align: "center", headerAlign: "center" },
    {
      field: "valorInmovilizado",
      headerName: "Valor Inmovilizado",
      width: 160,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => <Typography fontWeight={700}>{formatearMoneda(params.value)}</Typography>
    },
    {
      field: "fechaUltimoMovimiento",
      headerName: "Último Movimiento",
      width: 160,
      renderCell: (params) => formatearFecha(params.value)
    },
    {
      field: "diasSinMovimiento",
      headerName: "Días sin Movimiento",
      width: 170,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value != null ? `${params.value} días` : "Nunca"}
          color="error"
          variant="outlined"
        />
      )
    }
  ];

  return (
    <TablaLista
      title="Reporte de Stock Muerto"
      columns={columns}
      data={filas}
      isLoading={isLoading}
      onBack={() => navigate("/dashboard-reportes")}
      onRefresh={refetch}
      getRowId={(row) => row.rowId}
      showAddButton={false}
    >
      <Box sx={{ p: 2, m: { xs: 1, sm: 2, md: 3 }, mb: 0, bgcolor: "background.paper", borderRadius: 2, boxShadow: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Días sin movimiento (mínimo)"
              type="number"
              value={diasInput}
              onChange={(e) => setDiasInput(e.target.value)}
              fullWidth
              size="small"
              slotProps={{ htmlInput: { min: 1 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button variant="contained" startIcon={<SearchIcon />} onClick={handleBuscar} disabled={isLoading} fullWidth>
              Buscar
            </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary">Valor Inmovilizado Total</Typography>
              <Typography variant="h6" fontWeight={700} color="error.main">{formatearMoneda(totalInmovilizado)}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </TablaLista>
  );
}

export default ReporteStockMuerto;
