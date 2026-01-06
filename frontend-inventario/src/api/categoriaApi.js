import axiosInstance from "./axiosConfig";

export const getCategorias = async () => {
  const response = await axiosInstance.get("/categorias");
  return response.data;
};

export const getCategoria = async (id) => {
  const response = await axiosInstance.get(`/categorias/${id}`);
  return response.data;
};

export const createCategoria = (data) =>
  axiosInstance.post("/categorias/registrar", data);

export const updateCategoria = (id, data) =>
  axiosInstance.put(`/categorias/actualizar/${id}`, data);

export const deleteCategoria = (id) =>
  axiosInstance.delete(`/categorias/eliminar/${id}`);
