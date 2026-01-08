import { useNavigate } from "react-router-dom";
import LayoutDashboard from "../../Layouts/LayoutDashboard";
import "../../styles/dashboardProductos.css";

const dashboardLogistica = () => {
    const navigate = useNavigate();
    const OpcionGestion = [
        {
            id: "gestionHu",
            titulo: "Lista de HU's",
            descripcion: "Gestiona las HUs (Handling Units / Paletas) en el sistema.",
            ruta: "/hu/gestion",
        },
    ];
    const OpcionOperacion = [
        {
            id: "-----",
            titulo: "----",
            descripcion: "----",
            ruta: "-----",
        },
        {
            id: "-----",
            titulo: "------",
            descripcion: "------",
            ruta: "-----------",
        },
    ];

    const manejarClick = (ruta) => {
        navigate(ruta);
    };

    return (
        <LayoutDashboard>
            <section className="dashboard-productos">
                <h2>Gestion y Control</h2>
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
                <h2>Operaciones</h2>
                <ul className="dashboard-productos__lista">
                    {OpcionOperacion.map((opcion) => (
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

export default dashboardLogistica;