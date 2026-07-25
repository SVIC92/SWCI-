import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Grid, TextField, Button, useTheme } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import TablaLista from "../../components/TablaLista";

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

/**
 * Reporte de Kardex filtrado por dirección (entradas o salidas). Reutilizado por
 * ReporteEntradas.jsx y ReporteSalidas.jsx, que solo cambian título/queryFn.
 */
function ReporteMovimientos({ title, queryKeyBase, queryFn }) {
  const navigate = useNavigate();
  const theme = useTheme();

  const [filtros, setFiltros] = useState({ desde: "", hasta: "" });
  const [filtrosAplicados, setFiltrosAplicados] = useState({});

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: [queryKeyBase, filtrosAplicados],
    queryFn: () => queryFn(filtrosAplicados.desde, filtrosAplicados.hasta),
    initialData: { data: [] },
    select: (response) => response.data
  });

  const filas = useMemo(() => response || [], [response]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleBuscar = () => {
    setFiltrosAplicados({
      desde: filtros.desde || undefined,
      hasta: filtros.hasta || undefined
    });
  };

  const handleLimpiar = () => {
    setFiltros({ desde: "", hasta: "" });
    setFiltrosAplicados({});
  };

  const columns = [
    { field: "idMovimiento", headerName: "ID", width: 80 },
    { field: "skuProducto", headerName: "SKU", width: 100 },
    { field: "nombreProducto", headerName: "Producto", flex: 1, minWidth: 180 },
    { field: "nombreSede", headerName: "Sede", width: 140 },
    { field: "nombreCompletoUsuario", headerName: "Usuario", width: 160 },
    { field: "tipoMovimiento", headerName: "Tipo", width: 140 },
    { field: "cantidad", headerName: "Cantidad", width: 100, align: "center", headerAlign: "center" },
    {
      field: "fecha",
      headerName: "Fecha/Hora",
      width: 170,
      renderCell: (params) => formatearFecha(params.value)
    },
    { field: "observaciones", headerName: "Observaciones", flex: 1, minWidth: 200 }
  ];

  return (
    <TablaLista
      title={title}
      columns={columns}
      data={filas}
      isLoading={isLoading}
      onBack={() => navigate("/dashboard-reportes")}
      onRefresh={refetch}
      getRowId={(row) => row.idMovimiento}
      showAddButton={false}
    >
      <Box sx={{ p: 2, m: { xs: 1, sm: 2, md: 3 }, mb: 0, bgcolor: "background.paper", borderRadius: 2, boxShadow: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Desde"
              type="datetime-local"
              name="desde"
              value={filtros.desde}
              onChange={handleInputChange}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{
                "& input::-webkit-calendar-picker-indicator": {
                  filter: theme.palette.mode === "dark" ? "invert(1)" : "none",
                  cursor: "pointer"
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Hasta"
              type="datetime-local"
              name="hasta"
              value={filtros.hasta}
              onChange={handleInputChange}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{
                "& input::-webkit-calendar-picker-indicator": {
                  filter: theme.palette.mode === "dark" ? "invert(1)" : "none",
                  cursor: "pointer"
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3} sx={{ display: "flex", gap: 1 }}>
            <Button variant="contained" startIcon={<SearchIcon />} onClick={handleBuscar} disabled={isLoading} fullWidth>
              Buscar
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleLimpiar}>
              <CleaningServicesIcon />
            </Button>
          </Grid>
        </Grid>
      </Box>
    </TablaLista>
  );
}

export default ReporteMovimientos;
