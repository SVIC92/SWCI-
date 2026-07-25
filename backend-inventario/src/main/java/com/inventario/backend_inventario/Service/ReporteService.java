package com.inventario.backend_inventario.Service;

import com.inventario.backend_inventario.Dto.*;

import java.time.LocalDateTime;
import java.util.List;

public interface ReporteService {

    List<ReporteQuiebreStockDto> listarQuiebreStock();

    List<ReporteValorizadoDto> listarValorizado();

    List<ReporteMermaDto> listarMerma(LocalDateTime desde, LocalDateTime hasta);

    List<ReporteDiferenciaDto> listarDiferencias();

    List<ReporteStockMuertoDto> listarStockMuerto(int diasUmbral);

    List<MovimientoInventarioDto> listarEntradas(LocalDateTime desde, LocalDateTime hasta);

    List<MovimientoInventarioDto> listarSalidas(LocalDateTime desde, LocalDateTime hasta);
}
