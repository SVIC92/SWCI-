package com.inventario.backend_inventario.Dto;

import lombok.Data;
import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;

@Data
public class MermaMasivaDto {

    @NotNull(message = "El ID de la sede es obligatorio")
    private Integer sedeId;

    @NotEmpty(message = "La lista de productos no puede estar vacía")
    private List<DetalleItem> detalles;

    @Data
    public static class DetalleItem {
        @NotNull(message = "El ID del producto es obligatorio")
        private Long productoId;

        @NotNull(message = "La cantidad es obligatoria")
        @Positive(message = "La cantidad debe ser mayor a 0")
        private Integer cantidad;

        @NotBlank(message = "El motivo de la merma es obligatorio")
        private String motivo;

        private String observacion;
    }
}
