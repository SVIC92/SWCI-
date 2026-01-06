package com.inventario.backend_inventario.Controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inventario.backend_inventario.Dto.HistorialActividadDto;
import com.inventario.backend_inventario.Model.HistorialActividad;
import com.inventario.backend_inventario.Repository.HistorialActividadRepository;
import com.inventario.backend_inventario.Service.HistorialActividadService;
import com.inventario.backend_inventario.Dto.UltimoAccesoUser;

@RestController
@RequestMapping("/api/historial")
@CrossOrigin(origins = "*")
public class HistorialActividadController {
    @Autowired
    private HistorialActividadService historialActividadService;

    @Autowired
    private HistorialActividadRepository historialRepo;

    @GetMapping("/filtrar")
    public ResponseEntity<List<HistorialActividadDto>> filtrarActividades(
            @RequestParam(required = false) Integer usuarioId,
            @RequestParam(required = false) String modulo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin
    ) {
        List<HistorialActividad> resultados = historialRepo.filtrarActividades(usuarioId, modulo, fechaInicio, fechaFin);
        
        List<HistorialActividadDto> dtos = resultados.stream()
            .map(act -> new HistorialActividadDto(
                act.getId(),
                act.getTipoAccion(),
                act.getDescripcion(),
                act.getFechaHora(),
                act.getUsuario().getNombre_u(), 
                (act.getUsuario().getRol() != null ? act.getUsuario().getRol().getNombreRol() : "Sin Rol"),
                act.getModulo(),
                act.getEntidadAfectada(),
                act.getIdEntidad(),
                act.getIpDireccion(),
                act.getDetallesCambios()
            ))
            .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/recientes")
    public ResponseEntity<List<HistorialActividadDto>> getActividadesRecientes() {
        
        List<HistorialActividadDto> actividadesDto = historialActividadService.getRecentActivitiesDto();
        return ResponseEntity.ok(actividadesDto);
    }
    @GetMapping("/accesos")
    public ResponseEntity<List<UltimoAccesoUser>> obtenerUltimosAccesos() {
        return ResponseEntity.ok(historialRepo.findUltimosAccesos());
    }
}
