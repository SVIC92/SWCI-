package com.inventario.backend_inventario.Service.Impl;
import com.inventario.backend_inventario.Model.Area;
import com.inventario.backend_inventario.Model.Usuario;
import com.inventario.backend_inventario.Repository.AreaRepository;
import com.inventario.backend_inventario.Repository.UsuarioRepository;
import com.inventario.backend_inventario.Service.AreaService;
import com.inventario.backend_inventario.Service.HistorialActividadService;
import com.inventario.backend_inventario.Exception.ResourceConflictException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class AreaServiceImpl implements AreaService {

    @Autowired
    private AreaRepository areaRepository;
    @Autowired
    private HistorialActividadService historialActividadService;
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public List<Area> listarAreas() {
        return areaRepository.findAll();
    }

    @Override
    public Optional<Area> obtenerPorId(Integer id) {
        return areaRepository.findById(id);
    }

    @Override
    public Area registrarArea(Area area) {
        if (areaRepository.existsByNombreArea(area.getNombreArea())) {
            throw new IllegalArgumentException("El nombre del área ya está registrado");
        }
        Area areaGuardada = areaRepository.save(area);
        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Creó el área '" + areaGuardada.getNombreArea() + "' (ID: " + areaGuardada.getId_area() + ").";

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "CREACIÓN", descripcion, "PRODUCTO", "Área", Long.valueOf(areaGuardada.getId_area()), "Area creada con nombre: " + areaGuardada.getNombreArea());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }
        return areaGuardada;
    }

    @Override
    public Area actualizarArea(Integer id, Area area) {
        Area existente = areaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Área no encontrada"));
        existente.setNombreArea(area.getNombreArea());
        Area areaGuardada = areaRepository.save(existente);
        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Actualizó el área '" + areaGuardada.getNombreArea() + "' (ID: " + areaGuardada.getId_area() + ").";

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "ACTUALIZACIÓN", descripcion, "PRODUCTO", "Área", Long.valueOf(areaGuardada.getId_area()), "Area actualizada con nombre: " + areaGuardada.getNombreArea());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }
        return areaGuardada;
    }

    @Override
    public void eliminarArea(Integer id) {
        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Área no encontrada con el ID: " + id));

        if (area.getCategorias() != null && !area.getCategorias().isEmpty()) {
            throw new ResourceConflictException("No se puede eliminar el área porque tiene categorías asociadas.");
        }

        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Eliminó el área '" + area.getNombreArea() + "' (ID: " + area.getId_area() + ").";

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "ELIMINACIÓN", descripcion, "PRODUCTO", "Área", Long.valueOf(area.getId_area()), "Area eliminada con nombre: " + area.getNombreArea());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }

        areaRepository.delete(area);
    }
}
