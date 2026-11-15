package com.inventario.backend_inventario.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultadoImportacionVentasDto {
    private int filasProcesadas;
    private int productosAfectados;
    private int unidadesVendidas;
    private List<String> detalle;
}
