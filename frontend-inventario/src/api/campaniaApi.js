import axiosInstance from "./axiosConfig";

const ENDPOINT = "/campanias";
export const obtenerTodasLasCampanias = async () => {
  try {
    const response = await axiosInstance.get(ENDPOINT);
    return response.data;
  } catch (error) {
    console.error("Error al obtener todas las campañas:", error);
    throw error;
  }
};

export const getCampaniasActivas = async () => {
  try {
    const response = await axiosInstance.get(`${ENDPOINT}/activas`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener campañas activas:", error);
    throw error;
  }
};
export const obtenerCampaniaPorId = async (id) => {
  try {
    const response = await axiosInstance.get(`${ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener la campaña:", error);
    throw error;
  }
};
export const crearCampania = async (campania) => {
  try {
    const response = await axiosInstance.post(ENDPOINT, campania);
    return response.data;
  } catch (error) {
    console.error("Error al crear campaña:", error);
    throw error;
  }
};
export const actualizarCampania = async (id, campania) => {
  try {
    const response = await axiosInstance.put(`${ENDPOINT}/${id}`, campania);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar campaña:", error);
    throw error;
  }
};
export const eliminarCampania = async (id) => {
  try {
    await axiosInstance.delete(`${ENDPOINT}/${id}`);
  } catch (error) {
    console.error("Error al eliminar campaña:", error);
    throw error;
  }
};

export const asignarProductosACampania = async (
  idCampania,
  listaIdsProductos
) => {
  try {
    const response = await axiosInstance.post(
      `${ENDPOINT}/${idCampania}/productos`,
      listaIdsProductos
    );
    return response.data;
  } catch (error) {
    console.error("Error al asignar productos:", error);
    throw error;
  }
};
