// Ubicación: src/main/java/com/inventario/backend_inventario/Service/Impl/InventarioServiceImpl.java

package com.inventario.backend_inventario.Service.Impl;

import com.inventario.backend_inventario.Dto.InventarioActualDto;
import com.inventario.backend_inventario.Dto.MovimientoDto;
import com.inventario.backend_inventario.Dto.MovimientoInventarioDto;
import com.inventario.backend_inventario.Model.*; // Importa todos tus modelos
import com.inventario.backend_inventario.Repository.*; // Importa todos tus repos
import com.inventario.backend_inventario.Service.HistorialActividadService;
import com.inventario.backend_inventario.Service.InventarioService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventarioServiceImpl implements InventarioService {

    @Autowired private InventarioRepository inventarioRepository;
    @Autowired private MovimientoInventarioRepository movimientoInventarioRepository;
    @Autowired private ProductoRepository productoRepository;
    @Autowired private SedeRepository sedeRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private TipoMovimientoRepository tipoMovimientoRepository; // <-- AÑADIDO
    @Autowired private HistorialActividadService historialActividadService;

    @Override
    @Transactional
    public void registrarRecepcion(MovimientoDto movimientoDto) {

        Usuario usuario = getUsuarioLogueado();

        Producto producto = productoRepository.findById(movimientoDto.getProductoId())
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con ID: " + movimientoDto.getProductoId()));

        Sede sede = sedeRepository.findById(movimientoDto.getSedeIdOrigen())
                .orElseThrow(() -> new EntityNotFoundException("Sede no encontrada con ID: " + movimientoDto.getSedeIdOrigen()));

        // Busca el TIPO de movimiento "Recepción"
        TipoMovimiento tipoRecepcion = tipoMovimientoRepository.findByTipo("Recepción")
                .orElseThrow(() -> new EntityNotFoundException("Tipo de movimiento 'Recepción' no encontrado. Asegúrate de crearlo en la tabla TIPO_MOVIMIENTO."));

        Inventario inventario = inventarioRepository.findByProductoAndSede(producto, sede)
                .orElse(new Inventario(producto, sede, 0)); // Si no existe, creamos uno nuevo con stock 0

        // La Lógica de Stock
        int stockAnterior = inventario.getStockActual();
        int cantidadRecibida = movimientoDto.getCantidad();
        int stockNuevo = stockAnterior + cantidadRecibida;

        inventario.setStockActual(stockNuevo);
        inventarioRepository.save(inventario);

        // Crear el registro en el KARDEX (adaptado a TU BD)
        // Usamos el campo 'observaciones' de tu BD para guardar un resumen
        String observaciones = String.format("Stock: %d -> %d. %s",
                stockAnterior, stockNuevo,
                (movimientoDto.getDescripcion() != null ? movimientoDto.getDescripcion() : ""));

        MovimientoInventario movimiento = new MovimientoInventario(
                producto,
                sede,
                usuario,
                tipoRecepcion, // <-- Objeto TipoMovimiento
                cantidadRecibida, // Cantidad (+ para entradas)
                observaciones // Usamos el campo 'observaciones'
        );

        movimientoInventarioRepository.save(movimiento);

        // 5. Registrar en tu Historial de Actividad (como ya lo haces)
        String descripcionAuditoria = String.format("Registró recepción de %d unidad(es) del producto '%s' (SKU: %s) en la sede '%s'. Stock: %d -> %d",
                cantidadRecibida, producto.getNombre(), producto.getSku(), sede.getNombreSede(), stockAnterior, stockNuevo);

        historialActividadService.registrarActividad(usuario, "RECEPCIÓN", descripcionAuditoria,"INVENTARIO", "MovimientoInventario", movimiento.getId(), observaciones);
    }

    /**
     * Método privado para obtener el usuario desde el contexto de seguridad
     */
    private Usuario getUsuarioLogueado() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con email: " + email));
    }





    @Override
    @Transactional(readOnly = true)
    public List<MovimientoInventarioDto> listarMovimientos() {
        // 1. Obtener todos los movimientos (los ordenamos por ID o fecha, que es lo mismo)
        List<MovimientoInventario> movimientos = movimientoInventarioRepository.findAllWithDetails();

        // 2. Mapear cada entidad a tu DTO de 9 columnas
        return movimientos.stream().map(mov -> {
            MovimientoInventarioDto dto = new MovimientoInventarioDto();

            // Columna 1: ID de movimiento
            dto.setIdMovimiento(mov.getId());

            // Columna 2: Nombre Producto
            dto.setNombreProducto(mov.getProducto().getNombre());
            dto.setSkuProducto(mov.getProducto().getSku()); // Usamos el SKU

            // Columna 3: Nombre Sede
            dto.setNombreSede(mov.getSede().getNombreSede());

            // Columna 4 & 5: Nombre y Rol del Usuario
            Usuario usuario = mov.getUsuario();
            dto.setNombreCompletoUsuario(
                    usuario.getNombre_u() + " " + usuario.getApellido_pat() + (usuario.getApellido_mat() != null ? " " + usuario.getApellido_mat() : "")
            );
            dto.setNombreRolUsuario(usuario.getRol().getNombreRol());

            // Columna 6: Tipo de Movimiento
            dto.setTipoMovimiento(mov.getTipoMovimiento().getTipo());

            // Columna 7: Fecha
            dto.setFecha(mov.getFechaHora());

            // Columna 8: Cantidad
            dto.setCantidad(mov.getCantidad());

            // Columna 9: Observaciones
            dto.setObservaciones(mov.getObservaciones());


            return dto;
        }).collect(Collectors.toList());
    }




    @Override
    @Transactional(readOnly = true) // Es solo lectura
    public List<InventarioActualDto> listarInventarioActual() {

        // 1. Llama al nuevo método del repositorio que evita errores LAZY
        List<Inventario> inventarioLista = inventarioRepository.findAllWithProductoAndSede();

        // 2. Mapea la Entidad al DTO (con los nombres que pediste)
        return inventarioLista.stream().map(inv -> {
            InventarioActualDto dto = new InventarioActualDto();

            // Columna 1: ID
            dto.setIdInventario(inv.getId());

            // Columna 2: SKU y Nombre Producto
            dto.setSkuProducto(inv.getProducto().getSku());
            dto.setNombreProducto(inv.getProducto().getNombre());

            // Columna 3: Nombre Sede
            dto.setNombreSede(inv.getSede().getNombreSede());

            // Columna 4: Stock
            dto.setStockActual(inv.getStockActual());

            // Columna 5: Última Actualización
            dto.setUltimaActualizacion(inv.getUltimaActualizacion());

            return dto;
        }).collect(Collectors.toList());
    }
    @Override
    @Transactional(readOnly = true)
    public boolean verificarStock(Integer sedeId, Long productoId, Integer cantidad) {
        Sede sede = sedeRepository.findById(sedeId).orElse(null);
        Producto producto = productoRepository.findById(productoId).orElse(null);

        if (sede == null || producto == null) {
            return false;
        }
        Inventario inventario = inventarioRepository.findByProductoAndSede(producto, sede)
                .orElse(null);

        if (inventario == null) {
            return false; 
        }

        return inventario.getStockActual() >= cantidad;
    }

    @Override
    @Transactional
    public void registrarMovimiento(Integer sedeId, Long productoId, String tipoMovimientoStr, Integer cantidad) {
        Usuario usuario = getUsuarioLogueado();

        // 1. Validar existencias de Sede y Producto
        Sede sede = sedeRepository.findById(sedeId)
                .orElseThrow(() -> new EntityNotFoundException("Sede no encontrada ID: " + sedeId));
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado ID: " + productoId));

        // 2. Buscar o Validar el Tipo de Movimiento (Ej: "SALIDA_TRANSFERENCIA", "ENTRADA_TRANSFERENCIA")
        TipoMovimiento tipoMovimiento = tipoMovimientoRepository.findByTipo(tipoMovimientoStr)
                .orElseThrow(() -> new EntityNotFoundException("Tipo de movimiento no configurado: " + tipoMovimientoStr));

        // 3. Obtener o Crear Inventario
        Inventario inventario = inventarioRepository.findByProductoAndSede(producto, sede)
                .orElse(new Inventario(producto, sede, 0));

        int stockAnterior = inventario.getStockActual();
        int stockNuevo;

        // 4. Lógica para SUMAR o RESTAR según el tipo de texto
        // Si es SALIDA, MERMA o VENTA -> Resta
        if (tipoMovimientoStr.toUpperCase().contains("SALIDA") || 
            tipoMovimientoStr.toUpperCase().contains("MERMA") || 
            tipoMovimientoStr.toUpperCase().contains("VENTA")) {
            
            if (stockAnterior < cantidad) {
                throw new IllegalArgumentException("Stock insuficiente para realizar la salida en la sede: " + sede.getNombreSede());
            }
            stockNuevo = stockAnterior - cantidad;
        } else {
            // Si es ENTRADA, RECEPCIÓN, AJUSTE (+) -> Suma
            stockNuevo = stockAnterior + cantidad;
        }

        // 5. Actualizar Inventario
        inventario.setStockActual(stockNuevo);
        inventarioRepository.save(inventario);

        // 6. Registrar Movimiento en Kardex
        String observaciones = String.format("Movimiento automático: %s. Stock: %d -> %d", 
                                             tipoMovimientoStr, stockAnterior, stockNuevo);

        MovimientoInventario movimiento = new MovimientoInventario(
                producto,
                sede,
                usuario,
                tipoMovimiento,
                cantidad,
                observaciones
        );
        movimientoInventarioRepository.save(movimiento);

        // 7. Auditoría
        historialActividadService.registrarActividad(
                usuario, 
                "MOVIMIENTO_INVENTARIO", 
                "Se registró " + tipoMovimientoStr + " de " + cantidad + " unidades de " + producto.getNombre(),
                "INVENTARIO", 
                "MovimientoInventario", 
                movimiento.getId(), 
                observaciones
        );
    }
}