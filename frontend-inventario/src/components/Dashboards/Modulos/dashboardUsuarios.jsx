import { useNavigate } from "react-router-dom";
import LayoutDashboard from "../../Layouts/LayoutDashboard";
import "../../styles/dashboardProductos.css";

const DashboardUsuarios = () => {
    const navigate = useNavigate();

    const OpcionGestion = [
        {
            id: "lista-usuarios",
            titulo: "Gestión de Usuarios",
            descripcion: "Administra cuentas, roles y estados del personal.",
            ruta: "/lista-usuarios",
        },
        {
            id: "lista-roles",
            titulo: "Gestión de Roles",
            descripcion: "Administra roles y permisos de los usuarios.",
            ruta: "/roles",
        }
    ];
    const OpcionActividad = [
        {
            id: "historial-accesos",
            titulo: "Historial de Accesos",
            descripcion: "Verifica cuando fue el último acceso de los usuarios.",
            ruta: "/historial-accesos",
        },
        {
            id: "usuarios-conectados",
            titulo: "Usuarios Conectados",
            descripcion: "Administra que usuarios están usando el sistema en tiempo real.",
            ruta: "/usuarios-conectados",
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
                    {OpcionGestion.map((opcion) => (
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
                <h2>Actividad del Sistema</h2>
                <ul className="dashboard-productos__lista">
                    {OpcionActividad.map((opcion) => (
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

export default DashboardUsuarios;
