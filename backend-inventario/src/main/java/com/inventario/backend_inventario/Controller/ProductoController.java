package com.inventario.backend_inventario.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inventario.backend_inventario.Dto.ProductoDto;
import com.inventario.backend_inventario.Dto.SugerenciaCompraDto;
import com.inventario.backend_inventario.Model.Producto;
import com.inventario.backend_inventario.Service.ProductoService;
import com.inventario.backend_inventario.Service.Impl.ProductoServiceImpl;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {
    @Autowired
    private ProductoService productoService;

    @Autowired
    private ProductoServiceImpl productoServiceImpl;

    @GetMapping
    public ResponseEntity<List<ProductoDto>> listarProductos() {
        List<Producto> productos = productoService.listarProductos();
        return ResponseEntity.ok(productoServiceImpl.convertirEntidadesADto(productos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerProductoPorId(@PathVariable Long id) {
        return productoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/registrar")
    public ResponseEntity<Producto> registrarProducto(@Valid @RequestBody Producto producto) {
        return ResponseEntity.ok(productoService.registrarProducto(producto));
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Producto> actualizarProducto(@PathVariable Long id, @Valid @RequestBody Producto producto) {
        return ResponseEntity.ok(productoService.actualizarProducto(id, producto));
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        productoService.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activar")
    public ResponseEntity<Producto> activarProducto(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.activarProducto(id));
    }

    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<Producto> desactivarProducto(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.desactivarProducto(id));
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Producto>> buscarProductosInteligente(@RequestParam("query") String query) {
        List<Producto> resultados = productoService.buscarSugerencias(query);
        return ResponseEntity.ok(resultados);
    }

    @GetMapping("/sugerencias/reabastecer")
    public ResponseEntity<List<SugerenciaCompraDto>> sugerirCompra(@RequestParam Long idSede) {
        return ResponseEntity.ok(productoService.obtenerSugerenciasReabastecimiento(idSede));
    }
}
