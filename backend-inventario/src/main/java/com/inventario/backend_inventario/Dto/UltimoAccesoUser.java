package com.inventario.backend_inventario.Dto;

import java.time.LocalDateTime;

public interface UltimoAccesoUser {
    String getNombreCompleto();
    String getRol();
    LocalDateTime getUltimaFecha();
}
