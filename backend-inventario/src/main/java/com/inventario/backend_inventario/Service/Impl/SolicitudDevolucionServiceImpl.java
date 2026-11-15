package com.inventario.backend_inventario.Service.Impl;

import com.inventario.backend_inventario.Dto.SolicitudDevolucionRequestDto;
import com.inventario.backend_inventario.Enum.DestinoDevolucion;
import com.inventario.backend_inventario.Enum.EstadoSolicitud;
import com.inventario.backend_inventario.Model.*;
import com.inventario.backend_inventario.Repository.*;
import com.inventario.backend_inventario.Service.InventarioService;
import com.inventario.backend_inventario.Service.SolicitudDevolucionService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SolicitudDevolucionServiceImpl implements SolicitudDevolucionService {

    @Autowired private SolicitudDevolucionRepository solicitudRepo;
    @Autowired private SedeRepository sedeRepo;
    @Autowired private UsuarioRepository usuarioRepo;
    @Autowired private ProductoRepository productoRepo;
    @Autowired private ProveedorRepository proveedorRepo;
    @Autowired private InventarioService inventarioService;

    @Override
    @Transactional
    public SolicitudDevolucion crearSolicitud(SolicitudDevolucionRequestDto dto, Integer usuarioId) {
        Sede origen = sedeRepo.findById(dto.getSedeOrigenId())
                .orElseThrow(() -> new EntityNotFoundException("Sede que devuelve no encontrada"));
        Usuario solicitante = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        SolicitudDevolucion solicitud = new SolicitudDevolucion();
        solicitud.setSedeOrigen(origen);
        solicitud.setTipoDestino(dto.getTipoDestino());
        solicitud.setUsuarioSolicitante(solicitante);
        solicitud.setFechaSolicitud(LocalDateTime.now());
        solicitud.setEstado(EstadoSolicitud.PENDIENTE);
        solicitud.setReferencia(dto.getReferencia());

        if (dto.getTipoDestino() == DestinoDevolucion.SEDE) {
            if (dto.getSedeDestinoId() == null) {
                throw new IllegalArgumentException("Debes seleccionar la sede/almacén destino");
            }
            if (dto.getSedeDestinoId().equals(dto.getSedeOrigenId())) {
                throw new IllegalArgumentException("La sede destino no puede ser la misma que la sede que devuelve");
            }
            solicitud.setSedeDestino(sedeRepo.findById(dto.getSedeDestinoId())
                    .orElseThrow(() -> new EntityNotFoundException("Sede destino no encontrada")));
        } else {
            if (dto.getProveedorId() == null) {
                throw new IllegalArgumentException("Debes seleccionar el proveedor");
            }
            solicitud.setProveedor(proveedorRepo.findById(dto.getProveedorId())
                    .orElseThrow(() -> new EntityNotFoundException("Proveedor no encontrado")));
        }

        List<DetalleSolicitudDevolucion> detalles = new ArrayList<>();
        for (SolicitudDevolucionRequestDto.Item item : dto.getItems()) {
            Producto prod = productoRepo.findById(item.getProductoId())
                    .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado ID: " + item.getProductoId()));
            if (!inventarioService.verificarStock(origen.getIdSede(), prod.getId_producto(), item.getCantidad())) {
                throw new IllegalArgumentException("Stock insuficiente de '" + prod.getNombre()
                        + "' en la sede '" + origen.getNombreSede() + "'");
            }
            DetalleSolicitudDevolucion det = new DetalleSolicitudDevolucion();
            det.setProducto(prod);
            det.setCantidad(item.getCantidad());
            det.setMotivo(item.getMotivo());
            det.setSolicitud(solicitud);
            detalles.add(det);
        }
        solicitud.setDetalles(detalles);
        return solicitudRepo.save(solicitud);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudDevolucion> listarPendientes() {
        return solicitudRepo.findByEstadoOrderByFechaSolicitudDesc(EstadoSolicitud.PENDIENTE);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudDevolucion> listarHistorial() {
        return solicitudRepo.findByEstadoNotOrderByFechaSolicitudDesc(EstadoSolicitud.PENDIENTE);
    }

    @Override
    @Transactional
    public void aprobarSolicitud(Long id) {
        SolicitudDevolucion s = solicitudRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Solicitud de devolución no encontrada"));
        if (s.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new IllegalArgumentException("La solicitud ya fue procesada anteriormente");
        }

        String destinoTxt = s.getTipoDestino() == DestinoDevolucion.SEDE
                ? "sede '" + s.getSedeDestino().getNombreSede() + "'"
                : "proveedor '" + s.getProveedor().getNombre_proveedor() + "'";
        String refTxt = (s.getReferencia() != null && !s.getReferencia().isBlank()) ? " Ref: " + s.getReferencia() + "." : "";

        // Se valida todo el stock antes de mover nada (la transacción también revierte ante cualquier fallo).
        for (DetalleSolicitudDevolucion d : s.getDetalles()) {
            if (!inventarioService.verificarStock(s.getSedeOrigen().getIdSede(), d.getProducto().getId_producto(), d.getCantidad())) {
                throw new IllegalArgumentException("Stock insuficiente de '" + d.getProducto().getNombre()
                        + "' en la sede '" + s.getSedeOrigen().getNombreSede() + "'");
            }
        }

        for (DetalleSolicitudDevolucion d : s.getDetalles()) {
            Long productoId = d.getProducto().getId_producto();
            String detalle = "Devolución a " + destinoTxt + ". Motivo: " + d.getMotivo() + "." + refTxt;

            inventarioService.registrarMovimiento(s.getSedeOrigen().getIdSede(), productoId,
                    "SALIDA_DEVOLUCION", d.getCantidad(), detalle);

            if (s.getTipoDestino() == DestinoDevolucion.SEDE) {
                inventarioService.registrarMovimiento(s.getSedeDestino().getIdSede(), productoId,
                        "ENTRADA_DEVOLUCION", d.getCantidad(),
                        "Devolución recibida desde sede '" + s.getSedeOrigen().getNombreSede()
                                + "'. Motivo: " + d.getMotivo() + "." + refTxt);
            }
        }

        s.setEstado(EstadoSolicitud.APROBADO);
        s.setFechaAprobacion(LocalDateTime.now());
        solicitudRepo.save(s);
    }

    @Override
    @Transactional
    public void rechazarSolicitud(Long id, String motivo) {
        SolicitudDevolucion s = solicitudRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Solicitud de devolución no encontrada"));
        if (s.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new IllegalArgumentException("La solicitud no está pendiente");
        }
        s.setMotivoRechazo(motivo);
        s.setEstado(EstadoSolicitud.RECHAZADO);
        s.setFechaAprobacion(LocalDateTime.now());
        solicitudRepo.save(s);
    }
}
