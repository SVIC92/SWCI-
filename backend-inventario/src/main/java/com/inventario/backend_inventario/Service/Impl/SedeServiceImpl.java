package com.inventario.backend_inventario.Service.Impl;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.inventario.backend_inventario.Model.Sede;
import com.inventario.backend_inventario.Model.Usuario;
import com.inventario.backend_inventario.Repository.SedeRepository;
import com.inventario.backend_inventario.Repository.UsuarioRepository;
import com.inventario.backend_inventario.Service.HistorialActividadService;
import com.inventario.backend_inventario.Service.SedeService;

@Service
public class SedeServiceImpl implements SedeService {
    @Autowired
    private SedeRepository sedeRepository;
    @Autowired
    private HistorialActividadService historialActividadService;
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public List<Sede> obtenerTodasLasSedes() {
        return sedeRepository.findAll();
    }

    @Override
    public Optional<Sede> obtenerSedePorId(Integer id) {
        return sedeRepository.findById(id);
    }

    @Override
    public Sede guardarSede(Sede sede) {
        Sede sedeGuardada = sedeRepository.save(sede);

        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Creó la sede '" + sedeGuardada.getNombreSede() + "' (ID: " + sedeGuardada.getIdSede() + ").";

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "CREACIÓN", descripcion, "SEDES", "Sede", sedeGuardada.getIdSede().longValue(), "Sede creada con nombre: " + sedeGuardada.getNombreSede());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }
        return sedeGuardada;
    }

    @Override
    public Sede actualizarSede(Integer id, Sede sedeDetalles) {
        Sede sedeExistente = sedeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sede no encontrada con el ID: " + id));
        sedeExistente.setNombreSede(sedeDetalles.getNombreSede());
        sedeExistente.setDireccion(sedeDetalles.getDireccion());
        sedeExistente.setAnexo(sedeDetalles.getAnexo());
        Sede sedeGuardada = sedeRepository.save(sedeExistente);

        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Actualizó la sede '" + sedeGuardada.getNombreSede() + "' (ID: " + sedeGuardada.getIdSede() + ").";

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "ACTUALIZACIÓN", descripcion, "SEDES", "Sede", sedeGuardada.getIdSede().longValue(), "Nuevo nombre de sede: " + sedeGuardada.getNombreSede());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }
        return sedeGuardada;
    }

    @Override
    public void eliminarSede(Integer id) {
        if (!sedeRepository.existsById(id)) {
            throw new RuntimeException("Sede no encontrada con el ID: " + id);
        }
        Sede sedeGuardada = sedeRepository.findById(id).orElseThrow(() -> new RuntimeException("Sede no encontrada con el ID: " + id));

        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Eliminó la sede '" + sedeGuardada.getNombreSede() + "' (ID: " + sedeGuardada.getIdSede() + ").";

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "ELIMINACIÓN", descripcion, "SEDES", "Sede", sedeGuardada.getIdSede().longValue(), "Sede eliminada con nombre: " + sedeGuardada.getNombreSede());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }
        sedeRepository.deleteById(id);
    }
}
