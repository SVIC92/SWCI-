package com.inventario.backend_inventario.Dto;
import lombok.*;
@Data
public class ProductoDto {
    private Long id_producto;
    private String sku;
    private String codEan;
    private String nombre;
    private String marca;
    private String uni_medida;
    private Double precio_venta;
    private Double precio_compra;
    private Integer stockMinimo;
    private Integer stockIdeal;
    private Boolean estado;
    private CategoriaDto categoria;
    private ProveedorDto proveedor;
}
