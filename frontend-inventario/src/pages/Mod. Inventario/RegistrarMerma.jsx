import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
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
  IconButton,
  FormControl,
  InputLabel,
  Grid,
  Autocomplete,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Chip,
  Tooltip
} from "@mui/material";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Swal from "sweetalert2";
import { getProductos } from "../../api/productoApi";
import { getSedes } from "../../api/sedeApi";
import { getInventarioActual } from "../../api/InventarioApi";
import { solicitarMerma } from "../../api/mermaApi";
import LayoutDashboard from "../../components/Layouts/LayoutDashboard";
import PageHeader from "../../components/PageHeader";

const MOTIVOS_MERMA = [
  { value: "VENCIMIENTO", label: "Vencimiento" },
  { value: "ROTURA_DANIO", label: "Daño / Rotura" },
  { value: "ROBO_HURTO", label: "Robo / Hurto" },
  { value: "FALLA_TECNICA", label: "Falla Técnica" }
];

// Igual que en "Consulta de Stock": el usuario elige por qué campo busca
// y el Autocomplete filtra el catálogo ya cargado por ese campo.
const CAMPOS_BUSQUEDA = {
  SKU: (p) => p.sku,
  EAN: (p) => p.codEan,
  NOMBRE: (p) => p.nombre
};

