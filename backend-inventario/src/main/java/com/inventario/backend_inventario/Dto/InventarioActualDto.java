// Ubicación: src/main/java/com/inventario/backend_inventario/Dto/InventarioActualDto.java

package com.inventario.backend_inventario.Dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InventarioActualDto {

    private Long idInventario;
    private String skuProducto;
    private String nombreProducto;
    private String nombreSede;
    private Integer stockActual;
    private LocalDateTime ultimaActualizacion;
}