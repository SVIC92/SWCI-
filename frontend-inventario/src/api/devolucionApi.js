import axiosInstance from "./axiosConfig";

export const solicitarDevolucion = (data) => axiosInstance.post("/devolucion/solicitar", data);
export const listarDevolucionesPendientes = () => axiosInstance.get("/devolucion/pendientes");
export const aprobarDevolucion = (id) => axiosInstance.put(`/devolucion/${id}/aprobar`);
export const rechazarDevolucion = (id, motivo) =>
  axiosInstance.put(`/devolucion/${id}/rechazar`, { motivo });
export const listarHistorialDevoluciones = () => axiosInstance.get("/devolucion/historial");
