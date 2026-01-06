package com.inventario.backend_inventario.Dto;
import lombok.*;
@Data
public class CategoriaDto {
    private Integer id_cat;
    private String nombreCat;
    private AreaDto area;
}
