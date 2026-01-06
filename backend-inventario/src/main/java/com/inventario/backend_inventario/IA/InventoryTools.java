package com.inventario.backend_inventario.IA;

import com.inventario.backend_inventario.Repository.*;
import com.inventario.backend_inventario.Dto.SugerenciaCompraDto;
import com.inventario.backend_inventario.Model.Inventario;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

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

    public InventoryTools(ProductoRepository productoRepository, 
                          MovimientoInventarioRepository movimientoRepository,
                          ProveedorRepository proveedorRepository,
                          SedeRepository sedeRepository,
                          InventarioRepository inventarioRepository) {
        this.productoRepository = productoRepository;
        this.movimientoRepository = movimientoRepository;
        this.proveedorRepository = proveedorRepository;
        this.sedeRepository = sedeRepository;
        this.inventarioRepository = inventarioRepository;
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

}
