import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import LayoutDashboard from "../../Layouts/LayoutDashboard";
import GraficoUsuariosPorRol from "../../Graficos/GraficoUsuariosPorRol"
import ChartExportContainer from "../../Graficos/ChartExportContainer";
import FeedActividad from "../../Graficos/FeedActividad";
import CampaniaWidget from "../../Graficos/CampaniaWidget";
import "../../styles/dashboardAdmin.css";
import WidgetReabastecimiento from "../../Graficos/WidgetReabastecimiento";
import ChatWidget from "../../IA/ChatWidget";
import StatCard from "../../StatCard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { getProductos } from "../../../api/productoApi";
import { listarPendientes } from "../../../api/transferenciaApi";

export default function DashboardAdmin() {
    const navigate = useNavigate();

    const { data: productos = [], isLoading: isLoadingProductos } = useQuery({
        queryKey: ["productos"],
        queryFn: getProductos,
    });

    const { data: transferenciasPendientes = [], isLoading: isLoadingTransferencias } = useQuery({
        queryKey: ["transferenciasPendientes"],
        queryFn: async () => (await listarPendientes()).data,
    });

    return (
        <LayoutDashboard>
            <div className="dashboard-admin-container">
                <h1>Dashboard de Administrador</h1>

                <div className="dashboard-grid">

                    {/* --- FILA 1: TARJETAS KPI --- */}
                    <div className="grid-item-kpi">
                        <WidgetReabastecimiento idSede={1} />
                    </div>
                    <div className="grid-item-kpi" style={{ gridColumn: 'span 1' }}>
                        <CampaniaWidget />
                    </div>
                    <div className="grid-item-kpi">
                        <StatCard
                            label="Total Productos"
                            value={productos.length}
                            isLoading={isLoadingProductos}
                            icon={<Inventory2Icon />}
                            color="primary"
                            helperText="Productos registrados en el sistema"
                            onClick={() => navigate("/lista-productos")}
                        />
                    </div>
                    <div className="grid-item-kpi">
                        <StatCard
                            label="Transferencias Pendientes"
                            value={transferenciasPendientes.length}
                            isLoading={isLoadingTransferencias}
                            icon={<SwapHorizIcon />}
                            color={transferenciasPendientes.length > 0 ? "warning" : "success"}
                            helperText="Solicitudes esperando aprobación"
                            onClick={() => navigate("/inventario/transferencia/gestion")}
                        />
                    </div>
                    {/** Gráficos y Listas */}
                    <div className="grid-item-large">
                        <div className="card-widget">
                            <h3>Usuarios por Rol</h3>
                            <ChartExportContainer title="Usuarios por Rol">
                                <GraficoUsuariosPorRol />
                            </ChartExportContainer>
                        </div>
                    </div>
                    <div className="grid-item-large">
                        <FeedActividad/>
                    </div>
                </div>
            </div>
            <ChatWidget />
        </LayoutDashboard>
    );
}
