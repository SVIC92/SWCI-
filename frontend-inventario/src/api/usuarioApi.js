import axiosInstance from "./axiosConfig";

export const getUsuarios = async () => {
  const response = await axiosInstance.get("/usuarios");
  return response.data;
};
export const getUsuario = async (id) => {
  const response = await axiosInstance.get(`/usuarios/${id}`);
  return response.data;
};
export const getUsuariosConectados = async () => {
  const response = await axiosInstance.get("/usuarios/conectados");
  return response.data;
};
export const createUsuario = (data) => axiosInstance.post("/usuarios", data);
export const updateUsuario = (id, data) =>
  axiosInstance.put(`/usuarios/${id}`, data);
export const deleteUsuario = (id) => axiosInstance.delete(`/usuarios/${id}`);
export const desactivarUsuarioApi = (id) =>
  axiosInstance.patch(`/usuarios/${id}/desactivar`);
export const activarUsuarioApi = (id) =>
  axiosInstance.patch(`/usuarios/${id}/activar`);
