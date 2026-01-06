package com.inventario.backend_inventario.Service;

import com.inventario.backend_inventario.Model.Campania;
import java.util.List;

public interface CampaniaService {
    List<Campania> obtenerCampaniasRelevantes();
    String obtenerEstadoAlerta(Campania campania);
    Campania guardar(Campania campania);
    void asignarProductos(Integer campaniaId, List<Long> productoIds);
}
