package com.inventario.backend_inventario.IA;

import com.inventario.backend_inventario.Repository.*;
import com.inventario.backend_inventario.Dto.SugerenciaCompraDto;
import com.inventario.backend_inventario.Enum.EstadoSolicitud;
import com.inventario.backend_inventario.Model.Inventario;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import java.time.LocalDate;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Configuration
public class InventoryTools {

    private final ProductoRepository productoRepository;
    private final MovimientoInventarioRepository movimientoRepository;
    private final ProveedorRepository proveedorRepository;
    private final SedeRepository sedeRepository;
    private final InventarioRepository inventarioRepository;
    private final SolicitudTransferenciaRepository solicitudRepository;
    private final CampaniaRepository campaniaRepository;

    public InventoryTools(ProductoRepository productoRepository, 
                          MovimientoInventarioRepository movimientoRepository,
                          ProveedorRepository proveedorRepository,
                          SedeRepository sedeRepository,
                          InventarioRepository inventarioRepository,
                          SolicitudTransferenciaRepository solicitudRepository,
                          CampaniaRepository campaniaRepository) {
        this.productoRepository = productoRepository;
        this.movimientoRepository = movimientoRepository;
        this.proveedorRepository = proveedorRepository;
        this.sedeRepository = sedeRepository;
        this.inventarioRepository = inventarioRepository;
        this.solicitudRepository = solicitudRepository;
        this.campaniaRepository = campaniaRepository;
    }

    // --- HERRAMIENTA 1: SUGERENCIAS DE COMPRA ---
    public record RequestSugerencias(Long idSede) {}
    public record ResponseSugerencias(List<SugerenciaCompraDto> sugerencias) {}

    @Bean
    @Description("Obtiene una lista de productos que necesitan reabastecimiento urgente en una sede específica")
    public Function<RequestSugerencias, ResponseSugerencias> analizarReabastecimiento() {
        return request -> {
            Long sede = request.idSede() != null ? request.idSede() : 1L;
            List<SugerenciaCompraDto> data = productoRepository.obtenerSugerenciasPorSede(sede);
            return new ResponseSugerencias(data);
        };
    }

    // --- HERRAMIENTA 2: AUDITORÍA DE MOVIMIENTOS (KARDEX) ---
    public record RequestKardex(String nombreProducto) {}
    public record ResponseKardex(String resumen) {}

    @Bean
    @Description("Consulta los últimos movimientos (entradas/salidas) de un producto por su nombre")
    public Function<RequestKardex, ResponseKardex> consultarMovimientos() {
        return request -> {
            var productos = productoRepository.buscarPorSimilitud(request.nombreProducto());
            
            if (productos.isEmpty()) return new ResponseKardex("No encontré ningún producto similar a " + request.nombreProducto());
            
            var producto = productos.get(0);
            var movimientos = movimientoRepository.findByProductoOrderByFechaHoraAsc(producto);

            String historial = movimientos.stream()
                .skip(Math.max(0, movimientos.size() - 5))
                .map(m -> String.format("[%s] %s de %d unidades por %s", 
                    m.getFechaHora().toString(), 
                    m.getTipoMovimiento().getTipo(),
                    m.getCantidad(),
                    m.getUsuario().getUsername()))
                .collect(Collectors.joining("\n"));

            return new ResponseKardex("Producto: " + producto.getNombre() + "\nÚltimos movimientos:\n" + historial);
        };
    }

    // --- HERRAMIENTA 3: BUSCAR PROVEEDOR ---
    public record RequestProveedor(String rucOEmail) {}
    public record ResponseProveedor(String datos) {}

    @Bean
    @Description("Busca información de contacto de un proveedor por RUC o Email")
    public Function<RequestProveedor, ResponseProveedor> buscarDatosProveedor() {
        return request -> {
            var provRuc = proveedorRepository.findByRuc(request.rucOEmail());
            if (provRuc.isPresent()) return new ResponseProveedor(provRuc.get().toString());

            var provEmail = proveedorRepository.findByEmail(request.rucOEmail());
            if (provEmail.isPresent()) return new ResponseProveedor(provEmail.get().toString());

            return new ResponseProveedor("Proveedor no encontrado.");
        };
    }

    // --- HERRAMIENTA 4: VALORIZACIÓN DE INVENTARIO ---
    public record RequestValor(String nombreProducto, String nombreSede) {}
    public record ResponseValor(String detalle, Double valorTotal) {}

