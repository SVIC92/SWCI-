import axiosInstance from "./axiosConfig";

export const chatConGerente = async (mensaje) => {
  const response = await axiosInstance.post("/chat-gerente", mensaje, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
  return response.data;
};
