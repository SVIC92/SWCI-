import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import { getSedes } from "../../api/sedeApi";
import { importarVentasCsv } from "../../api/InventarioApi";
import LayoutDashboard from "../../components/Layouts/LayoutDashboard";

function ImportarVentas() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const inputRef = useRef(null);

  const [sedeId, setSedeId] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [errores, setErrores] = useState([]);
  const [mensajeError, setMensajeError] = useState("");

  const { data: sedes, isLoading } = useQuery({
    queryKey: ["sedes"],
    queryFn: getSedes,
    initialData: [],
  });

  const importarMutation = useMutation({
    mutationFn: ({ sedeId, archivo }) => importarVentasCsv(sedeId, archivo),
    onSuccess: (res) => {
      setResultado(res.data);
      setErrores([]);
      setMensajeError("");
      setArchivo(null);
      if (inputRef.current) inputRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["movimientos"] });
    },
    onError: (error) => {
      setResultado(null);
      setErrores(error.response?.data?.errores || []);
      setMensajeError(error.response?.data?.message || "Error en el servidor");
    },
  });

  const descargarPlantilla = () => {
    const blob = new Blob(["sku,cantidad\nSKU-001,2\nSKU-002,5\n"], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla_ventas.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleArchivo = (e) => {
    setArchivo(e.target.files?.[0] || null);
    setResultado(null);
    setErrores([]);
    setMensajeError("");
  };

  const handleImportar = () => {
    if (!sedeId || !archivo) return;
    importarMutation.mutate({ sedeId, archivo });
  };

  if (isLoading) {
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
      <Container maxWidth="md" sx={{ mt: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/dashboard-inventario")}
          >
            Volver
          </Button>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Importar Ventas (CSV)
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            El archivo debe tener las columnas <b>sku,cantidad</b> (con o sin cabecera). Las ventas se descuentan del
            stock de la sede elegida y quedan registradas en el Kardex. Si alguna fila tiene error,
            <b> no se aplica ninguna</b>.
          </Alert>

          <Stack spacing={3}>
            <FormControl fullWidth required>
              <InputLabel id="sede-ventas-label">Sede de las ventas</InputLabel>
              <Select
                labelId="sede-ventas-label"
                label="Sede de las ventas"
                value={sedeId}
                onChange={(e) => setSedeId(e.target.value)}
              >
                {sedes.map((sede) => (
                  <MenuItem key={sede.idSede} value={String(sede.idSede)}>
                    {sede.nombreSede}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
              <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
                Seleccionar archivo CSV
                <input ref={inputRef} hidden type="file" accept=".csv,text/csv" onChange={handleArchivo} />
              </Button>
              <Typography color={archivo ? "text.primary" : "text.secondary"}>
                {archivo ? archivo.name : "Ningún archivo seleccionado"}
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Button size="small" startIcon={<FileDownloadIcon />} onClick={descargarPlantilla}>
                Descargar plantilla
              </Button>
            </Stack>

            {mensajeError && (
              <Alert severity="error">
                {mensajeError}
                {errores.length > 0 && (
                  <List dense sx={{ maxHeight: 240, overflow: "auto" }}>
                    {errores.map((err, i) => (
                      <ListItem key={i} disableGutters>
                        <ListItemText primary={err} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Alert>
            )}

            {resultado && (
              <Alert severity="success">
                Importación exitosa: {resultado.filasProcesadas} fila(s), {resultado.productosAfectados} producto(s),{" "}
                {resultado.unidadesVendidas} unidad(es) descontadas.
                <List dense sx={{ maxHeight: 240, overflow: "auto" }}>
                  {resultado.detalle.map((d, i) => (
                    <ListItem key={i} disableGutters>
                      <ListItemText primary={d} />
                    </ListItem>
                  ))}
                </List>
              </Alert>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                size="large"
                disabled={!sedeId || !archivo || importarMutation.isPending}
                startIcon={importarMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <UploadFileIcon />}
                onClick={handleImportar}
              >
                {importarMutation.isPending ? "Importando..." : "Importar Ventas"}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </LayoutDashboard>
  );
}

export default ImportarVentas;
