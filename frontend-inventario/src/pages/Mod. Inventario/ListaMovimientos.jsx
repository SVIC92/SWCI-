import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Chip } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { format } from "date-fns";
import { listarMovimientos } from "../../api/InventarioApi";
import TablaLista from "../../components/TablaLista";

// El backend guarda "cantidad" siempre en positivo, salvo en "Ajuste Conteo" (único caso con signo real,
// porque un conteo físico puede arrojar sobrante o faltante frente al stock del sistema).
const CLAVES_ENTRADA = ["recep", "devoluci", "entrada"];
const esAjusteConteo = (tipoMovimiento) => !!tipoMovimiento && tipoMovimiento.toLowerCase().includes("ajuste");
const esEntrada = (tipoMovimiento, cantidad) => {
  if (!tipoMovimiento) return false;
  if (esAjusteConteo(tipoMovimiento)) return cantidad >= 0;
  const tipo = tipoMovimiento.toLowerCase();
  if (tipo.includes("salida")) return false; // ej: SALIDA_DEVOLUCION / SALIDA_TRANSFERENCIA
  return CLAVES_ENTRADA.some((clave) => tipo.includes(clave));
};

function ListaMovimientos() {
  const navigate = useNavigate();

  const { data: response, isLoading } = useQuery({
    queryKey: ["movimientos"],
    queryFn: listarMovimientos,
    initialData: { data: [] },
  });
  
  const movimientosProcesados = useMemo(() => {
    if (!response || !response.data) return [];

    return response.data.map(mov => {
      const fechaStr = mov.fecha;
      const fechaUTC = fechaStr && !fechaStr.endsWith('Z') ? fechaStr + 'Z' : fechaStr;

      return {
        ...mov,
        fechaFormateada: fechaUTC ? format(new Date(fechaUTC), "dd/MM/yyyy HH:mm:ss") : '-'
      };
    });
  }, [response.data]);

  const columns = [
    { field: "idMovimiento", headerName: "ID", width: 80 },
    { field: "skuProducto", headerName: "SKU", width: 100 },
    { field: "nombreProducto", headerName: "Producto", flex: 1, minWidth: 150 },
    { field: "nombreSede", headerName: "Sede", width: 130 },
    { field: "nombreCompletoUsuario", headerName: "Usuario", width: 160 },
    { field: "nombreRolUsuario", headerName: "Rol", width: 130 },
    {
      field: "tipoMovimiento",
      headerName: "Tipo",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={esEntrada(params.value, params.row.cantidad) ? 'success' : 'error'}
          variant="outlined"
        />
      )
    },
    {
      field: "cantidad",
      headerName: "Cantidad",
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const tipo = params.row.tipoMovimiento;
        const entrada = esEntrada(tipo, params.value);
        const valorAbs = Math.abs(params.value);
        return (
          <Chip
            size="small"
            icon={entrada ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
            label={entrada ? `+${valorAbs}` : `-${valorAbs}`}
            color={entrada ? 'success' : 'error'}
            sx={{ fontWeight: 700, minWidth: 78, '& .MuiChip-icon': { fontSize: 16 } }}
          />
        );
      }
    },
    {
      field: "fechaFormateada",
      headerName: "Fecha/Hora", 
      width: 170
    },
    { field: "observaciones", headerName: "Observaciones", flex: 2, minWidth: 200 },
  ];

  return (
    <TablaLista
      title="KARDEX (Historial de Movimientos)"
      columns={columns}
      data={movimientosProcesados}
      isLoading={isLoading}
      onBack={() => navigate("/dashboard-inventario")}
      getRowId={(row) => row.idMovimiento}
      showAddButton={false}
      showRefreshButton={true}
    />
  );
}

export default ListaMovimientos;