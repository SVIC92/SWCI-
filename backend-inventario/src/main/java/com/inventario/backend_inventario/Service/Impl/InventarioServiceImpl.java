// Ubicación: src/main/java/com/inventario/backend_inventario/Service/Impl/InventarioServiceImpl.java

package com.inventario.backend_inventario.Service.Impl;

import com.inventario.backend_inventario.Dto.InventarioActualDto;
import com.inventario.backend_inventario.Dto.MermaMasivaDto;
import com.inventario.backend_inventario.Dto.MovimientoInventarioDto;
import com.inventario.backend_inventario.Dto.RecepcionMasivaDto;
import com.inventario.backend_inventario.Model.*; 
import com.inventario.backend_inventario.Repository.*;
import com.inventario.backend_inventario.Service.HistorialActividadService;
import com.inventario.backend_inventario.Service.InventarioService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inventario.backend_inventario.Dto.ResultadoImportacionVentasDto;
import com.inventario.backend_inventario.Exception.ImportacionVentasException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
    public void registrarRecepcion(RecepcionMasivaDto recepcionDto) {

        Usuario usuario = getUsuarioLogueado();

        // 1. Validar la Sede una sola vez para toda la transacción
        Sede sede = sedeRepository.findById(recepcionDto.getSedeIdOrigen())
                .orElseThrow(() -> new EntityNotFoundException("Sede no encontrada con ID: " + recepcionDto.getSedeIdOrigen()));

        // 2. Buscar el TIPO de movimiento "Recepción"
        TipoMovimiento tipoRecepcion = tipoMovimientoRepository.findByTipo("Recepción")
                .orElseThrow(() -> new EntityNotFoundException("Tipo de movimiento 'Recepción' no encontrado. Asegúrate de crearlo en la tabla TIPO_MOVIMIENTO."));

        // 3. Iterar sobre la lista de productos
        for (RecepcionMasivaDto.DetalleItem item : recepcionDto.getDetalles()) {
                
                Producto producto = productoRepository.findById(item.getProductoId())
                        .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con ID: " + item.getProductoId()));

                Inventario inventario = inventarioRepository.findByProductoAndSede(producto, sede)
                        .orElse(new Inventario(producto, sede, 0)); // Si no existe, creamos uno nuevo con stock 0

                // Lógica de Stock
                int stockAnterior = inventario.getStockActual();
                int cantidadRecibida = item.getCantidad();
                int stockNuevo = stockAnterior + cantidadRecibida;

                inventario.setStockActual(stockNuevo);
                inventarioRepository.save(inventario);

                // Crear el registro en el KARDEX
                String observaciones = String.format("Stock: %d -> %d. %s",
                        stockAnterior, stockNuevo,
                        (recepcionDto.getDescripcion() != null ? recepcionDto.getDescripcion() : ""));

                MovimientoInventario movimiento = new MovimientoInventario(
                        producto,
                        sede,
                        usuario,
                        tipoRecepcion,
                        cantidadRecibida, 
                        observaciones 
                );

                movimientoInventarioRepository.save(movimiento);

                // Registrar en el Historial de Actividad
                String descripcionAuditoria = String.format("Registró recepción de %d unidad(es) del producto '%s' (SKU: %s) en la sede '%s'. Stock: %d -> %d",
                        cantidadRecibida, producto.getNombre(), producto.getSku(), sede.getNombreSede(), stockAnterior, stockNuevo);

                historialActividadService.registrarActividad(usuario, "RECEPCIÓN", descripcionAuditoria,"INVENTARIO", "MovimientoInventario", movimiento.getId(), observaciones);
        }
    }
    @Override
    @Transactional
    public void registrarMerma(MermaMasivaDto mermaDto) {

        Usuario usuario = getUsuarioLogueado();

        Sede sede = sedeRepository.findById(mermaDto.getSedeId())
                .orElseThrow(() -> new EntityNotFoundException("Sede no encontrada con ID: " + mermaDto.getSedeId()));

        TipoMovimiento tipoMerma = tipoMovimientoRepository.findByTipo("Merma")
                .orElseThrow(() -> new EntityNotFoundException("Tipo de movimiento 'Merma' no encontrado. Asegúrate de crearlo en la tabla TIPO_MOVIMIENTO."));

        for (MermaMasivaDto.DetalleItem item : mermaDto.getDetalles()) {

            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con ID: " + item.getProductoId()));

            Inventario inventario = inventarioRepository.findByProductoAndSede(producto, sede)
                    .orElseThrow(() -> new EntityNotFoundException(
                            "No existe stock registrado para '" + producto.getNombre() + "' en la sede '" + sede.getNombreSede() + "'"));

            int stockAnterior = inventario.getStockActual();
            int cantidadMermada = item.getCantidad();

            if (stockAnterior < cantidadMermada) {
                throw new IllegalArgumentException(
                        "Stock insuficiente para mermar '" + producto.getNombre() + "' en la sede '" + sede.getNombreSede()
                                + "'. Stock actual: " + stockAnterior);
            }

            int stockNuevo = stockAnterior - cantidadMermada;
            inventario.setStockActual(stockNuevo);
            inventarioRepository.save(inventario);

            String observaciones = String.format("Motivo: %s. Stock: %d -> %d.%s",
                    item.getMotivo(), stockAnterior, stockNuevo,
                    (item.getObservacion() != null && !item.getObservacion().isBlank() ? " " + item.getObservacion() : ""));

            MovimientoInventario movimiento = new MovimientoInventario(
                    producto,
                    sede,
                    usuario,
                    tipoMerma,
                    cantidadMermada,
                    observaciones
            );
            movimientoInventarioRepository.save(movimiento);

            String descripcionAuditoria = String.format(
                    "Registró merma de %d unidad(es) del producto '%s' (SKU: %s) en la sede '%s'. Motivo: %s. Stock: %d -> %d",
                    cantidadMermada, producto.getNombre(), producto.getSku(), sede.getNombreSede(), item.getMotivo(), stockAnterior, stockNuevo);

            historialActividadService.registrarActividad(usuario, "MERMA", descripcionAuditoria, "INVENTARIO",
                    "MovimientoInventario", movimiento.getId(), observaciones);
        }
    }

    @Override
    @Transactional
    public ResultadoImportacionVentasDto importarVentas(Integer sedeId, MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("Debes adjuntar un archivo CSV con datos.");
        }
        String nombreArchivo = archivo.getOriginalFilename() != null ? archivo.getOriginalFilename() : "ventas.csv";
        if (!nombreArchivo.toLowerCase().endsWith(".csv")) {
            throw new IllegalArgumentException("El archivo debe tener extensión .csv");
        }

        Usuario usuario = getUsuarioLogueado();
        Sede sede = sedeRepository.findById(sedeId)
                .orElseThrow(() -> new EntityNotFoundException("Sede no encontrada con ID: " + sedeId));
        TipoMovimiento tipoVenta = tipoMovimientoRepository.findByTipo("Venta")
                .orElseThrow(() -> new EntityNotFoundException("Tipo de movimiento 'Venta' no encontrado. Asegúrate de crearlo en la tabla TIPO_MOVIMIENTO."));

        // ---- Fase 1: leer y validar todo el archivo (formato: sku,cantidad) ----
        List<String> errores = new ArrayList<>();
        Map<String, Integer> ventasPorSku = new LinkedHashMap<>();
        Map<String, Producto> productosPorSku = new HashMap<>();
        int filas = 0;

        String contenido;
        try {
            contenido = new String(archivo.getBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalArgumentException("No se pudo leer el archivo CSV.");
        }
        if (contenido.startsWith("﻿")) {
            contenido = contenido.substring(1); // BOM de Excel
        }
        String[] lineas = contenido.split("\\r?\\n");

        for (int i = 0; i < lineas.length; i++) {
            String linea = lineas[i].trim();
            if (linea.isEmpty()) continue;
            int nroLinea = i + 1;

            String[] cols = linea.split("[,;\\t]", -1);
            String sku = cols[0].replace("\"", "").trim();
            String cantTxt = cols.length > 1 ? cols[1].replace("\"", "").trim() : "";

            // Cabecera opcional: primera línea cuya cantidad no es numérica
            if (i == 0 && !cantTxt.matches("-?\\d+")) continue;

            filas++;
            if (cols.length < 2 || sku.isEmpty()) {
                errores.add("Línea " + nroLinea + ": formato inválido, se esperaba 'sku,cantidad'.");
                continue;
            }
            int cantidad;
            try {
                cantidad = Integer.parseInt(cantTxt);
            } catch (NumberFormatException e) {
                errores.add("Línea " + nroLinea + ": la cantidad '" + cantTxt + "' no es un número entero.");
                continue;
            }
            if (cantidad <= 0) {
                errores.add("Línea " + nroLinea + ": la cantidad debe ser mayor a 0.");
                continue;
            }
            Producto producto = productosPorSku.get(sku);
            if (producto == null) {
                producto = productoRepository.findBySku(sku).orElse(null);
                if (producto == null) {
                    errores.add("Línea " + nroLinea + ": no existe un producto con SKU '" + sku + "'.");
                    continue;
                }
                productosPorSku.put(sku, producto);
            }
            ventasPorSku.merge(sku, cantidad, Integer::sum);
        }

        if (filas == 0 && errores.isEmpty()) {
            errores.add("El archivo no contiene filas de ventas.");
        }

        // Validar stock suficiente (sumando todas las filas del mismo SKU)
        Map<String, Inventario> inventarios = new HashMap<>();
        for (Map.Entry<String, Integer> e : ventasPorSku.entrySet()) {
            Producto p = productosPorSku.get(e.getKey());
            Inventario inv = inventarioRepository.findByProductoAndSede(p, sede).orElse(null);
            int stock = inv != null ? inv.getStockActual() : 0;
            if (inv == null || stock < e.getValue()) {
                errores.add("SKU '" + e.getKey() + "': stock insuficiente en '" + sede.getNombreSede()
                        + "' (stock " + stock + ", ventas " + e.getValue() + ").");
            } else {
                inventarios.put(e.getKey(), inv);
            }
        }

        if (!errores.isEmpty()) {
            throw new ImportacionVentasException("El archivo tiene errores. No se aplicó ninguna venta.", errores);
        }

        // ---- Fase 2: aplicar descuentos de stock y registrar en el Kardex ----
        List<String> detalle = new ArrayList<>();
        int unidades = 0;
        for (Map.Entry<String, Integer> e : ventasPorSku.entrySet()) {
            Producto producto = productosPorSku.get(e.getKey());
            Inventario inventario = inventarios.get(e.getKey());

            int cantidad = e.getValue();
            int stockAnterior = inventario.getStockActual();
            int stockNuevo = stockAnterior - cantidad;
            inventario.setStockActual(stockNuevo);
            inventarioRepository.save(inventario);

            String observaciones = String.format("Venta importada por CSV (%s). Stock: %d -> %d",
                    nombreArchivo, stockAnterior, stockNuevo);
            MovimientoInventario movimiento = new MovimientoInventario(
                    producto, sede, usuario, tipoVenta, cantidad, observaciones);
            movimientoInventarioRepository.save(movimiento);

            historialActividadService.registrarActividad(usuario, "VENTA_IMPORTADA",
                    String.format("Importó venta de %d unidad(es) de '%s' (SKU: %s) en la sede '%s'. Stock: %d -> %d",
                            cantidad, producto.getNombre(), producto.getSku(), sede.getNombreSede(), stockAnterior, stockNuevo),
                    "INVENTARIO", "MovimientoInventario", movimiento.getId(), observaciones);

            detalle.add(producto.getSku() + " - " + producto.getNombre() + ": -" + cantidad
                    + " (stock " + stockAnterior + " -> " + stockNuevo + ")");
            unidades += cantidad;
        }

        return new ResultadoImportacionVentasDto(filas, ventasPorSku.size(), unidades, detalle);
    }

    @Override
    @Transactional
    public void registrarAjusteConteo(Integer sedeId, Long productoId, Integer stockContado) {
        Usuario usuario = getUsuarioLogueado();

        Sede sede = sedeRepository.findById(sedeId)
                .orElseThrow(() -> new EntityNotFoundException("Sede no encontrada ID: " + sedeId));
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado ID: " + productoId));

        TipoMovimiento tipoAjuste = tipoMovimientoRepository.findByTipo("Ajuste Conteo")
                .orElseThrow(() -> new EntityNotFoundException(
                        "Tipo de movimiento 'Ajuste Conteo' no encontrado. Asegúrate de crearlo en la tabla TIPO_MOVIMIENTO."));

        Inventario inventario = inventarioRepository.findByProductoAndSede(producto, sede)
                .orElse(new Inventario(producto, sede, 0));

        int stockAnterior = inventario.getStockActual();
        int diferencia = stockContado - stockAnterior;

        if (diferencia == 0) {
            return;
        }

        inventario.setStockActual(stockContado);
        inventarioRepository.save(inventario);

        // A diferencia de los demás tipos de movimiento, aquí sí se guarda con signo:
        // permite saber de un vistazo si el conteo encontró más o menos stock del esperado.
        String observaciones = String.format("Ajuste por conteo físico. Stock: %d -> %d (%s%d).",
                stockAnterior, stockContado, diferencia > 0 ? "+" : "", diferencia);

        MovimientoInventario movimiento = new MovimientoInventario(
                producto,
                sede,
                usuario,
                tipoAjuste,
                diferencia,
                observaciones
        );
        movimientoInventarioRepository.save(movimiento);

        String descripcionAuditoria = String.format(
                "Ajustó el stock de '%s' (SKU: %s) en la sede '%s' por conteo físico. Stock: %d -> %d",
                producto.getNombre(), producto.getSku(), sede.getNombreSede(), stockAnterior, stockContado);

        historialActividadService.registrarActividad(usuario, "AJUSTE_CONTEO", descripcionAuditoria, "INVENTARIO",
                "MovimientoInventario", movimiento.getId(), observaciones);
    }

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
    public List<InventarioActualDto> listarInventarioPorSede(Integer sedeId) {
        Sede sede = sedeRepository.findById(sedeId)
                .orElseThrow(() -> new EntityNotFoundException("Sede no encontrada con ID: " + sedeId));
        return inventarioRepository.findBySede(sede).stream().map(inv -> {
            InventarioActualDto dto = new InventarioActualDto();
            dto.setIdInventario(inv.getId());
            dto.setIdProducto(inv.getProducto().getId_producto());
            dto.setSkuProducto(inv.getProducto().getSku());
            dto.setNombreProducto(inv.getProducto().getNombre());
            dto.setNombreSede(inv.getSede().getNombreSede());
            dto.setStockActual(inv.getStockActual());
            dto.setUltimaActualizacion(inv.getUltimaActualizacion());
            return dto;
        }).sorted(java.util.Comparator.comparing(InventarioActualDto::getNombreProducto, String.CASE_INSENSITIVE_ORDER))
          .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public int asociarProductosASede(Integer sedeId, List<Long> productoIds) {
        Usuario usuario = getUsuarioLogueado();
        Sede sede = sedeRepository.findById(sedeId)
                .orElseThrow(() -> new EntityNotFoundException("Sede no encontrada con ID: " + sedeId));

        int asociados = 0;
        for (Long productoId : new java.util.LinkedHashSet<>(productoIds)) {
            Producto producto = productoRepository.findById(productoId)
                    .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con ID: " + productoId));
            if (inventarioRepository.findByProductoAndSede(producto, sede).isPresent()) {
                continue; // ya estaba asociado
            }
            // Stock inicial 0: el stock real entra por recepción / transferencia / conteo para mantener el Kardex.
            inventarioRepository.save(new Inventario(producto, sede, 0));
            historialActividadService.registrarActividad(usuario, "ASOCIAR_PRODUCTO_SEDE",
                    String.format("Asoció el producto '%s' (SKU: %s) al inventario de la sede '%s'",
                            producto.getNombre(), producto.getSku(), sede.getNombreSede()),
                    "INVENTARIO", "Inventario", producto.getId_producto(), "Stock inicial: 0");
            asociados++;
        }
        return asociados;
    }

    @Override
    @Transactional
    public void desasociarProductoDeSede(Integer sedeId, Long productoId) {
        Usuario usuario = getUsuarioLogueado();
        Sede sede = sedeRepository.findById(sedeId)
                .orElseThrow(() -> new EntityNotFoundException("Sede no encontrada con ID: " + sedeId));
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con ID: " + productoId));
        Inventario inventario = inventarioRepository.findByProductoAndSede(producto, sede)
                .orElseThrow(() -> new EntityNotFoundException("El producto no está asociado a esta sede"));

        if (inventario.getStockActual() != 0) {
            throw new IllegalArgumentException("No se puede desasociar '" + producto.getNombre()
                    + "': aún tiene stock (" + inventario.getStockActual() + "). Transfiérelo o regístralo como merma primero.");
        }

        inventarioRepository.delete(inventario);
        historialActividadService.registrarActividad(usuario, "DESASOCIAR_PRODUCTO_SEDE",
                String.format("Quitó el producto '%s' (SKU: %s) del inventario de la sede '%s'",
                        producto.getNombre(), producto.getSku(), sede.getNombreSede()),
                "INVENTARIO", "Inventario", producto.getId_producto(), "Stock al quitar: 0");
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
        registrarMovimiento(sedeId, productoId, tipoMovimientoStr, cantidad, null);
    }

    @Override
    @Transactional
    public void registrarMovimiento(Integer sedeId, Long productoId, String tipoMovimientoStr, Integer cantidad, String detalle) {
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
        if (detalle != null && !detalle.isBlank()) {
            observaciones += ". " + detalle;
        }

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