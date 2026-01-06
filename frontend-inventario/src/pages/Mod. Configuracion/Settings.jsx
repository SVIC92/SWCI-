import React from "react";
import { useGlobalStore } from "../../store/useGlobalStore";
import LayoutDashboard from "../../components/Layouts/LayoutDashboard";
import {
    Container,
    Typography,
    Paper,
    Box,
    Divider,
    ToggleButton,
    ToggleButtonGroup,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Grid,
} from "@mui/material";

const themeOptions = [
    { value: "light", label: "Claro", emoji: "☀️" },
    { value: "dark", label: "Oscuro", emoji: "🌙" },
];
const densityOptions = [
    { value: "comfortable", label: "Cómodo" },
    { value: "compact", label: "Compacto" },
];

const ColorPicker = ({ label, color, onChange }) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
        }}
    >
        <Typography variant="body2">{label}</Typography>
        <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            style={{
                width: "60px",
                height: "30px",
                border: "none",
                padding: 0,
                backgroundColor: "transparent",
                cursor: "pointer",
            }}
        />
    </Box>
);

const Settings = () => {
    const {
        theme,
        fontSize,
        density,
        sidebarCollapsed,
        showFooter,
        lightThemeColor,
        setTheme,
        setFontSize,
        setDensity,
        setSidebarCollapsed,
        setShowFooter,
        setLightThemeColor, 
    } = useGlobalStore();

    return (
        <LayoutDashboard>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Preferencias de la Interfaz
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Personaliza el aspecto y la lectura del sistema para adecuarlo a tu
                    espacio de trabajo.
                </Typography>

                <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
                    <Typography variant="h6">Tema de la aplicación</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Selecciona el estilo visual que prefieras.
                    </Typography>

                    <ToggleButtonGroup
                        value={theme}
                        exclusive
                        onChange={(e, newTheme) => {
                            if (newTheme) setTheme(newTheme);
                        }}
                        aria-label="Selección de tema"
                    >
                        {themeOptions.map((opt) => (
                            <ToggleButton key={opt.value} value={opt.value} sx={{ px: 3 }}>
                                <span style={{ marginRight: "8px" }}>{opt.emoji}</span>
                                {opt.label}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                    {theme === "light" && (
                        <Box sx={{ mt: 3 }}>
                            <Divider sx={{ mb: 3 }} />
                            <ColorPicker
                                label="Color del Sidebar y Footer (Tema Claro):"
                                color={lightThemeColor || "#FFFFFF"}
                                onChange={setLightThemeColor}
                            />
                        </Box>
                    )}
                </Paper>

                <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
                    <Typography variant="h6">Lectura y Densidad</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Ajusta la escala tipográfica y el espaciado de los elementos.
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="font-size-select-label">
                                    Tamaño de fuente
                                </InputLabel>
                                <Select
                                    labelId="font-size-select-label"
                                    id="font-size-select"
                                    value={fontSize}
                                    label="Tamaño de fuente"
                                    onChange={(e) => setFontSize(e.target.value)}
                                >
                                    <MenuItem value="small">Pequeño</MenuItem>
                                    <MenuItem value="medium">Mediano</MenuItem>
                                    <MenuItem value="large">Grande</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <ToggleButtonGroup
                                value={density}
                                exclusive
                                fullWidth
                                onChange={(e, newDensity) => {
                                    if (newDensity) setDensity(newDensity);
                                }}
                                aria-label="Selección de densidad"
                            >
                                {densityOptions.map((opt) => (
                                    <ToggleButton key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Grid>
                    </Grid>
                </Paper>
                <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
                    <Typography variant="h6">Visibilidad y Comportamiento</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Define los elementos auxiliares y el estado inicial del menú.
                    </Typography>
                    <Box>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={sidebarCollapsed}
                                    onChange={() => setSidebarCollapsed(!sidebarCollapsed)}
                                />
                            }
                            label="Colapsar barra lateral por defecto"
                        />
                    </Box>
                    <Box>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showFooter}
                                    onChange={() => setShowFooter(!showFooter)}
                                />
                            }
                            label="Mostrar pie de página"
                        />
                    </Box>
                </Paper>
            </Container>
        </LayoutDashboard>
    );
};

export default Settings;