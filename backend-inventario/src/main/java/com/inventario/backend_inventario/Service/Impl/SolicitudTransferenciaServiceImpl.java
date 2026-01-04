package com.inventario.backend_inventario.Service.Impl;

import com.inventario.backend_inventario.Dto.SolicitudRequestDto;
import com.inventario.backend_inventario.Exception.ResourceConflictException;
import com.inventario.backend_inventario.Model.*;
import com.inventario.backend_inventario.Repository.*;
import com.inventario.backend_inventario.Service.InventarioService;
import com.inventario.backend_inventario.Service.SolicitudTransferenciaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SolicitudTransferenciaServiceImpl implements SolicitudTransferenciaService {

    @Autowired private SolicitudTransferenciaRepository solicitudRepo;
    @Autowired private SedeRepository sedeRepo;
    @Autowired private UsuarioRepository usuarioRepo;
    @Autowired private ProductoRepository productoRepo;
    @Autowired private InventarioService inventarioService; // Para mover stock real

    @Override
    @Transactional
    public SolicitudTransferencia crearSolicitud(SolicitudRequestDto dto, Integer usuarioId) {
        SolicitudTransferencia solicitud = new SolicitudTransferencia();
        
        // 1. Configurar Cabecera
        Sede origen = sedeRepo.findById(dto.getSedeOrigenId())
            .orElseThrow(() -> new ResourceConflictException("Sede origen no encontrada"));
        Sede destino = sedeRepo.findById(dto.getSedeDestinoId())
            .orElseThrow(() -> new ResourceConflictException("Sede destino no encontrada"));
        Usuario solicitante = usuarioRepo.findById(usuarioId)
            .orElseThrow(() -> new ResourceConflictException("Usuario no encontrado"));

        solicitud.setSedeOrigen(origen);
        solicitud.setSedeDestino(destino);
        solicitud.setUsuarioSolicitante(solicitante);
        solicitud.setFechaSolicitud(LocalDateTime.now());
        solicitud.setEstado(SolicitudTransferencia.EstadoSolicitud.PENDIENTE);

        // 2. Configurar Detalles (Lista de Productos)
        List<DetalleSolicitud> detalles = new ArrayList<>();
        
        for (SolicitudRequestDto.ItemSolicitud item : dto.getItems()) {
            DetalleSolicitud detalle = new DetalleSolicitud();
            Producto prod = productoRepo.findById(item.getProductoId())
                .orElseThrow(() -> new ResourceConflictException("Producto no encontrado ID: " + item.getProductoId()));
            
            detalle.setProducto(prod);
            detalle.setCantidad(item.getCantidad());
            detalle.setSolicitud(solicitud); // Vinculación bidireccional
            detalles.add(detalle);
        }

        solicitud.setDetalles(detalles);
        
        // Guardamos (CascadeType.ALL guardará los detalles automáticamente)
        return solicitudRepo.save(solicitud);
    }

    @Override
    public List<SolicitudTransferencia> listarPendientes() {
        return solicitudRepo.findByEstado(SolicitudTransferencia.EstadoSolicitud.PENDIENTE);
    }

    @Override
    @Transactional
    public void aprobarSolicitud(Long solicitudId) {
        SolicitudTransferencia solicitud = solicitudRepo.findById(solicitudId)
            .orElseThrow(() -> new ResourceConflictException("Solicitud no encontrada"));

        if (solicitud.getEstado() != SolicitudTransferencia.EstadoSolicitud.PENDIENTE) {
            throw new ResourceConflictException("La solicitud ya fue procesada anteriormente");
        }

        // Ejecutar movimiento por cada producto en la lista
        for (DetalleSolicitud det : solicitud.getDetalles()) {
            // Validar Stock antes de mover nada (Opcional, pero recomendado)
            boolean hayStock = inventarioService.verificarStock(
                solicitud.getSedeOrigen().getIdSede(), 
                det.getProducto().getId_producto(), 
                det.getCantidad()
            );
            
            if (!hayStock) {
                throw new ResourceConflictException("Stock insuficiente para el producto: " + det.getProducto().getNombre());
            }

            // 1. Salida de Origen
            inventarioService.registrarMovimiento(
                solicitud.getSedeOrigen().getIdSede(),
                det.getProducto().getId_producto(),
                "SALIDA_TRANSFERENCIA",
                det.getCantidad()
            );

            // 2. Entrada a Destino
            inventarioService.registrarMovimiento(
                solicitud.getSedeDestino().getIdSede(),
                det.getProducto().getId_producto(),
                "ENTRADA_TRANSFERENCIA",
                det.getCantidad()
            );
        }

        // Actualizar estado final
        solicitud.setEstado(SolicitudTransferencia.EstadoSolicitud.APROBADO);
        solicitud.setFechaAprobacion(LocalDateTime.now());
        solicitudRepo.save(solicitud);
    }

    @Override
    public void rechazarTransferencia(Long solicitudId, String motivo) {
        SolicitudTransferencia solicitud = solicitudRepo.findById(solicitudId)
            .orElseThrow(() -> new ResourceConflictException("Solicitud no encontrada"));

        if (solicitud.getEstado() != SolicitudTransferencia.EstadoSolicitud.PENDIENTE) {
            throw new ResourceConflictException("La solicitud no está pendiente");
        }

        solicitud.setMotivoRechazo(motivo);
        solicitud.setEstado(SolicitudTransferencia.EstadoSolicitud.RECHAZADO);
        solicitud.setFechaAprobacion(LocalDateTime.now()); // Usamos este campo para saber cuándo se cerró
        solicitudRepo.save(solicitud);
    }

    @Override
    public List<SolicitudTransferencia> listarHistorial() {
        // Asumiendo que agregaste este método en el Repository: findByEstadoNot(EstadoSolicitud.PENDIENTE)
        return solicitudRepo.findByEstadoNot(SolicitudTransferencia.EstadoSolicitud.PENDIENTE);
    }
}