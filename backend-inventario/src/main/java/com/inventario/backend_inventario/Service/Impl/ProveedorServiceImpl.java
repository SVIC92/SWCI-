package com.inventario.backend_inventario.Service.Impl;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.inventario.backend_inventario.Exception.ResourceConflictException;
import com.inventario.backend_inventario.Model.Proveedor;
import com.inventario.backend_inventario.Model.Usuario;
import com.inventario.backend_inventario.Repository.ProveedorRepository;
import com.inventario.backend_inventario.Repository.UsuarioRepository;
import com.inventario.backend_inventario.Service.HistorialActividadService;
import com.inventario.backend_inventario.Service.ProveedorService;

import jakarta.persistence.EntityNotFoundException;

@Service
public class ProveedorServiceImpl implements ProveedorService{
    @Autowired
    private ProveedorRepository proveedorRepository;
    @Autowired
    private HistorialActividadService historialActividadService;
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public List<Proveedor> listarProveedores() {
        return proveedorRepository.findAll();
    }

    @Override
    public Optional<Proveedor> obtenerPorId(Integer id) {
        return proveedorRepository.findById(id);
    }

    @Override
    public Proveedor registrarProveedor(Proveedor proveedor) {
        proveedorRepository.findByRuc(proveedor.getRuc()).ifPresent(p -> {
            throw new ResourceConflictException("El RUC '" + proveedor.getRuc() + "' ya está registrado.");
        });
        proveedorRepository.findByEmail(proveedor.getEmail()).ifPresent(p -> {
            throw new ResourceConflictException("El email '" + proveedor.getEmail() + "' ya está registrado.");
        });
        Proveedor proveedorGuardado = proveedorRepository.save(proveedor);
        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Creó el proveedor '" + proveedorGuardado.getNombre_proveedor() + "' (ID: " + proveedorGuardado.getId_proveedor() + ").";

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "CREACIÓN", descripcion, "PROVEEDOR", "Proveedor", proveedorGuardado.getId_proveedor().longValue(), "Proveedor creado con nombre: " + proveedorGuardado.getNombre_proveedor());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }
        return proveedorGuardado;
    }

    @Override
    public Proveedor actualizarProveedor(Integer id, Proveedor proveedor) {
        Proveedor existente = proveedorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Proveedor no encontrado con el ID: " + id));

        proveedorRepository.findByRuc(proveedor.getRuc()).ifPresent(p -> {
            if (!p.getId_proveedor().equals(id)) {
                throw new ResourceConflictException("El RUC '" + proveedor.getRuc() + "' ya pertenece a otro proveedor.");
            }
        });
        proveedorRepository.findByEmail(proveedor.getEmail()).ifPresent(p -> {
            if (!p.getId_proveedor().equals(id)) {
                throw new ResourceConflictException("El email '" + proveedor.getEmail() + "' ya pertenece a otro proveedor.");
            }
        });

        existente.setNombre_proveedor(proveedor.getNombre_proveedor());
        existente.setRuc(proveedor.getRuc());
        existente.setEmail(proveedor.getEmail());
        existente.setTelefono(proveedor.getTelefono());
        existente.setDireccion(proveedor.getDireccion());

        Proveedor proveedorGuardado = proveedorRepository.save(existente);
        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Actualizó el proveedor '" + proveedorGuardado.getNombre_proveedor() + "' (ID: " + proveedorGuardado.getId_proveedor() + ").";

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "ACTUALIZACIÓN", descripcion, "PROVEEDOR", "Proveedor", proveedorGuardado.getId_proveedor().longValue(), "Proveedor actualizado con nombre: " + proveedorGuardado.getNombre_proveedor());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }

        return proveedorGuardado;
    }

    @Override
    public void eliminarProveedor(Integer id) {
        if (!proveedorRepository.existsById(id)) {
            throw new EntityNotFoundException("Proveedor no encontrado con el ID: " + id);
        }

        Proveedor proveedorGuardado = proveedorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Proveedor no encontrado con el ID: " + id));

        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Eliminó el proveedor '" + proveedorGuardado.getNombre_proveedor() + "' (ID: " + proveedorGuardado.getId_proveedor() + ").";

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "ELIMINACIÓN", descripcion, "PROVEEDOR", "Proveedor", proveedorGuardado.getId_proveedor().longValue(), "Proveedor eliminado con nombre: " + proveedorGuardado.getNombre_proveedor());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }

        proveedorRepository.deleteById(id);
    }
}
