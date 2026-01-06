import { z } from "zod";
export const IngresarUsuarioSchema = z.object({
  dni: z.string().trim().length(8, "El DNI debe tener 8 dígitos"),
  nombre_u: z.string().trim().min(4, "El nombre es obligatorio"),
  apellido_pat: z.string().optional(),
  apellido_mat: z.string().optional(),
  telefono: z
    .string()
    .trim()
    .min(9, "El teléfono debe tener 9 dígitos"),
  email: z.string().trim().email("Debe ser un email válido"),
  pass: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "La contraseña debe tener al menos una letra mayúscula")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "La contraseña debe tener al menos un caracter especial"
    ),
  id_rol: z.string().nonempty("Debes seleccionar un rol"),
});
export const usuarioEditSchema = z.object({
  nombre_u: z.string().trim().min(4, "El nombre es obligatorio"),
  apellido_pat: z.string().optional(),
  apellido_mat: z.string().optional(),
  telefono: z
    .string()
    .trim()
    .min(9, "El teléfono debe tener 9 dígitos"),
  email: z.string().trim().email("Debe ser un email válido"),
  id_rol: z.string().nonempty("Debes seleccionar un rol"),
});

export const rolSchema = z.object({
  nombreRol: z
    .string()
    .trim()
    .min(4, "El nombre del rol debe tener al menos 4 caracteres"),
});
