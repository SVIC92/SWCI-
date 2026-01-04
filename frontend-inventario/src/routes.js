import React from "react";
import { Route } from "react-router-dom";

// --- Componentes ---

import RecepcionMercaderia from "./pages/Mod. Inventario/RecepcionMercaderia";

import ListaInventario from "./pages/Mod. Inventario/ListaInventario";

import AuditoriaActividadUsuario from "./pages/Mod. Reportes/AuditoriaActividadUsuario";
import Login from "./pages/Authenticación/Login";
import ForgotPassword from "./pages/Authenticación/ForgotPassword";
import ResetPassword from "./pages/Authenticación/ResetPassword";
import MfaVerify from "./pages/Authenticación/MfaVerify";
import DashboardAdmin from "./components/Dashboards/Roles/dashboardAdmin";
import DashboardJefeInventario from "./components/Dashboards/Roles/dashboardJInventario";
import DashboardOperadorRecepcion from "./components/Dashboards/Roles/dashboardORecepcion";
import DashboardAuditor from "./components/Dashboards/Roles/dashboardAuditor";
import DashboardOperadorTienda from "./components/Dashboards/Roles/dashboardOTienda";
import ProtectedRoute from "./components/ProtectedRoute";
import PerfilUsuario from "./pages/PerfilUsuario";
import ListaUsuarios from "./pages/Mod. Usuario/ListaUsuarios";
import CrearUsuario from "./pages/Mod. Usuario/RegistrarUsuario";
import LoadingScreen from "./components/LoadingScreen_login";
import DashboardProductos from "./components/Dashboards/Modulos/dashboardProductos";
import ListaAreas from "./pages/Mod. Producto/ListaAreas";
import ListaProductos from "./pages/Mod. Producto/ListaProductos";
import DetalleProducto from "./pages/Mod. Producto/DetalleProducto";
import GeneradorEtiquetas from "./pages/Mod. Producto/GeneradorEtiquetas";
import SugerenciasReabastecimiento from "./components/SugerenciasReabastecimiento";
import IngresarProducto from "./pages/Mod. Producto/IngresarProducto";
import DashboardUsuarios from "./components/Dashboards/Modulos/dashboardUsuarios";
import IngresarArea from "./pages/Mod. Producto/IngresarArea";
import ListaRoles from "./pages/Mod. Usuario/ListaRoles";
import IngresarRol from "./pages/Mod. Usuario/IngresarRol";
import HistorialAccesos from "./pages/Mod. Usuario/HistorialAccesos";
import UsuariosConectados from "./pages/Mod. Usuario/UsuariosConectados";
import ListaCategorias from "./pages/Mod. Producto/ListaCategorias";
import IngresarCategoria from "./pages/Mod. Producto/IngresarCategoria";
import DashboardProveedores from "./components/Dashboards/Modulos/dashboardProveedores";
import ListaProveedores from "./pages/Mod. Proveedor/ListaProveedores";
import IngresarProveedor from "./pages/Mod. Proveedor/IngresarProveedor";
import DashboardSedes from "./components/Dashboards/Modulos/dashboardSedes";
import ListaSedes from "./pages/Mod. Sedes/ListaSedes";
import RegistrarSede from "./pages/Mod. Sedes/RegistrarSede";
import GestionTransferencias from "./pages/Mod. Inventario/GestionTransferencias";
import SolicitarTransferencia from "./pages/Mod. Inventario/SolicitarTransferencia";
import DashboardInventario from "./components/Dashboards/Modulos/dashboardInventario";


import DashboardConteoI from "./components/Dashboards/Modulos/dashboardConteoI";

import DashboardReportes from "./components/Dashboards/Modulos/dashboardReportes";


import Settings from "./pages/Mod. Configuracion/Settings";

import ListaMovimientos from "./pages/Mod. Inventario/ListaMovimientos";


// --- Roles ---
const ROLES = {
  ADMIN: "Administrador",
  JEFE_INV: "Jefe de Inventario",
  OP_RECEPCION: "Operador de Recepción de Mercadería",
  AUDITOR: "Auditor de Inventarios",
  OP_TIENDA: "Operador de Tienda",
};

