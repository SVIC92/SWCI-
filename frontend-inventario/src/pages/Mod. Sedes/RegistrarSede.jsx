import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { createSede } from "../../api/sedeApi";
import LayoutDashboard from "../../components/Layouts/LayoutDashboard";
import "../../components/styles/styleRegistrar.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sedeSchema } from "../../Utils/sedeSchema";

const MySwal = withReactContent(Swal);

const RegistrarSede = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm({
		resolver: zodResolver(sedeSchema),
		defaultValues: {
		nombreSede: "",
		direccion: "",
		anexo: "",
    }
	});
	const createSedeMutation = useMutation({
		mutationFn: createSede,
		onSuccess: () => {
			MySwal.fire("Éxito", "Sede registrada correctamente", "success");
			queryClient.invalidateQueries(["sedes"]); 
			reset();
		},
		onError: (error) => {
			console.error("Error al registrar la sede:", error);
			if (error.response?.data?.errors) {
				const errores = error.response.data.errors;
				const mensajes = Object.entries(errores)
					.map(([campo, mensaje]) => `${campo.toUpperCase()}: ${mensaje}`)
					.join("<br>");
				MySwal.fire({
					icon: "error",
					title: "Errores de validación",
					html: mensajes,
				});
			} else {
				const mensaje =
					error.response?.data?.message || "No se pudo registrar la sede";
				MySwal.fire("Error", mensaje, "error");
			}
		},
	});
	const onSubmit = (data) => {
		createSedeMutation.mutate(data);
	};
	return (
		<LayoutDashboard>
			<div className="form-panel-container">
				<button
					type="button"
					className="form-panel-back"
					onClick={() => navigate("/lista-sedes")}
				>
					Volver
				</button>
				<h2>Registrar Nueva Sede</h2>
				<form className="form-panel" onSubmit={handleSubmit(onSubmit)}>
					<div className="form-group">
						<label>Nombre de la Sede:</label>
						<input
							type="text"
							{...register("nombreSede")}
						/>
						{errors.nombreSede && <span className="error-message">{errors.nombreSede.message}</span>}
					</div>

					<div className="form-group">
						<label>Dirección:</label>
						<input
							type="text"
							{...register("direccion")}
						/>
						{errors.direccion && <span className="error-message">{errors.direccion.message}</span>}
					</div>

					<div className="form-group">
						<label>Anexo:</label>
						<input
							type="text"
							{...register("anexo")}
						/>
						{errors.anexo && <span className="error-message">{errors.anexo.message}</span>}
					</div>

					<button type="submit" className="form-panel-submit" disabled={createSedeMutation.isPending}>
						{createSedeMutation.isPending ? "Registrando..." : "Registrar Sede"}
					</button>
				</form>
			</div>
		</LayoutDashboard>
	);
};

export default RegistrarSede;