    @Bean
    @Description("Calcula el valor monetario del stock (Stock * Costo). Puede filtrar por sede si se especifica.")
    public Function<RequestValor, ResponseValor> calcularValorInventario() {
        return request -> {
            var productos = productoRepository.buscarPorSimilitud(request.nombreProducto());
            
            if (productos.isEmpty()) {
                return new ResponseValor("No encontré el producto: " + request.nombreProducto(), 0.0);
            }
            
            var p = productos.get(0);
            Double costo = p.getPrecio_compra();
            
            if (costo == null) costo = 0.0;

            Integer stockTotal = 0;
            String ubicacionReporte = "Global (Todas las sedes)";

            if (request.nombreSede() != null && !request.nombreSede().isBlank()) {
                // Buscamos la sede en memoria (asumiendo que son pocas) o podrías crear un método findByNombre
                var sedeOpt = sedeRepository.findAll().stream()
                        .filter(s -> s.getNombreSede().toLowerCase().contains(request.nombreSede().toLowerCase()))
                        .findFirst();

                if (sedeOpt.isPresent()) {
                    var sede = sedeOpt.get();
                    ubicacionReporte = sede.getNombreSede();
                    
                    var invOpt = inventarioRepository.findByProductoAndSede(p, sede);
                    stockTotal = invOpt.map(Inventario::getStockActual).orElse(0);
                } else {
                    return new ResponseValor("No encontré la sede llamada: " + request.nombreSede(), 0.0);
                }
            } else {
                var inventarios = inventarioRepository.findByProducto(p);
                stockTotal = inventarios.stream()
                        .mapToInt(Inventario::getStockActual)
                        .sum();
            }

            Double valorTotal = stockTotal * costo;

            // Formato de moneda para la respuesta de texto
            String detalle = String.format(
                "💰 **Valorización de Inventario**\n" +
                "- **Producto:** %s (SKU: %s)\n" +
                "- **Ubicación:** %s\n" +
                "- **Stock Actual:** %d unid.\n" +
                "- **Costo Unitario:** S/ %.2f", 
                p.getNombre(), p.getSku(), ubicacionReporte, stockTotal, costo
            );
            
            return new ResponseValor(detalle, valorTotal);
        };
    }
    // --- HERRAMIENTA 5: LOCALIZADOR DE PRODUCTO (¿DÓNDE HAY STOCK?) ---
    public record RequestUbicacion(String nombreProducto) {}
    public record ResponseUbicacion(String mensaje) {}

    @Bean
    @Description("Busca en qué sedes hay stock disponible de un producto específico")
    public Function<RequestUbicacion, ResponseUbicacion> ubicarProductoEnSedes() {
        return request -> {
            // Buscamos el producto por similitud de nombre (usa tu repo existente)
            var productos = productoRepository.buscarPorSimilitud(request.nombreProducto());
            
            if (productos.isEmpty()) {
                return new ResponseUbicacion("No pude encontrar ningún producto con el nombre: " + request.nombreProducto());
            }
            
            var producto = productos.get(0); // Tomamos la mejor coincidencia
            var inventarios = inventarioRepository.findByProducto(producto);
            
            // Filtramos solo las sedes con stock > 0
            String disponibilidad = inventarios.stream()
                .filter(inv -> inv.getStockActual() > 0)
                .map(inv -> String.format("- 🏢 %s: %d unidades", inv.getSede().getNombreSede(), inv.getStockActual()))
                .collect(Collectors.joining("\n"));

            if (disponibilidad.isEmpty()) {
                return new ResponseUbicacion("El producto '" + producto.getNombre() + "' (SKU: " + producto.getSku() + ") está agotado en todas las sedes.");
            }

            return new ResponseUbicacion("📍 Disponibilidad de '" + producto.getNombre() + "':\n" + disponibilidad);
        };
    }
    // --- HERRAMIENTA 6: REPORTE GERENCIAL DE SEDE ---
    public record RequestResumenSede(String nombreSede) {}
    public record ResponseResumenSede(String resumen) {}

    @Bean
    @Description("Genera un resumen rápido del estado actual de una sede (Valorizado, alertas, stock total), en formato de lista")
    public Function<RequestResumenSede, ResponseResumenSede> resumenEstadoSede() {
        return request -> {
            // Buscamos la sede en memoria (filtrando por nombre)
            var sedeOpt = sedeRepository.findAll().stream()
                        .filter(s -> s.getNombreSede().toLowerCase().contains(request.nombreSede().toLowerCase()))
                        .findFirst();

            if (sedeOpt.isEmpty()) {
                return new ResponseResumenSede("No encontré la sede llamada: " + request.nombreSede());
            }

            var sede = sedeOpt.get();
            var inventarios = inventarioRepository.findBySede(sede); // Usamos el método existente en tu repo

            // Cálculos estadísticos
            int totalReferencias = inventarios.size();
            int stockFisicoTotal = inventarios.stream().mapToInt(Inventario::getStockActual).sum();
            
            long alertasStockBajo = inventarios.stream()
                    .filter(inv -> inv.getStockActual() <= inv.getProducto().getStockMinimo())
                    .count();
            
            double valorizadoSede = inventarios.stream()
                    .mapToDouble(inv -> {
                        Double costo = inv.getProducto().getPrecio_compra();
                        return (costo != null ? costo : 0.0) * inv.getStockActual();
                    })
                    .sum();

            String informe = String.format(
                "📊 **Reporte Flash: %s**\n" +
                "--------------------------------\n" +
                "📦 **Total Referencias:** %d productos\n" +
                "🔢 **Stock Físico:** %d unidades\n" +
                "⚠️ **Alertas Críticas:** %d productos bajo mínimo\n" +
                "💰 **Valor del Inventario:** S/ %.2f",
                sede.getNombreSede(), totalReferencias, stockFisicoTotal, alertasStockBajo, valorizadoSede
            );

            return new ResponseResumenSede(informe);
        };
    }
    // --- HERRAMIENTA 7: FICHA TÉCNICA DE PRODUCTO ---
    public record RequestInfoProducto(String nombreProducto) {}
    public record ResponseInfoProducto(String fichaTecnica) {}

