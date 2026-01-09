package com.inventario.backend_inventario.Controller;

import com.inventario.backend_inventario.Dto.RecepcionOrdenDto;
import com.inventario.backend_inventario.Enum.EstadoOC;
import com.inventario.backend_inventario.Model.OrdenCompra;
import com.inventario.backend_inventario.Model.Usuario;
import com.inventario.backend_inventario.Service.OrdenCompraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/compras")
@CrossOrigin(origins = "*")
public class OrdenCompraController {

    @Autowired
    private OrdenCompraService ordenCompraService;
    @PostMapping("/generar")
    public ResponseEntity<?> generarOrdenes(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam Integer idSede,
            @RequestBody List<Map<String, Object>> items) {
        
        try {
            if (usuario == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Usuario no autenticado"));
            }

            List<OrdenCompra> ordenes = ordenCompraService.generarOrdenesMasivas(items, usuario.getId_u(), idSede);
            return ResponseEntity.ok(Map.of(
                "message", "Se generaron " + ordenes.size() + " órdenes de compra correctamente.",
                "ordenes", ordenes
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error al generar órdenes: " + e.getMessage()));
        }
    }
    @GetMapping
    public ResponseEntity<List<OrdenCompra>> listarOrdenes(@RequestParam(required = false) EstadoOC estado) {
        if (estado != null) {
            return ResponseEntity.ok(ordenCompraService.listarPorEstado(estado));
        }
        return ResponseEntity.ok(ordenCompraService.listarTodas());
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerOrden(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ordenCompraService.obtenerPorId(id));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("message", "Orden no encontrada"));
        }
    }
    @GetMapping("/buscar/{codigo}")
    public ResponseEntity<?> buscarPorCodigo(@PathVariable String codigo) {
        Optional<OrdenCompra> orden = ordenCompraService.buscarPorCodigo(codigo);
        if (orden.isPresent()) {
            return ResponseEntity.ok(orden.get());
        } else {
            return ResponseEntity.status(404).body(Map.of("message", "No se encontró ninguna orden con el código: " + codigo));
        }
    }
    @PostMapping("/{id}/enviar")
    public ResponseEntity<?> enviarCorreoProveedor(@PathVariable Long id) {
        try {
            ordenCompraService.enviarOrdenPorCorreo(id);
            return ResponseEntity.ok(Map.of("message", "Orden enviada correctamente al proveedor."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error al enviar correo: " + e.getMessage()));
        }
    }
    @PostMapping("/recepcionar")
    public ResponseEntity<?> recepcionarMercaderia(
            @AuthenticationPrincipal Usuario usuario,
            @RequestBody RecepcionOrdenDto dto) {
        
        try {
            if (usuario == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Sesión inválida o expirada."));
            }
            ordenCompraService.procesarIngresoMercaderia(dto, usuario.getId_u());
            
            return ResponseEntity.ok(Map.of("message", "Recepción registrada con éxito. Stock y Kardex actualizados."));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error interno al procesar recepción: " + e.getMessage()));
        }
    }
}