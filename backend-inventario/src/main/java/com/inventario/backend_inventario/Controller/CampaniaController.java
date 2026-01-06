package com.inventario.backend_inventario.Controller;

import com.inventario.backend_inventario.Exception.ResourceConflictException;
import com.inventario.backend_inventario.Model.Campania;
import com.inventario.backend_inventario.Service.CampaniaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/campanias")
@CrossOrigin(origins = "*")
public class CampaniaController {

    @Autowired
    private CampaniaService campaniaService;

    @GetMapping
    public ResponseEntity<List<Campania>> listarTodas() {
        List<Campania> campanias = campaniaService.obtenerTodas();
        return ResponseEntity.ok(campanias);
    }

    @GetMapping("/activas")
    public ResponseEntity<List<Campania>> listarCampaniasActivas() {
        List<Campania> campanias = campaniaService.obtenerCampaniasRelevantes();
        return ResponseEntity.ok(campanias);
    }

    @PostMapping
    public ResponseEntity<?> crearCampania(@RequestBody Campania campania) {
        try {
            Campania nuevaCampania = campaniaService.crear(campania);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCampania);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));

        } catch (ResourceConflictException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error interno al crear la campaña", "error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarCampania(@PathVariable Integer id, @RequestBody Campania campania) {
        try {
            Campania campaniaActualizada = campaniaService.actualizar(id, campania);
            return ResponseEntity.ok(campaniaActualizada);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));

        } catch (ResourceConflictException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error al actualizar la campaña", "error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCampania(@PathVariable Integer id) {
        try {
            campaniaService.eliminar(id);
            return ResponseEntity.ok(Map.of("message", "Campaña eliminada correctamente"));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error al eliminar la campaña", "error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/productos")
    public ResponseEntity<?> asignarProductos(@PathVariable Integer id, @RequestBody List<Long> productoIds) {
        try {
            campaniaService.asignarProductos(id, productoIds);
            return ResponseEntity.ok(Map.of("message", "Productos asignados correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}