const RegistrarMerma = () => {
  const navigate = useNavigate();

  const [sedes, setSedes] = useState([]);
  const [sedeId, setSedeId] = useState("");

  const [stockActualLista, setStockActualLista] = useState([]);

  const [listaMermas, setListaMermas] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [catalogoProductos, setCatalogoProductos] = useState([]);
  const [tipoBusqueda, setTipoBusqueda] = useState("SKU");

  const [motivoSeleccionado, setMotivoSeleccionado] = useState("VENCIMIENTO");
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);
  const [costoSeleccionado, setCostoSeleccionado] = useState(0);
  const [observacionSeleccionada, setObservacionSeleccionada] = useState("");

  useEffect(() => {
    getProductos()
      .then(setCatalogoProductos)
      .catch(() => setCatalogoProductos([]));

    getSedes()
      .then(setSedes)
      .catch(() => setSedes([]));

    getInventarioActual()
      .then((res) => setStockActualLista(res.data || []))
      .catch(() => setStockActualLista([]));
  }, []);

  const sedeSeleccionada = useMemo(
    () => sedes.find((s) => String(s.idSede) === String(sedeId)) || null,
    [sedes, sedeId]
  );

  // Solo se pueden mermar productos que ya tienen un registro de stock (aunque sea 0) en la sede elegida.
  const productosDeSede = useMemo(() => {
    if (!sedeSeleccionada) return [];
    const skusEnSede = new Set(
      stockActualLista
        .filter((inv) => inv.nombreSede === sedeSeleccionada.nombreSede)
        .map((inv) => inv.skuProducto)
    );
    return catalogoProductos.filter((p) => skusEnSede.has(p.sku));
  }, [catalogoProductos, stockActualLista, sedeSeleccionada]);

  const obtenerStockDisponible = (producto) => {
    if (!producto || !sedeSeleccionada) return 0;
    const registro = stockActualLista.find(
      (inv) =>
        inv.skuProducto === producto.codigo &&
        inv.nombreSede === sedeSeleccionada.nombreSede
    );
    return registro?.stockActual ?? 0;
  };

  const handleSeleccionarProducto = (producto) => {
    if (!producto) {
      setProductoSeleccionado(null);
      return;
    }

    // Normaliza la entidad Producto real (id_producto, uni_medida,
    // precio_venta, codEan...) a los nombres que ya usa el resto del form.
    const normalizado = {
      id: producto.id_producto,
      codigo: producto.sku,
      codigoBarras: producto.codEan,
      nombre: producto.nombre,
      unidadMedida: producto.uni_medida,
      precio: producto.precio_venta ?? producto.precio_compra ?? 0
    };

    setProductoSeleccionado(normalizado);
    setCostoSeleccionado(normalizado.precio);
    setCantidadSeleccionada(1);

    if (listaMermas.find((item) => item.id === normalizado.id)) {
      Swal.fire({
        title: "Producto duplicado",
        text: "Este producto ya está agregado.",
        icon: "warning"
      });
    }
  };

  const insertarFila = (stockDisponible, cantidad) => {
    setListaMermas((prev) => [
      ...prev,
      {
        id: productoSeleccionado.id,
        codigo: productoSeleccionado.codigo || productoSeleccionado.codigoBarras,
        nombre: productoSeleccionado.nombre,
        unidad: productoSeleccionado.unidadMedida || "UND",
        stockActual: stockDisponible,
        cantidadMermar: cantidad,
        costo: Number(costoSeleccionado) || 0,
        motivo: motivoSeleccionado,
        observacion: observacionSeleccionada,
        stockInsuficiente: cantidad > stockDisponible
      }
    ]);

    setProductoSeleccionado(null);
    setMotivoSeleccionado("VENCIMIENTO");
    setCantidadSeleccionada(1);
    setCostoSeleccionado(0);
    setObservacionSeleccionada("");
  };

  const agregarProducto = () => {
    if (!sedeId) {
      Swal.fire("Seleccione una sede", "Debe elegir la sede donde se registrará la merma.", "warning");
      return;
    }

    if (!productoSeleccionado) {
      Swal.fire("Seleccione un producto", "Debe buscar un producto primero.", "warning");
      return;
    }

    const cantidad = Number(cantidadSeleccionada) || 0;

    if (cantidad <= 0) {
      Swal.fire("Cantidad inválida", "El número de unidades debe ser mayor a 0.", "error");
      return;
    }

    const stockDisponible = obtenerStockDisponible(productoSeleccionado);

    // Se permite mermar con stock insuficiente: solo se advierte, no se bloquea.
    if (cantidad > stockDisponible) {
      Swal.fire({
        title: "Stock insuficiente",
        text: `Solo hay ${stockDisponible} unidad(es) disponibles de "${productoSeleccionado.nombre}" en esta sede. Puedes continuar; quedará marcado para que el aprobador lo revise.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Agregar de todas formas",
        cancelButtonText: "Cancelar"
      }).then((result) => {
        if (result.isConfirmed) {
          insertarFila(stockDisponible, cantidad);
        }
      });
      return;
    }

    insertarFila(stockDisponible, cantidad);
  };

  const eliminarProducto = (id) => {
    setListaMermas((prev) => prev.filter((item) => item.id !== id));
  };

  const limpiarLista = () => {
    setListaMermas([]);
  };

  const actualizarFila = (id, campo, valor) => {
    setListaMermas((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const actualizado = { ...item, [campo]: valor };
        if (campo === "cantidadMermar") {
          actualizado.stockInsuficiente = Number(valor) > item.stockActual;
        }
        return actualizado;
      })
    );
  };

  const { mutate: enviarSolicitud, isPending } = useMutation({
    mutationFn: solicitarMerma,
    onSuccess: () => {
      Swal.fire(
        "Solicitud enviada",
        "La solicitud de merma quedó registrada en estado Solicitado, pendiente de aprobación.",
        "success"
      );
      setListaMermas([]);
    },
    onError: (error) => {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo registrar la solicitud.",
        "error"
      );
    }
  });

  const handleSubmit = async () => {
    if (!sedeId) {
      Swal.fire("Seleccione una sede", "Debe elegir la sede donde se registrará la merma.", "warning");
      return;
    }

    if (listaMermas.length === 0) {
      Swal.fire("Lista vacía", "Agrega productos primero.", "info");
      return;
    }

    const cantidadInvalida = listaMermas.find((item) => Number(item.cantidadMermar) <= 0);
    if (cantidadInvalida) {
      Swal.fire({
        title: "Cantidad inválida",
        text: `La cantidad de "${cantidadInvalida.nombre}" debe ser mayor a 0.`,
        icon: "error"
      });
      return;
    }

    const hayInsuficientes = listaMermas.some(
      (item) => Number(item.cantidadMermar) > item.stockActual
    );

    const result = await Swal.fire({
      title: "¿Confirmar solicitud?",
      html: hayInsuficientes
        ? "Se enviará la solicitud de merma para aprobación.<br/><b>Atención:</b> uno o más productos superan el stock disponible actualmente."
        : "Se enviará la solicitud de merma para aprobación.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar",
      cancelButtonText: "Cancelar"
    });

    if (!result.isConfirmed) return;

    const payload = {
      sedeId: Number(sedeId),
      items: listaMermas.map((item) => ({
        productoId: item.id,
        cantidad: Number(item.cantidadMermar),
        motivo: item.motivo,
        observacion: item.observacion || null
      }))
    };

    enviarSolicitud(payload);
  };

  const costoTotalSeleccionado = (Number(costoSeleccionado) || 0) * (Number(cantidadSeleccionada) || 0);

  return (
    <LayoutDashboard>
      <PageHeader
        title="Merma de Productos"
        subtitle={sedeSeleccionada ? `Sede: ${sedeSeleccionada.nombreSede}` : "Seleccione una sede"}
        actions={
          <>
            <Button variant="outlined" onClick={() => navigate("/dashboard-inventario")}>
              Volver
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={limpiarLista}
              disabled={listaMermas.length === 0}
            >
              Limpiar
            </Button>
          </>
        }
      />

      <Card sx={{ p: 3, maxWidth: 1100, mx: "auto" }}>
        <Grid container spacing={2.5}>
          {/* SEDE */}
          <Grid size={12}>
            <FormControl fullWidth size="small" required>
              <InputLabel id="sede-label">Sede</InputLabel>
              <Select
                labelId="sede-label"
                label="Sede"
                value={sedeId}
                onChange={(e) => {
                  setSedeId(e.target.value);
                  setProductoSeleccionado(null);
                }}
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

          {/* PRODUCTO */}
          <Grid size={12}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ fontWeight: 700, letterSpacing: "0.06em" }}
            >
              Producto
            </Typography>

            <ToggleButtonGroup
              color="primary"
              value={tipoBusqueda}
              exclusive
              size="small"
              onChange={(e, valor) => {
                if (valor) {
                  setTipoBusqueda(valor);
                  setProductoSeleccionado(null);
                }
              }}
              sx={{ mt: 0.5, mb: 1.5 }}
            >
              {Object.keys(CAMPOS_BUSQUEDA).map((campo) => (
                <ToggleButton key={campo} value={campo}>
                  {campo}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Box display="flex" gap={1}>
              <Autocomplete
                fullWidth
                options={productosDeSede}
                value={null}
                getOptionLabel={(producto) => CAMPOS_BUSQUEDA[tipoBusqueda](producto) || ""}
                isOptionEqualToValue={(option, value) => option.id_producto === value?.id_producto}
                onChange={(e, producto) => handleSeleccionarProducto(producto)}
                disabled={!sedeId}
                noOptionsText={sedeId ? "No hay productos con stock registrado en esta sede" : ""}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder={
                      sedeId
                        ? `Buscar por ${tipoBusqueda.toLowerCase()} (ej. 'laptop')`
                        : "Seleccione una sede primero"
                    }
                  />
                )}
                sx={{ flex: 1 }}
              />

              <Button
                variant="contained"
                onClick={agregarProducto}
                sx={{ minWidth: 48 }}
                disabled={!sedeId}
              >
                <AddIcon />
              </Button>
            </Box>
          </Grid>

          {/* DESCRIPCIÓN */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Descripción"
              value={productoSeleccionado?.nombre || ""}
              slotProps={{ input: { readOnly: true } }}
            />
          </Grid>

          {/* TIPO MERMA */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="tipo-merma-label">Tipo de Merma</InputLabel>
              <Select
                labelId="tipo-merma-label"
                label="Tipo de Merma"
                value={motivoSeleccionado}
                onChange={(e) => setMotivoSeleccionado(e.target.value)}
              >
                {MOTIVOS_MERMA.map((motivo) => (
                  <MenuItem key={motivo.value} value={motivo.value}>
                    {motivo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* UNIDAD */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Unidad de Medida"
              value={productoSeleccionado?.unidadMedida || "UND"}
              slotProps={{ input: { readOnly: true } }}
            />
          </Grid>

          {/* NUMERO DE UNIDADES */}
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="N° de Unidades"
              value={cantidadSeleccionada}
              onChange={(e) => setCantidadSeleccionada(e.target.value)}
              slotProps={{ htmlInput: { min: 1 } }}
            />
          </Grid>

          {/* COSTO (solo lectura, viene del precio del producto) */}
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Costo"
              value={`S/ ${(Number(costoSeleccionado) || 0).toFixed(2)}`}
              slotProps={{ input: { readOnly: true } }}
            />
          </Grid>

          {/* COSTO TOTAL (solo lectura) */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Costo Total"
              value={`S/ ${costoTotalSeleccionado.toFixed(2)}`}
              slotProps={{ input: { readOnly: true } }}
            />
          </Grid>

          {/* OBSERVACIÓN */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Observación (opcional)"
              value={observacionSeleccionada}
              onChange={(e) => setObservacionSeleccionada(e.target.value)}
            />
          </Grid>
        </Grid>
      </Card>

      {/* TABLA */}
      <TableContainer component={Card} sx={{ mt: 3, maxWidth: 1100, mx: "auto" }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Unidad de Medida</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>N° de Unidades</TableCell>
              <TableCell>Costo</TableCell>
              <TableCell>Costo Total</TableCell>
              <TableCell>Tipo de Merma</TableCell>
              <TableCell align="right">Acción</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {listaMermas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary" variant="body2">
                    No hay productos agregados.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              listaMermas.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.codigo}</TableCell>
                  <TableCell>{item.nombre}</TableCell>
                  <TableCell>{item.unidad}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {item.stockActual}
                      {item.stockInsuficiente && (
                        <Tooltip title="Stock insuficiente: la cantidad supera el stock disponible">
                          <WarningAmberIcon color="warning" fontSize="small" />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={item.cantidadMermar}
                      onChange={(e) =>
                        actualizarFila(item.id, "cantidadMermar", parseInt(e.target.value) || 1)
                      }
                      slotProps={{ htmlInput: { min: 1 } }}
                      sx={{ width: 90 }}
                      error={item.stockInsuficiente}
                    />
                  </TableCell>
                  <TableCell>S/ {Number(item.costo).toFixed(2)}</TableCell>
                  <TableCell>S/ {(item.costo * item.cantidadMermar).toFixed(2)}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={item.motivo}
                      onChange={(e) => actualizarFila(item.id, "motivo", e.target.value)}
                      sx={{ minWidth: 140 }}
                    >
                      {MOTIVOS_MERMA.map((motivo) => (
                        <MenuItem key={motivo.value} value={motivo.value}>
                          {motivo.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="error" size="small" onClick={() => eliminarProducto(item.id)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {listaMermas.some((item) => item.stockInsuficiente) && (
        <Box sx={{ maxWidth: 1100, mx: "auto", mt: 1.5 }}>
          <Chip
            icon={<WarningAmberIcon />}
            color="warning"
            variant="outlined"
            label="Hay productos con stock insuficiente. Puedes enviar la solicitud igual; el aprobador lo revisará."
          />
        </Box>
      )}

      {/* BOTONES */}
      <Box
        display="flex"
        justifyContent="flex-end"
        flexWrap="wrap"
        gap={2}
        mt={3}
        sx={{ maxWidth: 1100, mx: "auto" }}
      >
        <Button
          variant="contained"
          disabled={listaMermas.length === 0 || isPending}
          onClick={handleSubmit}
          startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {isPending ? "Enviando..." : "Confirmar Solicitud"}
        </Button>
      </Box>
    </LayoutDashboard>
  );
};

export default RegistrarMerma;
