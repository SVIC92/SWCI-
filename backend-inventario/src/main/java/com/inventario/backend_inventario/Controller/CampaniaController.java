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
@CrossOrigin(origins = "*") // Ajusta según tu SecurityConfig si es necesario
public class CampaniaController {

    @Autowired
    private CampaniaService campaniaService;

    /**
     * Endpoint para listar campañas activas y futuras.
     * GET /api/campanias/activas
     */
    @GetMapping("/activas")
    public ResponseEntity<List<Campania>> listarCampaniasActivas() {
        List<Campania> campanias = campaniaService.obtenerCampaniasRelevantes();
        return ResponseEntity.ok(campanias);
    }

    /**
     * Endpoint para CREAR o ACTUALIZAR una campaña.
     * POST /api/campanias
     */
    @PostMapping
    public ResponseEntity<?> guardarCampania(@RequestBody Campania campania) {
        try {
            Campania nuevaCampania = campaniaService.guardar(campania);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCampania);
            
        } catch (IllegalArgumentException e) {
            // Error de validación de fechas (400 Bad Request)
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
            
        } catch (ResourceConflictException e) {
            // Error de nombre duplicado (409 Conflict)
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
            
        } catch (Exception e) {
            // Error general (500 Internal Server Error)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error interno al guardar la campaña", "error", e.getMessage()));
        }
    }
    @PostMapping("/{id}/productos")
    public ResponseEntity<?> asignarProductos(@PathVariable Integer id, @RequestBody List<Long> productoIds) {
        try {
            campaniaService.asignarProductos(id, productoIds);
            return ResponseEntity.ok(Map.of("message", "Productos asignados correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
