package com.inventario.backend_inventario.Service.Impl;

import com.inventario.backend_inventario.Exception.ResourceConflictException;
import com.inventario.backend_inventario.Model.Campania;
import com.inventario.backend_inventario.Model.Producto;
import com.inventario.backend_inventario.Repository.CampaniaRepository;
import com.inventario.backend_inventario.Repository.ProductoRepository;
import com.inventario.backend_inventario.Service.CampaniaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class CampaniaServiceImpl implements CampaniaService {

    @Autowired
    private CampaniaRepository campaniaRepository;
    private ProductoRepository productoRepository;

    @Override
    public List<Campania> obtenerCampaniasRelevantes() {
        return campaniaRepository.findProximasYActivas(LocalDate.now());
    }

    @Override
    public Campania guardar(Campania campania) {
        // 1. Validar Fechas (Tu lógica actual)
        if (campania.getFechaFin().isBefore(campania.getFechaInicio())) {
            throw new IllegalArgumentException("La fecha de fin no puede ser anterior a la de inicio");
        }

        // 2. Validar Nombre Duplicado
        // Buscamos si existe alguna campaña con ese nombre (ignorando mayúsculas)
        Optional<Campania> campaniaExistente = campaniaRepository
                .findByNombreCampaniaIgnoreCase(campania.getNombreCampania().trim());

        if (campaniaExistente.isPresent()) {
            // Lógica para diferenciar CREAR de ACTUALIZAR:

            // Si la campaña entrante NO tiene ID (es nueva) y encontramos una, es
            // duplicado.
            if (campania.getId() == null) {
                throw new ResourceConflictException(
                        "Ya existe una campaña registrada con el nombre: " + campania.getNombreCampania());
            }
            if (!campaniaExistente.get().getId().equals(campania.getId())) {
                throw new ResourceConflictException(
                        "El nombre '" + campania.getNombreCampania() + "' ya está en uso por otra campaña.");
            }
        }

        return campaniaRepository.save(campania);
    }

    @Override
    public String obtenerEstadoAlerta(Campania campania) {
        LocalDate hoy = LocalDate.now();
        if (campania.getFechaInicio() == null || campania.getFechaFin() == null)
            return "Sin fecha";

        long diasParaInicio = ChronoUnit.DAYS.between(hoy, campania.getFechaInicio());
        long diasParaFin = ChronoUnit.DAYS.between(hoy, campania.getFechaFin());

        if (diasParaInicio > 0 && diasParaInicio <= 5)
            return "¡Prepárate! Inicia en " + diasParaInicio + " días";
        if (diasParaInicio <= 0 && diasParaFin <= 3 && diasParaFin >= 0)
            return "¡Últimos días! Termina pronto";
        if (diasParaInicio <= 0 && diasParaFin >= 0)
            return "En curso";

        return "Próximamente";
    }
    @Override
    public void asignarProductos(Integer campaniaId, List<Long> productoIds) {
        Campania campania = campaniaRepository.findById(campaniaId)
                .orElseThrow(() -> new RuntimeException("Campaña no encontrada"));

        // Buscamos todos los productos cuyos IDs vengan en la lista
        List<Producto> productosSeleccionados = productoRepository.findAllById(productoIds);

        // Actualizamos la relación
        campania.setProductosAplicables(productosSeleccionados);
        campaniaRepository.save(campania);
    }
}
