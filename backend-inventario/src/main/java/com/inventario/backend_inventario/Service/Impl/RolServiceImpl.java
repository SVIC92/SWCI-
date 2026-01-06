package com.inventario.backend_inventario.Service.Impl;
import com.inventario.backend_inventario.Model.Rol;
import com.inventario.backend_inventario.Model.Usuario;
import com.inventario.backend_inventario.Repository.RolRepository;
import com.inventario.backend_inventario.Repository.UsuarioRepository;
import com.inventario.backend_inventario.Service.HistorialActividadService;
import com.inventario.backend_inventario.Service.RolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RolServiceImpl implements RolService {

    @Autowired
    private RolRepository rolRepository;
    @Autowired
    private HistorialActividadService historialActividadService;
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public List<Rol> listarRoles() {
        return rolRepository.findAll();
    }

    @Override
    public Optional<Rol> obtenerRolPorId(Integer id) {
        return rolRepository.findById(id);
    }

    @Override
    public Rol crearRol(Rol rol) {
        Rol rolGuardado = rolRepository.save(rol);
        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Creó el rol '" + rolGuardado.getNombreRol() + "' (ID: " + rolGuardado.getId_rol() + ").";

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "CREACIÓN", descripcion, "USUARIOS", "Rol", rolGuardado.getId_rol().longValue(), "Rol creado con nombre: " + rolGuardado.getNombreRol());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }
        return rolGuardado;
    }

    @Override
    public Rol actualizarRol(Integer id, Rol rolActualizado) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + id));
        rol.setNombreRol(rolActualizado.getNombreRol());
        Rol rolGuardado = rolRepository.save(rol);
        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Actualizó el rol '" + rolGuardado.getNombreRol() + "' (ID: " + rolGuardado.getId_rol() + ").";

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "ACTUALIZACIÓN", descripcion, "USUARIOS", "Rol", rolGuardado.getId_rol().longValue(), "Nuevo nombre de rol: " + rolGuardado.getNombreRol());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }
        return rolGuardado;
    }

    @Override
    public void eliminarRol(Integer id) {
        Rol rolGuardado = rolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + id));
        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Eliminó el rol '" + rolGuardado.getNombreRol() + "' (ID: " + rolGuardado.getId_rol() + ").";

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "ELIMINACIÓN", descripcion, "USUARIOS", "Rol", rolGuardado.getId_rol().longValue(), "Rol eliminado con nombre: " + rolGuardado.getNombreRol());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }
        rolRepository.deleteById(id);
    }
}