package com.inventario.backend_inventario.Service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;

@Service
public class WebSocketService {
    private final Map<String, String> activeSessions = new ConcurrentHashMap<>();

    public void addSession(String sessionId, String email) {
        activeSessions.put(sessionId, email);
    }

    public void removeSession(String sessionId) {
        activeSessions.remove(sessionId);
    }

    public Set<String> getActiveUsers() {
        return new HashSet<>(activeSessions.values());
    }
}