package com.inventario.backend_inventario.Controller;

import com.inventario.backend_inventario.Dto.SolicitudMermaRequestDto;
import com.inventario.backend_inventario.Model.SolicitudMerma;
import com.inventario.backend_inventario.Model.Usuario;
import com.inventario.backend_inventario.Repository.SolicitudMermaRepository;
import com.inventario.backend_inventario.Repository.UsuarioRepository;
import com.inventario.backend_inventario.Service.SolicitudMermaService;
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
@RequestMapping("/api/merma")
public class SolicitudMermaController {

    @Autowired
    private SolicitudMermaService mermaService;
    @Autowired
    private SolicitudMermaRepository mermaRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * 1. CREAR SOLICITUD (queda en estado PENDIENTE / "Solicitado")
     */
    @PostMapping("/solicitar")
    public ResponseEntity<?> crearSolicitud(@Valid @RequestBody SolicitudMermaRequestDto solicitudDto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Usuario usuario = usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        SolicitudMerma nuevaSolicitud = mermaService.crearSolicitud(solicitudDto, usuario.getId_u());
        return ResponseEntity.ok(nuevaSolicitud);
    }

    /**
     * 2. LISTAR PENDIENTES
     */
    @GetMapping("/pendientes")
    public ResponseEntity<List<SolicitudMerma>> listarPendientes() {
        return ResponseEntity.ok(mermaService.listarPendientes());
    }

    /**
     * 3. APROBAR SOLICITUD (Admin o Jefe de Inventario). Ejecuta el descuento real de stock.
     */
    @PutMapping("/{id}/aprobar")
    public ResponseEntity<?> aprobarSolicitud(@PathVariable Long id) {
        try {
            mermaService.aprobarSolicitud(id);
            return ResponseEntity.ok(Map.of("message", "Merma aprobada y registrada exitosamente"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * 4. RECHAZAR SOLICITUD (Admin o Jefe de Inventario)
     */
    @PutMapping("/{id}/rechazar")
    public ResponseEntity<?> rechazarSolicitud(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String motivo = payload.get("motivo");

        if (motivo == null || motivo.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El motivo es obligatorio para rechazar"));
        }

        mermaService.rechazarSolicitud(id, motivo);
        return ResponseEntity.ok(Map.of("message", "Solicitud de merma rechazada correctamente"));
    }

    /**
     * 5. HISTORIAL
     */
    @GetMapping("/historial")
    public ResponseEntity<List<SolicitudMerma>> listarHistorial() {
        return ResponseEntity.ok(mermaService.listarHistorial());
    }

    /**
     * 6. VER DETALLE
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        return mermaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
