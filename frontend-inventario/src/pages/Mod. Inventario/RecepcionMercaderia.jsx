import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";


import { getProductos } from "../../api/productoApi";
import { getSedes } from "../../api/sedeApi";
import { registrarRecepcion } from "../../api/InventarioApi";


import { recepcionSchema } from "../../Utils/inventarioSchema";
import LayoutDashboard from "../../components/Layouts/LayoutDashboard";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

const MySwal = withReactContent(Swal);

function RecepcionMercaderia() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();


  const {
    data: productos,
    isLoading: isLoadingProductos,
    isError: isErrorProductos,
  } = useQuery({
    queryKey: ["productos"],
    queryFn: getProductos,
    initialData: [],
  });

  const {
    data: sedes,
    isLoading: isLoadingSedes,
    isError: isErrorSedes,
  } = useQuery({
    queryKey: ["sedes"],
    queryFn: getSedes,
    initialData: [],
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(recepcionSchema),
    defaultValues: {
      // 🛑 CORRECCIÓN: Inicializar con 0 en lugar de ""
      id_producto: 0,
      sedeIdOrigen: 0,
      cantidad: 0, // CAMBIO: También para Cantidad, ya que espera número
      descripcion: "",
    },
  });


  const createRecepcionMutation = useMutation({
    mutationFn: registrarRecepcion,
    onSuccess: (data) => {
      MySwal.fire({
        title: "¡Éxito!",
        text: "Recepción registrada correctamente.",
        icon: "success",
        timer: 2000,
      });
      reset();

    },
    onError: (error) => {
      MySwal.fire({
        title: "Error",
        text: error.response?.data?.message || "No se pudo registrar la recepción",
        icon: "error",
      });
    },
  });


  const onSubmit = (data) => {
    // 1. Limpiamos y aseguramos el payload final
    const payload = {
      // Aseguramos que los IDs sean números (aunque Zod lo hizo, es más seguro)
      productoId: parseInt(data.id_producto),
      sedeIdOrigen: parseInt(data.sedeIdOrigen),

      // La cantidad ya es número gracias al pipe de Zod
      cantidad: data.cantidad,

      // Aseguramos que la descripción sea null si está vacía, no una cadena vacía ""
      descripcion: data.descripcion || null,
    };

    // 2. Ejecutamos la mutación con el payload limpio
    createRecepcionMutation.mutate(payload);
  };

  if (isLoadingProductos || isLoadingSedes) {
    return (
      <LayoutDashboard>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>

      <div className="form-panel-container">
        <button
          className="form-panel-back"
          onClick={() => navigate("/dashboard-inventario")}
        >
          <Typography>Volver</Typography>
        </button>

        <form onSubmit={handleSubmit(onSubmit)} className="form-panel">
          <Typography variant="h4" component="h2" gutterBottom>
            Registrar Recepción de Mercadería
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Registra una nueva entrada de productos al inventario.
          </Typography>


          <FormControl
            fullWidth
            margin="normal"
            error={!!errors.sedeId}
          >
            <InputLabel id="sede-label">Sede *</InputLabel>
            <Controller
              name="sedeIdOrigen"
              control={control}
              render={({ field }) => (
                <Select labelId="sede-label" label="Sede *" {...field}>
                  <MenuItem value="">
                    <em>Seleccione una sede</em>
                  </MenuItem>
                  {sedes.map((sede) => (
                    <MenuItem
                      key={sede.idSede}
                      value={String(sede.idSede)} // 🛑 CORRECCIÓN: Forzar el ID a ser un string
                    >
                      {sede.nombreSede}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText>{errors.sedeId?.message}</FormHelperText>
          </FormControl>


          <FormControl
            fullWidth
            margin="normal"
            error={!!errors.id_producto}
          >
            <InputLabel id="producto-label">Producto *</InputLabel>
            <Controller
              name="id_producto"
              control={control}
              render={({ field }) => (
                <Select labelId="producto-label" label="Producto *" {...field}>
                  <MenuItem value="">
                    <em>Seleccione un producto</em>
                  </MenuItem>
                  {productos.map((prod) => (
                    <MenuItem
                      key={prod.id_producto}
                      value={String(prod.id_producto)} // 🛑 CORRECCIÓN: Forzar el ID a ser un string
                    >
                      {prod.sku} - {prod.nombre}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText>{errors.id_producto?.message}</FormHelperText>
          </FormControl>


          <TextField
            label="Cantidad *"
            type="number"
            fullWidth
            margin="normal"
            {...register("cantidad")}
            error={!!errors.cantidad}
            helperText={errors.cantidad?.message}
          />


          <TextField
            label="Descripción (Opcional)"
            type="text"
            fullWidth
            margin="normal"
            {...register("descripcion")}
            error={!!errors.descripcion}
            helperText={errors.descripcion?.message}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={createRecepcionMutation.isPending}
            sx={{ mt: 3 }}
          >
            {createRecepcionMutation.isPending
              ? "Registrando..."
              : "Registrar Recepción"}
          </Button>
        </form>
      </div>
    </LayoutDashboard>
  );
}

export default RecepcionMercaderia;