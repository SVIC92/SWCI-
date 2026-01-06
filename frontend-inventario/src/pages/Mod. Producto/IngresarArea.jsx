import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { createArea } from "../../api/areaApi";
import LayoutDashboard from "../../components/Layouts/LayoutDashboard";
import "../../components/styles/styleRegistrar.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { areaSchema } from "../../Utils/productoSchema";

const MySwal = withReactContent(Swal);
function IngresarArea() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const createAreaMutation = useMutation({
		mutationFn: createArea,
		onSuccess: () => {
			MySwal.fire("Éxito", "Área registrada correctamente", "success");
			queryClient.invalidateQueries(["areas"]); 
			reset(); 
		},
		onError: (error) => {
			console.error("Error al registrar área:", error);
			const mensaje =
				error.response?.data?.message || "No se pudo registrar el área";
			MySwal.fire("Error", mensaje, "error");
		},
	});
	const {
		register,
		handleSubmit,  
		formState: { errors, isSubmitting },
		reset,    
	} = useForm({
		resolver: zodResolver(areaSchema),
	});
	const onSubmit = (data) => {
		createAreaMutation.mutate(data);
	};

	return (
		<LayoutDashboard>
			<div className="form-panel-container">
				<button
					type="button"
					className="form-panel-back"
					onClick={() => navigate("/lista-areas")}
				>
					Volver
				</button>
				<h2>Registrar Nueva Área</h2>
				<form className="form-panel" onSubmit={handleSubmit(onSubmit)}>
					<div className="form-group">
						<label>Nombre del Área:</label>
						<input
							type="text"
							{...register("nombreArea")}
							/>
							{errors.nombreArea && (
							<span className="error-message">{errors.nombreArea.message}</span>
							)}
					</div>

					<button type="submit" className="form-panel-submit" disabled={createAreaMutation.isPending}>
						{createAreaMutation.isPending ? "Registrando..." : "Registrar Área"}
					</button>
				</form>
			</div>
		</LayoutDashboard>
	);
}

export default IngresarArea;
