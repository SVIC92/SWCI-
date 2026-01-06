import axiosInstance from "./axiosConfig";

export const getRoles = async () => {
    const response = await axiosInstance.get("/roles");
    return response.data;
};

export const getRol = async (id) => {
    const response = await axiosInstance.get(`/roles/${id}`);
    return response.data;
};

export const createRol = async (data) => {
    return await axiosInstance.post("/roles", data);
};

export const updateRol = async (id, data) => {
    return await axiosInstance.put(`/roles/${id}`, data);
};

export const deleteRol = async (id) => {
    return await axiosInstance.delete(`/roles/${id}`);
};
