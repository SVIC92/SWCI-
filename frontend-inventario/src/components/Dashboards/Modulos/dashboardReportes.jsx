import { useNavigate } from "react-router-dom";
import LayoutDashboard from "../../Layouts/LayoutDashboard";
import "../../styles/dashboardProductos.css";

const DashboardReportes = () => {
    const navigate = useNavigate();
    const OpcionReporte = [
        {
            id: "reporte-quiebre-stock",
            titulo: "Reporte de Quiebres de Stock",
            descripcion: "Verifica los quiebres de stock en el inventario.",
            ruta: "/reporte-quiebre-stock",
        },
        {
            id: "reporte-valorizado",
            titulo: "Reporte Valorizado",
            descripcion: "Consulta el valor monetario del inventario por sede, categoría o proveedor.",
            ruta: "/reporte-valorizado",
        },
        {
            id: "reporte-merma",
            titulo: "Reporte de Merma",
            descripcion: "Visualiza el costo de merma en el inventario.",
            ruta: "/reporte-merma",
        },
        {
            id: "reporte-diferencias",
            titulo: "Reporte de Diferencias",
            descripcion: "Verifica las diferencias en el inventario.",
            ruta: "/reporte-diferencias",
        },
        {
            id: "reporte-stock-muerto",
            titulo: "Reporte de Stock Muerto",
            descripcion: "Verifica los productos que no se han movido en el inventario.",
            ruta: "/reporte-stock-muerto",
        },
        {
            id: "reporte-entradas",
            titulo: "Reporte de Entradas",
            descripcion: "Visualiza las entradas de productos al inventario.",
            ruta: "/reporte-entradas",
        },
        {
            id: "reporte-salidas",
            titulo: "Reporte de Salidas",
            descripcion: "Visualiza las salidas de productos del inventario.",
            ruta: "/reporte-salidas",
        },
        {
            id: "reporte-auditoria-usuarios",
            titulo: "Reporte de Auditoría de Usuarios",
            descripcion: "Verifica las acciones realizadas por los usuarios en el sistema.",
            ruta: "/auditoria-actividad-usuario",
        },
    ];

    const manejarClick = (ruta) => {
        navigate(ruta);
    };

    return (
        <LayoutDashboard>
            <section className="dashboard-productos">
                <h2>Reportes</h2>
                <ul className="dashboard-productos__lista">
                    {OpcionReporte.map((opcion) => (
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

export default DashboardReportes;