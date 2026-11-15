package com.inventario.backend_inventario.Service.Impl;

import com.inventario.backend_inventario.Dto.*;
import com.inventario.backend_inventario.Enum.EstadoConteo;
import com.inventario.backend_inventario.Model.*;
import com.inventario.backend_inventario.Repository.*;
import com.inventario.backend_inventario.Service.ReporteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReporteServiceImpl implements ReporteService {

    @Autowired private InventarioRepository inventarioRepo;
    @Autowired private MovimientoInventarioRepository movimientoRepo;
    @Autowired private DetalleConteoRepository detalleConteoRepo;

    @Override
    @Transactional(readOnly = true)
    public List<ReporteQuiebreStockDto> listarQuiebreStock() {
        return inventarioRepo.findAllWithProductoAndSede().stream()
                .filter(inv -> inv.getStockActual() <= inv.getProducto().getStockMinimo())
                .map(this::mapQuiebre)
                .collect(Collectors.toList());
    }

    private ReporteQuiebreStockDto mapQuiebre(Inventario inv) {
        Producto p = inv.getProducto();
        ReporteQuiebreStockDto dto = new ReporteQuiebreStockDto();
        dto.setIdInventario(inv.getId());
        dto.setSkuProducto(p.getSku());
        dto.setNombreProducto(p.getNombre());
        dto.setNombreSede(inv.getSede().getNombreSede());
        dto.setStockActual(inv.getStockActual());
        dto.setStockMinimo(p.getStockMinimo());
        dto.setStockIdeal(p.getStockIdeal());
        if (p.getStockIdeal() != null) {
            dto.setCantidadSugerida(p.getStockIdeal() - inv.getStockActual());
        }
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReporteValorizadoDto> listarValorizado() {
        return inventarioRepo.findAllWithProductoAndSede().stream()
                .map(this::mapValorizado)
                .collect(Collectors.toList());
    }

    private ReporteValorizadoDto mapValorizado(Inventario inv) {
        Producto p = inv.getProducto();
        ReporteValorizadoDto dto = new ReporteValorizadoDto();
        dto.setSkuProducto(p.getSku());
        dto.setNombreProducto(p.getNombre());
        dto.setNombreSede(inv.getSede().getNombreSede());
        dto.setNombreCategoria(
                p.getSubcategoria() != null && p.getSubcategoria().getCategoria() != null
                        ? p.getSubcategoria().getCategoria().getNombreCat()
                        : null);
        dto.setNombreProveedor(p.getProveedor() != null ? p.getProveedor().getNombre_proveedor() : null);
        dto.setStockActual(inv.getStockActual());
        double costo = p.getPrecio_compra() != null ? p.getPrecio_compra() : 0.0;
        dto.setCostoUnitario(costo);
        dto.setValorTotal(costo * inv.getStockActual());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReporteMermaDto> listarMerma(LocalDateTime desde, LocalDateTime hasta) {
        return movimientoRepo.findAllWithDetails().stream()
                .filter(m -> m.getTipoMovimiento().getTipo().toLowerCase().contains("merma"))
                .filter(m -> dentroDeRango(m.getFechaHora(), desde, hasta))
                .map(this::mapMerma)
                .collect(Collectors.toList());
    }

    private ReporteMermaDto mapMerma(MovimientoInventario m) {
        Producto p = m.getProducto();
        ReporteMermaDto dto = new ReporteMermaDto();
        dto.setIdMovimiento(m.getId());
        dto.setFecha(m.getFechaHora());
        dto.setSkuProducto(p.getSku());
        dto.setNombreProducto(p.getNombre());
        dto.setNombreSede(m.getSede().getNombreSede());
        dto.setNombreUsuario(m.getUsuario().getNombre_u());
        dto.setCantidad(m.getCantidad());
        double costo = p.getPrecio_compra() != null ? p.getPrecio_compra() : 0.0;
        dto.setCostoUnitario(costo);
        dto.setCostoTotal(costo * m.getCantidad());
        dto.setObservaciones(m.getObservaciones());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReporteDiferenciaDto> listarDiferencias() {
        return detalleConteoRepo.findDiferencias(EstadoConteo.APROBADA).stream()
                .map(this::mapDiferencia)
                .collect(Collectors.toList());
    }

    private ReporteDiferenciaDto mapDiferencia(DetalleConteo det) {
        HojaConteo hoja = det.getHoja();
        Producto p = det.getProducto();
        ReporteDiferenciaDto dto = new ReporteDiferenciaDto();
        dto.setIdHoja(hoja.getId());
        dto.setFechaAprobacion(hoja.getFechaAprobacion());
        dto.setNombreSede(hoja.getSede().getNombreSede());
        dto.setSkuProducto(p.getSku());
        dto.setNombreProducto(p.getNombre());
        dto.setStockSistema(det.getStockSistema());
        dto.setStockContado(det.getStockContado());
        int diferencia = det.getStockContado() - det.getStockSistema();
        dto.setDiferencia(diferencia);
        double costo = p.getPrecio_compra() != null ? p.getPrecio_compra() : 0.0;
        dto.setValorDiferencia(diferencia * costo);
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReporteStockMuertoDto> listarStockMuerto(int diasUmbral) {
        List<MovimientoInventario> movimientos = movimientoRepo.findAllWithDetails();

        Map<String, LocalDateTime> ultimoMovimientoPorClave = new HashMap<>();
        for (MovimientoInventario m : movimientos) {
            String clave = claveProductoSede(m.getProducto().getId_producto(), m.getSede().getIdSede());
            LocalDateTime actual = ultimoMovimientoPorClave.get(clave);
            if (actual == null || m.getFechaHora().isAfter(actual)) {
                ultimoMovimientoPorClave.put(clave, m.getFechaHora());
            }
        }

        LocalDateTime ahora = LocalDateTime.now();
        List<ReporteStockMuertoDto> resultado = new ArrayList<>();

        for (Inventario inv : inventarioRepo.findAllWithProductoAndSede()) {
            if (inv.getStockActual() <= 0) continue; // Sin stock no aplica "stock muerto"

            String clave = claveProductoSede(inv.getProducto().getId_producto(), inv.getSede().getIdSede());
            LocalDateTime ultimoMovimiento = ultimoMovimientoPorClave.get(clave);
            Long dias = ultimoMovimiento != null ? ChronoUnit.DAYS.between(ultimoMovimiento, ahora) : null;

            boolean esCandidato = (ultimoMovimiento == null) || (dias != null && dias >= diasUmbral);
            if (!esCandidato) continue;

            Producto p = inv.getProducto();
            ReporteStockMuertoDto dto = new ReporteStockMuertoDto();
            dto.setSkuProducto(p.getSku());
            dto.setNombreProducto(p.getNombre());
            dto.setNombreSede(inv.getSede().getNombreSede());
            dto.setStockActual(inv.getStockActual());
            double costo = p.getPrecio_compra() != null ? p.getPrecio_compra() : 0.0;
            dto.setValorInmovilizado(costo * inv.getStockActual());
            dto.setFechaUltimoMovimiento(ultimoMovimiento);
            dto.setDiasSinMovimiento(dias);
            resultado.add(dto);
        }

        return resultado;
    }

    private String claveProductoSede(Long idProducto, Integer idSede) {
        return idProducto + "-" + idSede;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovimientoInventarioDto> listarEntradas(LocalDateTime desde, LocalDateTime hasta) {
        return movimientoRepo.findAllWithDetails().stream()
                .filter(this::esEntrada)
                .filter(m -> dentroDeRango(m.getFechaHora(), desde, hasta))
                .map(this::mapMovimiento)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovimientoInventarioDto> listarSalidas(LocalDateTime desde, LocalDateTime hasta) {
        return movimientoRepo.findAllWithDetails().stream()
                .filter(m -> !esEntrada(m))
                .filter(m -> dentroDeRango(m.getFechaHora(), desde, hasta))
                .map(this::mapMovimiento)
                .collect(Collectors.toList());
    }

    // Misma clasificación entrada/salida que ya usa el Kardex en el frontend:
    // el signo de "Ajuste Conteo" es el único que sí viene con signo real en BD.
    private boolean esEntrada(MovimientoInventario m) {
        String tipo = m.getTipoMovimiento().getTipo().toLowerCase();
        if (tipo.contains("ajuste")) {
            return m.getCantidad() >= 0;
        }
        if (tipo.contains("salida")) {
            return false; // ej: SALIDA_DEVOLUCION / SALIDA_TRANSFERENCIA
        }
        return tipo.contains("recep") || tipo.contains("devoluci") || tipo.contains("entrada");
    }

    private boolean dentroDeRango(LocalDateTime fecha, LocalDateTime desde, LocalDateTime hasta) {
        if (desde != null && fecha.isBefore(desde)) return false;
        if (hasta != null && fecha.isAfter(hasta)) return false;
        return true;
    }

    private MovimientoInventarioDto mapMovimiento(MovimientoInventario m) {
        MovimientoInventarioDto dto = new MovimientoInventarioDto();
        dto.setIdMovimiento(m.getId());
        dto.setNombreProducto(m.getProducto().getNombre());
        dto.setSkuProducto(m.getProducto().getSku());
        dto.setNombreSede(m.getSede().getNombreSede());
        Usuario usuario = m.getUsuario();
        dto.setNombreCompletoUsuario(
                usuario.getNombre_u() + " " + usuario.getApellido_pat()
                        + (usuario.getApellido_mat() != null ? " " + usuario.getApellido_mat() : ""));
        dto.setNombreRolUsuario(usuario.getRol().getNombreRol());
        dto.setTipoMovimiento(m.getTipoMovimiento().getTipo());
        dto.setFecha(m.getFechaHora());
        dto.setCantidad(m.getCantidad());
        dto.setObservaciones(m.getObservaciones());
        return dto;
    }
}
