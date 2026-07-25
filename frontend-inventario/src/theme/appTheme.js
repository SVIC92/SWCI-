import { createTheme } from "@mui/material/styles";

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", ' +
  '"Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';

const PALETTES = {
  light: {
    mode: "light",
    primary: { main: "#2563eb", dark: "#1d4ed8" },
    success: { main: "#16a34a", dark: "#15803d" },
    warning: { main: "#f97316" },
    error: { main: "#dc2626", dark: "#b91c1c" },
    background: { default: "#f8fafc", paper: "#ffffff" },
    text: { primary: "#1f2937", secondary: "#6b7280" },
    divider: "rgba(148, 163, 184, 0.2)",
  },
  dark: {
    mode: "dark",
    // Fondos/superficies neutros (negro/zinc, sin tinte azul) + acento azul
    // fuerte para lo interactivo (botones, headers, selección). Un acento
    // gris sobre fondo casi negro se leía "muerto"; el azul da vida y
    // sigue siendo perfectamente legible como texto/ícono sobre el fondo.
    primary: { main: "#3b82f6", dark: "#1d4ed8" },
    success: { main: "#34d399", dark: "#22c55e" },
    warning: { main: "#fb923c" },
    error: { main: "#f87171", dark: "#ef4444" },
    background: { default: "#18181b", paper: "#232326" },
    text: { primary: "#f4f4f5", secondary: "#a1a1aa" },
    divider: "rgba(255, 255, 255, 0.1)",
  },
};

// Colores reales extraídos del logo (public/logo.png): navy del isotipo y
// verde lima del acento. Se usan para dar identidad de marca al sidebar,
// footer, headers de listas y botón "Ingresar" en el tema claro.
export const LOGO_NAVY = "#00265f";
export const LOGO_NAVY_DARK = "#001a45";
export const LOGO_GREEN = "#7ad500";

const CARD_SHADOW = {
  light: "0 4px 12px rgba(0, 0, 0, 0.05)",
  dark: "0 4px 12px rgba(0, 0, 0, 0.35)",
};

// Sombra "glow" para botones primarios: da profundidad y evita que el theme
// se vea plano. En claro usa el verde del logo; en oscuro, azul (ya validado).
const PRIMARY_BUTTON_SHADOW = {
  light: `0 6px 16px rgba(122, 213, 0, 0.35)`,
  dark: "0 6px 18px rgba(59, 130, 246, 0.45)",
};

// Header de listas/tablas: en claro usa el navy de marca; en oscuro, azul
// fuerte (ya validado). Exportado para usarlo vía sx en TablaLista, ya que
// @mui/x-data-grid v8 no expone estos slots a través de
// theme.components.MuiDataGrid.styleOverrides (usa CSS vars internas).
export const TABLE_HEADER_BG = {
  light: LOGO_NAVY,
  dark: "#1d4ed8",
};

// Sustituye la escala de sombras "duras" por defecto de MUI por una escala
// suave y consistente. Al reemplazar theme.shadows, cualquier elevation={n}
// (Paper, Card, Dialog, Menu, AppBar) o sx={{ boxShadow: n }} en toda la app
// hereda automáticamente el mismo lenguaje visual, sin tocar cada componente.
function buildSoftShadows(mode) {
  const maxOpacity = mode === "light" ? 0.16 : 0.55;
  const baseOpacity = mode === "light" ? 0.05 : 0.3;
  return Array.from({ length: 25 }, (_, elevation) => {
    if (elevation === 0) return "none";
    const y = Math.min(2 + elevation * 1.2, 22);
    const blur = Math.min(6 + elevation * 2.5, 48);
    const opacity = Math.min(baseOpacity + elevation * 0.012, maxOpacity);
    return `0 ${y}px ${blur}px rgba(0, 0, 0, ${opacity.toFixed(3)})`;
  });
}

const getFontSizeValue = (size) => {
  switch (size) {
    case "small":
      return 12;
    case "large":
      return 16;
    default:
      return 14;
  }
};

export function createAppTheme(mode, fontSize) {
  const palette = PALETTES[mode] ?? PALETTES.light;
  const cardShadow = CARD_SHADOW[mode] ?? CARD_SHADOW.light;
  const primaryButtonShadow = PRIMARY_BUTTON_SHADOW[mode] ?? PRIMARY_BUTTON_SHADOW.light;

  return createTheme({
    palette,
    shape: { borderRadius: 12 },
    shadows: buildSoftShadows(mode),
    typography: {
      fontFamily: FONT_FAMILY,
      fontSize: getFontSizeValue(fontSize),
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            fontSize: fontSize === "large" ? "1rem" : undefined,
          },
          containedPrimary: {
            boxShadow: primaryButtonShadow,
            "&:hover": { boxShadow: primaryButtonShadow },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            boxShadow: cardShadow,
            border: `1px solid ${palette.divider}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
    },
  });
}
