import { z } from 'zod';
export const proveedorSchema = z.object({
  ruc: z.string().trim().length(11, "El RUC debe tener 11 dígitos"),
  nombre_proveedor: z.string().trim().min(3, "La razón social es obligatoria"),
  telefono: z
    .string()
    .trim()
    .min(7, "El teléfono debe tener al menos 7 dígitos"),
  email: z.string().trim().email("Debe ser un email válido"),
  direccion: z.string().trim().min(5, "La dirección es obligatoria"),
});