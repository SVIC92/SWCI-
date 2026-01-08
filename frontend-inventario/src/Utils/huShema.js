import { z } from "zod";
const huSchema = z.object({
  idAlmacen: z.coerce.number().min(1, "Debe seleccionar un almacén de origen"),
  tipoIndicador: z.string().optional(),
  fechaSolicitada: z.string().optional(),
  fechaVencimiento: z.string().optional(),
});
