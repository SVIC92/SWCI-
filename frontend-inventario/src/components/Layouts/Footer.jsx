import { useGlobalStore } from "../../store/useGlobalStore";
import { HookTiempoReal } from "../Hooks/HookTiempo";
import { Box, Typography, useTheme } from "@mui/material";
import { LOGO_NAVY } from "../../theme/appTheme";

const DEFAULT_LIGHT_COLORS = ["#ffffffff", "#ffffff", "#fff"];

export default function Footer({mostrarUsuario = true, empresa = "Empresa S.A.", version = "v1.0.0",}) {
  const user = useGlobalStore((state) => state.user);
  const horaFormateada = HookTiempoReal();
  const theme = useTheme();
  const mode = theme.palette.mode;
  const lightThemeColor = useGlobalStore((state) => state.lightThemeColor);

  // Mismo criterio que el Sidebar: si el usuario no personalizó el color,
  // usamos el navy de marca en vez de un footer blanco/plano.
  const hasCustomLightColor = lightThemeColor && !DEFAULT_LIGHT_COLORS.includes(lightThemeColor.toLowerCase());
  const footerLightBg = hasCustomLightColor ? lightThemeColor : LOGO_NAVY;
  const isDarkChrome = mode === "dark" || !hasCustomLightColor;
  const chromeText = isDarkChrome ? "#f8fafc" : "text.primary";
  const chromeTextMuted = isDarkChrome ? "rgba(248, 250, 252, 0.7)" : "text.secondary";
  const chromeDivider = isDarkChrome ? "rgba(248, 250, 252, 0.14)" : "divider";

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
        borderColor: chromeDivider,
        backgroundColor: mode === 'light'
          ? footerLightBg
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
            bgcolor: '#ffffff',
            borderRadius: '50%',
            p: 0.5,
            boxSizing: 'border-box',
            objectFit: 'contain',
          }}
        />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: "bold", color: chromeText }}>
            {empresa}
            <Typography
              component="span"
              variant="caption"
              sx={{ ml: 1, color: chromeTextMuted }}
            >
              {version}
            </Typography>
          </Typography>
          <Typography variant="caption" sx={{ color: chromeTextMuted }}>
            © {anio}
          </Typography>
        </Box>
      </Box>
      <Box>
        {mostrarUsuario && nombreUsuario ? (
          <Typography variant="body2" sx={{ textAlign: "right", color: chromeText }}>
            <Typography component="span" sx={{ fontWeight: "bold" }}>
              {nombreUsuario}
            </Typography>
            {rolUsuario && (
              <Typography
                component="span"
                variant="caption"
                sx={{ color: chromeTextMuted }}
              >
                {" — "}
                {rolUsuario}
              </Typography>
            )}
            <Typography
              component="span"
              variant="body2"
              sx={{ color: chromeText, ml: 1 }}
            >
              | {horaFormateada}
            </Typography>
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ color: chromeTextMuted }}>
            Sistema de Control de Inventarios
          </Typography>
        )}
      </Box>
    </Box>
  );
}
