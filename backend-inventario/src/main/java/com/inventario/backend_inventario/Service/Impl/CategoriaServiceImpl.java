package com.inventario.backend_inventario.Service.Impl;

import com.inventario.backend_inventario.Dto.AreaDto;
import com.inventario.backend_inventario.Dto.CategoriaDto;
import com.inventario.backend_inventario.Exception.ResourceConflictException;
import com.inventario.backend_inventario.Model.Categoria;
import com.inventario.backend_inventario.Model.Usuario;
import com.inventario.backend_inventario.Repository.CategoriaRepository;
import com.inventario.backend_inventario.Repository.UsuarioRepository;
import com.inventario.backend_inventario.Repository.AreaRepository;
import com.inventario.backend_inventario.Service.CategoriaService;
import com.inventario.backend_inventario.Service.HistorialActividadService;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoriaServiceImpl implements CategoriaService {
    @Autowired
    private CategoriaRepository categoriaRepository;
    @Autowired
    private HistorialActividadService historialActividadService;
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AreaRepository areaRepository;

    @Override
    public List<Categoria> listarCategorias() {
        return categoriaRepository.findAll();
    }

    @Override
    public Optional<Categoria> obtenerPorId(Integer id) {
        return categoriaRepository.findById(id);
    }

    @Override
    public Categoria registrarCategoria(Categoria categoria) {
        if (categoriaRepository.existsByNombreCat(categoria.getNombreCat())) {
            throw new IllegalArgumentException("La categoría ya está registrada");
        }
        areaRepository.findById(categoria.getArea().getId_area())
                .orElseThrow(() -> new EntityNotFoundException("Área asociada no encontrada"));

        Categoria categoriaGuardada = categoriaRepository.save(categoria);
        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Creó la categoría '" + categoriaGuardada.getNombreCat() + "' (ID: " + categoriaGuardada.getId_cat() + ").";

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "CREACIÓN", descripcion, "PRODUCTO", "Categoría", Long.valueOf(categoriaGuardada.getId_cat()), "Categoría creada con nombre: " + categoriaGuardada.getNombreCat());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }
        return categoriaGuardada;
    }

    @Override
    public Categoria actualizarCategoria(Integer id, Categoria categoria) {
        Categoria existente = categoriaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Categoría no encontrada"));

        existente.setNombreCat(categoria.getNombreCat());
        existente.setArea(categoria.getArea());
        Categoria categoriaGuardada = categoriaRepository.save(existente);
        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Actualizó la categoría '" + categoriaGuardada.getNombreCat() + "' (ID: " + categoriaGuardada.getId_cat() + ").";

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "ACTUALIZACIÓN", descripcion , "PRODUCTO", "Categoría", Long.valueOf(categoriaGuardada.getId_cat()), "Categoría actualizada con nombre: " + categoriaGuardada.getNombreCat());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }
        return categoriaGuardada;
    }

    @Override
    public void eliminarCategoria(Integer id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Categoría no encontrada con el ID: " + id));

        if (categoria.getProductos() != null && !categoria.getProductos().isEmpty()) {
            throw new ResourceConflictException("No se puede eliminar la categoría porque tiene productos asociados.");
        }
        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Eliminó la categoría '" + categoria.getNombreCat() + "' (ID: " + categoria.getId_cat() + ").";

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "ELIMINACIÓN", descripcion , "PRODUCTO", "Categoría", Long.valueOf(categoria.getId_cat()), "Categoría eliminada con nombre: " + categoria.getNombreCat());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }
        categoriaRepository.delete(categoria);
    }
    public List<CategoriaDto> convertirEntidadesADto(List<Categoria> categorias) {
        return categorias.stream()
                .map(this::convertirEntidadADto)
                .collect(Collectors.toList());
    }
    private CategoriaDto convertirEntidadADto(Categoria categoria) {
        CategoriaDto categoriaDto = new CategoriaDto();
        categoriaDto.setId_cat(categoria.getId_cat());
        categoriaDto.setNombreCat(categoria.getNombreCat());

        if (categoria.getArea() != null) {

            AreaDto areaDto = new AreaDto();
            areaDto.setId_area(categoria.getArea().getId_area());
            areaDto.setNombreArea(categoria.getArea().getNombreArea());
            
            categoriaDto.setArea(areaDto);
        }

        return categoriaDto;
    }
}
