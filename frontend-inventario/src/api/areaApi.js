import axiosInstance from "./axiosConfig";

export const getAreas = async () => {
  const response = await axiosInstance.get("/areas");
  return response.data;
};
export const getArea = async (id) => {
  const response = await axiosInstance.get(`/areas/${id}`);
  return response.data;
};
export const createArea = async (data) => axiosInstance.post("/areas/registrar", data);
export const updateArea = async (id, data) => axiosInstance.put(`/areas/actualizar/${id}`, data);
export const deleteArea = async (id) => axiosInstance.delete(`/areas/eliminar/${id}`);

