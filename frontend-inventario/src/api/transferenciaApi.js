import axiosInstance from "./axiosConfig";

export const solicitarTransferencia = (data) =>
  axiosInstance.post("/transferencia/solicitar", data);
export const listarPendientes = () => axiosInstance.get("/transferencia/pendientes");
export const aprobarTransferencia = (id) =>
  axiosInstance.put(`/transferencia/${id}/aprobar`);
export const rechazarTransferencia = (id, motivo) =>
  axiosInstance.put(`/transferencia/${id}/rechazar`, { motivo });
export const listarHistorial = () => {
  return axiosInstance.get("/transferencia/historial");
};
export const obtenerTransferenciaPorId = (id) => {
  return axiosInstance.get(`/transferencia/${id}`);
};