// Ubicación: src/main/java/com/inventario/backend_inventario/Dto/MovimientoDto.java

package com.inventario.backend_inventario.Dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MovimientoDto {

    @NotNull(message = "El ID del producto no puede ser nulo")
    private Long productoId;

    @NotNull(message = "El ID de la sede de origen no puede ser nulo")
    private Integer sedeIdOrigen; // ID de la sede (o de origen en transferencias)

    // Es opcional, solo se usa para transferencias
    private Integer sedeIdDestino;

    @NotNull(message = "La cantidad no puede ser nula")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer cantidad;

    private String descripcion;

    // No necesitamos usuarioId, porque lo sacamos del Token de Seguridad
}