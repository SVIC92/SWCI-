package com.inventario.backend_inventario.Service;

import java.util.List;
import java.util.Optional;

import com.inventario.backend_inventario.Model.Sede;

public interface SedeService {
    List<Sede> obtenerTodasLasSedes();
    List<Sede> obtenerTodosLosAlmacenes();
    Optional<Sede> obtenerSedePorId(Integer id);
    Sede guardarSede(Sede sede);
    Sede actualizarSede(Integer id, Sede sedeDetalles);
    void eliminarSede(Integer id);
}
