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

    @Autowired
    private ProductoRepository productoRepository;

    @Override
    public List<Campania> obtenerTodas() {
        return campaniaRepository.findAll();
    }

    @Override
    public List<Campania> obtenerCampaniasRelevantes() {
        return campaniaRepository.findProximasYActivas(LocalDate.now());
    }

    @Override
    public Optional<Campania> obtenerPorId(Integer id) {
        return campaniaRepository.findById(id);
    }

    @Override
    public Campania crear(Campania campania) {
        validarFechas(campania);
        Optional<Campania> campaniaExistente = campaniaRepository
                .findByNombreCampaniaIgnoreCase(campania.getNombreCampania().trim());

        if (campaniaExistente.isPresent()) {
            throw new ResourceConflictException(
                    "Ya existe una campaña registrada con el nombre: " + campania.getNombreCampania());
        }
        campania.setId(null);
        return campaniaRepository.save(campania);
    }

    @Override
    public Campania actualizar(Integer id, Campania campaniaDetails) {
        Campania campaniaExistente = campaniaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se encontró la campaña con ID: " + id));
        validarFechas(campaniaDetails);

        Optional<Campania> nombreDuplicado = campaniaRepository
                .findByNombreCampaniaIgnoreCase(campaniaDetails.getNombreCampania().trim());

        if (nombreDuplicado.isPresent() && !nombreDuplicado.get().getId().equals(id)) {
            throw new ResourceConflictException(
                    "El nombre '" + campaniaDetails.getNombreCampania() + "' ya está en uso por otra campaña.");
        }
        campaniaExistente.setNombreCampania(campaniaDetails.getNombreCampania());
        campaniaExistente.setDescripcion(campaniaDetails.getDescripcion());
        campaniaExistente.setFechaInicio(campaniaDetails.getFechaInicio());
        campaniaExistente.setFechaFin(campaniaDetails.getFechaFin());

        return campaniaRepository.save(campaniaExistente);
    }

    @Override
    public void eliminar(Integer id) {
        if (!campaniaRepository.existsById(id)) {
            throw new RuntimeException("No se puede eliminar. La campaña con ID " + id + " no existe.");
        }
        campaniaRepository.deleteById(id);
    }

    private void validarFechas(Campania campania) {
        if (campania.getFechaInicio() != null && campania.getFechaFin() != null) {
            if (campania.getFechaFin().isBefore(campania.getFechaInicio())) {
                throw new IllegalArgumentException("La fecha de fin no puede ser anterior a la de inicio");
            }
        }
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
        List<Producto> productosSeleccionados = productoRepository.findAllById(productoIds);
        campania.setProductosAplicables(productosSeleccionados);
        campaniaRepository.save(campania);
    }
}