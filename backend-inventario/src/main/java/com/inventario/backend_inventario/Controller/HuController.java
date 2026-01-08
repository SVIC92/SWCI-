package com.inventario.backend_inventario.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inventario.backend_inventario.Dto.HuDto;
import com.inventario.backend_inventario.Model.Hu;
import com.inventario.backend_inventario.Service.HuService;

@RestController
@RequestMapping("/api/hu")
@CrossOrigin(origins = "*")
public class HuController {

    @Autowired
    private HuService huService;
    @GetMapping("/{id}")
    public ResponseEntity<Hu> obtener(@PathVariable Long id) { return ResponseEntity.ok(huService.obtenerPorId(id)); };

    @PostMapping("/crear")
    public ResponseEntity<Hu> crearHu(@RequestBody HuDto huDto) {
        return ResponseEntity.ok(huService.crearHu(huDto));
    }

    @GetMapping("/disponibles")
    public ResponseEntity<List<Hu>> listarHuDisponibles(@RequestParam(required = false) Integer idAlmacen) {
        return ResponseEntity.ok(huService.listarHuDisponibles(idAlmacen));
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Hu> actualizarHu(@PathVariable Long id, @RequestBody HuDto huDto) {
        return ResponseEntity.ok(huService.actualizarHu(id, huDto));
    }

    @GetMapping("/historial")
    public ResponseEntity<List<Hu>> verHistorialHu() {
        return ResponseEntity.ok(huService.historialHu());
    }

    @PutMapping("/solicitar/{id}")
    public ResponseEntity<?> solicitarHu(@PathVariable Long id, @RequestBody HuDto huDto) {
        return ResponseEntity.ok(huService.solicitarHu(id, huDto));
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminarHu(@PathVariable Long id) {
        huService.eliminarHu(id);
        return ResponseEntity.ok().build();
    }
}