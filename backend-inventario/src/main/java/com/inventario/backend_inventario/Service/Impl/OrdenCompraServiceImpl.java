package com.inventario.backend_inventario.Service.Impl;

import com.inventario.backend_inventario.Dto.RecepcionOrdenDto;
import com.inventario.backend_inventario.Enum.EstadoOC;
import com.inventario.backend_inventario.Model.*;
import com.inventario.backend_inventario.Repository.*;
import com.inventario.backend_inventario.Service.EmailService;
import com.inventario.backend_inventario.Service.OrdenCompraService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class OrdenCompraServiceImpl implements OrdenCompraService {

    @Autowired private OrdenCompraRepository ordenCompraRepository;
    @Autowired private ProductoRepository productoRepository;
    @Autowired private ProveedorRepository proveedorRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private SedeRepository sedeRepository;
    
    // Repositorios para mover el inventario real
    @Autowired private InventarioRepository inventarioRepository;
    @Autowired private MovimientoInventarioRepository movimientoRepository;
    @Autowired private TipoMovimientoRepository tipoMovimientoRepository;
    
    @Autowired private EmailService emailService;

    @Override
    @Transactional
    public List<OrdenCompra> generarOrdenesMasivas(List<Map<String, Object>> itemsSolicitados, Integer idUsuario, Integer idSede) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
        Sede sede = sedeRepository.findById(idSede)
                .orElseThrow(() -> new EntityNotFoundException("Sede no encontrada"));
        Map<Integer, List<Map<String, Object>>> itemsPorProveedor = new HashMap<>();

        for (Map<String, Object> item : itemsSolicitados) {
            Long idProducto = Long.valueOf(item.get("idProducto").toString());
            Producto prod = productoRepository.findById(idProducto)
                    .orElseThrow(() -> new EntityNotFoundException("Producto ID " + idProducto + " no existe"));
            
            if (prod.getProveedor() == null) continue;

            itemsPorProveedor.computeIfAbsent(prod.getProveedor().getId_proveedor(), k -> new ArrayList<>()).add(item);
        }

        List<OrdenCompra> ordenesGeneradas = new ArrayList<>();

        for (Map.Entry<Integer, List<Map<String, Object>>> entry : itemsPorProveedor.entrySet()) {
            Proveedor proveedor = proveedorRepository.findById(entry.getKey()).orElseThrow();
            
            OrdenCompra orden = new OrdenCompra();
            orden.setProveedor(proveedor);
            orden.setUsuarioSolicitante(usuario);
            orden.setSedeDestino(sede);
            orden.setCodigoOrden("OC-" + System.currentTimeMillis());
            orden.setEstado(EstadoOC.PENDIENTE);
            orden.setFechaEmision(LocalDateTime.now());
            
            List<DetalleOrdenCompra> detalles = new ArrayList<>();
            double total = 0.0;

            for (Map<String, Object> item : entry.getValue()) {
                Producto prod = productoRepository.findById(Long.valueOf(item.get("idProducto").toString())).get();
                Integer cantidad = Integer.valueOf(item.get("cantidad").toString());

                DetalleOrdenCompra det = new DetalleOrdenCompra();
                det.setOrdenCompra(orden);
                det.setProducto(prod);
                det.setCantidadSolicitada(cantidad);
                det.setCantidadRecibida(0); 
                det.setCostoUnitarioPactado(prod.getPrecio_compra() != null ? prod.getPrecio_compra() : 0.0);

                total += (cantidad * det.getCostoUnitarioPactado());
                detalles.add(det);
            }
            orden.setDetalles(detalles);
            orden.setTotalEstimado(total);
            ordenesGeneradas.add(ordenCompraRepository.save(orden));
        }
        return ordenesGeneradas;
    }

    @Override
    public List<OrdenCompra> listarTodas() { return ordenCompraRepository.findAll(); }

    @Override
    public List<OrdenCompra> listarPorEstado(EstadoOC estado) { return ordenCompraRepository.findByEstado(estado); }

    @Override
    public OrdenCompra obtenerPorId(Long id) {
        return ordenCompraRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Orden no encontrada"));
    }

    @Override
    public Optional<OrdenCompra> buscarPorCodigo(String codigo) {
        return ordenCompraRepository.findByCodigoOrden(codigo);
    }

    @Override
    public void enviarOrdenPorCorreo(Long idOrden) {
        OrdenCompra orden = obtenerPorId(idOrden);
        
        if (orden.getProveedor().getEmail() == null || orden.getProveedor().getEmail().isEmpty()) {
            throw new IllegalStateException("El proveedor no tiene un email registrado.");
        }
        StringBuilder body = new StringBuilder();
        body.append("<div style='font-family: Arial, sans-serif; color: #333;'>");
        body.append("<h2>Orden de Compra: ").append(orden.getCodigoOrden()).append("</h2>");
        body.append("<p>Estimado proveedor <strong>").append(orden.getProveedor().getNombre_proveedor()).append("</strong>,</p>");
        body.append("<p>Adjuntamos el detalle de los productos requeridos para nuestra sede <strong>")
            .append(orden.getSedeDestino().getNombreSede()).append("</strong>.</p>");
        
        body.append("<table style='width: 100%; border-collapse: collapse; margin-top: 20px;'>");
        body.append("<tr style='background-color: #f2f2f2;'>")
            .append("<th style='padding: 10px; border: 1px solid #ddd;'>Producto</th>")
            .append("<th style='padding: 10px; border: 1px solid #ddd;'>SKU</th>")
            .append("<th style='padding: 10px; border: 1px solid #ddd;'>Cantidad</th>")
            .append("</tr>");

        for (DetalleOrdenCompra det : orden.getDetalles()) {
            body.append("<tr>");
            body.append("<td style='padding: 10px; border: 1px solid #ddd;'>").append(det.getProducto().getNombre()).append("</td>");
            body.append("<td style='padding: 10px; border: 1px solid #ddd;'>").append(det.getProducto().getSku()).append("</td>");
            body.append("<td style='padding: 10px; border: 1px solid #ddd; text-align: center;'><strong>").append(det.getCantidadSolicitada()).append("</strong></td>");
            body.append("</tr>");
        }
        body.append("</table>");
        body.append("<p style='margin-top: 20px;'>Por favor, confirmar la recepción de este pedido y la fecha estimada de entrega.</p>");
        body.append("<p>Atentamente,<br>Departamento de Logística</p>");
        body.append("</div>");
        emailService.sendEmail(
                orden.getProveedor().getEmail(),
                "Nueva Orden de Compra - " + orden.getCodigoOrden(),
                body.toString()
        );
        orden.setEstado(EstadoOC.ENVIADA);
        ordenCompraRepository.save(orden);
    }
    @Override
    @Transactional
    public void procesarIngresoMercaderia(RecepcionOrdenDto recepcionDto, Integer idUsuarioOperador) {
        OrdenCompra orden = obtenerPorId(recepcionDto.getIdOrden());

        if (orden.getEstado() == EstadoOC.COMPLETADA || orden.getEstado() == EstadoOC.CANCELADA) {
            throw new IllegalStateException("Esta orden ya fue procesada o cancelada.");
        }

        Usuario operador = usuarioRepository.findById(idUsuarioOperador)
                .orElseThrow(() -> new EntityNotFoundException("Usuario operador no encontrado"));
        TipoMovimiento tipoEntrada = tipoMovimientoRepository.findByTipo("INGRESO POR COMPRA DIRECTA")
             .or(() -> tipoMovimientoRepository.findByTipo("ENTRADA"))
             .orElseThrow(() -> new EntityNotFoundException("No existe tipo de movimiento 'INGRESO POR COMPRA'"));

        boolean recepcionCompleta = true; 
        for (RecepcionOrdenDto.DetalleRecepcion itemRecibido : recepcionDto.getDetalles()) {
            DetalleOrdenCompra detalleOrden = orden.getDetalles().stream()
                .filter(d -> d.getProducto().getId_producto().equals(itemRecibido.getIdProducto()))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("El producto ID " + itemRecibido.getIdProducto() + " no pertenece a esta orden."));

            int cantidadReal = itemRecibido.getCantidadRecibida();
            detalleOrden.setCantidadRecibida(detalleOrden.getCantidadRecibida() + cantidadReal);
            
            if (detalleOrden.getCantidadRecibida() < detalleOrden.getCantidadSolicitada()) {
                recepcionCompleta = false;
            }

            if (cantidadReal > 0) {
                Producto producto = detalleOrden.getProducto();
                Sede sede = orden.getSedeDestino();

                Inventario inv = inventarioRepository.findByProductoAndSede(producto, sede)
                        .orElse(new Inventario(producto, sede, 0));
                
                inv.setStockActual(inv.getStockActual() + cantidadReal);
                inv.setUltimaActualizacion(LocalDateTime.now());
                inventarioRepository.save(inv);
                MovimientoInventario mov = new MovimientoInventario();
                mov.setProducto(producto);
                mov.setSede(sede);
                mov.setUsuario(operador);
                mov.setTipoMovimiento(tipoEntrada);
                mov.setCantidad(cantidadReal);
                mov.setFechaHora(LocalDateTime.now());
                mov.setObservaciones("Recepción OC: " + orden.getCodigoOrden());
                movimientoRepository.save(mov);
            }
        }
        if (recepcionCompleta) {
            orden.setEstado(EstadoOC.COMPLETADA);
            orden.setFechaEntregaEsperada(LocalDateTime.now());
        } else {
            orden.setEstado(EstadoOC.PARCIAL);
        }

        ordenCompraRepository.save(orden);
    }
}