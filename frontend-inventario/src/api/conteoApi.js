import axiosInstance from "./axiosConfig";

export const generarHojaConteo = (data) => axiosInstance.post("/conteo/generar", data);
export const registrarConteo = (id, data) => axiosInstance.put(`/conteo/${id}/registrar`, data);
export const modificarConteo = (id, data) => axiosInstance.put(`/conteo/${id}/modificar`, data);
export const listarTodasHojasConteo = () => axiosInstance.get("/conteo/todas");
export const listarConteosPendientes = () => axiosInstance.get("/conteo/pendientes");
export const listarHistorialConteo = () => axiosInstance.get("/conteo/historial");
export const aprobarConteo = (id) => axiosInstance.put(`/conteo/${id}/aprobar`);
export const rechazarConteo = (id, motivo) =>
  axiosInstance.put(`/conteo/${id}/rechazar`, { motivo });
export const obtenerConteoPorId = (id) => axiosInstance.get(`/conteo/${id}`);
