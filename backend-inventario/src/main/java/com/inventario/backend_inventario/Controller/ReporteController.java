package com.inventario.backend_inventario.Controller;

import com.inventario.backend_inventario.Dto.*;
import com.inventario.backend_inventario.Service.ReporteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    @Autowired
    private ReporteService reporteService;

    @GetMapping("/quiebre-stock")
    public ResponseEntity<List<ReporteQuiebreStockDto>> quiebreStock() {
        return ResponseEntity.ok(reporteService.listarQuiebreStock());
    }

    @GetMapping("/valorizado")
    public ResponseEntity<List<ReporteValorizadoDto>> valorizado() {
        return ResponseEntity.ok(reporteService.listarValorizado());
    }

    @GetMapping("/merma")
    public ResponseEntity<List<ReporteMermaDto>> merma(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return ResponseEntity.ok(reporteService.listarMerma(desde, hasta));
    }

    @GetMapping("/diferencias")
    public ResponseEntity<List<ReporteDiferenciaDto>> diferencias() {
        return ResponseEntity.ok(reporteService.listarDiferencias());
    }

    @GetMapping("/stock-muerto")
    public ResponseEntity<List<ReporteStockMuertoDto>> stockMuerto(
            @RequestParam(defaultValue = "90") int dias) {
        return ResponseEntity.ok(reporteService.listarStockMuerto(dias));
    }

    @GetMapping("/entradas")
    public ResponseEntity<List<MovimientoInventarioDto>> entradas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return ResponseEntity.ok(reporteService.listarEntradas(desde, hasta));
    }

    @GetMapping("/salidas")
    public ResponseEntity<List<MovimientoInventarioDto>> salidas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return ResponseEntity.ok(reporteService.listarSalidas(desde, hasta));
    }
}
