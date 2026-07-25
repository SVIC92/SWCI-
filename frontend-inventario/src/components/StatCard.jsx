import { Card, Box, Typography, Skeleton } from "@mui/material";
import { alpha } from "@mui/material/styles";

export default function StatCard({ icon, label, value, isLoading, color = "primary", helperText, onClick }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 0.75,
        p: 2.25,
        position: "relative",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        borderLeft: "5px solid",
        borderLeftColor: `${color}.main`,
        backgroundImage: (theme) =>
          `linear-gradient(135deg, ${alpha(theme.palette[color].main, theme.palette.mode === "dark" ? 0.18 : 0.09)}, transparent 65%)`,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": onClick ? { transform: "translateY(-3px)" } : undefined,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: -18,
          right: -18,
          fontSize: 110,
          opacity: 0.08,
          color: `${color}.main`,
          display: "flex",
          pointerEvents: "none",
        }}
      >
        {icon}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.75, zIndex: 1 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: `${color}.main`,
            color: "#ffffff",
            flexShrink: 0,
            fontSize: "1.5rem",
            boxShadow: (theme) => `0 6px 16px ${alpha(theme.palette[color].main, 0.45)}`,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            noWrap
            sx={{ fontWeight: 700, letterSpacing: "0.06em", lineHeight: 1.2, display: "block" }}
          >
            {label}
          </Typography>
          {isLoading ? (
            <Skeleton variant="text" width={56} height={40} />
          ) : (
            <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              {value}
            </Typography>
          )}
        </Box>
      </Box>

      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ zIndex: 1, pl: "63px" }} noWrap>
          {helperText}
        </Typography>
      )}
    </Card>
  );
}
