package com.inventario.backend_inventario.Dto;

import lombok.Data;
import java.util.List;

@Data
public class RecepcionOrdenDto {
    private Long idOrden;
    private List<DetalleRecepcion> detalles;

    @Data
    public static class DetalleRecepcion {
        private Long idProducto;
        private Integer cantidadRecibida;
    }
}