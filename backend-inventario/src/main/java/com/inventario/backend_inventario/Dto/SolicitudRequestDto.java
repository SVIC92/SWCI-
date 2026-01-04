package com.inventario.backend_inventario.Dto;

import java.util.List;
import lombok.Data;

@Data
public class SolicitudRequestDto {
    private Integer sedeOrigenId;
    private Integer sedeDestinoId;
    private List<ItemSolicitud> items;

    @Data
    public static class ItemSolicitud {
        private Long productoId;
        private Integer cantidad;
    }
}
