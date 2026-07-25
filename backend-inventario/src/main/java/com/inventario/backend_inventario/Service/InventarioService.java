// Ubicación: src/main/java/com/inventario/backend_inventario/Service/InventarioService.java

package com.inventario.backend_inventario.Service;

import com.inventario.backend_inventario.Dto.InventarioActualDto;
import com.inventario.backend_inventario.Dto.MermaMasivaDto;
import com.inventario.backend_inventario.Dto.MovimientoInventarioDto;
import com.inventario.backend_inventario.Dto.RecepcionMasivaDto;

import java.util.List;

public interface InventarioService {

    List<MovimientoInventarioDto> listarMovimientos();
    List<InventarioActualDto> listarInventarioActual();

    boolean verificarStock(Integer sedeId, Long productoId, Integer cantidad);

    void registrarMovimiento(Integer sedeId, Long productoId, String tipoMovimiento, Integer cantidad);
    void registrarRecepcion(RecepcionMasivaDto recepcionDto);
    void registrarMerma(MermaMasivaDto mermaDto);

    /**
     * Ajusta el stock de un producto en una sede al valor exacto encontrado en un conteo físico
     * aprobado, registrando la diferencia (positiva o negativa) en el Kardex como "Ajuste Conteo".
     */
    void registrarAjusteConteo(Integer sedeId, Long productoId, Integer stockContado);
}