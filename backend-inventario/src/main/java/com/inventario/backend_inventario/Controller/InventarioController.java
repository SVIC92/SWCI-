
package com.inventario.backend_inventario.Controller;

import com.inventario.backend_inventario.Dto.InventarioActualDto;
import com.inventario.backend_inventario.Exception.ImportacionVentasException;
import org.springframework.web.multipart.MultipartFile;
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




    /** POST /api/inventario/ventas/importar  (multipart: sedeId + archivo CSV "sku,cantidad") */
    @PostMapping(value = "/ventas/importar", consumes = "multipart/form-data")
    public ResponseEntity<?> importarVentas(@RequestParam("sedeId") Integer sedeId,
                                            @RequestParam("archivo") MultipartFile archivo) {
        try {
            return ResponseEntity.ok(inventarioService.importarVentas(sedeId, archivo));
        } catch (ImportacionVentasException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage(), "errores", e.getErrores()));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "No se pudo importar el archivo de ventas. Inténtalo nuevamente."));
        }
    }

    /** GET /api/inventario/sede/{sedeId} : productos asociados a la sede con su stock */
    @GetMapping("/sede/{sedeId}")
    public ResponseEntity<?> listarInventarioPorSede(@PathVariable Integer sedeId) {
        try {
            return ResponseEntity.ok(inventarioService.listarInventarioPorSede(sedeId));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    /** POST /api/inventario/sede/{sedeId}/asociar  body: { "productoIds": [1,2,3] } */
    @PostMapping("/sede/{sedeId}/asociar")
    public ResponseEntity<?> asociarProductos(@PathVariable Integer sedeId, @RequestBody Map<String, List<Long>> body) {
        List<Long> ids = body.get("productoIds");
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Selecciona al menos un producto"));
        }
        try {
            int nuevos = inventarioService.asociarProductosASede(sedeId, ids);
            return ResponseEntity.ok(Map.of("asociados", nuevos, "message",
                    nuevos + " producto(s) asociado(s) a la sede" + (nuevos < ids.size() ? " (el resto ya estaba asociado)" : "")));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    /** DELETE /api/inventario/sede/{sedeId}/producto/{productoId} : solo si el stock es 0 */
    @DeleteMapping("/sede/{sedeId}/producto/{productoId}")
    public ResponseEntity<?> desasociarProducto(@PathVariable Integer sedeId, @PathVariable Long productoId) {
        try {
            inventarioService.desasociarProductoDeSede(sedeId, productoId);
            return ResponseEntity.ok(Map.of("message", "Producto quitado de la sede"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
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