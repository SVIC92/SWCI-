import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  TextField,
  Button,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Divider,
  Container,
  Autocomplete,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { getProductos } from "../../api/productoApi";
import { getSedes } from "../../api/sedeApi";
import { getProveedores } from "../../api/proveedorApi";
import { solicitarDevolucion } from "../../api/devolucionApi";
import LayoutDashboard from "../../components/Layouts/LayoutDashboard";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

const MySwal = withReactContent(Swal);

const MOTIVOS_DEVOLUCION = [
  "Producto defectuoso",
  "Producto dañado",
  "Error en el pedido / envío",
  "Exceso de stock",
  "Producto vencido o por vencer",
  "Otro",
];

const FILA_VACIA = { productoId: "", cantidad: "", motivo: "" };

function DevolucionMercaderia() {
  const navigate = useNavigate();

  const { data: productos = [], isLoading: lp } = useQuery({ queryKey: ["productos"], queryFn: getProductos });
  const { data: sedes = [], isLoading: ls } = useQuery({ queryKey: ["sedes"], queryFn: getSedes });
  const { data: proveedores = [], isLoading: lpr } = useQuery({ queryKey: ["proveedores"], queryFn: getProveedores });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      sedeOrigenId: "",
      tipoDestino: "SEDE",
      sedeDestinoId: "",
      proveedorId: "",
      referencia: "",
      detalles: [{ ...FILA_VACIA }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "detalles" });
  const tipoDestino = useWatch({ control, name: "tipoDestino" });
  const sedeOrigenId = useWatch({ control, name: "sedeOrigenId" });

  const mutation = useMutation({
    mutationFn: solicitarDevolucion,
    onSuccess: () => {
      MySwal.fire({
        title: "Solicitud enviada",
        text: "La devolución quedó pendiente de aprobación. El stock se moverá cuando sea aprobada.",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
      reset();
    },
    onError: (error) => {
      const data = error.response?.data;
      const detalle = data?.errors ? Object.values(data.errors).join(". ") : null;
      MySwal.fire({
        title: "Error",
        text: detalle || data?.message || "Error en el servidor",
        icon: "error",
      });
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({
      sedeOrigenId: parseInt(data.sedeOrigenId),
      tipoDestino: data.tipoDestino,
      sedeDestinoId: data.tipoDestino === "SEDE" ? parseInt(data.sedeDestinoId) : null,
      proveedorId: data.tipoDestino === "PROVEEDOR" ? parseInt(data.proveedorId) : null,
      referencia: data.referencia || null,
      items: data.detalles.map((d) => ({
        productoId: parseInt(d.productoId),
        cantidad: parseInt(d.cantidad),
        motivo: d.motivo,
      })),
    });
  };

  if (lp || ls || lpr) {
    return (
      <LayoutDashboard>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <CircularProgress size={60} />
        </Box>
      </LayoutDashboard>
    );
  }

  const sedesDestino = sedes.filter((s) => String(s.idSede) !== String(sedeOrigenId));

  return (
    <LayoutDashboard>
      <Container maxWidth={false} sx={{ mt: 3, mb: 3, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2, flexWrap: "wrap" }}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashboard-inventario")}>
            Volver
          </Button>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Devolución de Mercadería
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="text" onClick={() => navigate("/inventario/devolucion/gestion")}>
            Ver solicitudes
          </Button>
        </Box>

        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Alert severity="info" sx={{ mb: 3 }}>
              La sede que devuelve descuenta stock cuando la solicitud es <b>aprobada</b> por el Administrador o el Jefe
              de Inventario. Si el destino es una sede/almacén, esta recibe el stock en ese momento.
            </Alert>

            <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
              Origen y destino
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3,
                mb: 3,
                alignItems: "start",
              }}
            >
              <Controller
                name="sedeOrigenId"
                control={control}
                rules={{ required: "Selecciona la sede que devuelve" }}
                render={({ field }) => (
                  <TextField
                    select
                    required
                    label="Sede que devuelve"
                    {...field}
                    error={!!errors.sedeOrigenId}
                    helperText={errors.sedeOrigenId?.message}
                  >
                    {sedes.map((s) => (
                      <MenuItem key={s.idSede} value={String(s.idSede)}>{s.nombreSede}</MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Controller
                name="tipoDestino"
                control={control}
                render={({ field }) => (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Devolver a</Typography>
                    <ToggleButtonGroup
                      fullWidth
                      exclusive
                      color="primary"
                      value={field.value}
                      onChange={(_, v) => v && field.onChange(v)}
                    >
                      <ToggleButton value="SEDE">Sede / Almacén</ToggleButton>
                      <ToggleButton value="PROVEEDOR">Proveedor</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                )}
              />

              {tipoDestino === "SEDE" ? (
                <Controller
                  name="sedeDestinoId"
                  control={control}
                  rules={{ required: "Selecciona la sede/almacén destino" }}
                  render={({ field }) => (
                    <TextField
                      select
                      required
                      label="Sede / Almacén destino"
                      {...field}
                      error={!!errors.sedeDestinoId}
                      helperText={errors.sedeDestinoId?.message}
                    >
                      {sedesDestino.map((s) => (
                        <MenuItem key={s.idSede} value={String(s.idSede)}>{s.nombreSede}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              ) : (
                <Controller
                  name="proveedorId"
                  control={control}
                  rules={{ required: "Selecciona el proveedor" }}
                  render={({ field }) => (
                    <TextField
                      select
                      required
                      label="Proveedor"
                      {...field}
                      error={!!errors.proveedorId}
                      helperText={errors.proveedorId?.message}
                    >
                      {proveedores.map((p) => (
                        <MenuItem key={p.id_proveedor} value={String(p.id_proveedor)}>{p.nombre_proveedor}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              )}

              <TextField
                label="Referencia / Notas"
                placeholder="Ej: Guía de remisión T001-123"
                {...register("referencia")}
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
              Productos a devolver
            </Typography>

            {fields.map((item, index) => (
              <Paper key={item.id} variant="outlined" sx={{ p: 2, mb: 2, borderWidth: 1.5 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: { md: "flex-start" } }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Controller
                      name={`detalles.${index}.productoId`}
                      control={control}
                      rules={{ required: "Selecciona un producto" }}
                      render={({ field: { onChange, value } }) => (
                        <Autocomplete
                          fullWidth
                          options={productos}
                          getOptionLabel={(o) => `[${o.sku}] ${o.nombre}`}
                          isOptionEqualToValue={(o, v) => o.id_producto === v.id_producto}
                          onChange={(_, nv) => onChange(nv ? nv.id_producto : "")}
                          value={productos.find((p) => p.id_producto === value) || null}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              required
                              label="Buscar por SKU o Nombre de Producto"
                              error={!!errors.detalles?.[index]?.productoId}
                              helperText={errors.detalles?.[index]?.productoId?.message}
                            />
                          )}
                        />
                      )}
                    />
                  </Box>

                  <Box sx={{ width: { xs: "100%", md: 140 }, flexShrink: 0 }}>
                    <TextField
                      label="Cant."
                      type="number"
                      fullWidth
                      required
                      inputProps={{ min: 1 }}
                      {...register(`detalles.${index}.cantidad`, {
                        required: "Requerido",
                        min: { value: 1, message: "Mínimo 1" },
                      })}
                      error={!!errors.detalles?.[index]?.cantidad}
                      helperText={errors.detalles?.[index]?.cantidad?.message}
                    />
                  </Box>

                  <Box sx={{ width: { xs: "100%", md: 260 }, flexShrink: 0 }}>
                    <Controller
                      name={`detalles.${index}.motivo`}
                      control={control}
                      rules={{ required: "Selecciona un motivo" }}
                      render={({ field }) => (
                        <TextField
                          select
                          required
                          fullWidth
                          label="Motivo"
                          {...field}
                          error={!!errors.detalles?.[index]?.motivo}
                          helperText={errors.detalles?.[index]?.motivo?.message}
                        >
                          {MOTIVOS_DEVOLUCION.map((m) => (
                            <MenuItem key={m} value={m}>{m}</MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Box>

                  <IconButton
                    color="error"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    sx={{ border: "1px solid", borderColor: "error.light", alignSelf: { xs: "flex-start", md: "center" } }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Paper>
            ))}

            <Button startIcon={<AddIcon />} onClick={() => append({ ...FILA_VACIA })} sx={{ fontWeight: "bold" }}>
              Agregar otra fila
            </Button>

            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={mutation.isPending}
                startIcon={mutation.isPending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                sx={{ px: 5, py: 1.5, borderRadius: 2 }}
              >
                {mutation.isPending ? "Enviando..." : "Enviar solicitud de devolución"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </LayoutDashboard>
  );
}

export default DevolucionMercaderia;
