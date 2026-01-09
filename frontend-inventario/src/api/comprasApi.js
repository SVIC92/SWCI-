import axiosInstance from "./axiosConfig";
export const generarOrdenesMasivas = async (items, idSede) => {
  const response = await axiosInstance.post(
    `/compras/generar?idSede=${idSede}`,
    items
  );
  return response.data;
};
export const getOrdenes = async (estado = null) => {
  const params = estado ? { estado } : {};
  const response = await axiosInstance.get("/compras", { params });
  return response.data;
};
export const getOrdenById = async (id) => {
  const response = await axiosInstance.get(`/compras/${id}`);
  return response.data;
};
export const buscarOrdenPorCodigo = async (codigo) => {
  const response = await axiosInstance.get(`/compras/buscar/${codigo}`);
  return response.data;
};
export const enviarOrdenCorreo = async (id) => {
  const response = await axiosInstance.post(`/compras/${id}/enviar`);
  return response.data;
};
export const recepcionarMercaderia = async (payload) => {
  const response = await axiosInstance.post("/compras/recepcionar", payload);
  return response.data;
};
