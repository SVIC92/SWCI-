package com.inventario.backend_inventario.Service.Impl;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.inventario.backend_inventario.Dto.UsuarioUpdateDto;
import com.inventario.backend_inventario.Exception.ResourceConflictException;
import com.inventario.backend_inventario.Model.Rol;
import com.inventario.backend_inventario.Model.Usuario;
import com.inventario.backend_inventario.Repository.RolRepository;
import com.inventario.backend_inventario.Repository.UsuarioRepository;
import com.inventario.backend_inventario.Service.HistorialActividadService;
import com.inventario.backend_inventario.Service.UsuarioService;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {
    private final UsuarioRepository userRepo;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    @Autowired
    private HistorialActividadService historialActividadService;

    @Override
    public List<Usuario> listarUsuarios() { return userRepo.findAll(); }

    @Override
    public Optional<Usuario> obtenerUsuarioPorId(Integer id) { return userRepo.findById(id); }

    @Override
    public Usuario crearUsuario(Usuario usuario) {
        if (existeEmail(usuario.getEmail())) {
            throw new ResourceConflictException("El email ya está en uso");
        }
        if (existeDni(usuario.getDni())) {
            throw new ResourceConflictException("El DNI ya está registrado");
        }
        String passwordPlano = usuario.getPassword(); 
        
        String passwordEncriptado = passwordEncoder.encode(passwordPlano);
        
        usuario.setPass(passwordEncriptado);
        
        Usuario usuarioGuardado = userRepo.save(usuario);

        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
            Optional<Usuario> usuarioActual = userRepo.findByEmail(emailUsuario);

            String descripcion = "Creó el usuario '" + usuarioGuardado.getNombre_u() + "' (ID: " + usuarioGuardado.getId_u() + ").";

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "CREACIÓN", descripcion, "USUARIO", "Usuario", usuarioGuardado.getId_u().longValue(), "Usuario creado con nombre: " + usuarioGuardado.getNombre_u());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }
        return usuarioGuardado;
    }

    @Override
    public Usuario actualizarUsuario(Integer id, UsuarioUpdateDto usuarioUpdateDto) {
        return userRepo.findById(id).map(uDB -> {
            if (usuarioUpdateDto.getEmail() != null && existeEmailEnOtroUsuario(usuarioUpdateDto.getEmail(), id)) {
                throw new ResourceConflictException("El email ya está en uso");
            }
            uDB.setNombre_u(usuarioUpdateDto.getNombre_u());
            uDB.setApellido_pat(usuarioUpdateDto.getApellido_pat());
            uDB.setApellido_mat(usuarioUpdateDto.getApellido_mat());
            uDB.setTelefono(usuarioUpdateDto.getTelefono());
            uDB.setEmail(usuarioUpdateDto.getEmail());

            Rol rol = rolRepository.findById(usuarioUpdateDto.getRol().getId_rol())
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
            uDB.setRol(rol);
            Usuario usuarioGuardado = userRepo.save(uDB);

            try {
                String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
                Optional<Usuario> usuarioActual = userRepo.findByEmail(emailUsuario);

                String descripcion = "Actualizó el usuario '" + usuarioGuardado.getNombre_u() + "' (ID: " + usuarioGuardado.getId_u() + ").";

                usuarioActual.ifPresent(u -> {
                    historialActividadService.registrarActividad(u, "ACTUALIZACIÓN", descripcion, "USUARIO", "Usuario", usuarioGuardado.getId_u().longValue(), "Nuevo nombre de usuario: " + usuarioGuardado.getNombre_u());
                });

            } catch (Exception e) {
                System.err.println("Error al registrar actividad: " + e.getMessage());
            }

            return usuarioGuardado;
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @Override
    public void eliminarUsuario(Integer id) { 
        Usuario usuarioGuardado = userRepo.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
            Optional<Usuario> usuarioActual = userRepo.findByEmail(emailUsuario);

            String descripcion = "Eliminó el usuario '" + usuarioGuardado.getNombre_u() + "' (ID: " + usuarioGuardado.getId_u() + ").";

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "ELIMINACIÓN", descripcion, "USUARIO", "Usuario", usuarioGuardado.getId_u().longValue(), "Usuario eliminado con nombre: " + usuarioGuardado.getNombre_u());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }
        userRepo.deleteById(id); 
    }

    @Override
    public Optional<Usuario> desactivarUsuario(Integer id) {
        Usuario usuarioGuardado = userRepo.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
            Optional<Usuario> usuarioActual = userRepo.findByEmail(emailUsuario);

            String descripcion = "Desactivó al usuario '" + usuarioGuardado.getNombre_u() + "' (ID: " + usuarioGuardado.getId_u() + ").";

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "DESACTIVACIÓN", descripcion, "USUARIO", "Usuario", usuarioGuardado.getId_u().longValue(), "Usuario desactivado con nombre: " + usuarioGuardado.getNombre_u());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }
        return userRepo.findById(id).map(usuario -> {
            usuario.setEstado_u(false);
            return userRepo.save(usuario);
        });
    }

    @Override
    public Optional<Usuario> activarUsuario(Integer id) {
        Usuario usuarioGuardado = userRepo.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
            Optional<Usuario> usuarioActual = userRepo.findByEmail(emailUsuario);

            String descripcion = "Activó al usuario '" + usuarioGuardado.getNombre_u() + "' (ID: " + usuarioGuardado.getId_u() + ").";

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "ACTIVACIÓN", descripcion, "USUARIO", "Usuario", usuarioGuardado.getId_u().longValue(), "Usuario activado con nombre: " + usuarioGuardado.getNombre_u());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }
        return userRepo.findById(id).map(usuario -> {
            usuario.setEstado_u(true);
            return userRepo.save(usuario);
        });
    }

    @Override
    public boolean existeEmail(String email) {
        return userRepo.findByEmail(email).isPresent();
    }

    @Override
    public boolean existeEmailEnOtroUsuario(String email, Integer id) {
        return userRepo.findByEmail(email)
                .map(u -> !u.getId_u().equals(id))
                .orElse(false);
    }
    @Override
    public boolean existeDni(String dni) {
        return userRepo.findByDni(dni).isPresent();
    }
}
