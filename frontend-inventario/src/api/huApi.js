import axiosInstance from "./axiosConfig";
export const getHuById = async (id) => {
  const response = await axiosInstance.get(`/hu/${id}`);
  return response.data;
};
export const createHu = async (huData) => {
  const response = await axiosInstance.post("/hu/crear", huData);
  return response.data;
};

export const getHuDisponibles = async (idAlmacen = null) => {
  const params = idAlmacen ? { idAlmacen } : {};
  const response = await axiosInstance.get("/hu/disponibles", { params });
  return response.data;
};

export const getAllHus = async () => {
  const response = await axiosInstance.get("/hu/historial");
  return response.data;
};
export const updateHu = async (id, huData) => {
  const response = await axiosInstance.put(`/hu/actualizar/${id}`, huData);
  return response.data;
};
export const solicitarHu = async (id, requestData) => {
  const response = await axiosInstance.put(`/hu/solicitar/${id}`, requestData);
  return response.data;
};
export const deleteHu = async (id) => {
  const response = await axiosInstance.delete(`/hu/eliminar/${id}`);
  return response.data;
};
