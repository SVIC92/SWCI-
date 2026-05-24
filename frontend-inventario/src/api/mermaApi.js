import axios from './axiosConfig'; // Asumo que tienes tu instancia de axios configurada

export const registrarMermasApi = async (mermaPayload) => {
  // Ajusta la URL según cómo tengas tu endpoint en el Controller
  const response = await axios.post('/api/mermas/registrar', mermaPayload);
  return response.data;
};