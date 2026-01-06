package com.inventario.backend_inventario.Service;

import com.inventario.backend_inventario.Model.Rol;
import java.util.List;
import java.util.Optional;

public interface RolService {
    List<Rol> listarRoles();
    Optional<Rol> obtenerRolPorId(Integer id);
    Rol crearRol(Rol rol);
    Rol actualizarRol(Integer id, Rol rol);
    void eliminarRol(Integer id);
}
