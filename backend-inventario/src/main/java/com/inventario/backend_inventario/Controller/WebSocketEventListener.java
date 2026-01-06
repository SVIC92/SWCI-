package com.inventario.backend_inventario.Controller;

import com.inventario.backend_inventario.Service.WebSocketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.Set;

@Component
public class WebSocketEventListener {

    @Autowired
    private WebSocketService webSocketService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        // Obtenemos el usuario directamente del evento (inyectado en el Config)
        Principal user = event.getUser();
        
        // El ID de sesión sigue siendo necesario para saber cuál borrar después
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        if (user != null) {
            System.out.println("Evento Conectado recibido para: " + user.getName());
            webSocketService.addSession(sessionId, user.getName());
            broadcastActiveUsers();
        } else {
            System.out.println("Evento Conectado pero Usuario es NULL");
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        webSocketService.removeSession(sessionId);
        broadcastActiveUsers();
    }

    private void broadcastActiveUsers() {
        Set<String> users = webSocketService.getActiveUsers();
        messagingTemplate.convertAndSend("/topic/users", users);
    }
}