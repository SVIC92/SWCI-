
package com.inventario.backend_inventario.Controller;

import com.inventario.backend_inventario.Dto.InventarioActualDto;
import com.inventario.backend_inventario.Dto.MovimientoInventarioDto;
import com.inventario.backend_inventario.Dto.RecepcionMasivaDto;
import com.inventario.backend_inventario.Service.InventarioService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventario")
@CrossOrigin(origins = "*") // Tu frontend
public class InventarioController {

    @Autowired
    private InventarioService inventarioService;

    /**
     * Endpoint para registrar una nueva recepción de mercadería.
     * POST /api/inventario/recepcion
     */
    @PostMapping("/recepcion")
    public ResponseEntity<?> registrarRecepcion(@Valid @RequestBody RecepcionMasivaDto recepcionDto) {
        try {
            inventarioService.registrarRecepcion(recepcionDto);
            return ResponseEntity.ok(Map.of("message", "Recepción de múltiples productos registrada con éxito"));
        } catch (EntityNotFoundException e) {
            // Error si el Producto o Sede no existen
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            // Error genérico: no se expone el detalle técnico al cliente
            return ResponseEntity.status(500).body(Map.of("message", "No se pudo registrar la recepción. Inténtalo nuevamente."));
        }
    }




    @GetMapping("/movimientos")
    public ResponseEntity<List<MovimientoInventarioDto>> listarMovimientos() {
        try {
            // El servicio hará la magia de convertir las Entidades en DTOs
            List<MovimientoInventarioDto> movimientos = inventarioService.listarMovimientos();
            return ResponseEntity.ok(movimientos);
        } catch (Exception e) {
            // Puedes usar tu GlobalExceptionHandler, pero esto es un catch simple
            return ResponseEntity.status(500).body(null);
        }
    }


    @GetMapping("/stock")
    public ResponseEntity<List<InventarioActualDto>> listarInventarioActual() {
        // (El try/catch es opcional si ya tienes un GlobalExceptionHandler)
        try {
            List<InventarioActualDto> inventario = inventarioService.listarInventarioActual();
            return ResponseEntity.ok(inventario);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

}