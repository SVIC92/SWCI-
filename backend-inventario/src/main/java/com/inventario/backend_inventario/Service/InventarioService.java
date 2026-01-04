// Ubicación: src/main/java/com/inventario/backend_inventario/Service/InventarioService.java

package com.inventario.backend_inventario.Service;

import com.inventario.backend_inventario.Dto.InventarioActualDto;
import com.inventario.backend_inventario.Dto.MovimientoDto; // El DTO que creamos antes
import com.inventario.backend_inventario.Dto.MovimientoInventarioDto;

import java.util.List;

public interface InventarioService {

    List<MovimientoInventarioDto> listarMovimientos();
    List<InventarioActualDto> listarInventarioActual();

    boolean verificarStock(Integer sedeId, Long productoId, Integer cantidad);
    
    void registrarMovimiento(Integer sedeId, Long productoId, String tipoMovimiento, Integer cantidad);
    void registrarRecepcion(MovimientoDto movimientoDto);
}