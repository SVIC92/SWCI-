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

    /** Productos asociados (con su stock) al inventario de una sede. */
    List<InventarioActualDto> listarInventarioPorSede(Integer sedeId);

    /** Asocia productos a una sede con stock inicial 0. Devuelve cuántos eran nuevos. */
    int asociarProductosASede(Integer sedeId, List<Long> productoIds);

    /** Quita un producto del inventario de una sede. Solo si su stock es 0. */
    void desasociarProductoDeSede(Integer sedeId, Long productoId);

    boolean verificarStock(Integer sedeId, Long productoId, Integer cantidad);

    void registrarMovimiento(Integer sedeId, Long productoId, String tipoMovimiento, Integer cantidad);

    /** Igual que el anterior, pero agrega un detalle legible (motivo, destino, etc.) a las observaciones del Kardex. */
    void registrarMovimiento(Integer sedeId, Long productoId, String tipoMovimiento, Integer cantidad, String detalle);
    void registrarRecepcion(RecepcionMasivaDto recepcionDto);
    void registrarMerma(MermaMasivaDto mermaDto);

    /**
     * Importa un CSV de ventas (sku,cantidad) y descuenta el stock de la sede como "Venta".
     * Es todo-o-nada: si alguna fila es inválida no se aplica ninguna.
     */
    com.inventario.backend_inventario.Dto.ResultadoImportacionVentasDto importarVentas(
            Integer sedeId, org.springframework.web.multipart.MultipartFile archivo);

    /**
     * Ajusta el stock de un producto en una sede al valor exacto encontrado en un conteo físico
     * aprobado, registrando la diferencia (positiva o negativa) en el Kardex como "Ajuste Conteo".
     */
    void registrarAjusteConteo(Integer sedeId, Long productoId, Integer stockContado);
}