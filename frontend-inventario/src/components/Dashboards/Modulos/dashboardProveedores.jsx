import { useNavigate } from "react-router-dom";
import LayoutDashboard from "../../Layouts/LayoutDashboard";
import "../../styles/dashboardProductos.css";

const DashboardProveedores = () => {
  const navigate = useNavigate();

  const OpcionesGestion = [
    {
      id: "lista-proveedores",
      titulo: "Gestión de Proveedores",
      descripcion: "Administra datos de proveedores y sus contactos.",
      ruta: "/lista-proveedores",
    },
  ];
  const OpcionesOperaciones = [
    {
      id: "Pedido_mercaderia",
      titulo: "Pedido de Mercadería",
      descripcion: "Realiza un pedido de mercadería HU al almacen de su elección.",
      ruta: "/proveedores/pedido",
    },
    {
      id: "Generacion-OC",
      titulo: "Generación de Orden de Compra",
      descripcion: "Genera órdenes de compra para los pedidos realizados a los proveedores.",
      ruta: "/proveedores/orden-compra",
    },
  ];
  const OpcionesSoporte = [
    {
      id: "Soporte-Tecnico",
      titulo: "Soporte Técnico",
      descripcion: "Solicita soporte técnico para resolver incidencias con electrodomésticos.",
      ruta: "/proveedores/soporte",
    },
  ];

  const manejarClick = (ruta) => {
    navigate(ruta);
  };

  return (
    <LayoutDashboard>
      <section className="dashboard-productos">
        <h2>Dashboard de Proveedores</h2>
        <ul className="dashboard-productos__lista">
          {OpcionesGestion.map((opcion) => (
            <li key={opcion.id}>
              <div
                className="dashboard-productos__card"
                role="button"
                tabIndex={0}
                onClick={() => manejarClick(opcion.ruta)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
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
          {OpcionesOperaciones.map((opcion) => (
            <li key={opcion.id}>
              <div
                className="dashboard-productos__card"
                role="button"
                tabIndex={0}
                onClick={() => manejarClick(opcion.ruta)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
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
        <h2>Soporte</h2>
        <ul className="dashboard-productos__lista">
          {OpcionesSoporte.map((opcion) => (
            <li key={opcion.id}>
              <div
                className="dashboard-productos__card"
                role="button"
                tabIndex={0}
                onClick={() => manejarClick(opcion.ruta)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
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

export default DashboardProveedores;
