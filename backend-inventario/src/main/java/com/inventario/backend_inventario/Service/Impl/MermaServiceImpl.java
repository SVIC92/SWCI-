package com.inventario.backend_inventario.Service.Impl;

import com.inventario.backend_inventario.Dto.DetalleMermaRequestDto;
import com.inventario.backend_inventario.Dto.MermaRequestDto;
import com.inventario.backend_inventario.Enum.TipoMerma;
import com.inventario.backend_inventario.Model.*;
import com.inventario.backend_inventario.Repository.*;
import com.inventario.backend_inventario.Service.MermaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class MermaServiceImpl implements MermaService {

    @Autowired
    private MermaRepository mermaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private SedeRepository sedeRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private InventarioRepository inventarioRepository;

    @Override
    @Transactional // Garantiza atomicidad total en la base de datos
    public Merma registrarMerma(MermaRequestDto request) {
        
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + request.getUsuarioId()));

        Sede sede = sedeRepository.findById(request.getSedeId())
                .orElseThrow(() -> new RuntimeException("Sede no encontrada con ID: " + request.getSedeId()));

        Merma merma = new Merma();
        merma.setFechaRegistro(LocalDateTime.now());
        merma.setUsuario(usuario);
        merma.setSede(sede);
        merma.setCostoTotal(0.0);

        List<DetalleMerma> listaDetalles = new ArrayList<>();
        double costoTotalAcumulado = 0.0;

        for (DetalleMermaRequestDto detDto : request.getDetalles()) {
            Producto prod = productoRepository.findById(detDto.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + detDto.getProductoId()));

            // BUSCAR EL STOCK EN LA SEDE ESPECÍFICA
            Inventario inventario = inventarioRepository.findByProductoAndSede(prod, sede)
                    .orElseThrow(() -> new RuntimeException("El producto " + prod.getNombre() + " no está registrado en el inventario de esta sede."));

            if (inventario.getStockActual() < detDto.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para " + prod.getNombre() + ". Disponible: " + inventario.getStockActual());
            }

            // DESCONTAR STOCK DEL INVENTARIO
            inventario.setStockActual((int) (inventario.getStockActual() - detDto.getCantidad()));
            inventarioRepository.save(inventario);

            // CALCULAR COSTOS
            // Usamos el precio o costo de compra de tu entidad Producto
            double costoUnitario = prod.getPrecio_compra() != null ? prod.getPrecio_compra() : 0.0; 
            double costoTotalFila = costoUnitario * detDto.getCantidad();
            costoTotalAcumulado += costoTotalFila;

            DetalleMerma detalle = new DetalleMerma();
            detalle.setMerma(merma);
            detalle.setProducto(prod);
            detalle.setCantidad(detDto.getCantidad());
            detalle.setCostoUnitario(costoUnitario);
            detalle.setCostoTotal(costoTotalFila);
            detalle.setTipoMerma(TipoMerma.valueOf(detDto.getTipoMerma()));

            listaDetalles.add(detalle);
        }

        merma.setCostoTotal(costoTotalAcumulado);
        merma.setDetalles(listaDetalles);

        return mermaRepository.save(merma);
    }
}