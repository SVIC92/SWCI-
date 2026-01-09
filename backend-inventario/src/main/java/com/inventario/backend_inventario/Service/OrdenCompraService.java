package com.inventario.backend_inventario.Service;

import com.inventario.backend_inventario.Enum.EstadoOC;
import com.inventario.backend_inventario.Model.OrdenCompra;
import com.inventario.backend_inventario.Dto.RecepcionOrdenDto;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface OrdenCompraService {
    List<OrdenCompra> generarOrdenesMasivas(List<Map<String, Object>> itemsSolicitados, Integer idUsuario, Integer idSede);
    List<OrdenCompra> listarTodas();
    List<OrdenCompra> listarPorEstado(EstadoOC estado);
    OrdenCompra obtenerPorId(Long id);
    Optional<OrdenCompra> buscarPorCodigo(String codigo);
    void enviarOrdenPorCorreo(Long idOrden);
    void procesarIngresoMercaderia(RecepcionOrdenDto recepcionDto, Integer idUsuarioOperador);
}