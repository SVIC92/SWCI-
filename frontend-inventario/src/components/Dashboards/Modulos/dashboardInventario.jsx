import { useNavigate } from "react-router-dom";
import LayoutDashboard from "../../Layouts/LayoutDashboard";
import "../../styles/dashboardProductos.css";

const DashboardInventario = () => {
    const navigate = useNavigate();
    const OpcionInventario = [
        {
            id: "lista-inventario",
            titulo: "Lista de Inventario",
            descripcion: "Verifica el ultimo inventario de productos...",
            ruta: "/inventario/stock", // <-- ¡Asegúrate de que coincida!
        },
    ];
    const OpcionMovimientosInventario = [

        {
            id: "transferencia-sedes",
            titulo: "Pedido de Transferencia entre Sedes",
            descripcion: "Realiza pedidos de transferencia de productos entre diferentes sedes.",
            ruta: "/inventario/transferencia/gestion",
        },
        {
            id: "recepcion-mercaderia",
            titulo: "Recepción de Mercadería",
            descripcion: "Registra la recepción de mercadería en el inventario",
            ruta: "/inventario/recepcion-merceria",
        },
        {
            id: "devolucion-mercaderia",
            titulo: "Devolución de Mercadería",
            descripcion: "Registra la devolución de mercadería en el inventario",
            ruta: "/devolucion-mercaderia",
        },
        {
            id: "merma",
            titulo: "Merma de Productos",
            descripcion: "Registra la merma de productos en el inventario",
            ruta: "/merma",
        },
        {
            id: "importar-ventas",
            titulo: "Importar Ventas",
            descripcion: "Importa los datos en formato CSV de ventas para actualizar el inventario",
            ruta: "/importar-ventas",
        },
        {
            id: "kardex",
            titulo: "KARDEX",
            descripcion: "Verifica el historial de movimientos...",
            ruta: "/inventario/kardex", // <-- Asegúrate de que coincida
        },
    ];

    const manejarClick = (ruta) => {
        navigate(ruta);
    };

    return (
        <LayoutDashboard>
            <section className="dashboard-productos">
                <h2>Inventario</h2>
                <ul className="dashboard-productos__lista">
                    {OpcionInventario.map((opcion) => (
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
                <h2>Movimientos de Inventario</h2>
                <ul className="dashboard-productos__lista">
                    {OpcionMovimientosInventario.map((opcion) => (
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

export default DashboardInventario;