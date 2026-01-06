import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useQuery } from '@tanstack/react-query';
import { getUsuarios } from "../../api/usuarioApi";
import "./css/GraficoUsuariosPorRol.css";

function GraficoUsuariosPorRol() {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0"];

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
    return <div className="grafico-usuarios-container">Cargando datos...</div>;
  }
  if (isError) {
    return <div className="grafico-usuarios-container">Error: {error.message}</div>;
  }
  return (
    <div className="grafico-usuarios-container">
      <h3>Usuarios por Rol</h3>
      {datosFormateados.length > 0 ? (
      <ResponsiveContainer width="95%" height={300}>
        <PieChart>
          <Pie
            data={datosFormateados}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            nameKey="name"
            label={({ name, value, percent }) =>
              `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
            }
            labelLine={false}
          >
            {datosFormateados.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} usuario${value > 1 ? "s" : ""}`, name]}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{
              marginTop: "10px",
              fontSize: "13px",
            }}
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
