package com.inventario.backend_inventario.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inventario.backend_inventario.Model.Sede;
import com.inventario.backend_inventario.Service.SedeService;

@RestController
@RequestMapping("/api/sedes")
@CrossOrigin(origins = "*")
public class SedeController {
    @Autowired
    private SedeService sedeService;
    
    @GetMapping
    public List<Sede> obtenerSedes() {
        return sedeService.obtenerTodasLasSedes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sede> obtenerSedePorId(@PathVariable Integer id) {
        return sedeService.obtenerSedePorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/registrar")
    public Sede crearSede(@RequestBody Sede sede) {
        return sedeService.guardarSede(sede);
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Sede> actualizarSede(@PathVariable Integer id, @RequestBody Sede sedeDetalles) {
        try {
            Sede sedeActualizada = sedeService.actualizarSede(id, sedeDetalles);
            return ResponseEntity.ok(sedeActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminarSede(@PathVariable Integer id) {
        try {
            sedeService.eliminarSede(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
