import { useNavigate } from "react-router-dom";
import LayoutDashboard from "../../Layouts/LayoutDashboard";
import "../../styles/dashboardProductos.css";

const DashboardConteoI = () => {
    const navigate = useNavigate();
    const OpcionGestion = [
        {
            id: "lista-conteo-inventario",
            titulo: "Lista de Conteo de Inventario",
            descripcion: "Verifica los conteos de inventario realizados en distintas sedes.",
            ruta: "/lista-conteo-inventario",
        },
    ];
    const OpcionOperacion = [
        {
            id: "generar-conteo-inventario",
            titulo: "Generar Hoja de Conteo de Inventario",
            descripcion: "Generación de hojas de conteo (Programado o Sorpresivo) de inventario.",
            ruta: "/generar-conteo-inventario",
        },
        {
            id: "aprobar-desaprobar-conteo",
            titulo: "Aprobar/Desaprobar Conteo",
            descripcion: "Gestiona la aprobación o desaprobación de los conteos de inventario realizados.",
            ruta: "/aprobar-desaprobar-conteo",
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

export default DashboardConteoI;