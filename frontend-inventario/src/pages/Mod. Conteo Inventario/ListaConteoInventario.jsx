import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
  IconButton
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { listarTodasHojasConteo } from "../../api/conteoApi";
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
                      const diferencia =
                        det.stockContado != null ? det.stockContado - det.stockSistema : null;
                      return (
                        <TableRow key={det.id}>
                          <TableCell>{det.skuProducto}</TableCell>
                          <TableCell>{det.nombreProducto}</TableCell>
                          <TableCell align="right">{det.stockSistema}</TableCell>
                          <TableCell align="right">{det.stockContado ?? "-"}</TableCell>
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
          <Button onClick={cerrarModal} color="inherit">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ListaConteoInventario;
