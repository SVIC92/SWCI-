import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import LayoutDashboard from "../../components/Layouts/LayoutDashboard";
import "../../components/styles/styleRegistrar.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createProducto } from "../../api/productoApi";
import { getCategorias } from "../../api/categoriaApi";
import { getProveedores } from "../../api/proveedorApi";
import { getAreas } from "../../api/areaApi";
import { IngresarProductoSchema } from "../../Utils/productoSchema";

const MySwal = withReactContent(Swal);

const IngresarProducto = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: areas = [], isLoading: isLoadingAreas } = useQuery({
		queryKey: ["areas"],
		queryFn: getAreas,
	});
	const { data: categorias = [], isLoading: isLoadingCategorias } = useQuery({
		queryKey: ["categorias"],
		queryFn: getCategorias,
	});
	const { data: proveedores = [], isLoading: isLoadingProveedores } = useQuery({
		queryKey: ["proveedores"],
		queryFn: getProveedores,
	});
	const cargandoTablas = isLoadingAreas || isLoadingCategorias || isLoadingProveedores;
	const createProductoMutation = useMutation({
		mutationFn: createProducto,
		onSuccess: () => {
			MySwal.fire("Éxito", "Producto registrado correctamente", "success");
			queryClient.invalidateQueries(["productos"]);
			reset();
		},
		onError: (error) => {
			console.error("Error al registrar producto:", error);
			if (error.response?.data?.errors) {
				const mensajes = Object.entries(error.response.data.errors)
					.map(([campo, mensaje]) => `${campo.toUpperCase()}: ${mensaje}`)
					.join("<br>");
				MySwal.fire({
					icon: "error",
					title: "Errores de validación",
					html: mensajes,
				});
			} else {
				const mensaje =
					error.response?.data?.message || "No se pudo registrar el producto";
				MySwal.fire("Error", mensaje, "error");
			}
		},
	});
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
		setValue,
	} = useForm({
		resolver: zodResolver(IngresarProductoSchema),
		defaultValues: {
			sku: "", ean: "", nombre_producto: "", marca: "", uni_medida: "",
			precio_venta: "", precio_compra: "", stockMinimo: 10,
			stockIdeal: 20, id_area: "", id_cat: "", id_proveedor: ""
		}
	});
	const selectedAreaId = watch("id_area");

	const categoriasDisponibles = useMemo(() => {
		if (!selectedAreaId) return [];

		const areaIdNum = parseInt(selectedAreaId, 10);
		return categorias.filter((categoria) => {
			const categoriaAreaRaw = categoria.area?.id_area ?? categoria.id_area;
			const categoriaAreaId = Number(categoriaAreaRaw);
			return !Number.isNaN(categoriaAreaId) && categoriaAreaId === areaIdNum;
		});
	}, [selectedAreaId, categorias]);
	useEffect(() => {
		setValue("id_cat", "");
	}, [selectedAreaId, setValue]);
	const onSubmit = (data) => {
		const payload = {
			sku: data.sku,
			ean: data.ean,
			codEan: data.ean,
			nombre_producto: data.nombre_producto,
			nombre: data.nombre_producto,
			marca: data.marca,
			uni_medida: data.uni_medida,
			precio_venta: data.precio_venta,
			precio_compra: data.precio_compra,
			stockMinimo: data.stockMinimo,
			stockIdeal: data.stockIdeal,
			estado: true,
			categoria: { id_cat: parseInt(data.id_cat, 10) },
			proveedor: { id_proveedor: parseInt(data.id_proveedor, 10) },
		};

		createProductoMutation.mutate(payload);
	};

	return (
		<LayoutDashboard>
			<div className="form-panel-container">
				<button
					type="button"
					className="form-panel-back"
					onClick={() => navigate("/lista-productos")}
				>
					Volver
				</button>
				<h2>Registrar Nuevo Producto</h2>
				<form className="form-panel" onSubmit={handleSubmit(onSubmit)}>
					<div className="form-group">
						<label>SKU:</label>
						<input
							type="text"
							{...register("sku")}
						/>
						{errors.sku && <span className="error-message">{errors.sku.message}</span>}
					</div>

					<div className="form-group">
						<label>EAN:</label>
						<input
							type="text"
							{...register("ean")}
						/>
						{errors.ean && <span className="error-message">{errors.ean.message}</span>}
					</div>

					<div className="form-group">
						<label>Nombre:</label>
						<input
							type="text"
							{...register("nombre_producto")}
						/>
						{errors.nombre_producto && <span className="error-message">{errors.nombre_producto.message}</span>}
					</div>

					<div className="form-group">
						<label>Marca:</label>
						<input
							type="text"
							{...register("marca")}
						/>
						{errors.marca && <span className="error-message">{errors.marca.message}</span>}
					</div>

					<div className="form-group">
						<label>Unidad de Medida:</label>
						<input
							type="text"
							{...register("uni_medida")}
						/>
						{errors.uni_medida && <span className="error-message">{errors.uni_medida.message}</span>}
					</div>

					<div className="form-group">
						<label>Precio Venta:</label>
						<input
							type="number"
							min="0"
							step="0.01"
							{...register("precio_venta")}
						/>
						{errors.precio_venta && <span className="error-message">{errors.precio_venta.message}</span>}
					</div>

					<div className="form-group">
						<label>Precio Compra:</label>
						<input
							type="number"
							min="0"
							step="0.01"
							{...register("precio_compra")}
						/>
						{errors.precio_compra && <span className="error-message">{errors.precio_compra.message}</span>}
					</div>
					<div className="form-group">
						<label>Stock Mínimo (Alerta):</label>
						<input
							type="number"
							min="0"
							step="1"
							placeholder="Ej. 10"
							{...register("stockMinimo")}
						/>
						{errors.stockMinimo && <span className="error-message">{errors.stockMinimo.message}</span>}
					</div>

					<div className="form-group">
						<label>Stock Ideal (Meta):</label>
						<input
							type="number"
							min="1"
							step="1"
							placeholder="Ej. 50"
							{...register("stockIdeal")}
						/>
						{errors.stockIdeal && <span className="error-message">{errors.stockIdeal.message}</span>}
					</div>
					<div className="form-group">
						<label>Área:</label>
						<select
							{...register("id_area")}
							disabled={cargandoTablas || areas.length === 0}
						>
							<option value="">{cargandoTablas ? "Cargando..." : "Seleccione un área"}</option>
							{areas.map((area) => (
								<option key={area.id_area} value={area.id_area}>
									{area.nombreArea}
								</option>
							))}
						</select>
						{errors.id_area && <span className="error-message">{errors.id_area.message}</span>}
					</div>

					<div className="form-group">
						<label>Categoría:</label>
						<select
							{...register("id_cat")}
							disabled={cargandoTablas || !selectedAreaId || categoriasDisponibles.length === 0}
						>
							<option value="">
								{!selectedAreaId
									? "Seleccione un área primero"
									: categoriasDisponibles.length === 0
										? "Sin categorías disponibles"
										: "Seleccione una categoría"}
							</option>
							{categoriasDisponibles.map((categoria) => (
								<option key={categoria.id_cat || categoria.id_categoria} value={categoria.id_cat || categoria.id_categoria}>
									{categoria.nombreCat || categoria.nombre_categoria}
								</option>
							))}
						</select>
						{errors.id_cat && <span className="error-message">{errors.id_cat.message}</span>}
					</div>

					<div className="form-group">
						<label>Proveedor:</label>
						<select
							{...register("id_proveedor")}
							disabled={cargandoTablas || proveedores.length === 0}
						>
							<option value="">{cargandoTablas ? "Cargando..." : "Seleccione un proveedor"}</option>
							{proveedores.map((proveedor) => (
								<option key={proveedor.id_proveedor || proveedor.id} value={proveedor.id_proveedor || proveedor.id}>
									{proveedor.nombre_proveedor || proveedor.nombre}
								</option>
							))}
						</select>
						{errors.id_proveedor && <span className="error-message">{errors.id_proveedor.message}</span>}
					</div>

					<button type="submit" className="form-panel-submit" disabled={cargandoTablas || createProductoMutation.isPending}>
						{createProductoMutation.isPending ? "Registrando..." : "Registrar Producto"}
					</button>
				</form>
			</div>
		</LayoutDashboard>
	);
};

export default IngresarProducto;
