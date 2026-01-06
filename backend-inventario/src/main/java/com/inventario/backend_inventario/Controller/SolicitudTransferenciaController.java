package com.inventario.backend_inventario.Controller;

import com.inventario.backend_inventario.Dto.SolicitudRequestDto;
import com.inventario.backend_inventario.Model.SolicitudTransferencia;
import com.inventario.backend_inventario.Model.Usuario;
import com.inventario.backend_inventario.Repository.SolicitudTransferenciaRepository;
import com.inventario.backend_inventario.Repository.UsuarioRepository;
import com.inventario.backend_inventario.Service.SolicitudTransferenciaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transferencia")
public class SolicitudTransferenciaController {

    @Autowired
    private SolicitudTransferenciaService transferenciaService;
    @Autowired
    private SolicitudTransferenciaRepository transferenciaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/solicitar")
    public ResponseEntity<?> crearSolicitud(@RequestBody SolicitudRequestDto solicitudDto) {
        // Obtener el usuario autenticado (quien hace la petición)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Usuario usuario = usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        SolicitudTransferencia nuevaSolicitud = transferenciaService.crearSolicitud(solicitudDto, usuario.getId_u());
        return ResponseEntity.ok(nuevaSolicitud);
    }

    /**
     * 2. LISTAR PENDIENTES
     */
    @GetMapping("/pendientes")
    public ResponseEntity<List<SolicitudTransferencia>> listarPendientes() {
        return ResponseEntity.ok(transferenciaService.listarPendientes());
    }

    /**
     * 3. APROBAR SOLICITUD
     */
    @PutMapping("/{id}/aprobar")
    public ResponseEntity<?> aprobarSolicitud(@PathVariable Long id) {
        transferenciaService.aprobarSolicitud(id);
        return ResponseEntity.ok(Map.of("message", "Transferencia aprobada y ejecutada exitosamente"));
    }

    /**
     * 4. RECHAZAR SOLICITUD
     */
    @PutMapping("/{id}/rechazar")
    public ResponseEntity<?> rechazarSolicitud(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String motivo = payload.get("motivo");

        if (motivo == null || motivo.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El motivo es obligatorio para rechazar"));
        }

        transferenciaService.rechazarTransferencia(id, motivo);
        return ResponseEntity.ok(Map.of("message", "Solicitud rechazada correctamente"));
    }

    /**
     * 5. HISTORIAL
     */
    @GetMapping("/historial")
    public ResponseEntity<List<SolicitudTransferencia>> listarHistorial() {
        return ResponseEntity.ok(transferenciaService.listarHistorial());
    }

    /**
     * 6. VER DETALLES (Opcional si necesitas cargar los productos por separado)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        return transferenciaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}