package com.inventario.backend_inventario.Controller;

import com.inventario.backend_inventario.Dto.GenerarConteoRequestDto;
import com.inventario.backend_inventario.Dto.HojaConteoResponseDto;
import com.inventario.backend_inventario.Dto.RegistrarConteoRequestDto;
import com.inventario.backend_inventario.Model.Usuario;
import com.inventario.backend_inventario.Repository.UsuarioRepository;
import com.inventario.backend_inventario.Service.ConteoInventarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conteo")
public class ConteoInventarioController {

    @Autowired
    private ConteoInventarioService conteoService;
    @Autowired
    private UsuarioRepository usuarioRepository;

    private Usuario getUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return usuarioRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    /**
     * 1. GENERAR HOJA DE CONTEO (toma una fotografía del stock del sistema)
     */
    @PostMapping("/generar")
    public ResponseEntity<HojaConteoResponseDto> generarHoja(@Valid @RequestBody GenerarConteoRequestDto dto) {
        Usuario usuario = getUsuarioAutenticado();
        HojaConteoResponseDto hoja = conteoService.generarHoja(dto, usuario.getId_u());
        return ResponseEntity.ok(hoja);
    }

    /**
     * 2. REGISTRAR EL CONTEO FÍSICO sobre una hoja ya generada
     */
    @PutMapping("/{id}/registrar")
    public ResponseEntity<HojaConteoResponseDto> registrarConteo(@PathVariable Long id, @Valid @RequestBody RegistrarConteoRequestDto dto) {
        Usuario usuario = getUsuarioAutenticado();
        HojaConteoResponseDto hoja = conteoService.registrarConteo(id, dto, usuario.getId_u());
        return ResponseEntity.ok(hoja);
    }

    /**
     * 3. LISTAR TODAS (para la vista general / historial de conteos)
     */
    @GetMapping("/todas")
    public ResponseEntity<List<HojaConteoResponseDto>> listarTodas() {
        return ResponseEntity.ok(conteoService.listarTodas());
    }

    /**
     * 4. LISTAR PENDIENTES DE APROBACIÓN (ya contadas, esperando revisión)
     */
    @GetMapping("/pendientes")
    public ResponseEntity<List<HojaConteoResponseDto>> listarPendientes() {
        return ResponseEntity.ok(conteoService.listarPendientesAprobacion());
    }

    /**
     * 5. HISTORIAL DE APROBACIÓN (aprobadas / rechazadas)
     */
    @GetMapping("/historial")
    public ResponseEntity<List<HojaConteoResponseDto>> listarHistorial() {
        return ResponseEntity.ok(conteoService.listarHistorialAprobacion());
    }

    /**
     * 6. APROBAR (Admin o Jefe de Inventario). Ejecuta el ajuste real de stock por cada diferencia.
     */
    @PutMapping("/{id}/aprobar")
    public ResponseEntity<?> aprobarHoja(@PathVariable Long id) {
        Usuario usuario = getUsuarioAutenticado();
        conteoService.aprobarHoja(id, usuario.getId_u());
        return ResponseEntity.ok(Map.of("message", "Conteo aprobado y stock ajustado exitosamente"));
    }

    /**
     * 7. RECHAZAR (Admin o Jefe de Inventario)
     */
    @PutMapping("/{id}/rechazar")
    public ResponseEntity<?> rechazarHoja(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String motivo = payload.get("motivo");

        if (motivo == null || motivo.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El motivo es obligatorio para rechazar"));
        }

        Usuario usuario = getUsuarioAutenticado();
        conteoService.rechazarHoja(id, motivo, usuario.getId_u());
        return ResponseEntity.ok(Map.of("message", "Conteo rechazado correctamente"));
    }

    /**
     * 8. VER DETALLE
     */
    @GetMapping("/{id}")
    public ResponseEntity<HojaConteoResponseDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(conteoService.obtenerDetalle(id));
    }
}
