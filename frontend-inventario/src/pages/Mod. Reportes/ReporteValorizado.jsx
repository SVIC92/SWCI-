import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Grid, TextField, MenuItem, Typography, Paper } from "@mui/material";
import { getReporteValorizado } from "../../api/reporteApi";
import TablaLista from "../../components/TablaLista";

const formatearMoneda = (valor) =>
  `S/ ${(Number(valor) || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function ReporteValorizado() {
  const navigate = useNavigate();

  const [filtroSede, setFiltroSede] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroProveedor, setFiltroProveedor] = useState("");

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ["reporteValorizado"],
    queryFn: getReporteValorizado,
    initialData: { data: [] },
    select: (response) => response.data
  });

  const filas = response || [];

  const opciones = useMemo(() => {
    const sedes = new Set();
    const categorias = new Set();
    const proveedores = new Set();
    filas.forEach((f) => {
      if (f.nombreSede) sedes.add(f.nombreSede);
      if (f.nombreCategoria) categorias.add(f.nombreCategoria);
      if (f.nombreProveedor) proveedores.add(f.nombreProveedor);
    });
    return {
      sedes: Array.from(sedes).sort(),
      categorias: Array.from(categorias).sort(),
      proveedores: Array.from(proveedores).sort()
    };
  }, [filas]);

  const filasFiltradas = useMemo(() => {
    return filas.filter(
      (f) =>
        (!filtroSede || f.nombreSede === filtroSede) &&
        (!filtroCategoria || f.nombreCategoria === filtroCategoria) &&
        (!filtroProveedor || f.nombreProveedor === filtroProveedor)
    );
  }, [filas, filtroSede, filtroCategoria, filtroProveedor]);

  const totalValorizado = useMemo(
    () => filasFiltradas.reduce((acc, f) => acc + (Number(f.valorTotal) || 0), 0),
    [filasFiltradas]
  );

  const columns = [
    { field: "skuProducto", headerName: "SKU", width: 120 },
    { field: "nombreProducto", headerName: "Producto", flex: 1, minWidth: 180 },
    { field: "nombreSede", headerName: "Sede", width: 150 },
    { field: "nombreCategoria", headerName: "Categoría", width: 150 },
    { field: "nombreProveedor", headerName: "Proveedor", width: 170 },
    { field: "stockActual", headerName: "Stock", width: 90, align: "center", headerAlign: "center" },
    {
      field: "costoUnitario",
      headerName: "Costo Unitario",
      width: 140,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => formatearMoneda(params.value)
    },
    {
      field: "valorTotal",
      headerName: "Valor Total",
      width: 150,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <Typography fontWeight={700}>{formatearMoneda(params.value)}</Typography>
      )
    }
  ];

  return (
    <TablaLista
      title="Reporte Valorizado de Inventario"
      columns={columns}
      data={filasFiltradas}
      isLoading={isLoading}
      onBack={() => navigate("/dashboard-reportes")}
      onRefresh={refetch}
      getRowId={(row) => `${row.skuProducto}-${row.nombreSede}`}
      showAddButton={false}
    >
      <Box sx={{ p: 2, m: { xs: 1, sm: 2, md: 3 }, mb: 0, bgcolor: "background.paper", borderRadius: 2, boxShadow: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              select
              label="Sede"
              value={filtroSede}
              onChange={(e) => setFiltroSede(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value=""><em>Todas</em></MenuItem>
              {opciones.sedes.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              select
              label="Categoría"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value=""><em>Todas</em></MenuItem>
              {opciones.categorias.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              select
              label="Proveedor"
              value={filtroProveedor}
              onChange={(e) => setFiltroProveedor(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              {opciones.proveedores.map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary">Valor Total (filtrado)</Typography>
              <Typography variant="h6" fontWeight={700}>{formatearMoneda(totalValorizado)}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </TablaLista>
  );
}

export default ReporteValorizado;
