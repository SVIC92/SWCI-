package com.inventario.backend_inventario.Service;

import com.inventario.backend_inventario.Model.Campania;
import java.util.List;
import java.util.Optional;

public interface CampaniaService {
    List<Campania> obtenerTodas();
    List<Campania> obtenerCampaniasRelevantes();
    Optional<Campania> obtenerPorId(Integer id);
    String obtenerEstadoAlerta(Campania campania);
    Campania crear(Campania campania);
    Campania actualizar(Integer id, Campania campaniaDetails);
    void eliminar(Integer id);
    void asignarProductos(Integer campaniaId, List<Long> productoIds);
}
