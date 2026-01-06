package com.inventario.backend_inventario.Security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private final long expiration = 1000 * 60 * 60 * 10;

    public String generateToken(String email, String rol, String type_expiration) {
        long expiration_time;
        if (type_expiration.equals("Sesion")) {
            expiration_time = this.expiration;
        }else if (type_expiration.equals("Temporal")) {
            expiration_time = 15 * 60 * 1000;
            return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration_time))
                .signWith(key)
                .compact();
        }else{
            expiration_time = 1000 * 60 * 60 * 24;
        }
        return Jwts.builder()
                .setSubject(email)
                .claim("rol", rol)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration_time))
                .signWith(key)
                .compact();
    }

    public Claims validateToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("⚠️ Token inválido o expirado: " + e.getMessage());
            return null;
        }
    }
    public String getEmailFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject(); 

        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("⚠️ Token inválido o expirado al intentar leer el email: " + e.getMessage());
            return null;
        }
    }
}
