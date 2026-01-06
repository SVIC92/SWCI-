import axiosInstance from "./axiosConfig";
const ENDPOINT = "/campanias";

export const getCampaniasActivas = async () => {
  try {
    const response = await axiosInstance.get(`${ENDPOINT}/activas`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener campañas:", error);
    throw error;
  }
};

export const guardarCampania = async (campania) => {
  try {
    const response = await axiosInstance.post(`${ENDPOINT}`, campania);
    return response.data;
  } catch (error) {
    console.error("Error al guardar campaña:", error);
    throw error;
  }
};
export const asignarProductosACampania = async (idCampania, listaIdsProductos) => {
  await axiosInstance.post(
    `${ENDPOINT}/${idCampania}/productos`,
    listaIdsProductos
  );
};
/*export const eliminarCampania = async (id) => {
    await axiosInstance.delete(`${ENDPOINT}/${id}`);
};*/
