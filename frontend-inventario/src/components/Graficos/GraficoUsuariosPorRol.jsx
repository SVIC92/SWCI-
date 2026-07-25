import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useQuery } from '@tanstack/react-query';
import { useTheme } from "@mui/material/styles";
import { getUsuarios } from "../../api/usuarioApi";
import "./css/GraficoUsuariosPorRol.css";
import { Skeleton, Box } from "@mui/material";

// Orden fijo de roles -> color: la identidad (rol) siempre tiene el mismo
// color, sin importar qué otros roles estén presentes en los datos actuales
// (evita que un filtro/recorte de datos "repinte" a los roles sobrevivientes).
const ROLE_ORDER = [
  "Administrador",
  "Jefe de Inventario",
  "Operador de Recepción de Mercadería",
  "Auditor de Inventarios",
  "Operador de Tienda",
  "Jefe de Almacén",
  "Sin Rol",
];

// Paleta categórica validada (contraste + separación para daltonismo) del
// design system de dataviz; pasos ya calibrados para superficie clara/oscura.
const CATEGORICAL_LIGHT = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7"];
const CATEGORICAL_DARK = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9"];

function getColorForRole(rol, palette) {
  const idx = ROLE_ORDER.indexOf(rol);
  return palette[idx >= 0 ? idx : palette.length - 1];
}

function GraficoUsuariosPorRol() {
  const theme = useTheme();
  const palette = theme.palette.mode === "dark" ? CATEGORICAL_DARK : CATEGORICAL_LIGHT;

  const {
    data: usuarios,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['usuarios'],
    queryFn: getUsuarios
  });
  const datosFormateados = useMemo(() => {
    if (!usuarios) {
      return [];
    }
    const conteoPorRol = usuarios.reduce((acc, usuario) => {
      const rol = usuario.rol?.nombreRol || "Sin Rol";
      acc[rol] = (acc[rol] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(conteoPorRol).map(([rol, cantidad]) => ({
      name: rol,
      value: cantidad,
    }));
  }, [usuarios]);

  if (isLoading) {
    return (
      <div className="grafico-usuarios-container">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 210 }}>
          <Skeleton variant="circular" width={150} height={150} />
        </Box>
      </div>
    );
  }
  if (isError) {
    return <div className="grafico-usuarios-container">Error: {error.message}</div>;
  }
  return (
    <div className="grafico-usuarios-container">
      {datosFormateados.length > 0 ? (
      <ResponsiveContainer width="100%" height={210}>
        <PieChart>
          <Pie
            data={datosFormateados}
            cx="34%"
            cy="50%"
            outerRadius={75}
            dataKey="value"
            nameKey="name"
          >
            {datosFormateados.map((entry) => (
              <Cell key={entry.name} fill={getColorForRole(entry.name, palette)} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} usuario${value > 1 ? "s" : ""}`, name]}
          />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            formatter={(value, entry) => (
              <span style={{ color: theme.palette.text.secondary }}>
                {value} ({entry.payload.value})
              </span>
            )}
            wrapperStyle={{ fontSize: 12, lineHeight: "22px", maxWidth: "46%" }}
          />
        </PieChart>
      </ResponsiveContainer>
      ): (
        <p>No hay datos de usuarios para mostrar.</p>
      )}
    </div>
  );
}

export default GraficoUsuariosPorRol;
