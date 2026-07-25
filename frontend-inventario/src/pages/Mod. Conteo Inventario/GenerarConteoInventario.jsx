import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Paper,
  Autocomplete
} from "@mui/material";
import Swal from "sweetalert2";
import { getSedes } from "../../api/sedeApi";
import { getAreas } from "../../api/areaApi";
import { getCategorias } from "../../api/categoriaApi";
import { getSubcategorias } from "../../api/subcategoriaApi";
import { getProductos } from "../../api/productoApi";
import { generarHojaConteo, listarTodasHojasConteo, registrarConteo } from "../../api/conteoApi";
import LayoutDashboard from "../../components/Layouts/LayoutDashboard";
import PageHeader from "../../components/PageHeader";

const TIPOS_CONTEO = [
  { value: "PROGRAMADO", label: "Programado" },
  { value: "SORPRESIVO", label: "Sorpresivo" }
];

const ALCANCES_CONTEO = [
  { value: "SEDE", label: "Toda la Sede" },
  { value: "AREA", label: "Por Área" },
  { value: "CATEGORIA", label: "Por Categoría" },
  { value: "SUBCATEGORIA", label: "Por Subcategoría" },
  { value: "PRODUCTOS", label: "Productos Específicos" }
];

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

function GenerarConteoInventario() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [sedes, setSedes] = useState([]);
  const [sedeId, setSedeId] = useState("");
  const [tipoConteo, setTipoConteo] = useState("PROGRAMADO");

  const [alcance, setAlcance] = useState("SEDE");
  const [areas, setAreas] = useState([]);
  const [areaId, setAreaId] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [subcategorias, setSubcategorias] = useState([]);
  const [subcategoriaId, setSubcategoriaId] = useState("");
  const [catalogoProductos, setCatalogoProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);

  const [hojaSeleccionada, setHojaSeleccionada] = useState(null);
  const [conteosIngresados, setConteosIngresados] = useState({});
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getSedes()
      .then(setSedes)
      .catch(() => setSedes([]));

    getAreas()
      .then(setAreas)
      .catch(() => setAreas([]));

    getCategorias()
      .then(setCategorias)
      .catch(() => setCategorias([]));

    getSubcategorias()
      .then(setSubcategorias)
      .catch(() => setSubcategorias([]));

    getProductos()
      .then(setCatalogoProductos)
      .catch(() => setCatalogoProductos([]));
  }, []);

  const handleCambiarAlcance = (nuevoAlcance) => {
    setAlcance(nuevoAlcance);
    setAreaId("");
    setCategoriaId("");
    setSubcategoriaId("");
    setProductosSeleccionados([]);
  };

  const { data: hojasResponse, isLoading } = useQuery({
    queryKey: ["hojasConteo"],
    queryFn: listarTodasHojasConteo,
    initialData: { data: [] }
  });

  const hojasGeneradas = useMemo(
    () => (hojasResponse?.data || []).filter((h) => h.estado === "GENERADA"),
    [hojasResponse]
  );

  const { mutate: crearHoja, isPending: generando } = useMutation({
    mutationFn: generarHojaConteo,
    onSuccess: () => {
      Swal.fire("Hoja generada", "La hoja de conteo se generó correctamente.", "success");
      setSedeId("");
      handleCambiarAlcance("SEDE");
      queryClient.invalidateQueries({ queryKey: ["hojasConteo"] });
    },
    onError: (error) => {
      Swal.fire("Error", error.response?.data?.message || "No se pudo generar la hoja.", "error");
    }
  });

  const handleGenerar = async () => {
    if (!sedeId) {
      Swal.fire("Seleccione una sede", "Debe elegir la sede a contar.", "warning");
      return;
    }

    if (alcance === "AREA" && !areaId) {
      Swal.fire("Seleccione un área", "Debe elegir el área a contar.", "warning");
      return;
    }

    if (alcance === "CATEGORIA" && !categoriaId) {
      Swal.fire("Seleccione una categoría", "Debe elegir la categoría a contar.", "warning");
      return;
    }

    if (alcance === "SUBCATEGORIA" && !subcategoriaId) {
      Swal.fire("Seleccione una subcategoría", "Debe elegir la subcategoría a contar.", "warning");
      return;
    }

    if (alcance === "PRODUCTOS" && productosSeleccionados.length === 0) {
      Swal.fire("Seleccione productos", "Debe elegir al menos un producto a contar.", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "¿Generar hoja de conteo?",
      text: "Se tomará una fotografía del stock actual del sistema para el alcance elegido.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, generar",
      cancelButtonText: "Cancelar"
    });

    if (!result.isConfirmed) return;

    const payload = {
      sedeId: Number(sedeId),
      tipoConteo,
      alcance
    };

    if (alcance === "AREA") payload.areaId = Number(areaId);
    if (alcance === "CATEGORIA") payload.categoriaId = Number(categoriaId);
    if (alcance === "SUBCATEGORIA") payload.subcategoriaId = Number(subcategoriaId);
    if (alcance === "PRODUCTOS") {
      payload.productoIds = productosSeleccionados.map((p) => p.id_producto);
    }

    crearHoja(payload);
  };

  const abrirModalConteo = (hoja) => {
    const iniciales = {};
    hoja.detalles.forEach((det) => {
      iniciales[det.id] = det.stockSistema;
    });
    setConteosIngresados(iniciales);
    setHojaSeleccionada(hoja);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setHojaSeleccionada(null);
    setConteosIngresados({});
  };

  const { mutate: enviarConteo, isPending: enviando } = useMutation({
    mutationFn: ({ id, data }) => registrarConteo(id, data),
    onSuccess: () => {
      Swal.fire("Conteo registrado", "El conteo quedó enviado para aprobación.", "success");
      queryClient.invalidateQueries({ queryKey: ["hojasConteo"] });
      cerrarModal();
    },
    onError: (error) => {
      Swal.fire("Error", error.response?.data?.message || "No se pudo registrar el conteo.", "error");
    }
  });

  const handleGuardarConteo = () => {
    const detalles = hojaSeleccionada.detalles.map((det) => ({
      detalleId: det.id,
      stockContado: Number(conteosIngresados[det.id])
    }));

    const invalido = detalles.find((d) => Number.isNaN(d.stockContado) || d.stockContado < 0);
    if (invalido) {
      Swal.fire(
        "Cantidad inválida",
        "Todas las cantidades contadas deben ser números válidos (0 o más).",
        "error"
      );
      return;
    }

    enviarConteo({ id: hojaSeleccionada.id, data: { detalles } });
  };

  return (
    <LayoutDashboard>
      <PageHeader
        title="Generar Hoja de Conteo de Inventario"
        subtitle="Programa un conteo físico y registra sus resultados"
        actions={
          <Button variant="outlined" onClick={() => navigate("/dashboard-conteoinventario")}>
            Volver
          </Button>
        }
      />

      <Card sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small" required>
              <InputLabel id="sede-label">Sede</InputLabel>
              <Select
                labelId="sede-label"
                label="Sede"
                value={sedeId}
                onChange={(e) => setSedeId(e.target.value)}
              >
                <MenuItem value="">
                  <em>Seleccione una sede</em>
                </MenuItem>
                {sedes.map((sede) => (
                  <MenuItem key={sede.idSede} value={String(sede.idSede)}>
                    {sede.nombreSede}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="tipo-conteo-label">Tipo de Conteo</InputLabel>
              <Select
                labelId="tipo-conteo-label"
                label="Tipo de Conteo"
                value={tipoConteo}
                onChange={(e) => setTipoConteo(e.target.value)}
              >
                {TIPOS_CONTEO.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* ALCANCE DEL CONTEO */}
          <Grid size={12}>
            <FormControl>
              <FormLabel id="alcance-label" sx={{ fontWeight: 600, mb: 0.5 }}>
                ¿Qué se va a contar?
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="alcance-label"
                value={alcance}
                onChange={(e) => handleCambiarAlcance(e.target.value)}
              >
                {ALCANCES_CONTEO.map((op) => (
                  <FormControlLabel
                    key={op.value}
                    value={op.value}
                    control={<Radio size="small" />}
                    label={op.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* CAMPO CONDICIONAL SEGÚN EL ALCANCE */}
          {alcance === "AREA" && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small" required>
                <InputLabel id="area-label">Área</InputLabel>
                <Select
                  labelId="area-label"
                  label="Área"
                  value={areaId}
                  onChange={(e) => setAreaId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Seleccione un área</em>
                  </MenuItem>
                  {areas.map((area) => (
                    <MenuItem key={area.id_area} value={String(area.id_area)}>
                      {area.nombreArea}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {alcance === "CATEGORIA" && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small" required>
                <InputLabel id="categoria-label">Categoría</InputLabel>
                <Select
                  labelId="categoria-label"
                  label="Categoría"
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Seleccione una categoría</em>
                  </MenuItem>
                  {categorias.map((cat) => {
                    const id = cat.id_cat ?? cat.id_categoria;
                    const nombre = cat.nombreCat ?? cat.nombre_categoria;
                    return (
                      <MenuItem key={id} value={String(id)}>
                        {nombre}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          )}

          {alcance === "SUBCATEGORIA" && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small" required>
                <InputLabel id="subcategoria-label">Subcategoría</InputLabel>
                <Select
                  labelId="subcategoria-label"
                  label="Subcategoría"
                  value={subcategoriaId}
                  onChange={(e) => setSubcategoriaId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Seleccione una subcategoría</em>
                  </MenuItem>
                  {subcategorias.map((subcat) => (
                    <MenuItem key={subcat.id} value={String(subcat.id)}>
                      {subcat.nombreSubcat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {alcance === "PRODUCTOS" && (
            <Grid size={12}>
              <Autocomplete
                multiple
                size="small"
                options={catalogoProductos}
                value={productosSeleccionados}
                onChange={(e, valor) => setProductosSeleccionados(valor)}
                getOptionLabel={(p) => `[${p.sku}] ${p.nombre}`}
                isOptionEqualToValue={(option, value) => option.id_producto === value.id_producto}
                renderInput={(params) => (
                  <TextField {...params} label="Productos a contar" placeholder="Buscar por SKU o nombre" />
                )}
              />
            </Grid>
          )}

          <Grid size={12} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={handleGenerar}
              disabled={generando}
              startIcon={generando ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {generando ? "Generando..." : "Generar Hoja de Conteo"}
            </Button>
          </Grid>
        </Grid>
      </Card>

      <TableContainer component={Card} sx={{ mt: 3, maxWidth: 900, mx: "auto" }}>
        <Typography variant="h6" sx={{ p: 2, pb: 0 }}>
          Hojas pendientes de contar
        </Typography>
        <Table size="small">
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Sede</TableCell>
              <TableCell>Alcance</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Fecha Generación</TableCell>
              <TableCell align="right">Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : hojasGeneradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary" variant="body2">
                    No hay hojas pendientes de contar.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              hojasGeneradas.map((hoja) => (
                <TableRow key={hoja.id} hover>
                  <TableCell>#{hoja.id}</TableCell>
                  <TableCell>{hoja.nombreSede}</TableCell>
                  <TableCell>{hoja.alcanceDescripcion || "Toda la Sede"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={hoja.tipoConteo === "SORPRESIVO" ? "Sorpresivo" : "Programado"}
                      color={hoja.tipoConteo === "SORPRESIVO" ? "warning" : "info"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{formatearFecha(hoja.fechaGeneracion)}</TableCell>
                  <TableCell align="right">
                    <Button variant="contained" size="small" onClick={() => abrirModalConteo(hoja)}>
                      Registrar Conteo
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={modalOpen} onClose={cerrarModal} maxWidth="md" fullWidth>
        <DialogTitle>
          Registrar Conteo — Hoja #{hojaSeleccionada?.id} ({hojaSeleccionada?.nombreSede})
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  <TableCell>SKU</TableCell>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Stock Sistema</TableCell>
                  <TableCell align="right">Stock Contado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hojaSeleccionada?.detalles?.map((det) => (
                  <TableRow key={det.id}>
                    <TableCell>{det.skuProducto}</TableCell>
                    <TableCell>{det.nombreProducto}</TableCell>
                    <TableCell align="right">{det.stockSistema}</TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={conteosIngresados[det.id] ?? ""}
                        onChange={(e) =>
                          setConteosIngresados((prev) => ({ ...prev, [det.id]: e.target.value }))
                        }
                        slotProps={{ htmlInput: { min: 0 } }}
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModal} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardarConteo}
            disabled={enviando}
            startIcon={enviando ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {enviando ? "Enviando..." : "Enviar Conteo"}
          </Button>
        </DialogActions>
      </Dialog>
    </LayoutDashboard>
  );
}

export default GenerarConteoInventario;
