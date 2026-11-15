import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import Swal from "sweetalert2";

import { getSedes } from "../../api/sedeApi";
import { getProductos } from "../../api/productoApi";
import { getInventarioPorSede, asociarProductosASede, desasociarProductoDeSede } from "../../api/InventarioApi";
import LayoutDashboard from "../../components/Layouts/LayoutDashboard";

function InventarioSede() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [sedeId, setSedeId] = useState("");
  const [seleccionados, setSeleccionados] = useState([]);
  const [filtro, setFiltro] = useState("");

  const { data: sedes = [], isLoading: ls } = useQuery({ queryKey: ["sedes"], queryFn: getSedes });
  const { data: productos = [], isLoading: lp } = useQuery({ queryKey: ["productos"], queryFn: getProductos });

  const { data: asociados = [], isFetching } = useQuery({
    queryKey: ["inventarioSede", sedeId],
    queryFn: async () => (await getInventarioPorSede(sedeId)).data,
    enabled: !!sedeId,
  });

  const idsAsociados = useMemo(() => new Set(asociados.map((a) => a.idProducto)), [asociados]);
  const disponibles = useMemo(
    () => productos.filter((p) => !idsAsociados.has(p.id_producto)),
    [productos, idsAsociados]
  );
  const asociadosFiltrados = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    if (!q) return asociados;
    return asociados.filter(
      (a) => a.nombreProducto.toLowerCase().includes(q) || (a.skuProducto || "").toLowerCase().includes(q)
    );
  }, [asociados, filtro]);

  const refrescar = () => queryClient.invalidateQueries({ queryKey: ["inventarioSede", sedeId] });

  const asociarMutation = useMutation({
    mutationFn: () => asociarProductosASede(sedeId, seleccionados.map((p) => p.id_producto)),
    onSuccess: (res) => {
      Swal.fire("Listo", res.data?.message || "Productos asociados.", "success");
      setSeleccionados([]);
      refrescar();
    },
    onError: (error) => Swal.fire("Error", error.response?.data?.message || "No se pudo asociar.", "error"),
  });

  const desasociarMutation = useMutation({
    mutationFn: (productoId) => desasociarProductoDeSede(sedeId, productoId),
    onSuccess: () => refrescar(),
    onError: (error) => Swal.fire("Error", error.response?.data?.message || "No se pudo quitar el producto.", "error"),
  });

  const handleQuitar = async (fila) => {
    const r = await Swal.fire({
      title: "¿Quitar de la sede?",
      text: `'${fila.nombreProducto}' dejará de estar asociado a esta sede.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, quitar",
      cancelButtonText: "Cancelar",
    });
    if (r.isConfirmed) desasociarMutation.mutate(fila.idProducto);
  };

  if (ls || lp) {
    return (
      <LayoutDashboard>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <CircularProgress size={60} />
        </Box>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2, flexWrap: "wrap" }}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashboard-sedes")}>
            Volver
          </Button>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Inventario por Sede
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Aquí defines qué productos maneja cada sede. Al asociar, el producto entra con <b>stock 0</b>; el stock real se
            carga con recepción, transferencia o conteo. Solo se puede quitar un producto cuando su stock es 0.
          </Alert>

          <TextField
            select
            fullWidth
            label="Sede"
            value={sedeId}
            onChange={(e) => {
              setSedeId(e.target.value);
              setSeleccionados([]);
              setFiltro("");
            }}
          >
            {sedes.map((s) => (
              <MenuItem key={s.idSede} value={String(s.idSede)}>{s.nombreSede}</MenuItem>
            ))}
          </TextField>
        </Paper>

        {sedeId && (
          <>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 3 }}>
              <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                Asociar productos
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
                <Autocomplete
                  multiple
                  fullWidth
                  disableCloseOnSelect
                  options={disponibles}
                  value={seleccionados}
                  onChange={(_, v) => setSeleccionados(v)}
                  getOptionLabel={(o) => `[${o.sku}] ${o.nombre}`}
                  isOptionEqualToValue={(o, v) => o.id_producto === v.id_producto}
                  noOptionsText="No quedan productos por asociar"
                  renderInput={(params) => <TextField {...params} label="Buscar por SKU o nombre" />}
                />
                <Button
                  variant="contained"
                  startIcon={asociarMutation.isPending ? <CircularProgress size={18} color="inherit" /> : <LinkIcon />}
                  disabled={seleccionados.length === 0 || asociarMutation.isPending}
                  onClick={() => asociarMutation.mutate()}
                  sx={{ minWidth: 200, alignSelf: { md: "flex-start" }, py: 1.7 }}
                >
                  Asociar ({seleccionados.length})
                </Button>
              </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 2, flexWrap: "wrap" }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                  Productos de la sede ({asociados.length})
                </Typography>
                <TextField size="small" label="Filtrar" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
              </Box>

              <TableContainer sx={{ maxHeight: 460 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>SKU</TableCell>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Stock</TableCell>
                      <TableCell align="center">Quitar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isFetching && asociados.length === 0 ? (
                      <TableRow><TableCell colSpan={4} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                    ) : asociadosFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">Esta sede no tiene productos asociados.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      asociadosFiltrados.map((a) => (
                        <TableRow key={a.idInventario} hover>
                          <TableCell>{a.skuProducto}</TableCell>
                          <TableCell>{a.nombreProducto}</TableCell>
                          <TableCell align="right">
                            <Chip size="small" label={a.stockActual} color={a.stockActual === 0 ? "default" : "primary"} variant="outlined" />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title={a.stockActual > 0 ? "Solo se puede quitar con stock 0" : "Quitar de la sede"}>
                              <span>
                                <IconButton
                                  color="error"
                                  size="small"
                                  disabled={a.stockActual > 0 || desasociarMutation.isPending}
                                  onClick={() => handleQuitar(a)}
                                >
                                  <LinkOffIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Container>
    </LayoutDashboard>
  );
}

export default InventarioSede;
