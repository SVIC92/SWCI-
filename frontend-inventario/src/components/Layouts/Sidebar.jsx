import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalStore } from "../../store/useGlobalStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  Drawer, Box, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, IconButton, Divider, useMediaQuery, useTheme,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button
} from "@mui/material";
import {
  FaUsers, FaBoxes, FaChartBar, FaCog, FaBars, FaSignOutAlt,
  FaTags, FaStore, FaClipboardList, FaTruck, FaHome,
  FaChevronLeft, FaRobot, FaPallet
} from "react-icons/fa";

const SIDEBAR_WIDTH = 250;
const SIDEBAR_COLLAPSED_WIDTH = 60;
const getMenuItems = (rol) => {
  const allMenus = {
    "Administrador": [
      { icon: <FaHome />, label: "Inicio", path: "/dashboard-administrador" },
      { icon: <FaRobot />, label: "IA", path: "/chat-ia" },
      { icon: <FaUsers />, label: "Usuarios", path: "/dashboard-usuarios" },
      { icon: <FaTags />, label: "Productos", path: "/dashboard-productos" },
      { icon: <FaStore />, label: "Sedes", path: "/dashboard-sedes" },
      { icon: <FaTruck />, label: "Proveedores", path: "/dashboard-proveedores" },
      { icon: <FaBoxes />, label: "Inventario", path: "/dashboard-inventario" },
      { icon: <FaClipboardList />, label: "Conteo Inventario", path: "/dashboard-conteoinventario" },
      { icon: <FaChartBar />, label: "Reportes", path: "/dashboard-reportes" },
    ],
    "Jefe de Inventario": [
      { icon: <FaHome />, label: "Inicio", path: "/dashboard-jefe-inventario" },
      { icon: <FaRobot />, label: "IA", path: "/chat-ia" },
      { icon: <FaTags />, label: "Productos", path: "/dashboard-productos" },
      { icon: <FaStore />, label: "Sedes", path: "/dashboard-sedes" },
      { icon: <FaPallet />, label: "Logistica", path: "/dashboard-logistica" },
      { icon: <FaBoxes />, label: "Inventario", path: "/dashboard-inventario" },
      { icon: <FaClipboardList />, label: "Conteo Inventario", path: "/dashboard-conteoinventario" },
      { icon: <FaChartBar />, label: "Reportes", path: "/dashboard-reportes" },
    ],
    "Operador de Recepción de Mercadería": [
      { icon: <FaHome />, label: "Inicio", path: "/dashboard-operador-recepcion" },
      { icon: <FaTruck />, label: "Proveedores", path: "/dashboard-proveedores" },
      { icon: <FaBoxes />, label: "Inventario", path: "/dashboard-inventario" },
      { icon: <FaClipboardList />, label: "Conteo Inventario", path: "/dashboard-conteoinventario" },
      { icon: <FaChartBar />, label: "Reportes", path: "/dashboard-reportes" },
    ],
    "Auditor de Inventarios": [
      { icon: <FaHome />, label: "Inicio", path: "/dashboard-auditor-inventarios" },
      { icon: <FaChartBar />, label: "Reportes", path: "/dashboard-reportes" },
    ],
    "Operador de Tienda": [
      { icon: <FaHome />, label: "Inicio", path: "/dashboard-operador-tienda" },
      { icon: <FaTruck />, label: "Proveedores", path: "/dashboard-proveedores" },
      { icon: <FaBoxes />, label: "Inventario", path: "/dashboard-inventario" },
      { icon: <FaClipboardList />, label: "Conteo Inventario", path: "/dashboard-conteoinventario" },
      { icon: <FaChartBar />, label: "Reportes", path: "/dashboard-reportes" },
    ],
    "Jefe de Almacén": [
      { icon: <FaHome />, label: "Inicio", path: "/dashboard-jefe-almacen" },
      { icon: <FaRobot />, label: "IA", path: "/chat-ia" },
      { icon: <FaPallet />, label: "Logistica", path: "/dashboard-logistica" },
    ]
  };
  const baseMenu = allMenus[rol] || [
    { icon: <FaHome />, label: "Inicio", path: "/" },
  ];
  
  return [
    ...baseMenu,
    { icon: <FaCog />, label: "Configuración", path: "/settings" },
  ];
};
export default function Sidebar({ collapsed, onCollapsedChange }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const mode = theme.palette.mode;
  const lightThemeColor = useGlobalStore((state) => state.lightThemeColor);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));


  const user = useGlobalStore((state) => state.user);
  const logout = useGlobalStore((state) => state.logout);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLogoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const isOpen = isMobile ? isMobileOpen : !collapsed;
  const handleMenuNavigation = (path) => {
    if (isMobile) {
      setIsMobileOpen(false); 
    }
    navigate(path);
  };

  const { mutate: performLogout, isPending: isLoggingOut } = useMutation({
    mutationFn: async () => {
      logout();
    },
    onSuccess: () => {
      setLogoutDialogOpen(false);
      toast.success("Has salido del sistema correctamente.");
      queryClient.clear(); 
      navigate("/");
    },
    onError: () => {
      toast.error("Hubo un error al cerrar sesión.");
    },
  });

  const menuItems = useMemo(() => getMenuItems(user?.rol), [user?.rol]);
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden', }}>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar
          src="/logo.png"
          sx={{ width: isOpen ? 80 : 40, height: isOpen ? 80 : 40, mb: 1, cursor: 'pointer', transition: 'width 0.2s, height 0.2s' }}
          onClick={() => handleMenuNavigation("/perfil")}
        />
        <Typography variant="subtitle1" noWrap sx={{ display: isOpen ? 'block' : 'none' }}>
          {`${user?.nombre_u || ""} ${user?.apellido_pat || ""} ${user?.apellido_mat || ""}`}
        </Typography>
        <Typography variant="caption" noWrap sx={{ display: isOpen ? 'block' : 'none', color: 'text.secondary' }}>
          {user?.email}
        </Typography>
        <Typography variant="overline" noWrap sx={{ display: isOpen ? 'block' : 'none', color: 'primary.main' }}>
          {user?.rol}
        </Typography>
      </Box>
      <Divider />

      <List sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.label}
            onClick={() => handleMenuNavigation(item.path)}
            title={item.label} 
            sx={{ 
              justifyContent: isOpen ? 'initial' : 'center',
              px: 2.5,
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: isOpen ? 3 : 'auto', justifyContent: 'center' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} sx={{ opacity: isOpen ? 1 : 0 }} noWrap />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <List sx={{overflowX: 'hidden'}}>
        <ListItemButton
          onClick={() => setLogoutDialogOpen(true)}
          title="Cerrar sesión"
          sx={{ 
            justifyContent: isOpen ? 'initial' : 'center',
            px: 2.5,
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: isOpen ? 3 : 'auto', justifyContent: 'center' }}>
            <FaSignOutAlt />
          </ListItemIcon>
          <ListItemText primary="Cerrar sesión" sx={{ opacity: isOpen ? 1 : 0 }} noWrap />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          onClick={() => setIsMobileOpen(true)}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          <FaBars />
        </IconButton>
      )}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? isMobileOpen : isOpen}
        onClose={() => setIsMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: isMobile ? SIDEBAR_WIDTH : (isOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH),
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            backgroundColor: mode === 'light'
              ? lightThemeColor
              : 'background.paper', 
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isOpen ? 'space-between' : 'center',
            p: 1.5,
          }}
        >
          {isOpen && <Typography variant="h6" sx={{ ml: 1 }}>Bienvenido</Typography>}
          {!isMobile && (
            <IconButton onClick={onCollapsedChange}>
              {isOpen ? <FaChevronLeft /> : <FaBars />}
            </IconButton>
          )}
        </Box>
        <Divider />
        
        {drawerContent}
      </Drawer>

      {/* --- Diálogo de Confirmación de Logout (reemplaza SweetAlert) --- */}
      <Dialog
        open={isLogoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
      >
        <DialogTitle>¿Cerrar sesión?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Se cerrará tu sesión actual y volverás al inicio de sesión.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)} disabled={isLoggingOut}>
            Cancelar
          </Button>
          <Button onClick={performLogout} color="primary" disabled={isLoggingOut}>
            {isLoggingOut ? "Cerrando..." : "Sí, cerrar sesión"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