    @Bean
    @Description("Obtiene la ficha técnica detallada de un producto: precios, códigos (SKU/EAN), marca y proveedor, en formato de lista")
    public Function<RequestInfoProducto, ResponseInfoProducto> obtenerInformacionProducto() {
        return request -> {
            var productos = productoRepository.buscarPorSimilitud(request.nombreProducto());
            
            if (productos.isEmpty()) {
                return new ResponseInfoProducto("No encontré información del producto: " + request.nombreProducto());
            }

            var p = productos.get(0); 
            
            String ficha = String.format(
                "📋 **Ficha Técnica: %s**\n\n" +  
                "- 🏷️ **Marca:** %s\n" +   
                "- 🔢 **SKU:** %s  |  **EAN:** %s\n" +
                "- 📂 **Categoría:** %s\n" +
                "- 💵 **Precio Venta:** S/ %.2f\n" +
                "- 📉 **Costo Compra:** S/ %.2f\n" +
                "- 📦 **Unidad:** %s\n" +
                "- 📊 **Stock (Min/Ideal):** %d / %d\n" +
                "- 🚚 **Proveedor:** %s",
                p.getNombre(), 
                p.getMarca(), 
                p.getSku(), p.getCodEan(),
                (p.getCategoria() != null ? p.getCategoria().getNombreCat() : "N/A"),
                p.getPrecio_venta(), 
                p.getPrecio_compra(),
                p.getUni_medida(),
                p.getStockMinimo(), p.getStockIdeal(),
                (p.getProveedor() != null ? p.getProveedor().getNombre_proveedor() : "N/A")
            );

            return new ResponseInfoProducto(ficha);
        };
    }
    // --- HERRAMIENTA 8: ESTADO DE TRANSFERENCIAS (LOGÍSTICA) ---
    public record RequestTransferencias(String estado) {} // Ej: "PENDIENTE", "APROBADO"
    public record ResponseTransferencias(String reporte) {}

    @Bean
    @Description("Consulta las solicitudes de transferencia de mercadería según su estado (PENDIENTE, APROBADO, RECHAZADO), en formato de lista")
    public Function<RequestTransferencias, ResponseTransferencias> consultarTransferencias() {
        return request -> {
            String estadoBusqueda = request.estado() != null ? request.estado().toUpperCase() : "PENDIENTE";
            
            try {
                var estadoEnum = EstadoSolicitud.valueOf(estadoBusqueda);
                var solicitudes = solicitudRepository.findByEstado(estadoEnum);

                if (solicitudes.isEmpty()) {
                    return new ResponseTransferencias("No hay solicitudes de transferencia con estado: " + estadoBusqueda);
                }

                String detalle = solicitudes.stream()
                    .map(s -> String.format("🆔 #%d | 📅 %s | 🚚 De %s ➡ A %s | 👤 %s",
                        s.getId(),
                        s.getFechaSolicitud().toLocalDate(),
                        s.getSedeOrigen().getNombreSede(),
                        s.getSedeDestino().getNombreSede(),
                        s.getUsuarioSolicitante().getUsername()))
                    .collect(Collectors.joining("\n"));

                return new ResponseTransferencias("🚛 **Transferencias " + estadoBusqueda + ":**\n" + detalle);
            } catch (IllegalArgumentException e) {
                return new ResponseTransferencias("Estado inválido. Intenta con: PENDIENTE, APROBADO o RECHAZADO.");
            }
        };
    }

    // --- HERRAMIENTA 9: CAMPAÑAS ACTIVAS (MARKETING) ---
    public record RequestCampanias(String fechaReferencia) {} // No es obligatorio usarlo, usaremos fecha actual
    public record ResponseCampanias(String reporte) {}

    @Bean
    @Description("Muestra las campañas promocionales activas y próximas a realizarse")
    public Function<RequestCampanias, ResponseCampanias> consultarCampaniasActivas() {
        return request -> {
            var activas = campaniaRepository.findProximasYActivas(LocalDate.now());

            if (activas.isEmpty()) {
                return new ResponseCampanias("No hay campañas o promociones activas en este momento.");
            }

            String detalle = activas.stream()
                .map(c -> String.format("🎉 **%s** (Descuento: %.0f%%)\n   - 📅 Del %s al %s\n   - 📝 %s",
                    c.getNombreCampania(),
                    c.getPorcentajeDescuento(),
                    c.getFechaInicio(),
                    c.getFechaFin(),
                    c.getDescripcion()))
                .collect(Collectors.joining("\n\n"));

            return new ResponseCampanias("📢 **Campañas Comerciales Vigentes:**\n\n" + detalle);
        };
    }
}
