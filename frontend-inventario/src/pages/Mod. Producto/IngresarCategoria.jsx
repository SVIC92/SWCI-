import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import LayoutDashboard from "../../components/Layouts/LayoutDashboard";
import "../../components/styles/styleRegistrar.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategoria } from "../../api/categoriaApi";
import { getAreas } from "../../api/areaApi";
import { categoriaSchema } from "../../Utils/productoSchema";

const MySwal = withReactContent(Swal);
function IngresarCategoria() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
		data: areas,
		isLoading: loadingAreas, 
		isError,
		error,
	} = useQuery({
		queryKey: ["areas"],
		queryFn: getAreas,
    initialData: [], 
	});
  const createCategoriaMutation = useMutation({
		mutationFn: createCategoria,
		onSuccess: () => {
			MySwal.fire("Éxito", "Categoría registrada correctamente", "success");
			queryClient.invalidateQueries(["categorias"]);
			reset();
		},
		onError: (error) => {
			console.error("Error al registrar categoría:", error);
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
					error.response?.data?.message || "No se pudo registrar la categoría";
				MySwal.fire("Error", mensaje, "error");
			}
		},
	});
  const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm({
		resolver: zodResolver(categoriaSchema),
	});
  const onSubmit = (data) => {
		const payload = {
			nombreCat: data.nombreCat,
			area: { id_area: parseInt(data.id_area, 10) },
		};

		createCategoriaMutation.mutate(payload);
	};
  if (isError) {
    MySwal.fire("Error", `No se pudieron cargar las áreas: ${error.message}`, "error");
    navigate("/lista-categorias"); 
  }

  return (
    <LayoutDashboard>
      <div className="form-panel-container">
        <button
          type="button"
          className="form-panel-back"
          onClick={() => navigate("/lista-categorias")}
        >
          Volver
        </button>
        <h2>Registrar Nueva Categoría</h2>
        <form className="form-panel" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Nombre de la Categoría:</label>
            <input
              type="text"
              {...register("nombreCat")}
              disabled={createCategoriaMutation.isPending}
            />
            {errors.nombreCat && <span className="error-message">{errors.nombreCat.message}</span>}
          </div>
          <div className="form-group">
            <label>Área:</label>
            <select
              {...register("id_area")}
              disabled={loadingAreas || areas.length === 0}
            >
              <option value="">{loadingAreas ? "Cargando áreas..." : "Seleccione un área"}</option>
              {areas.map((area) => (
                <option key={area.id_area} value={area.id_area}>
                  {area.nombreArea}
                </option>
              ))}
            </select>
            {errors.id_area && (
              <span className="error-message">{errors.id_area.message}</span>
            )}
          </div>

          <button type="submit" className="form-panel-submit" disabled={loadingAreas || createCategoriaMutation.isPending}>
            {createCategoriaMutation.isPending ? "Registrando..." : "Registrar Categoría"}
          </button>
        </form>
      </div>
    </LayoutDashboard>
  );
}

export default IngresarCategoria;
