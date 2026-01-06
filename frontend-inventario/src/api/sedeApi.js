import axiosInstance from "./axiosConfig";

export const getSedes = async () =>{
    const response = await axiosInstance.get("/sedes");
    return response.data;
}
export const getSede = async (id) => {
    const response = await axiosInstance.get(`/sedes/${id}`);
    return response.data;
}
export const createSede = (data) => axiosInstance.post("/sedes/registrar", data);
export const updateSede = (id, data) => axiosInstance.put(`/sedes/actualizar/${id}`, data);
export const deleteSede = (id) => axiosInstance.delete(`/sedes/eliminar/${id}`);
