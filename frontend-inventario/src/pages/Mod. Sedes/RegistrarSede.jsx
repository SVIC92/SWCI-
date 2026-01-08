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
			tipo: "Sede",
		}
	});

	const createSedeMutation = useMutation({
		mutationFn: createSede,
		onSuccess: () => {
			MySwal.fire("Éxito", "Registrado correctamente", "success");
			queryClient.invalidateQueries(["sedes"]);
			reset();
		},
		onError: (error) => {
			console.error("Error al registrar:", error);
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
					error.response?.data?.message || "No se pudo registrar";
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
				<h2>Registrar Nueva Sede o Almacén</h2>
				<form className="form-panel" onSubmit={handleSubmit(onSubmit)}>
					<div className="form-group">
						<label>Nombre:</label>
						<input
							type="text"
							{...register("nombreSede")}
							placeholder="Ej. Sede Central"
						/>
						{errors.nombreSede && <span className="error-message">{errors.nombreSede.message}</span>}
					</div>

					<div className="form-group">
						<label>Dirección:</label>
						<input
							type="text"
							{...register("direccion")}
							placeholder="Ej. Av. Principal 123"
						/>
						{errors.direccion && <span className="error-message">{errors.direccion.message}</span>}
					</div>

					<div className="form-group">
						<label>Anexo:</label>
						<input
							type="text"
							{...register("anexo")}
							placeholder="Ej. 101"
						/>
						{errors.anexo && <span className="error-message">{errors.anexo.message}</span>}
					</div>
					<div className="form-group">
						<label>Tipo:</label>
						<select {...register("tipo")}>
							<option value="Sede">Sede</option>
							<option value="Almacén">Almacén</option>
						</select>
						{errors.tipo && <span className="error-message">{errors.tipo.message}</span>}
					</div>

					<button type="submit" className="form-panel-submit" disabled={createSedeMutation.isPending}>
						{createSedeMutation.isPending ? "Registrando..." : "Registrar"}
					</button>
				</form>
			</div>
		</LayoutDashboard>
	);
};

export default RegistrarSede;