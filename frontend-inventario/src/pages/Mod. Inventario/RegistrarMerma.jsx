import React, { useState } from "react";
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
  Paper,
  Select,
  MenuItem,
  FormControl,
  Checkbox
} from "@mui/material";

import Swal from "sweetalert2";
import { useGlobalStore } from "../../store/useGlobalStore";
import BuscadorInteligente from "../../components/BuscadorInteligente";
import LayoutDashboard from "../../components/Layouts/LayoutDashboard";

// 3 tipos de merma oficiales especificados
const MOTIVOS_MERMA = [
  { value: "MERMA_VENCIDA", label: "Merma Vencida" },
  { value: "MERMA_ROTURA", label: "Merma Rotura" },
  { value: "MERMA_CALIDAD", label: "Merma Calidad" }
];

const RegistrarMerma = () => {
  const { user } = useGlobalStore();

  // 1. Estados de control de la lista preliminar (Tabla inferior)
  const [listaMermas, setListaMermas] = useState([]);

  // 2. Estado de búsqueda del producto (Filtro Activo)
  const [filtroActivo, setFiltroActivo] = useState("NOMBRE");
  const [productoBuscado, setProductoBuscado] = useState(null);

  // 3. Estados de los cuadros intermedios (Bloques Grises) que se completan con la Flecha Azul
  const [descripcion, setDescripcion] = useState("");
  const [tipoMerma, setTipoMerma] = useState("");
  const [unidadMedida, setUnidadMedida] = useState("");
  const [numUnidades, setNumUnidades] = useState("");
  const [costoCompra, setCostoCompra] = useState(0);

  // Captura el producto seleccionado en el Autocomplete/Buscador Inteligente
  const handleBusquedaProducto = (producto) => {
    if (!producto) return;
    setProductoBuscado(producto);
  };

  // BOTÓN AZUL (→): Al dar click, completa automáticamente los campos intermedios
  const handleDispararFlechaAzul = () => {
    if (!productoBuscado) {
      Swal.fire({
        title: "Búsqueda vacía",
        text: "Por favor, escribe y selecciona un producto en el buscador inteligente.",
        icon: "warning",
        confirmButtonColor: "#1976d2"
      });
      return;
    }

    // Mapeo de propiedades provenientes de tu entidad de Spring Boot (Producto / Inventario)
    setDescripcion(productoBuscado.nombre || "");
    setUnidadMedida(productoBuscado.unidadMedida || "UND");

    // Mapea el costo de compra (costo) del backend, si no existe usa el precio o 0 por defecto
    const costoEstablecido = productoBuscado.costo || productoBuscado.precio || 0;
    setCostoCompra(costoEstablecido);

    setNumUnidades(1); // Inicializa con 1 unidad por defecto
    setTipoMerma("");  // Limpia el selector para obligar a elegir
  };

  // BOTÓN AGREGAR (Morado ➕): Valida e Inyecta a la lista preliminar inferior
  const handleAgregarAListaPreliminar = () => {
    if (!productoBuscado || !descripcion) {
      Swal.fire("Falta Producto", "No hay ningún producto cargado mediante la flecha azul.", "warning");
      return;
    }

    if (!tipoMerma) {
      Swal.fire("Falta Tipo de Merma", "Selecciona uno de los 3 tipos de merma oficiales.", "warning");
      return;
    }

    const unidadesParseadas = parseFloat(numUnidades);

    // Validación de nulidad, vacíos y valores negativos o cero
    if (!numUnidades || isNaN(unidadesParseadas) || unidadesParseadas <= 0) {
      Swal.fire({
        title: "Cantidad Inválida",
        text: "El número de unidades no puede estar vacío, ser nulo ni ser menor o igual a cero.",
        icon: "error",
        confirmButtonColor: "#9c27b0"
      });
      return;
    }

    // Validar duplicados en la tabla preliminar
    if (listaMermas.find((item) => item.id === productoBuscado.id)) {
      Swal.fire("Producto Duplicado", "Este artículo ya está en la lista preliminar de bajas.", "warning");
      return;
    }

    // Inyecta a la lista preliminar
    setListaMermas((prev) => [
      ...prev,
      {
        id: productoBuscado.id,
        sku: productoBuscado.codigo || productoBuscado.codigoBarra || "S/K",
        producto: descripcion,
        unidadMedida: unidadMedida,
        numUnidades: unidadesParseadas,
        costo: costoCompra,
        costoTotal: unidadesParseadas * costoCompra,
        tipoMerma: MOTIVOS_MERMA.find((m) => m.value === tipoMerma)?.label || tipoMerma
      }
    ]);

    // Reseteamos el formulario intermedio para dejarlo listo para la siguiente búsqueda
    setProductoBuscado(null);
    setDescripcion("");
    setUnidadMedida("");
    setNumUnidades("");
    setCostoCompra(0);
    setTipoMerma("");
  };

  // Envío final hacia el Backend
  const handleConfirmarSolicitud = async () => {
    const result = await Swal.fire({
      title: "¿Confirmar Registro?",
      text: `Se enviará la baja de ${listaMermas.length} productos al sistema central.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2e7d32",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, registrar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        // Armamos el JSON según el MermaRequestDto de Spring Boot
        const payload = {
          usuarioId: user?.id, // ID del usuario logueado
          sedeId: user?.sedeId || 1, // ID de la sede actual (ajusta según tu store)
          detalles: listaMermas.map(item => {
            // Buscamos el VALUE original ("MERMA_ROTURA") a partir del label que mostramos en la tabla
            const motivoValue = MOTIVOS_MERMA.find(m => m.label === item.tipoMerma)?.value || "MERMA_ROTURA";

            return {
              productoId: item.id,
              cantidad: item.numUnidades,
              tipoMerma: motivoValue
            };
          })
        };

        // Llamada a la API
        // IMPORTANTE: Asegúrate de importar registrarMermasApi arriba en tu archivo
        // await registrarMermasApi(payload); 

        // Si todo sale bien:
        Swal.fire("Registrado", "Las mermas han sido inyectadas y el stock actualizado con éxito.", "success");
        setListaMermas([]); // Vaciamos la tabla

      } catch (error) {
        // Capturamos el mensaje exacto que manda el backend (ej. "Stock insuficiente")
        const mensajeError = error.response?.data || "No se pudo conectar con el servidor.";
        Swal.fire("Error en la transacción", mensajeError, "error");
      }
    }
  };

  // ESTILOS DE INTERFAZ INTACTOS
  const labelStyle = {
    width: 250,
    background: "#efefef",
    borderBottom: "1px solid #d9d9d9",
    borderRight: "1px solid #d9d9d9",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "20px",
    minHeight: 78
  };

  const fieldStyle = {
    flex: 1,
    padding: 2,
    borderBottom: "1px solid #d9d9d9",
    display: "flex",
    alignItems: "center"
  };

  const tabStyle = {
    flex: 1,
    border: "1px solid #d9d9d9",
    borderRadius: 0,
    color: "#666",
    fontWeight: 700
  };

  const tabActive = {
    ...tabStyle,
    background: "#dbe5f1",
    color: "#1976d2"
  };

  // CÁLCULO EN VIVO: Multiplica automáticamente Unidades por Costo cada vez que cambia el número
  const calcularCostoTotalLive = () => {
    const unidades = parseFloat(numUnidades) || 0;
    return (unidades * costoCompra).toFixed(2);
  };

  return (
    <LayoutDashboard>
      <Box sx={{ p: 2, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
        <Paper elevation={2} sx={{ maxWidth: 1050, margin: "0 auto", borderRadius: 2, p: 3 }}>

          {/* HEADER */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography sx={{ fontSize: "3rem", fontWeight: 900, color: "#000" }}>
              MERMA DE PRODUCTOS
            </Typography>

            <Box display="flex" gap={1}>
              <Button variant="outlined" sx={{ borderColor: "#d9d9d9", color: "#333", fontWeight: 'bold' }}>
                ← VOLVER
              </Button>
              <Button color="error" variant="outlined" sx={{ fontWeight: 'bold' }}>
                🗑 LIMPIAR
              </Button>
            </Box>
          </Box>

          {/* FORMULARIO */}
          <Box border="1px solid #d9d9d9">

            {/* 1. SELECCIÓN DE FILTRO Y BÚSQUEDA */}
            <Box display="flex">
              <Box sx={labelStyle}>Producto</Box>
              <Box sx={{ flex: 1, p: 2, borderBottom: "1px solid #d9d9d9", display: "flex", flexDirection: "column" }}>
                <Box display="flex" mb={2}>
                  <Button sx={filtroActivo === "SKU" ? tabActive : tabStyle} onClick={() => setFiltroActivo("SKU")}>
                    SKU
                  </Button>
                  <Button sx={filtroActivo === "EAN" ? tabActive : tabStyle} onClick={() => setFiltroActivo("EAN")}>
                    EAN
                  </Button>
                  <Button sx={filtroActivo === "NOMBRE" ? tabActive : tabStyle} onClick={() => setFiltroActivo("NOMBRE")}>
                    NOMBRE
                  </Button>
                </Box>

                <Box display="flex" alignItems="center" gap={1} sx={{ width: "100%" }}>
                  <Box sx={{ flex: 1, width: "100%", "& .MuiFormControl-root": { width: "100%" } }}>
                    <BuscadorInteligente onSelect={handleBusquedaProducto} tipoFiltro={filtroActivo} />
                  </Box>

                  {/* BOTÓN AZUL (→): Ejecuta el autocompletado en los campos intermedios */}
                  <Button
                    variant="contained"
                    onClick={handleDispararFlechaAzul}
                    sx={{ minWidth: '55px', height: '40px', bgcolor: "#1976d2", fontSize: '1.2rem', fontWeight: 'bold' }}
                  >
                    →
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* 2. DESCRIPCIÓN */}
            <Box display="flex">
              <Box sx={labelStyle}>Descripción</Box>
              <Box sx={fieldStyle}>
                <TextField
                  fullWidth
                  size="small"
                  InputProps={{ readOnly: true }}
                  value={descripcion}
                  placeholder="Se autocompleta al presionar el botón azul..."
                />
              </Box>
            </Box>

            {/* 3. TIPO DE MERMA (3 opciones oficiales) */}
            <Box display="flex">
              <Box sx={labelStyle}>Tipo de Merma</Box>
              <Box sx={fieldStyle}>
                <FormControl fullWidth size="small">
                  <Select
                    value={tipoMerma}
                    onChange={(e) => setTipoMerma(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>Seleccione</MenuItem>
                    {MOTIVOS_MERMA.map((m) => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* 4. UNIDAD DE MEDIDA */}
            <Box display="flex">
              <Box sx={labelStyle}>Unidad de Medida</Box>
              <Box sx={fieldStyle}>
                <TextField
                  fullWidth
                  size="small"
                  InputProps={{ readOnly: true }}
                  value={unidadMedida}
                  placeholder="KG o Unidades..."
                />
              </Box>
            </Box>

            {/* 5. N° DE UNIDADES Y COSTO DE COMPRA */}
            <Box display="flex" sx={{ borderBottom: "1px solid #d9d9d9" }}>
              <Box sx={{ ...labelStyle, borderBottom: 'none' }}>N° de Unidades</Box>

              <Box sx={{ flex: 1, display: "flex" }}>
                <Box flex={1} p={2} display="flex" alignItems="center">
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={numUnidades}
                    onChange={(e) => setNumUnidades(e.target.value)}
                    placeholder="Escribe la cantidad..."
                  />
                </Box>

                <Box sx={{
                  width: 250,
                  background: "#efefef",
                  borderLeft: "1px solid #d9d9d9",
                  borderRight: "1px solid #d9d9d9",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: "bold",
                  fontSize: 22
                }}>
                  Costo
                </Box>

                <Box flex={1} p={2} display="flex" alignItems="center">
                  <TextField
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                    value={costoCompra > 0 ? `S/ ${costoCompra.toFixed(2)}` : ""}
                    placeholder="Costo unitario base..."
                  />
                </Box>
              </Box>
            </Box>

            {/* 6. COSTO TOTAL (Calculado en vivo) */}
            <Box display="flex">
              <Box sx={{ ...labelStyle, borderBottom: 'none' }}>Costo Total</Box>
              <Box sx={{ ...fieldStyle, borderBottom: 'none' }}>
                <TextField
                  fullWidth
                  size="small"
                  InputProps={{ readOnly: true }}
                  value={descripcion ? `S/ ${calcularCostoTotalLive()}` : ""}
                  sx={{ input: { fontWeight: 'bold', color: '#1976d2' } }}
                />
              </Box>
            </Box>
          </Box>

          {/* TABLA PRELIMINAR (Sin columna de acción) */}
          <TableContainer component={Paper} sx={{ mt: 3, border: "1px solid #d9d9d9", borderRadius: 1, boxShadow: "none" }}>
            <Table size="small">
              <TableHead sx={{ background: "#ececec" }}>
                <TableRow>
                  <TableCell align="center" width="5%"><Checkbox size="small" disabled /></TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>SKU</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>PRODUCTO</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>UNIDAD DE MEDIDA</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>N° DE UNIDADES</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>COSTO</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>COSTO TOTAL</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>TIPO DE MERMA</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {listaMermas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6, color: "#777", fontSize: '1.1rem' }}>
                      No hay productos agregados en la lista preliminar.
                    </TableCell>
                  </TableRow>
                ) : (
                  listaMermas.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell align="center"><Checkbox size="small" checked /></TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell sx={{ fontWeight: '500' }}>{item.producto}</TableCell>
                      <TableCell>{item.unidadMedida}</TableCell>
                      <TableCell>{item.numUnidades}</TableCell>
                      <TableCell>S/ {item.costo.toFixed(2)}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>S/ {item.costoTotal.toFixed(2)}</TableCell>
                      <TableCell>{item.tipoMerma}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ACCIONES INFERIORES */}
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Box display="flex" gap={2}>
              {/* BOTÓN AGREGAR (Morado): Realiza las validaciones estrictas */}
              <Button
                variant="contained"
                onClick={handleAgregarAListaPreliminar}
                sx={{ background: "#9c27b0", px: 4, py: 1.3, fontWeight: "bold", '&:hover': { background: '#7b1fa2' } }}
              >
                ➕ AGREGAR
              </Button>
              {/* BOTÓN ELIMINAR TODO */}
              <Button
                variant="contained"
                color="secondary"
                sx={{ px: 4, py: 1.3, fontWeight: "bold" }}
                onClick={() => {
                  if (listaMermas.length === 0) return;
                  Swal.fire({
                    title: '¿Limpiar tabla?',
                    text: "Se borrarán todos los productos de la lista preliminar.",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'Sí, borrar todo'
                  }).then((result) => {
                    if (result.isConfirmed) setListaMermas([]);
                  });
                }}
              >
                🗑 Eliminar Todo
              </Button>
            </Box>

            <Button
              variant="contained"
              disabled={listaMermas.length === 0}
              onClick={handleConfirmarSolicitud}
              sx={{
                background: listaMermas.length === 0 ? "#d9d9d9" : "#2e7d32",
                color: listaMermas.length === 0 ? "#777" : "#fff",
                px: 5,
                fontWeight: "bold"
              }}
            >
              ▶ CONFIRMAR SOLICITUD
            </Button>
          </Box>

        </Paper>
      </Box>
    </LayoutDashboard>
  );
};

export default RegistrarMerma;