// Grupos de roles comunes
const ALL_ROLES = [
  ROLES.ADMIN,
  ROLES.JEFE_INV,
  ROLES.OP_RECEPCION,
  ROLES.AUDITOR,
  ROLES.OP_TIENDA,
];
const ADMIN_ONLY = [ROLES.ADMIN];
const ADMIN_JEFE = [ROLES.ADMIN, ROLES.JEFE_INV];
const ADMIN_OP_RECEPCION = [ROLES.ADMIN, ROLES.OP_RECEPCION];
const ADMIN_OP_RECEPCION_TIENDA = [
  ROLES.ADMIN,
  ROLES.OP_RECEPCION,
  ROLES.OP_TIENDA,
];

const ROLES_RECEPCION = [
  ROLES.ADMIN,
  ROLES.JEFE_INV,
  ROLES.OP_RECEPCION,
];

const ADMIN_JEFE_INV_OP_RECEPCION_TIENDA = [
  ROLES.ADMIN,
  ROLES.JEFE_INV,
  ROLES.OP_RECEPCION,
  ROLES.OP_TIENDA,
];
//------ Función Auxiliar para Rutas Protegidas ------
const RutaProtegida = (key, path, roles, Component) => (
  <Route
    key={key}
    path={path}
    element={
      <ProtectedRoute roles={roles}>
        <Component />
      </ProtectedRoute>
    }
  />
);

// Rutas públicas de autenticación (SIN TOKEN)
const RutasAutenticacion = [
  <Route key="login" path="/" element={<Login />} />,
  <Route
    key="forgotPassword"
    path="/forgot-password"
    element={<ForgotPassword />}
  />,
  <Route
    key="resetPassword"
    path="/reset-password"
    element={<ResetPassword />}
  />,
  <Route key="mfaVerify" path="/verify-2fa" element={<MfaVerify />} />,
];



// Dashboards principales por rol
const RutasDashboard = [
  RutaProtegida(
    "admin",
    "/dashboard-administrador",
    ADMIN_ONLY,
    DashboardAdmin
  ),
  RutaProtegida(
    "jefe",
    "/dashboard-jefe-inventario",
    [ROLES.JEFE_INV],
    DashboardJefeInventario
  ),
  RutaProtegida(
    "recepcion",
    "/dashboard-operador-recepcion",
    [ROLES.OP_RECEPCION],
    DashboardOperadorRecepcion
  ),
  RutaProtegida(
    "auditor",
    "/dashboard-auditor-inventarios",
    [ROLES.AUDITOR],
    DashboardAuditor
  ),
  RutaProtegida(
    "tienda",
    "/dashboard-operador-tienda",
    [ROLES.OP_TIENDA],
    DashboardOperadorTienda
  ),
];

// Rutas compartidas por todos los usuarios autenticados
const RutasCompartidas = [
  RutaProtegida("perfil", "/perfil", ALL_ROLES, PerfilUsuario),
  RutaProtegida("loading", "/loading_login", ALL_ROLES, LoadingScreen),
  RutaProtegida("settings", "/settings", ALL_ROLES, Settings),
];

// Gestión de Usuarios y Roles (Admin)
const RutasUsuario = [
  RutaProtegida(
    "dashboardUsuarios",
    "/dashboard-usuarios",
    ADMIN_ONLY,
    DashboardUsuarios
  ),
  RutaProtegida("ListaUsuarios", "/lista-usuarios", ADMIN_ONLY, ListaUsuarios),
  RutaProtegida("crearUsuario", "/usuarios/nuevo", ADMIN_ONLY, CrearUsuario),
  RutaProtegida("listaRoles", "/roles", ADMIN_ONLY, ListaRoles),
  RutaProtegida("ingresarRol", "/roles/nuevo", ADMIN_ONLY, IngresarRol),
  RutaProtegida("historialAccesos", "/historial-accesos", ADMIN_ONLY, HistorialAccesos),
  RutaProtegida("usuariosConectados", "/usuarios-conectados", ADMIN_ONLY, UsuariosConectados),
];

