import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import LayoutDashboard from "../../components/Layouts/LayoutDashboard";
import "../../components/styles/styleRegistrar.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRol } from "../../api/rolApi";
import { rolSchema } from "../../Utils/usuarioSchema";

const MySwal = withReactContent(Swal);
function IngresarRol() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm({
		resolver: zodResolver(rolSchema),
    defaultValues: {
      nombreRol: "",
    }
	});
  const createRolMutation = useMutation({
		mutationFn: createRol,
		onSuccess: () => {
			MySwal.fire("Éxito", "Rol registrado correctamente", "success");
			queryClient.invalidateQueries(["roles"]); 
			reset();
		},
		onError: (error) => {
			console.error("Error al registrar rol:", error);
			if (error.response?.data?.errors) {
				const mensajes = Object.entries(error.response.data.errors)
					.map(([campo, msg]) => `${campo.toUpperCase()}: ${msg}`)
					.join("<br>");
				MySwal.fire({
					icon: "error",
					title: "Errores de validación",
					html: mensajes,
				});
			} else {
				const mensaje =
					error.response?.data?.message || "No se pudo registrar el rol";
				MySwal.fire("Error", mensaje, "error");
			}
		},
	});
  const onSubmit = (data) => {
		createRolMutation.mutate(data);
	};
  return (
    <LayoutDashboard>
      <div className="form-panel-container">
        <button
          type="button"
          className="form-panel-back"
          onClick={() => navigate("/roles")}
        >
          Volver
        </button>
        <h2>Registrar Nuevo Rol</h2>
        <form className="form-panel" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Nombre del Rol:</label>
            <input
              type="text"
              {...register("nombreRol")}
            />
            {errors.nombreRol && <span className="error-message">{errors.nombreRol.message}</span>}
          </div>

          <button type="submit" className="form-panel-submit" disabled={createRolMutation.isPending}>
            {createRolMutation.isPending ? "Registrando..." : "Registrar Rol"}
          </button>
        </form>
      </div>
    </LayoutDashboard>
  );
}

export default IngresarRol;
