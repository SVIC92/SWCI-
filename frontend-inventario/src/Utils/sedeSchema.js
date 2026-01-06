import { z } from 'zod';
export const sedeSchema = z.object({
  nombreSede: z
    .string()
    .trim()
    .min(4, "El nombre de la sede es obligatorio (mín. 4)"),
  direccion: z.string().trim().min(10, "La dirección es obligatoria (mín. 10)"),
  anexo: z.string().trim().min(6, "El anexo es obligatorio (mín. 6)"),
});