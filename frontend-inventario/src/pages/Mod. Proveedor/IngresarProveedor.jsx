import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import LayoutDashboard from "../../components/Layouts/LayoutDashboard";
import "../../components/styles/styleRegistrar.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProveedor } from "../../api/proveedorApi";
import { proveedorSchema } from "../../Utils/proveedorSchema";

const MySwal = withReactContent(Swal);
function IngresarProveedor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm({
		resolver: zodResolver(proveedorSchema),
    defaultValues: {
      ruc: "",
      nombre_proveedor: "",
      telefono: "",
      email: "",
      direccion: "",
    }
	});
  const createProveedorMutation = useMutation({
		mutationFn: createProveedor,
		onSuccess: () => {
			MySwal.fire("Éxito", "Proveedor registrado correctamente", "success");
			queryClient.invalidateQueries(["proveedores"]);
			reset(); 
		},
		onError: (error) => {
			console.error("Error al registrar proveedor:", error);
			if (error.response?.data?.errors) {
				const errores = error.response.data.errors;
				const mensajes = Object.entries(errores)
					.map(([campo, msg]) => `${campo.toUpperCase()}: ${msg}`)
					.join("<br>");
				MySwal.fire({
					icon: "error",
					title: "Errores de validación",
					html: mensajes,
				});
			} else {
				const mensaje =
					error.response?.data?.message || "No se pudo registrar el proveedor";
				MySwal.fire("Error", mensaje, "error");
			}
		},
	});
  const onSubmit = (data) => {
		const payload = {
			...data,
			estado: 1, 
		};

		createProveedorMutation.mutate(payload);
	};
  return (
    <LayoutDashboard>
      <div className="form-panel-container">
        <button
          type="button"
          className="form-panel-back"
          onClick={() => navigate("/lista-proveedores")}
        >
          Volver
        </button>
        <h2>Registrar Nuevo Proveedor</h2>
        <form className="form-panel" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>RUC:</label>
            <input type="text" {...register("ruc")} />
            {errors.ruc && <span className="error-message">{errors.ruc.message}</span>}
          </div>

          <div className="form-group">
            <label>Razón Social:</label>
            <input
              type="text"
              {...register("nombre_proveedor")}
            />
            {errors.nombre_proveedor && <span className="error-message">{errors.nombre_proveedor.message}</span>}
          </div>

          <div className="form-group">
            <label>Teléfono:</label>
            <input type="text" {...register("telefono")} />
            {errors.telefono && <span className="error-message">{errors.telefono.message}</span>}
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input type="email" {...register("email")} />
            {errors.email && <span className="error-message">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label>Dirección:</label>
            <input type="text" {...register("direccion")} />
            {errors.direccion && <span className="error-message">{errors.direccion.message}</span>}
          </div>

          <button type="submit" className="form-panel-submit" disabled={createProveedorMutation.isPending}>{createProveedorMutation.isPending ? "Registrando..." : "Registrar Proveedor"}</button>
        </form>
      </div>
    </LayoutDashboard>
  );
}

export default IngresarProveedor;
