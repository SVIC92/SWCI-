package com.inventario.backend_inventario.Dto;

import com.inventario.backend_inventario.Enum.DestinoDevolucion;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class SolicitudDevolucionRequestDto {

    @NotNull(message = "La sede que devuelve es obligatoria")
    private Integer sedeOrigenId;

    @NotNull(message = "El tipo de destino es obligatorio")
    private DestinoDevolucion tipoDestino;

    /** Obligatorio si tipoDestino = SEDE */
    private Integer sedeDestinoId;

    /** Obligatorio si tipoDestino = PROVEEDOR */
    private Integer proveedorId;

    private String referencia;

    @Valid
    @NotEmpty(message = "La lista de productos no puede estar vacía")
    private List<Item> items;

    @Data
    public static class Item {
        @NotNull(message = "El ID del producto es obligatorio")
        private Long productoId;

        @NotNull(message = "La cantidad es obligatoria")
        @Positive(message = "La cantidad debe ser mayor a 0")
        private Integer cantidad;

        @NotBlank(message = "El motivo de la devolución es obligatorio")
        private String motivo;
    }
}
