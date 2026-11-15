package com.inventario.backend_inventario.Service.Impl;

import com.inventario.backend_inventario.Dto.DetalleConteoResponseDto;
import com.inventario.backend_inventario.Dto.GenerarConteoRequestDto;
import com.inventario.backend_inventario.Dto.HojaConteoResponseDto;
import com.inventario.backend_inventario.Dto.RegistrarConteoRequestDto;
import com.inventario.backend_inventario.Enum.EstadoConteo;
import com.inventario.backend_inventario.Exception.ResourceConflictException;
import com.inventario.backend_inventario.Model.*;
import com.inventario.backend_inventario.Repository.*;
import com.inventario.backend_inventario.Service.ConteoInventarioService;
import com.inventario.backend_inventario.Service.InventarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ConteoInventarioServiceImpl implements ConteoInventarioService {

    @Autowired private HojaConteoRepository hojaRepo;
    @Autowired private SedeRepository sedeRepo;
    @Autowired private UsuarioRepository usuarioRepo;
    @Autowired private InventarioRepository inventarioRepo;
    @Autowired private AreaRepository areaRepo;
    @Autowired private CategoriaRepository categoriaRepo;
    @Autowired private SubcategoriaRepository subcategoriaRepo;
    @Autowired private com.inventario.backend_inventario.Service.HistorialActividadService historialActividadService;
    @Autowired private InventarioService inventarioService; // Para ejecutar el ajuste real de stock al aprobar

    @Override
    @Transactional
    public HojaConteoResponseDto generarHoja(GenerarConteoRequestDto dto, Integer usuarioId) {
        Sede sede = sedeRepo.findById(dto.getSedeId())
                .orElseThrow(() -> new ResourceConflictException("Sede no encontrada"));
        Usuario generador = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new ResourceConflictException("Usuario no encontrado"));

        List<Inventario> inventarios = filtrarPorAlcance(inventarioRepo.findBySede(sede), dto);
        if (inventarios.isEmpty()) {
            throw new ResourceConflictException(
                    "No se encontraron productos con stock registrado para el alcance seleccionado");
        }

        HojaConteo hoja = new HojaConteo();
        hoja.setSede(sede);
        hoja.setTipoConteo(dto.getTipoConteo());
        hoja.setEstado(EstadoConteo.GENERADA);
        hoja.setUsuarioGenerador(generador);
        hoja.setFechaGeneracion(LocalDateTime.now());
        hoja.setAlcanceDescripcion(describirAlcance(dto, inventarios.size()));

        // Fotografía del stock del sistema al momento de generar la hoja
        List<DetalleConteo> detalles = new ArrayList<>();
        for (Inventario inv : inventarios) {
            DetalleConteo detalle = new DetalleConteo();
            detalle.setProducto(inv.getProducto());
            detalle.setStockSistema(inv.getStockActual());
            detalle.setHoja(hoja);
            detalles.add(detalle);
        }
        hoja.setDetalles(detalles);

        return mapToDto(hojaRepo.save(hoja));
    }

    private String describirAlcance(GenerarConteoRequestDto dto, int totalProductos) {
        switch (dto.getAlcance()) {
            case AREA:
                return areaRepo.findById(dto.getAreaId())
                        .map(a -> "Área: " + a.getNombreArea())
                        .orElse("Área");
            case CATEGORIA:
                return categoriaRepo.findById(dto.getCategoriaId())
                        .map(c -> "Categoría: " + c.getNombreCat())
                        .orElse("Categoría");
            case SUBCATEGORIA:
                return subcategoriaRepo.findById(dto.getSubcategoriaId())
                        .map(s -> "Subcategoría: " + s.getNombreSubcat())
                        .orElse("Subcategoría");
            case PRODUCTOS:
                return totalProductos + " producto(s) específico(s)";
            case SEDE:
            default:
                return "Toda la Sede";
        }
    }

    private List<Inventario> filtrarPorAlcance(List<Inventario> inventarios, GenerarConteoRequestDto dto) {
        switch (dto.getAlcance()) {
            case AREA: {
                if (dto.getAreaId() == null) {
                    throw new ResourceConflictException("Debe indicar el área a contar");
                }
                return inventarios.stream()
                        .filter(inv -> inv.getProducto().getSubcategoria() != null
                                && inv.getProducto().getSubcategoria().getCategoria() != null
                                && inv.getProducto().getSubcategoria().getCategoria().getArea() != null
                                && dto.getAreaId().equals(
                                        inv.getProducto().getSubcategoria().getCategoria().getArea().getId_area()))
                        .collect(Collectors.toList());
            }
            case CATEGORIA: {
                if (dto.getCategoriaId() == null) {
                    throw new ResourceConflictException("Debe indicar la categoría a contar");
                }
                return inventarios.stream()
                        .filter(inv -> inv.getProducto().getSubcategoria() != null
                                && inv.getProducto().getSubcategoria().getCategoria() != null
                                && dto.getCategoriaId().equals(
                                        inv.getProducto().getSubcategoria().getCategoria().getId_cat()))
                        .collect(Collectors.toList());
            }
            case SUBCATEGORIA: {
                if (dto.getSubcategoriaId() == null) {
                    throw new ResourceConflictException("Debe indicar la subcategoría a contar");
                }
                return inventarios.stream()
                        .filter(inv -> inv.getProducto().getSubcategoria() != null
                                && dto.getSubcategoriaId().equals(inv.getProducto().getSubcategoria().getId()))
                        .collect(Collectors.toList());
            }
            case PRODUCTOS: {
                if (dto.getProductoIds() == null || dto.getProductoIds().isEmpty()) {
                    throw new ResourceConflictException("Debe seleccionar al menos un producto a contar");
                }
                Set<Long> idsSeleccionados = new HashSet<>(dto.getProductoIds());
                return inventarios.stream()
                        .filter(inv -> idsSeleccionados.contains(inv.getProducto().getId_producto()))
                        .collect(Collectors.toList());
            }
            case SEDE:
            default:
                return inventarios;
        }
    }

    @Override
    @Transactional
    public HojaConteoResponseDto registrarConteo(Long hojaId, RegistrarConteoRequestDto dto, Integer usuarioId) {
        HojaConteo hoja = hojaRepo.findById(hojaId)
                .orElseThrow(() -> new ResourceConflictException("Hoja de conteo no encontrada"));

        if (hoja.getEstado() != EstadoConteo.GENERADA) {
            throw new ResourceConflictException("Esta hoja ya no admite el registro de un conteo");
        }

        Usuario contador = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new ResourceConflictException("Usuario no encontrado"));

        Map<Long, Integer> conteosPorDetalle = dto.getDetalles().stream()
                .collect(Collectors.toMap(
                        RegistrarConteoRequestDto.ItemConteo::getDetalleId,
                        RegistrarConteoRequestDto.ItemConteo::getStockContado));

        for (DetalleConteo detalle : hoja.getDetalles()) {
            Integer contado = conteosPorDetalle.get(detalle.getId());
            if (contado == null) {
                throw new ResourceConflictException(
                        "Falta registrar el conteo del producto: " + detalle.getProducto().getNombre());
            }
            detalle.setStockContado(contado);
        }

        hoja.setEstado(EstadoConteo.CONTADA);
        hoja.setUsuarioContador(contador);
        hoja.setFechaConteo(LocalDateTime.now());

        return mapToDto(hojaRepo.save(hoja));
    }

    @Override
    @Transactional
    public HojaConteoResponseDto modificarConteo(Long hojaId, RegistrarConteoRequestDto dto, Integer usuarioId) {
        HojaConteo hoja = hojaRepo.findById(hojaId)
                .orElseThrow(() -> new ResourceConflictException("Hoja de conteo no encontrada"));

        // Solo se puede corregir un conteo ya registrado que todavía no fue resuelto por el aprobador.
        if (hoja.getEstado() != EstadoConteo.CONTADA) {
            throw new ResourceConflictException(
                    "Solo se puede modificar un conteo que ya fue registrado y aún no está aprobado ni rechazado");
        }

        Usuario modificador = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new ResourceConflictException("Usuario no encontrado"));

        Map<Long, DetalleConteo> detallesPorId = hoja.getDetalles().stream()
                .collect(Collectors.toMap(DetalleConteo::getId, d -> d));

        List<String> cambios = new ArrayList<>();
        for (RegistrarConteoRequestDto.ItemConteo item : dto.getDetalles()) {
            DetalleConteo detalle = detallesPorId.get(item.getDetalleId());
            if (detalle == null) {
                throw new ResourceConflictException(
                        "El detalle " + item.getDetalleId() + " no pertenece a esta hoja de conteo");
            }
            if (!item.getStockContado().equals(detalle.getStockContado())) {
                cambios.add(String.format("%s (%s): %s -> %d",
                        detalle.getProducto().getNombre(), detalle.getProducto().getSku(),
                        detalle.getStockContado(), item.getStockContado()));
                detalle.setStockContado(item.getStockContado());
            }
        }

        if (cambios.isEmpty()) {
            throw new ResourceConflictException("No se detectaron cambios respecto al conteo registrado");
        }

        hoja.setUsuarioModificador(modificador);
        hoja.setFechaModificacion(LocalDateTime.now());
        HojaConteo guardada = hojaRepo.save(hoja);

        historialActividadService.registrarActividad(modificador, "MODIFICAR_CONTEO",
                "Modificó el conteo #" + hojaId + " de la sede '" + hoja.getSede().getNombreSede() + "' antes de su aprobación",
                "CONTEO", "HojaConteo", hojaId, String.join("; ", cambios));

        return mapToDto(guardada);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HojaConteoResponseDto> listarTodas() {
        return hojaRepo.findAllByOrderByFechaGeneracionDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HojaConteoResponseDto> listarPendientesAprobacion() {
        return hojaRepo.findByEstado(EstadoConteo.CONTADA).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HojaConteoResponseDto> listarHistorialAprobacion() {
        return hojaRepo.findByEstadoInOrderByFechaGeneracionDesc(
                        Arrays.asList(EstadoConteo.APROBADA, EstadoConteo.RECHAZADA)).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HojaConteoResponseDto obtenerDetalle(Long hojaId) {
        HojaConteo hoja = hojaRepo.findById(hojaId)
                .orElseThrow(() -> new ResourceConflictException("Hoja de conteo no encontrada"));
        return mapToDto(hoja);
    }

    @Override
    @Transactional
    public void aprobarHoja(Long hojaId, Integer usuarioId) {
        HojaConteo hoja = hojaRepo.findById(hojaId)
                .orElseThrow(() -> new ResourceConflictException("Hoja de conteo no encontrada"));

        if (hoja.getEstado() != EstadoConteo.CONTADA) {
            throw new ResourceConflictException("Solo se pueden aprobar hojas que ya fueron contadas");
        }

        Usuario aprobador = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new ResourceConflictException("Usuario no encontrado"));

        for (DetalleConteo detalle : hoja.getDetalles()) {
            if (!detalle.getStockContado().equals(detalle.getStockSistema())) {
                inventarioService.registrarAjusteConteo(
                        hoja.getSede().getIdSede(),
                        detalle.getProducto().getId_producto(),
                        detalle.getStockContado());
            }
        }

        hoja.setEstado(EstadoConteo.APROBADA);
        hoja.setUsuarioAprobador(aprobador);
        hoja.setFechaAprobacion(LocalDateTime.now());
        hojaRepo.save(hoja);
    }

    @Override
    @Transactional
    public void rechazarHoja(Long hojaId, String motivo, Integer usuarioId) {
        HojaConteo hoja = hojaRepo.findById(hojaId)
                .orElseThrow(() -> new ResourceConflictException("Hoja de conteo no encontrada"));

        if (hoja.getEstado() != EstadoConteo.CONTADA) {
            throw new ResourceConflictException("Solo se pueden rechazar hojas que ya fueron contadas");
        }

        Usuario aprobador = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new ResourceConflictException("Usuario no encontrado"));

        hoja.setMotivoRechazo(motivo);
        hoja.setEstado(EstadoConteo.RECHAZADA);
        hoja.setUsuarioAprobador(aprobador);
        hoja.setFechaAprobacion(LocalDateTime.now());
        hojaRepo.save(hoja);
    }

    // --- Mapeo a DTO: se hace dentro de la transacción para no filtrar proxies de Hibernate sin
    // inicializar hacia Jackson (causaba "ByteBuddyInterceptor" al serializar la entidad directamente).
    private HojaConteoResponseDto mapToDto(HojaConteo hoja) {
        HojaConteoResponseDto dto = new HojaConteoResponseDto();
        dto.setId(hoja.getId());
        dto.setSedeId(hoja.getSede() != null ? hoja.getSede().getIdSede() : null);
        dto.setNombreSede(hoja.getSede() != null ? hoja.getSede().getNombreSede() : null);
        dto.setTipoConteo(hoja.getTipoConteo());
        dto.setEstado(hoja.getEstado());
        dto.setAlcanceDescripcion(hoja.getAlcanceDescripcion());
        dto.setNombreGenerador(hoja.getUsuarioGenerador() != null ? hoja.getUsuarioGenerador().getNombre_u() : null);
        dto.setNombreContador(hoja.getUsuarioContador() != null ? hoja.getUsuarioContador().getNombre_u() : null);
        dto.setNombreAprobador(hoja.getUsuarioAprobador() != null ? hoja.getUsuarioAprobador().getNombre_u() : null);
        dto.setFechaGeneracion(hoja.getFechaGeneracion());
        dto.setFechaConteo(hoja.getFechaConteo());
        dto.setFechaAprobacion(hoja.getFechaAprobacion());
        dto.setNombreModificador(hoja.getUsuarioModificador() != null ? hoja.getUsuarioModificador().getNombre_u() : null);
        dto.setFechaModificacion(hoja.getFechaModificacion());
        dto.setMotivoRechazo(hoja.getMotivoRechazo());
        dto.setDetalles(hoja.getDetalles().stream().map(this::mapDetalleToDto).collect(Collectors.toList()));
        return dto;
    }

    private DetalleConteoResponseDto mapDetalleToDto(DetalleConteo det) {
        DetalleConteoResponseDto dto = new DetalleConteoResponseDto();
        dto.setId(det.getId());
        dto.setProductoId(det.getProducto().getId_producto());
        dto.setSkuProducto(det.getProducto().getSku());
        dto.setNombreProducto(det.getProducto().getNombre());
        dto.setStockSistema(det.getStockSistema());
        dto.setStockContado(det.getStockContado());
        return dto;
    }
}
