import axiosInstance from "./axiosConfig";

export const registrarRecepcion = (data) => {
  
  return axiosInstance.post("/inventario/recepcion", data);
};



export const listarMovimientos = () => {
  return axiosInstance.get("/inventario/movimientos");
};

export const getInventarioActual = () => {
  return axiosInstance.get("/inventario/stock");
};

export const importarVentasCsv = (sedeId, archivo) => {
  const formData = new FormData();
  formData.append("sedeId", sedeId);
  formData.append("archivo", archivo);
  // Content-Type en undefined para que el navegador agregue el boundary del multipart
  return axiosInstance.post("/inventario/ventas/importar", formData, {
    headers: { "Content-Type": undefined },
  });
};

export const getInventarioPorSede = (sedeId) => axiosInstance.get(`/inventario/sede/${sedeId}`);
export const asociarProductosASede = (sedeId, productoIds) =>
  axiosInstance.post(`/inventario/sede/${sedeId}/asociar`, { productoIds });
export const desasociarProductoDeSede = (sedeId, productoId) =>
  axiosInstance.delete(`/inventario/sede/${sedeId}/producto/${productoId}`);
