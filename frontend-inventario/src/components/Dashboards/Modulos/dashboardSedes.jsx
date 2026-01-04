import { useNavigate } from "react-router-dom";
import LayoutDashboard from "../../Layouts/LayoutDashboard";
import "../../styles/dashboardProductos.css";

const DashboardSedes = () => {
	const navigate = useNavigate();

	const OpcionesGestion = [
		{
			id: "lista-sedes",
			titulo: "Gestión de Sedes",
			descripcion: "Consulta y administra la información de las sedes.",
			ruta: "/lista-sedes",
		},
	];
	const OpcionesOperacion = [
		{
			id: "pedido-transferencia-sedes",
			titulo: "Pedido de Transferencia de productos entre Sedes",
			descripcion: "Realiza pedidos de transferencia de productos entre diferentes sedes.",
			ruta: "/inventario/transferencias/solicitar",
		},
		{
			id: "solicitudes-transferencia-sedes",
			titulo: "Solicitudes de Transferencia de productos entre Sedes",
			descripcion: "Consulta los pedidos de transferencia de productos entre diferentes sedes.",
			ruta: "/inventario/transferencias/gestion",
		}
	];

	const manejarClick = (ruta) => {
		navigate(ruta);
	};

	return (
		<LayoutDashboard>
			<section className="dashboard-productos">
				<h2>Gestión y Control</h2>
				<ul className="dashboard-productos__lista">
					{OpcionesGestion.map((opcion) => (
						<li key={opcion.id}>
							<div
								className="dashboard-productos__card"
								role="button"
								tabIndex={0}
								onClick={() => manejarClick(opcion.ruta)}
								onKeyDown={(event) => {
									if (event.key === "Enter" || event.key === " ") {
										event.preventDefault();
										manejarClick(opcion.ruta);
									}
								}}
							>
								<div className="dashboard-productos__card-header">
									<span className="dashboard-productos__card-title">
										{opcion.titulo}
									</span>
									<span className="dashboard-productos__card-icon">→</span>
								</div>
								{opcion.descripcion && (
									<p className="dashboard-productos__card-description">
										{opcion.descripcion}
									</p>
								)}
							</div>
						</li>
					))}
				</ul>
				<h2>Operaciones</h2>
				<ul className="dashboard-productos__lista">
					{OpcionesOperacion.map((opcion) => (
						<li key={opcion.id}>
							<div
								className="dashboard-productos__card"
								role="button"
								tabIndex={0}
								onClick={() => manejarClick(opcion.ruta)}
								onKeyDown={(event) => {
									if (event.key === "Enter" || event.key === " ") {
										event.preventDefault();
										manejarClick(opcion.ruta);
									}
								}}
							>
								<div className="dashboard-productos__card-header">
									<span className="dashboard-productos__card-title">
										{opcion.titulo}
									</span>
									<span className="dashboard-productos__card-icon">→</span>
								</div>
								{opcion.descripcion && (
									<p className="dashboard-productos__card-description">
										{opcion.descripcion}
									</p>
								)}
							</div>
						</li>
					))}
				</ul>
			</section>
		</LayoutDashboard>
	);
};

export default DashboardSedes;
