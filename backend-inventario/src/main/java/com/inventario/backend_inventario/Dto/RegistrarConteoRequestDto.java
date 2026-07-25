package com.inventario.backend_inventario.Dto;

import java.util.List;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class RegistrarConteoRequestDto {

    @NotEmpty(message = "La lista de conteos no puede estar vacía")
    private List<ItemConteo> detalles;

    @Data
    public static class ItemConteo {
        @NotNull(message = "El ID del detalle es obligatorio")
        private Long detalleId;

        @NotNull(message = "El stock contado es obligatorio")
        @PositiveOrZero(message = "El stock contado no puede ser negativo")
        private Integer stockContado;
    }
}
