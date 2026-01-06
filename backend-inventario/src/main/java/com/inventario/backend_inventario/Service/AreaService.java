package com.inventario.backend_inventario.Service;

import java.util.List;
import java.util.Optional;
import com.inventario.backend_inventario.Model.Area;

public interface AreaService {
    List<Area> listarAreas();
    Optional<Area> obtenerPorId(Integer id);
    Area registrarArea(Area area);
    Area actualizarArea(Integer id, Area area);
    void eliminarArea(Integer id);
}
