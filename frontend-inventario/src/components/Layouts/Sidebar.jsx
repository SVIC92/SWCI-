import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGlobalStore } from "../../store/useGlobalStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  Drawer, Box, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, IconButton, Divider, useMediaQuery, useTheme,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import SellIcon from "@mui/icons-material/Sell";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ChecklistIcon from "@mui/icons-material/Checklist";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import HomeIcon from "@mui/icons-material/Home";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PalletIcon from "@mui/icons-material/Pallet";
import { LOGO_NAVY, LOGO_GREEN } from "../../theme/appTheme";

const SIDEBAR_WIDTH = 250;
const SIDEBAR_COLLAPSED_WIDTH = 60;
const DEFAULT_LIGHT_COLORS = ["#ffffffff", "#ffffff", "#fff"];
const getMenuItems = (rol) => {
  const allMenus = {
    "Administrador": [
      { icon: <HomeIcon />, label: "Inicio", path: "/dashboard-administrador" },
      { icon: <SmartToyIcon />, label: "IA", path: "/chat-ia" },
      { icon: <GroupIcon />, label: "Usuarios", path: "/dashboard-usuarios" },
      { icon: <SellIcon />, label: "Productos", path: "/dashboard-productos" },
      { icon: <StorefrontIcon />, label: "Sedes", path: "/dashboard-sedes" },
      { icon: <LocalShippingIcon />, label: "Proveedores", path: "/dashboard-proveedores" },
      { icon: <PalletIcon />, label: "Logistica", path: "/dashboard-logistica" },
      { icon: <Inventory2Icon />, label: "Inventario", path: "/dashboard-inventario" },
      { icon: <ChecklistIcon />, label: "Conteo Inventario", path: "/dashboard-conteoinventario" },
      { icon: <BarChartIcon />, label: "Reportes", path: "/dashboard-reportes" },
    ],
    "Jefe de Inventario": [
      { icon: <HomeIcon />, label: "Inicio", path: "/dashboard-jefe-inventario" },
      { icon: <SmartToyIcon />, label: "IA", path: "/chat-ia" },
      { icon: <SellIcon />, label: "Productos", path: "/dashboard-productos" },
      { icon: <StorefrontIcon />, label: "Sedes", path: "/dashboard-sedes" },
      { icon: <Inventory2Icon />, label: "Inventario", path: "/dashboard-inventario" },
      { icon: <ChecklistIcon />, label: "Conteo Inventario", path: "/dashboard-conteoinventario" },
      { icon: <BarChartIcon />, label: "Reportes", path: "/dashboard-reportes" },
    ],
    "Operador de Recepción de Mercadería": [
      { icon: <HomeIcon />, label: "Inicio", path: "/dashboard-operador-recepcion" },
      { icon: <LocalShippingIcon />, label: "Proveedores", path: "/dashboard-proveedores" },
      { icon: <Inventory2Icon />, label: "Inventario", path: "/dashboard-inventario" },
      { icon: <ChecklistIcon />, label: "Conteo Inventario", path: "/dashboard-conteoinventario" },
      { icon: <BarChartIcon />, label: "Reportes", path: "/dashboard-reportes" },
    ],
    "Auditor de Inventarios": [
      { icon: <HomeIcon />, label: "Inicio", path: "/dashboard-auditor-inventarios" },
      { icon: <BarChartIcon />, label: "Reportes", path: "/dashboard-reportes" },
    ],
    "Operador de Tienda": [
      { icon: <HomeIcon />, label: "Inicio", path: "/dashboard-operador-tienda" },
      { icon: <LocalShippingIcon />, label: "Proveedores", path: "/dashboard-proveedores" },
      { icon: <Inventory2Icon />, label: "Inventario", path: "/dashboard-inventario" },
      { icon: <ChecklistIcon />, label: "Conteo Inventario", path: "/dashboard-conteoinventario" },
      { icon: <BarChartIcon />, label: "Reportes", path: "/dashboard-reportes" },
    ],
    "Jefe de Almacén": [
      { icon: <HomeIcon />, label: "Inicio", path: "/dashboard-jefe-almacen" },
      { icon: <SmartToyIcon />, label: "IA", path: "/chat-ia" },
      { icon: <PalletIcon />, label: "Logistica", path: "/dashboard-logistica" },
    ]
  };
  const baseMenu = allMenus[rol] || [
    { icon: <HomeIcon />, label: "Inicio", path: "/" },
  ];

  return [
    ...baseMenu,
    { icon: <SettingsIcon />, label: "Configuración", path: "/settings" },
  ];
};
export default function Sidebar({ collapsed, onCollapsedChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const mode = theme.palette.mode;
  const lightThemeColor = useGlobalStore((state) => state.lightThemeColor);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Si el usuario no personalizó el color del sidebar (sigue en el blanco
  // por defecto), usamos el navy de marca en vez de un sidebar plano/blanco.
  const hasCustomLightColor = lightThemeColor && !DEFAULT_LIGHT_COLORS.includes(lightThemeColor.toLowerCase());
  const sidebarLightBg = hasCustomLightColor ? lightThemeColor : LOGO_NAVY;
  // El sidebar es "chrome oscuro" (navy o negro) salvo que el usuario haya
  // elegido su propio color claro; en ese caso respetamos el texto oscuro original.
  const isDarkChrome = mode === "dark" || !hasCustomLightColor;
  const chromeText = isDarkChrome ? "#f8fafc" : "text.primary";
  const chromeTextMuted = isDarkChrome ? "rgba(248, 250, 252, 0.7)" : "text.secondary";
  const chromeDivider = isDarkChrome ? "rgba(248, 250, 252, 0.14)" : undefined;
  const chromeHoverBg = isDarkChrome ? "rgba(255, 255, 255, 0.16)" : "rgba(0, 0, 0, 0.04)";


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
      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar
          src={user?.fotoUrl || "/logo.png"}
          alt="Foto de perfil"
          sx={{
            width: isOpen ? 56 : 36,
            height: isOpen ? 56 : 36,
            mb: 0.75,
            cursor: 'pointer',
            transition: 'all 0.2s',
            border: '2px solid',
            borderColor: isDarkChrome ? 'rgba(248, 250, 252, 0.35)' : 'divider',
            ...(!user?.fotoUrl && {
              bgcolor: '#ffffff',
              p: 0.75,
              '& img': { objectFit: 'contain' },
            }),
          }}
          onClick={() => handleMenuNavigation("/perfil")}
        />
        <Typography variant="body2" fontWeight={600} noWrap sx={{ display: isOpen ? 'block' : 'none', maxWidth: '100%', color: chromeText }}>
          {`${user?.nombre_u || ""} ${user?.apellido_pat || ""} ${user?.apellido_mat || ""}`}
        </Typography>
        <Typography variant="caption" noWrap sx={{ display: isOpen ? 'block' : 'none', color: chromeTextMuted, maxWidth: '100%' }}>
          {user?.email}
        </Typography>
        <Typography variant="caption" noWrap sx={{ display: isOpen ? 'block' : 'none', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {user?.rol}
        </Typography>
      </Box>
      <Divider sx={{ borderColor: chromeDivider }} />

      <List sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', px: 1, py: 0.5 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.label}
              selected={isActive}
              onClick={() => handleMenuNavigation(item.path)}
              title={item.label}
              sx={{
                justifyContent: isOpen ? 'initial' : 'center',
                px: 1.5,
                py: 0.6,
                minHeight: 40,
                borderRadius: 1.5,
                borderLeft: '3px solid transparent',
                color: chromeText,
                '& .MuiListItemIcon-root': { color: chromeText },
                '&:hover': { backgroundColor: chromeHoverBg },
                '&.Mui-selected': {
                  borderLeft: '3px solid',
                  borderLeftColor: LOGO_GREEN,
                  backgroundColor: isDarkChrome
                    ? 'rgba(122, 213, 0, 0.22)'
                    : 'rgba(122, 213, 0, 0.14)',
                  color: isDarkChrome ? '#a3e635' : '#4d7c00',
                  '& .MuiListItemIcon-root': { color: isDarkChrome ? '#a3e635' : '#4d7c00' },
                  '&:hover': {
                    backgroundColor: isDarkChrome
                      ? 'rgba(122, 213, 0, 0.3)'
                      : 'rgba(122, 213, 0, 0.2)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: isOpen ? 2.5 : 'auto', justifyContent: 'center', '& svg': { fontSize: '1.25rem' } }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ variant: 'body2' }}
                sx={{ opacity: isOpen ? 1 : 0, my: 0 }}
                noWrap
              />
            </ListItemButton>
          );
        })}
      </List>
      <Divider sx={{ borderColor: chromeDivider }} />
      <List sx={{ overflowX: 'hidden', px: 1, py: 0.5 }}>
        <ListItemButton
          onClick={() => setLogoutDialogOpen(true)}
          title="Cerrar sesión"
          sx={{
            justifyContent: isOpen ? 'initial' : 'center',
            px: 1.5,
            py: 0.6,
            minHeight: 40,
            borderRadius: 1.5,
            color: chromeText,
            '& .MuiListItemIcon-root': { color: chromeText },
            '&:hover': { backgroundColor: chromeHoverBg },
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: isOpen ? 2.5 : 'auto', justifyContent: 'center', '& svg': { fontSize: '1.25rem' } }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Cerrar sesión"
            primaryTypographyProps={{ variant: 'body2' }}
            sx={{ opacity: isOpen ? 1 : 0, my: 0 }}
            noWrap
          />
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
          <MenuIcon />
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
              ? sidebarLightBg
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
            minHeight: 64,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Logo"
              sx={{
                width: 32,
                height: 32,
                flexShrink: 0,
                mr: isOpen ? 1.5 : 0,
                bgcolor: '#ffffff',
                borderRadius: '50%',
                p: 0.5,
                boxSizing: 'border-box',
                objectFit: 'contain',
              }}
            />
            {isOpen && (
              <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700, color: chromeText }}>
                Inventario
              </Typography>
            )}
          </Box>
          {!isMobile && isOpen && (
            <IconButton onClick={onCollapsedChange} size="small" sx={{ color: chromeText }}>
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Box>
        <Divider sx={{ borderColor: chromeDivider }} />
        {!isMobile && !isOpen && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
            <IconButton onClick={onCollapsedChange} size="small" sx={{ color: chromeText }}>
              <MenuIcon />
            </IconButton>
          </Box>
        )}

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
