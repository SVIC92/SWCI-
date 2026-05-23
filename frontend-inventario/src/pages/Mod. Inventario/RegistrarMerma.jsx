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
  IconButton,
  FormControl
} from "@mui/material";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Swal from "sweetalert2";
import { useGlobalStore } from "../../store/useGlobalStore";
import BuscadorInteligente from "../../components/BuscadorInteligente";
import LayoutDashboard from "../../components/Layouts/LayoutDashboard";

const MOTIVOS_MERMA = [
  { value: "VENCIMIENTO", label: "Vencimiento" },
  { value: "ROTURA_DANIO", label: "Daño / Rotura" },
  { value: "ROBO_HURTO", label: "Robo / Hurto" },
  { value: "FALLA_TECNICA", label: "Falla Técnica" }
];

const RegistrarMerma = () => {
  const { user } = useGlobalStore();

  const sedeUsuario = user?.sede || "Sede General";

  const [listaMermas, setListaMermas] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const handleSeleccionarProducto = (producto) => {
    if (!producto) return;

    setProductoSeleccionado(producto);

    if (listaMermas.find((item) => item.id === producto.id)) {
      Swal.fire({
        title: "Producto duplicado",
        text: "Este producto ya está agregado.",
        icon: "warning"
      });
      return;
    }
  };

  const agregarProducto = () => {
    if (!productoSeleccionado) {
      Swal.fire(
        "Seleccione un producto",
        "Debe buscar un producto primero.",
        "warning"
      );
      return;
    }

    setListaMermas((prev) => [
      ...prev,
      {
        id: productoSeleccionado.id,
        codigo:
          productoSeleccionado.codigo ||
          productoSeleccionado.codigoBarras,
        nombre: productoSeleccionado.nombre,
        unidad:
          productoSeleccionado.unidadMedida || "UND",
        stockActual: productoSeleccionado.stock || 0,
        cantidadMermar: 1,
        costo: productoSeleccionado.precio || 0,
        motivo: "VENCIMIENTO",
        observacion: ""
      }
    ]);

    setProductoSeleccionado(null);
  };

  const eliminarProducto = (id) => {
    setListaMermas((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const actualizarFila = (id, campo, valor) => {
    setListaMermas((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, [campo]: valor }
          : item
      )
    );
  };

  const handleSubmit = async () => {
    if (listaMermas.length === 0) {
      Swal.fire(
        "Lista vacía",
        "Agrega productos primero.",
        "info"
      );
      return;
    }

    const filaInvalida = listaMermas.find(
      (item) =>
        item.cantidadMermar <= 0 ||
        item.cantidadMermar > item.stockActual
    );

    if (filaInvalida) {
      Swal.fire({
        title: "Cantidad inválida",
        text: `La cantidad supera el stock de ${filaInvalida.nombre}`,
        icon: "error"
      });
      return;
    }

    const result = await Swal.fire({
      title: "¿Confirmar solicitud?",
      text: "Se registrará la merma.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar"
    });

    if (!result.isConfirmed) return;

    try {
      // AQUÍ TU API
      // await registrarMermasApi(listaMermas);

      Swal.fire(
        "Éxito",
        "Merma registrada correctamente.",
        "success"
      );

      setListaMermas([]);
    } catch (error) {
      Swal.fire(
        "Error",
        "No se pudo registrar.",
        "error"
      );
    }
  };

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
    borderBottom: "1px solid #d9d9d9"
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

  return (
    <LayoutDashboard>

      <Box
        sx={{
          p: 2,
          bgcolor: "#f5f5f5",
          minHeight: "100vh"
        }}
      >
        <Paper
          elevation={2}
          sx={{
            maxWidth: 1050,
            margin: "0 auto",
            borderRadius: 2,
            p: 3
          }}
        >
          {/* HEADER */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography
              sx={{
                fontSize: "3rem",
                fontWeight: 900,
                color: "#000"
              }}
            >
              MERMA DE PRODUCTOS
            </Typography>

            <Box display="flex" gap={1}>
              <Button variant="outlined">
                ← VOLVER
              </Button>

              <Button color="error" variant="outlined">
                🗑 LIMPIAR
              </Button>
            </Box>
          </Box>

          {/* FORMULARIO */}
          <Box border="1px solid #d9d9d9">
            {/* PRODUCTO */}
            <Box display="flex">
              <Box sx={labelStyle}>
                Producto
              </Box>

              <Box sx={{ flex: 1, p: 2 }}>
                <Box display="flex" mb={2}>
                  <Button sx={tabActive}>
                    SKU
                  </Button>

                  <Button sx={tabStyle}>
                    EAN
                  </Button>

                  <Button sx={tabStyle}>
                    NOMBRE
                  </Button>
                </Box>

                <Box display="flex" gap={1}>
                  <Box flex={1}>
                    <BuscadorInteligente
                      onSelect={
                        handleSeleccionarProducto
                      }
                    />
                  </Box>

                  <Button
                    variant="contained"
                    onClick={agregarProducto}
                    sx={{
                      minWidth: 45,
                      height: 40
                    }}
                  >
                    →
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* DESCRIPCIÓN */}
            <Box display="flex">
              <Box sx={labelStyle}>
                Descripción
              </Box>

              <Box sx={fieldStyle}>
                <TextField
                  fullWidth
                  size="small"
                  value={
                    productoSeleccionado?.nombre ||
                    ""
                  }
                />
              </Box>
            </Box>

            {/* TIPO MERMA */}
            <Box display="flex">
              <Box sx={labelStyle}>
                Tipo de Merma
              </Box>

              <Box sx={fieldStyle}>
                <FormControl fullWidth size="small">
                  <Select defaultValue="">
                    <MenuItem value="">
                      Seleccione
                    </MenuItem>

                    {MOTIVOS_MERMA.map(
                      (motivo) => (
                        <MenuItem
                          key={motivo.value}
                          value={motivo.value}
                        >
                          {motivo.label}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* UNIDAD */}
            <Box display="flex">
              <Box sx={labelStyle}>
                Unidad de Medida
              </Box>

              <Box sx={fieldStyle}>
                <TextField
                  fullWidth
                  size="small"
                  value={
                    productoSeleccionado?.unidadMedida ||
                    "UND"
                  }
                />
              </Box>
            </Box>

            {/* NUMERO + COSTO */}
            <Box display="flex">
              <Box sx={labelStyle}>
                N° de Unidades
              </Box>

              <Box
                sx={{
                  flex: 1,
                  display: "flex"
                }}
              >
                <Box flex={1} p={1}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                  />
                </Box>

                <Box
                  sx={{
                    width: 250,
                    background: "#efefef",
                    borderLeft:
                      "1px solid #d9d9d9",
                    borderRight:
                      "1px solid #d9d9d9",
                    display: "flex",
                    justifyContent:
                      "center",
                    alignItems: "center",
                    fontWeight: "bold",
                    fontSize: 22
                  }}
                >
                  Costo
                </Box>

                <Box flex={1} p={1}>
                  <TextField
                    fullWidth
                    size="small"
                  />
                </Box>
              </Box>
            </Box>

            {/* COSTO TOTAL */}
            <Box display="flex">
              <Box sx={labelStyle}>
                Costo Total
              </Box>

              <Box sx={fieldStyle}>
                <TextField
                  fullWidth
                  size="small"
                />
              </Box>
            </Box>
          </Box>

          {/* TABLA */}
          <TableContainer
            component={Paper}
            sx={{
              mt: 3,
              border:
                "1px solid #d9d9d9",
              borderRadius: 1,
              boxShadow: "none"
            }}
          >
            <Table size="small">
              <TableHead
                sx={{
                  background:
                    "#ececec"
                }}
              >
                <TableRow>
                  <TableCell>
                    ✓
                  </TableCell>
                  <TableCell>
                    SKU
                  </TableCell>
                  <TableCell>
                    PRODUCTO
                  </TableCell>
                  <TableCell>
                    UNIDAD DE MEDIDA
                  </TableCell>
                  <TableCell>
                    N° DE UNIDADES
                  </TableCell>
                  <TableCell>
                    COSTO
                  </TableCell>
                  <TableCell>
                    COSTO TOTAL
                  </TableCell>
                  <TableCell>
                    TIPO DE MERMA
                  </TableCell>
                  <TableCell>
                    ACCIÓN
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {listaMermas.length ===
                  0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      align="center"
                      sx={{
                        py: 6,
                        color: "#777"
                      }}
                    >
                      No hay productos
                      agregados.
                    </TableCell>
                  </TableRow>
                ) : (
                  listaMermas.map(
                    (item) => (
                      <TableRow
                        key={item.id}
                      >
                        <TableCell>
                          ✓
                        </TableCell>

                        <TableCell>
                          {item.codigo}
                        </TableCell>

                        <TableCell>
                          {item.nombre}
                        </TableCell>

                        <TableCell>
                          {item.unidad}
                        </TableCell>

                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={
                              item.cantidadMermar
                            }
                            onChange={(
                              e
                            ) =>
                              actualizarFila(
                                item.id,
                                "cantidadMermar",
                                parseInt(
                                  e.target
                                    .value
                                ) || 1
                              )
                            }
                          />
                        </TableCell>

                        <TableCell>
                          S/
                          {item.costo}
                        </TableCell>

                        <TableCell>
                          S/
                          {(
                            item.costo *
                            item.cantidadMermar
                          ).toFixed(2)}
                        </TableCell>

                        <TableCell>
                          {item.motivo}
                        </TableCell>

                        <TableCell>
                          <IconButton
                            color="error"
                            onClick={() =>
                              eliminarProducto(
                                item.id
                              )
                            }
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* BOTONES */}
          <Box
            display="flex"
            justifyContent="space-between"
            mt={4}
          >
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                sx={{
                  background:
                    "#9c27b0",
                  px: 4,
                  py: 1.3,
                  fontWeight: "bold"
                }}
                onClick={agregarProducto}
              >
                ➕ AGREGAR
              </Button>

              <Button
                variant="contained"
                color="secondary"
                sx={{
                  px: 4,
                  py: 1.3,
                  fontWeight: "bold"
                }}
              >
                🗑 Eliminar
              </Button>
            </Box>

            <Button
              variant="contained"
              disabled={
                listaMermas.length ===
                0
              }
              onClick={handleSubmit}
              sx={{
                background:
                  "#d9d9d9",
                color: "#777",
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