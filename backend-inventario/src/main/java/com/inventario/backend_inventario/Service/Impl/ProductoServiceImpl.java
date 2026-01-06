package com.inventario.backend_inventario.Service.Impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.inventario.backend_inventario.Dto.CategoriaDto;
import com.inventario.backend_inventario.Dto.ProductoDto;
import com.inventario.backend_inventario.Dto.ProveedorDto;
import com.inventario.backend_inventario.Dto.SugerenciaCompraDto;
import com.inventario.backend_inventario.Model.Producto;
import com.inventario.backend_inventario.Model.Usuario;
import com.inventario.backend_inventario.Repository.CategoriaRepository;
import com.inventario.backend_inventario.Repository.ProductoRepository;
import com.inventario.backend_inventario.Repository.ProveedorRepository;
import com.inventario.backend_inventario.Repository.UsuarioRepository;
import com.inventario.backend_inventario.Service.HistorialActividadService;
import com.inventario.backend_inventario.Service.ProductoService;

import jakarta.persistence.EntityNotFoundException;

@Service
public class ProductoServiceImpl implements ProductoService {
    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProveedorRepository proveedorRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private HistorialActividadService historialActividadService;

    @Override
    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    @Override
    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findById(id);
    }

    @Override
    public Producto registrarProducto(Producto producto) {
        if (productoRepository.existsBySku(producto.getSku())) {
            throw new IllegalArgumentException("El SKU ya está registrado");
        }
        if (productoRepository.existsByCodEan(producto.getCodEan())) {
            throw new IllegalArgumentException("El código EAN ya está registrado");
        }
        categoriaRepository.findById(producto.getCategoria().getId_cat())
                .orElseThrow(() -> new EntityNotFoundException("Categoría no encontrada"));
        proveedorRepository.findById(producto.getProveedor().getId_proveedor())
                .orElseThrow(() -> new EntityNotFoundException("Proveedor no encontrado"));

        Producto productoGuardado = productoRepository.save(producto);

        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                    .getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Creó el producto '" + productoGuardado.getNombre() + "' (ID: "
                    + productoGuardado.getId_producto() + ").";

            usuarioActual.ifPresent(usuario -> {
                historialActividadService.registrarActividad(usuario, "CREACIÓN", descripcion, "PRODUCTO", "Producto",
                        Long.valueOf(productoGuardado.getId_producto()),
                        "Producto creado con nombre: " + productoGuardado.getNombre());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }
        return productoGuardado;
    }

    @Override
    public Producto actualizarProducto(Long id, Producto producto) {
        Producto existente = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado"));
        existente.setSku(producto.getSku());
        existente.setCodEan(producto.getCodEan());
        existente.setNombre(producto.getNombre());
        existente.setMarca(producto.getMarca());
        existente.setUni_medida(producto.getUni_medida());
        existente.setPrecio_venta(producto.getPrecio_venta());
        existente.setPrecio_compra(producto.getPrecio_compra());
        existente.setStockMinimo(producto.getStockMinimo());
        existente.setStockIdeal(producto.getStockIdeal());
        existente.setCategoria(producto.getCategoria());
        existente.setProveedor(producto.getProveedor());

        Producto productoGuardado = productoRepository.save(existente);

        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                    .getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Actualizó el producto '" + productoGuardado.getNombre() + "' (ID: "
                    + productoGuardado.getId_producto() + ").";

            usuarioActual.ifPresent(usuario -> {
                historialActividadService.registrarActividad(usuario, "ACTUALIZACIÓN", descripcion, "PRODUCTO",
                        "Producto", Long.valueOf(productoGuardado.getId_producto()),
                        "Producto actualizado con nombre: " + productoGuardado.getNombre());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }

        return productoGuardado;
    }

    @Override
    public void eliminarProducto(Long id) {
        Producto productoGuardado = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado"));

        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                    .getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Eliminó el producto '" + productoGuardado.getNombre() + "' (ID: "
                    + productoGuardado.getId_producto() + ").";

            usuarioActual.ifPresent(usuario -> {
                historialActividadService.registrarActividad(usuario, "ELIMINACIÓN", descripcion, "PRODUCTO",
                        "Producto", Long.valueOf(productoGuardado.getId_producto()),
                        "Producto eliminado con nombre: " + productoGuardado.getNombre());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }
        productoRepository.deleteById(id);
    }

    @Override
    public Producto activarProducto(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado"));
        producto.setEstado(true);
        return productoRepository.save(producto);
    }

    @Override
    public Producto desactivarProducto(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado"));
        producto.setEstado(false);
        return productoRepository.save(producto);
    }

    @Override
    public List<Producto> buscarSugerencias(String termino) {
        if (termino == null || termino.trim().isEmpty()) {
            return List.of();
        }
        return productoRepository.buscarPorSimilitud(termino);
    }

    @Override
    public List<SugerenciaCompraDto> obtenerSugerenciasReabastecimiento(Long idSede) {
        if (idSede == null) {
            throw new IllegalArgumentException("El ID de la sede es obligatorio para calcular el reabastecimiento.");
        }
        return productoRepository.obtenerSugerenciasPorSede(idSede);
    }

    public List<ProductoDto> convertirEntidadesADto(List<Producto> productos) {
        return productos.stream()
                .map(this::convertirEntidadADto)
                .collect(Collectors.toList());
    }

    private ProductoDto convertirEntidadADto(Producto producto) {
        ProductoDto dto = new ProductoDto();
        dto.setId_producto(producto.getId_producto());
        dto.setSku(producto.getSku());
        dto.setCodEan(producto.getCodEan());
        dto.setNombre(producto.getNombre());
        dto.setMarca(producto.getMarca());
        dto.setUni_medida(producto.getUni_medida());
        dto.setPrecio_venta(producto.getPrecio_venta());
        dto.setPrecio_compra(producto.getPrecio_compra());
        dto.setStockMinimo(producto.getStockMinimo());
        dto.setStockIdeal(producto.getStockIdeal());
        dto.setEstado(producto.getEstado());

        if (producto.getCategoria() != null) {
            CategoriaDto catDto = new CategoriaDto();
            catDto.setId_cat(producto.getCategoria().getId_cat());
            catDto.setNombreCat(producto.getCategoria().getNombreCat());
            dto.setCategoria(catDto);
        }

        if (producto.getProveedor() != null) {
            ProveedorDto provDto = new ProveedorDto();
            provDto.setId_proveedor(producto.getProveedor().getId_proveedor());
            provDto.setNombre_proveedor(producto.getProveedor().getNombre_proveedor());
            dto.setProveedor(provDto);
        }
        return dto;
    }
}
