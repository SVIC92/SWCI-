import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Typography,
  IconButton,
  TextField
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import Swal from "sweetalert2";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { listarTodasHojasConteo, modificarConteo } from "../../api/conteoApi";
import TablaLista from "../../components/TablaLista";

const ESTADO_LABEL = {
  GENERADA: "Generada",
  CONTADA: "Contada (pend. aprobación)",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada"
};
const ESTADO_COLOR = {
  GENERADA: "default",
  CONTADA: "warning",
  APROBADA: "success",
  RECHAZADA: "error"
};

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

function ListaConteoInventario() {
  const navigate = useNavigate();
  const [hojaSeleccionada, setHojaSeleccionada] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(false);
  const [conteosEditados, setConteosEditados] = useState({});

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ["hojasConteoTodas"],
    queryFn: listarTodasHojasConteo,
    initialData: { data: [] },
    select: (response) => response.data
  });

  const hojasProcesadas = useMemo(() => {
    return (response || []).map((h) => ({
      ...h,
      fechaGeneracionFormateada: formatearFecha(h.fechaGeneracion)
    }));
  }, [response]);

  const verDetalle = (hoja) => {
    setHojaSeleccionada(hoja);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setHojaSeleccionada(null);
    setEditando(false);
    setConteosEditados({});
  };

  // Solo se puede modificar un conteo ya registrado que aún no fue aprobado ni rechazado.
  const puedeModificar = hojaSeleccionada?.estado === "CONTADA";

  const iniciarEdicion = () => {
    const valores = {};
    hojaSeleccionada.detalles.forEach((det) => {
      valores[det.id] = det.stockContado ?? "";
    });
    setConteosEditados(valores);
    setEditando(true);
  };

  const { mutate: guardarModificacion, isPending: guardando } = useMutation({
    mutationFn: ({ id, data }) => modificarConteo(id, data),
    onSuccess: () => {
      Swal.fire("Conteo modificado", "Los cambios quedaron registrados. El conteo sigue pendiente de aprobación.", "success");
      refetch();
      cerrarModal();
    },
    onError: (error) => {
      Swal.fire("Error", error.response?.data?.message || "No se pudo modificar el conteo.", "error");
    }
  });

  const handleGuardarEdicion = () => {
    const detalles = hojaSeleccionada.detalles.map((det) => ({
      detalleId: det.id,
      stockContado: Number(conteosEditados[det.id])
    }));
    const invalido = detalles.find(
      (d) => Number.isNaN(d.stockContado) || !Number.isInteger(d.stockContado) || d.stockContado < 0
    );
    if (invalido) {
      Swal.fire("Cantidad inválida", "Todas las cantidades deben ser números enteros (0 o más).", "error");
      return;
    }
    guardarModificacion({ id: hojaSeleccionada.id, data: { detalles } });
  };

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "nombreSede", headerName: "Sede", width: 160 },
    {
      field: "tipoConteo",
      headerName: "Tipo",
      width: 130,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value === "SORPRESIVO" ? "Sorpresivo" : "Programado"}
          color={params.value === "SORPRESIVO" ? "warning" : "info"}
          variant="outlined"
        />
      )
    },
    {
      field: "estado",
      headerName: "Estado",
      width: 200,
      renderCell: (params) => (
        <Chip
          size="small"
          label={ESTADO_LABEL[params.value] || params.value}
          color={ESTADO_COLOR[params.value] || "default"}
          variant="outlined"
        />
      )
    },
    { field: "alcanceDescripcion", headerName: "Alcance", width: 170 },
    { field: "nombreGenerador", headerName: "Generado por", width: 160 },
    { field: "fechaGeneracionFormateada", headerName: "Fecha Generación", width: 170 },
    {
      field: "acciones",
      headerName: "Detalle",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton size="small" color="primary" onClick={() => verDetalle(params.row)}>
          <VisibilityIcon fontSize="small" />
        </IconButton>
      )
    }
  ];

  return (
    <>
      <TablaLista
        title="Lista de Conteo de Inventario"
        columns={columns}
        data={hojasProcesadas}
        isLoading={isLoading}
        onBack={() => navigate("/dashboard-conteoinventario")}
        onRefresh={refetch}
        getRowId={(row) => row.id}
        showAddButton={false}
      />

      <Dialog open={modalOpen} onClose={cerrarModal} maxWidth="md" fullWidth>
        <DialogTitle>Detalle de Hoja de Conteo #{hojaSeleccionada?.id}</DialogTitle>
        <DialogContent>
          {hojaSeleccionada && (
            <>
              <Grid container spacing={2} sx={{ mb: 2, mt: 0.5 }}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="textSecondary">Sede</Typography>
                  <Typography variant="body1" fontWeight="bold">{hojaSeleccionada.nombreSede}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="textSecondary">Estado</Typography>
                  <Chip
                    size="small"
                    label={ESTADO_LABEL[hojaSeleccionada.estado] || hojaSeleccionada.estado}
                    color={ESTADO_COLOR[hojaSeleccionada.estado] || "default"}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="textSecondary">Alcance</Typography>
                  <Typography variant="body1">{hojaSeleccionada.alcanceDescripcion || "Toda la Sede"}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="textSecondary">Generado por</Typography>
                  <Typography variant="body1">{hojaSeleccionada.nombreGenerador}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="textSecondary">Contado por</Typography>
                  <Typography variant="body1">{hojaSeleccionada.nombreContador || "-"}</Typography>
                </Grid>
                {hojaSeleccionada.nombreModificador && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Última modificación</Typography>
                    <Typography variant="body1">
                      {hojaSeleccionada.nombreModificador} · {formatearFecha(hojaSeleccionada.fechaModificacion)}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {hojaSeleccionada.estado === "RECHAZADA" && hojaSeleccionada.motivoRechazo && (
                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                  Motivo de rechazo: {hojaSeleccionada.motivoRechazo}
                </Typography>
              )}

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      <TableCell>SKU</TableCell>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Stock Sistema</TableCell>
                      <TableCell align="right">Stock Contado</TableCell>
                      <TableCell align="right">Diferencia</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hojaSeleccionada.detalles?.map((det) => {
                      const contadoVigente = editando
                        ? conteosEditados[det.id] === "" || conteosEditados[det.id] == null
                          ? null
                          : Number(conteosEditados[det.id])
                        : det.stockContado;
                      const diferencia =
                        contadoVigente != null && !Number.isNaN(contadoVigente)
                          ? contadoVigente - det.stockSistema
                          : null;
                      return (
                        <TableRow key={det.id}>
                          <TableCell>{det.skuProducto}</TableCell>
                          <TableCell>{det.nombreProducto}</TableCell>
                          <TableCell align="right">{det.stockSistema}</TableCell>
                          <TableCell align="right">
                            {editando ? (
                              <TextField
                                size="small"
                                type="number"
                                value={conteosEditados[det.id] ?? ""}
                                onChange={(e) =>
                                  setConteosEditados((prev) => ({ ...prev, [det.id]: e.target.value }))
                                }
                                inputProps={{ min: 0, style: { textAlign: "right", width: 80 } }}
                              />
                            ) : (
                              det.stockContado ?? "-"
                            )}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 700,
                              color:
                                diferencia == null
                                  ? "text.secondary"
                                  : diferencia === 0
                                  ? "success.main"
                                  : diferencia > 0
                                  ? "info.main"
                                  : "error.main"
                            }}
                          >
                            {diferencia == null ? "-" : diferencia > 0 ? `+${diferencia}` : diferencia}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {editando ? (
            <>
              <Button onClick={() => setEditando(false)} color="inherit" disabled={guardando}>
                Cancelar edición
              </Button>
              <Button onClick={handleGuardarEdicion} variant="contained" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar cambios"}
              </Button>
            </>
          ) : (
            <>
              {puedeModificar && (
                <Button onClick={iniciarEdicion} startIcon={<EditIcon />} variant="outlined">
                  Modificar conteo
                </Button>
              )}
              <Button onClick={cerrarModal} color="inherit">
                Cerrar
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ListaConteoInventario;
