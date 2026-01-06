package com.inventario.backend_inventario.config;
import com.inventario.backend_inventario.Model.Campania;
import com.inventario.backend_inventario.Service.CampaniaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CampaniaAlerta {

    @Autowired
    private CampaniaService campaniaService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate; 

    @Scheduled(cron = "0 0 7 * * ?") 
    public void verificarAlertasCampania() {
        List<Campania> campanias = campaniaService.obtenerCampaniasRelevantes();
        
        for (Campania c : campanias) {
            String estado = campaniaService.obtenerEstadoAlerta(c);
            
            if (estado.contains("¡Últimos días!") || estado.contains("¡Prepárate!")) {
                String mensajeAlerta = String.format("📢 Atención Inventario: La campaña '%s' está en estado: %s", c.getNombreCampania(), estado);
                messagingTemplate.convertAndSend("/topic/alertas", mensajeAlerta);
                System.out.println("Enviando alerta WebSocket: " + mensajeAlerta);
            }
        }
    }
}
