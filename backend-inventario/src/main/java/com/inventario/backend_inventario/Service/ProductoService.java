package com.inventario.backend_inventario.Service;

import java.util.List;
import java.util.Optional;

import com.inventario.backend_inventario.Dto.SugerenciaCompraDto;
import com.inventario.backend_inventario.Model.Producto;

public interface ProductoService {
    List<Producto> listarProductos();
    Optional<Producto> obtenerPorId(Long id);
    Producto registrarProducto(Producto producto);
    Producto actualizarProducto(Long id, Producto producto);
    void eliminarProducto(Long id);
    Producto activarProducto(Long id);
    Producto desactivarProducto(Long id);
    List<Producto> buscarSugerencias(String termino);
    List<SugerenciaCompraDto> obtenerSugerenciasReabastecimiento(Long idSede);
}
