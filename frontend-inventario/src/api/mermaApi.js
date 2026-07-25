import axiosInstance from "./axiosConfig";

export const solicitarMerma = (data) => axiosInstance.post("/merma/solicitar", data);
export const listarMermasPendientes = () => axiosInstance.get("/merma/pendientes");
export const aprobarMerma = (id) => axiosInstance.put(`/merma/${id}/aprobar`);
export const rechazarMerma = (id, motivo) =>
  axiosInstance.put(`/merma/${id}/rechazar`, { motivo });
export const listarHistorialMermas = () => axiosInstance.get("/merma/historial");
export const obtenerMermaPorId = (id) => axiosInstance.get(`/merma/${id}`);