// Gestión de Productos (Admin & Jefe Inv.)
const RutasProductos = [
  RutaProtegida(
    "dashboardProductos",
    "/dashboard-productos",
    ADMIN_JEFE,
    DashboardProductos
  ),
  RutaProtegida(
    "listaProductos",
    "/lista-productos",
    ADMIN_JEFE,
    ListaProductos
  ),
  RutaProtegida(
    "detalleProducto",
    "/productos/detalle/:id",
    ADMIN_JEFE,
    DetalleProducto
  ),
  RutaProtegida(
    "ingresarProducto",
    "/productos/nuevo",
    ADMIN_JEFE,
    IngresarProducto
  ),
  RutaProtegida("listaAreas", "/lista-areas", ADMIN_JEFE, ListaAreas),
  RutaProtegida("ingresarArea", "/areas/nuevo", ADMIN_JEFE, IngresarArea),
  RutaProtegida(
    "listaCategorias",
    "/lista-categorias",
    ADMIN_JEFE,
    ListaCategorias
  ),
  RutaProtegida(
    "ingresarCategoria",
    "/categorias/nuevo",
    ADMIN_JEFE,
    IngresarCategoria
  ),
  RutaProtegida(
    "generadorEtiquetas",
    "/productos/etiquetas",
    ADMIN_JEFE,
    GeneradorEtiquetas
  ),
  RutaProtegida(
    "sugerenciasReabastecimiento",
    "/productos/sugerencias/reabastecimiento",
    ADMIN_JEFE,
    SugerenciasReabastecimiento
  ),
];

// Gestión de Proveedores
const RutasProveedores = [
  RutaProtegida(
    "dashboardProveedores",
    "/dashboard-proveedores",
    ADMIN_OP_RECEPCION_TIENDA,
    DashboardProveedores
  ),
  RutaProtegida(
    "listaProveedores",
    "/lista-proveedores",
    ADMIN_OP_RECEPCION_TIENDA,
    ListaProveedores
  ),
  RutaProtegida(
    "ingresarProveedor",
    "/proveedores/nuevo",
    ADMIN_OP_RECEPCION,
    IngresarProveedor
  ),
];

// Gestión de Sedes (Admin & Jefe Inv.)
const RutasSedes = [
  RutaProtegida(
    "dashboardSedes",
    "/dashboard-sedes",
    ADMIN_JEFE,
    DashboardSedes
  ),
  RutaProtegida("listaSedes", "/lista-sedes", ADMIN_JEFE, ListaSedes),
  RutaProtegida("registrarSedes", "/sedes/nuevo", ADMIN_JEFE, RegistrarSede),
];


// Rutas de Conteo de Inventario
const RutasConteoInventario = [
  RutaProtegida(
    "dashboardConteoInventario",
    "/dashboard-conteoinventario",
    ADMIN_JEFE_INV_OP_RECEPCION_TIENDA,
    DashboardConteoI
  ),
];

// Rutas de Reportes
const RutasReportes = [
  RutaProtegida(
    "dashboardReportes",
    "/dashboard-reportes",
    ALL_ROLES,
    DashboardReportes
  ),
  RutaProtegida(
    "auditoriaActividadUsuario",
    "/auditoria-actividad-usuario",
    ALL_ROLES,
    AuditoriaActividadUsuario
  ),
];

const RutasInventario = [
  RutaProtegida(
    "dashboard-inventario",
    "/dashboard-inventario",
    [ROLES.ADMIN, ROLES.JEFE_INV, ROLES.OP_RECEPCION, ROLES.OP_TIENDA],
    DashboardInventario
  ),
  RutaProtegida(
    "recepcion-merceria",
    "/inventario/recepcion-merceria",
    ROLES_RECEPCION,
    RecepcionMercaderia
  ),
  RutaProtegida(
    "lista-movimientos",
    "/inventario/kardex", // La ruta que verá el usuario
    ALL_ROLES, // Todos pueden ver el Kardex
    ListaMovimientos
  ),
  RutaProtegida(
    "lista-inventario",
    "/inventario/stock", // La ruta que verá el usuario
    ALL_ROLES, // Todos pueden ver el stock
    ListaInventario
  ),
  RutaProtegida(
    "gestion-transferencias",
    "//inventario/transferencia/gestion",
    ADMIN_JEFE_INV_OP_RECEPCION_TIENDA,
    GestionTransferencias
  ),
  RutaProtegida(
    "solicitar-transferencia",
    "/inventario/transferencia/solicitar",
    ADMIN_JEFE_INV_OP_RECEPCION_TIENDA,
    SolicitarTransferencia
  ),
];

const AppRoutes = [
  ...RutasAutenticacion,
  ...RutasDashboard,
  ...RutasCompartidas,
  ...RutasUsuario,
  ...RutasProductos,
  ...RutasProveedores,
  ...RutasSedes,
  ...RutasInventario,
  ...RutasConteoInventario,
  ...RutasReportes,
];

export default AppRoutes;


