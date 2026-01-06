package com.inventario.backend_inventario.Service;

import java.util.List;
import java.util.Optional;

import com.inventario.backend_inventario.Model.Proveedor;

public interface ProveedorService {
    List<Proveedor> listarProveedores();
    Optional<Proveedor> obtenerPorId(Integer id);
    Proveedor registrarProveedor(Proveedor proveedor);
    Proveedor actualizarProveedor(Integer id, Proveedor proveedor);
    void eliminarProveedor(Integer id);
}
