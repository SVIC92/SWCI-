import { z } from "zod";
export const areaSchema = z.object({
  nombreArea: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
});
export const categoriaSchema = z.object({
  nombreCat: z
    .string()
    .trim()
    .min(4, "El nombre debe tener al menos 4 caracteres"),
  id_area: z.string().nonempty("Debes seleccionar un área"),
});
export const IngresarProductoSchema = z.object({
  sku: z.string().trim().min(4, "El SKU es obligatorio (mín. 4 caracteres)"),
  ean: z.string().trim().min(13, "El EAN es obligatorio (mín. 13 caracteres)"),
  nombre_producto: z
    .string()
    .trim()
    .min(4, "El nombre es obligatorio (mín. 4 caracteres)"),
  marca: z.string().trim().min(2, "La marca es obligatoria"),
  uni_medida: z.string().trim().min(1, "La unidad de medida es obligatoria"),
  precio_venta: z.coerce
    .number()
    .positive("El precio de venta debe ser positivo"),
  precio_compra: z.coerce
    .number()
    .positive("El precio de compra debe ser positivo"),
  stockMinimo: z.coerce
    .number()
    .int()
    .nonnegative("El stock mínimo no puede ser negativo")
    .min(1, "El mínimo sugerido es 1"),
  stockIdeal: z.coerce
    .number()
    .int()
    .positive("El stock ideal debe ser mayor a 0"),
  id_area: z.string().nonempty("Debes seleccionar un área"),
  id_cat: z.string().nonempty("Debes seleccionar una categoría"),
  id_proveedor: z.string().nonempty("Debes seleccionar un proveedor"),
});
export const UpdateProductoSchema = z.object({
  sku: z.string().trim().min(4, "El SKU es obligatorio (mín. 4 caracteres)"),
  codEan: z
    .string()
    .trim()
    .min(13, "El EAN es obligatorio (mín. 13 caracteres)"),
  nombre_producto: z
    .string()
    .trim()
    .min(4, "El nombre es obligatorio (mín. 4 caracteres)"),
  marca: z.string().trim().min(2, "La marca es obligatoria"),
  uni_medida: z.string().trim().min(1, "La unidad de medida es obligatoria"),
  precio_venta: z.coerce
    .number()
    .positive("El precio de venta debe ser positivo"),
  precio_compra: z.coerce
    .number()
    .positive("El precio de compra debe ser positivo"),
  stockMinimo: z.coerce
    .number()
    .int()
    .nonnegative("El stock mínimo no puede ser negativo"),
  stockIdeal: z.coerce
    .number()
    .int()
    .positive("El stock ideal debe ser mayor a 0"),
  id_area: z.coerce.string().min(1, "Debes seleccionar un área"),
  id_cat: z.coerce.string().min(1, "Debes seleccionar una categoría"),
  id_proveedor: z.coerce.string().min(1, "Debes seleccionar un proveedor"),
});
