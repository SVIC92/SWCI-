import { useGlobalStore } from "../../store/useGlobalStore";
import { HookTiempoReal } from "../Hooks/HookTiempo";
import { Box, Typography, useTheme } from "@mui/material";

export default function Footer({mostrarUsuario = true, empresa = "Empresa S.A.", version = "v1.0.0",}) {
  const user = useGlobalStore((state) => state.user);
  const horaFormateada = HookTiempoReal();
  const theme = useTheme();
  const mode = theme.palette.mode;
  const lightThemeColor = useGlobalStore((state) => state.lightThemeColor);

  const nombreUsuario = user
    ? `${user.nombre_u || ""} ${user.apellido_pat || ""} ${user.apellido_mat || ""}`.trim()
    : null;
  const rolUsuario = user?.rol || null;
  const anio = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        p: 2,
        borderTop: 1,
        borderColor: "divider",
        backgroundColor: mode === 'light'
          ? lightThemeColor
          : 'background.paper',
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0, 
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box
          component="img"
          src="/logo.png"
          alt="Logo"
          sx={{
            width: 28, 
            height: 28, 
            mr: 1.5, 
          }}
        />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {empresa}
            <Typography
              component="span"
              variant="caption"
              sx={{ ml: 1, color: "text.secondary" }}
            >
              {version}
            </Typography>
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            © {anio}
          </Typography>
        </Box>
      </Box>
      <Box>
        {mostrarUsuario && nombreUsuario ? (
          <Typography variant="body2" sx={{ textAlign: "right" }}>
            <Typography component="span" sx={{ fontWeight: "bold" }}>
              {nombreUsuario}
            </Typography>
            {rolUsuario && (
              <Typography
                component="span"
                variant="caption"
                sx={{ color: "text.secondary" }}
              >
                {" — "}
                {rolUsuario}
              </Typography>
            )}
            <Typography
              component="span"
              variant="body2"
              sx={{ color: "text.primary", ml: 1 }}
            >
              | {horaFormateada}
            </Typography>
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Sistema de Control de Inventarios
          </Typography>
        )}
      </Box>
    </Box>
  );
}