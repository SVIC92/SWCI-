// Ubicación: src/utils/inventarioSchema.js

import { z } from "zod";

export const recepcionSchema = z.object({
  // 🛑 CORRECCIÓN: Usamos .coerce.number() para transformar el string del Select a un número
  sedeIdOrigen: z.coerce
    .number({ invalid_type_error: "Debes seleccionar una sede" })
    .min(1, "Debes seleccionar una sede"),

  id_producto: z.coerce
    .number({ invalid_type_error: "Debes seleccionar un producto" })
    .min(1, "Debes seleccionar un producto"),

  cantidad: z
    .string()
    .nonempty("La cantidad es obligatoria")
    .transform((val) => parseInt(val, 10))
    .pipe(
      z.number({ invalid_type_error: "La cantidad debe ser un número" })
           .min(1, "La cantidad debe ser al menos 1")
    ),
    
  descripcion: z.string().optional(),
});