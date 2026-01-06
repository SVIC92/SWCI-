package com.inventario.backend_inventario.config;

import com.inventario.backend_inventario.Model.TipoMovimiento;
import com.inventario.backend_inventario.Repository.TipoMovimientoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private TipoMovimientoRepository tipoMovimientoRepo;

    @Override
    public void run(String... args) throws Exception {
        crearTipoSiNoExiste("SALIDA_TRANSFERENCIA", "Salida de inventario por transferencia a otra sede");
        crearTipoSiNoExiste("ENTRADA_TRANSFERENCIA", "Entrada de inventario por transferencia desde otra sede");
    }

    private void crearTipoSiNoExiste(String tipo, String descripcion) {
        // Verifica si ya existe para no duplicarlo cada vez que inicias la app
        if (tipoMovimientoRepo.findByTipo(tipo).isEmpty()) {
            TipoMovimiento nuevo = new TipoMovimiento();
            nuevo.setTipo(tipo);
            nuevo.setDescripcion(descripcion);
            tipoMovimientoRepo.save(nuevo);
            System.out.println("✅ Tipo de movimiento creado automáticamente: " + tipo);
        }
    }
}