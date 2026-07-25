package com.inventario.backend_inventario.Dto;

import com.inventario.backend_inventario.Enum.AlcanceConteo;
import com.inventario.backend_inventario.Enum.TipoConteo;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class GenerarConteoRequestDto {

    @NotNull(message = "El ID de la sede es obligatorio")
    private Integer sedeId;

    @NotNull(message = "El tipo de conteo es obligatorio")
    private TipoConteo tipoConteo;

    @NotNull(message = "El alcance del conteo es obligatorio")
    private AlcanceConteo alcance;

    // Solo se usa cuando alcance = AREA
    private Integer areaId;

    // Solo se usa cuando alcance = CATEGORIA
    private Integer categoriaId;

    // Solo se usa cuando alcance = SUBCATEGORIA
    private Integer subcategoriaId;

    // Solo se usa cuando alcance = PRODUCTOS
    private List<Long> productoIds;
}
