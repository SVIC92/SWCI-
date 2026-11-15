package com.inventario.backend_inventario.Controller;

import com.inventario.backend_inventario.Dto.SolicitudDevolucionRequestDto;
import com.inventario.backend_inventario.Model.SolicitudDevolucion;
import com.inventario.backend_inventario.Model.Usuario;
import com.inventario.backend_inventario.Repository.SolicitudDevolucionRepository;
import com.inventario.backend_inventario.Repository.UsuarioRepository;
import com.inventario.backend_inventario.Service.SolicitudDevolucionService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/devolucion")
public class SolicitudDevolucionController {

    @Autowired private SolicitudDevolucionService devolucionService;
    @Autowired private SolicitudDevolucionRepository devolucionRepository;
    @Autowired private UsuarioRepository usuarioRepository;

    @PostMapping("/solicitar")
    public ResponseEntity<?> crearSolicitud(@Valid @RequestBody SolicitudDevolucionRequestDto dto) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Usuario usuario = usuarioRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
            return ResponseEntity.ok(devolucionService.crearSolicitud(dto, usuario.getId_u()));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/pendientes")
    public ResponseEntity<List<SolicitudDevolucion>> listarPendientes() {
        return ResponseEntity.ok(devolucionService.listarPendientes());
    }

    @GetMapping("/historial")
    public ResponseEntity<List<SolicitudDevolucion>> listarHistorial() {
        return ResponseEntity.ok(devolucionService.listarHistorial());
    }

    @PutMapping("/{id}/aprobar")
    public ResponseEntity<?> aprobar(@PathVariable Long id) {
        try {
            devolucionService.aprobarSolicitud(id);
            return ResponseEntity.ok(Map.of("message", "Devolución aprobada y ejecutada exitosamente"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/rechazar")
    public ResponseEntity<?> rechazar(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String motivo = payload.get("motivo");
        if (motivo == null || motivo.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El motivo es obligatorio para rechazar"));
        }
        try {
            devolucionService.rechazarSolicitud(id, motivo);
            return ResponseEntity.ok(Map.of("message", "Devolución rechazada correctamente"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        return devolucionRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}
