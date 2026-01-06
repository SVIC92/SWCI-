package com.inventario.backend_inventario.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inventario.backend_inventario.Dto.CategoriaDto;
import com.inventario.backend_inventario.Model.Categoria;
import com.inventario.backend_inventario.Service.CategoriaService;
import com.inventario.backend_inventario.Service.Impl.CategoriaServiceImpl;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*")
public class CategoriaController {
    @Autowired
    private CategoriaService categoriaService;
    @Autowired
    private CategoriaServiceImpl categoriaServiceImpl;

    @GetMapping
    public ResponseEntity<List<CategoriaDto>> listarCategorias() {
        List<Categoria> categorias = categoriaServiceImpl.listarCategorias();
        List<CategoriaDto> categoriasDto = categoriaServiceImpl.convertirEntidadesADto(categorias);
        return ResponseEntity.ok(categoriasDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Categoria> obtenerCategoriaPorId(@PathVariable Integer id) {
        return categoriaService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/registrar")
    public ResponseEntity<Categoria> registrarCategoria(@Valid @RequestBody Categoria categoria) {
        return ResponseEntity.ok(categoriaService.registrarCategoria(categoria));
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Categoria> actualizarCategoria(@PathVariable Integer id, @Valid @RequestBody Categoria categoria) {
        return ResponseEntity.ok(categoriaService.actualizarCategoria(id, categoria));
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminarCategoria(@PathVariable Integer id) {
        categoriaService.eliminarCategoria(id);
        return ResponseEntity.noContent().build();
    }
}
