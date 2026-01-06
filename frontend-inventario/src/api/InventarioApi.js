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