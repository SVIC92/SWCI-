package com.inventario.backend_inventario.Controller;

import com.inventario.backend_inventario.Model.Usuario;
import com.inventario.backend_inventario.Repository.UsuarioRepository;
import com.inventario.backend_inventario.Security.JwtUtil;
import com.inventario.backend_inventario.Service.HistorialActividadService;
import com.inventario.backend_inventario.Service.EmailService;
import com.inventario.backend_inventario.Service.MfaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioRepository usuarioRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    @Autowired
    private EmailService emailService;
    @Autowired
    private MfaService mfaService;
    @Autowired
    private HistorialActividadService historialService;

    public AuthController(UsuarioRepository usuarioRepo,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil) {
        this.usuarioRepo = usuarioRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest datos) {
        var usuarioOpt = usuarioRepo.findByEmail(datos.getEmail());
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Credenciales inválidas"));
        }

        Usuario usuario = usuarioOpt.get();

        if (usuario.getEstado_u() != null && usuario.getEstado_u() == false) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Cuenta desactivada"));
        }

        boolean passOk = false;
        if (usuario.getPass() != null) {
            try {
                passOk = passwordEncoder.matches(datos.getPass(), usuario.getPass());
            } catch (Exception ignored) {
            }
            if (!passOk)
                passOk = datos.getPass().equals(usuario.getPass());
        }

        if (!passOk) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Credenciales inválidas"));
        }

        if (usuario.isMfaEnabled()) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("mfaRequired", true);
            resp.put("email", usuario.getEmail());

            return ResponseEntity.ok(resp);

        } else {
            String token = jwtUtil.generateToken(usuario.getEmail(), usuario.getRol().getNombreRol(), "Sesion");
            try {
                historialService.registrarActividad(
                        usuario,
                        "LOGIN",
                        "El usuario: " + usuario.getNombre_u() + " [" + usuario.getRol().getNombreRol()
                                + "] ha iniciado sesión.",
                        "INICIO SESIÓN",
                        "Usuario",
                        (long) usuario.getId_u(),
                        "Inicio de sesión exitoso");
            } catch (Exception e) {
                System.err.println("Error registrando auditoría de login: " + e.getMessage());
            }
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("mfaRequired", false);
            resp.put("token", token);
            resp.put("usuario", new LoginResponse(
                    usuario.getId_u(),
                    usuario.getDni(),
                    usuario.getNombre_u(),
                    usuario.getApellido_pat(),
                    usuario.getApellido_mat(),
                    usuario.getTelefono(),
                    usuario.getEmail(),
                    usuario.getEstado_u(),
                    usuario.getRol().getNombreRol(),
                    usuario.isMfaEnabled()));
            return ResponseEntity.ok(resp);
        }
    }

    @PostMapping("/mfa/login-verify")
    public ResponseEntity<Map<String, Object>> verifyMfaLogin(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String code = payload.get("code");

        var usuarioOpt = usuarioRepo.findByEmail(email);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Usuario no encontrado"));
        }
        Usuario usuario = usuarioOpt.get();

        if (usuario.getMfaSecret() == null || !mfaService.verifyCode(usuario.getMfaSecret(), code)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Código 2FA inválido"));
        }

        String token = jwtUtil.generateToken(usuario.getEmail(), usuario.getRol().getNombreRol(), "Sesion");

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("token", token);
        resp.put("usuario", new LoginResponse(
                usuario.getId_u(),
                usuario.getDni(),
                usuario.getNombre_u(),
                usuario.getApellido_pat(),
                usuario.getApellido_mat(),
                usuario.getTelefono(),
                usuario.getEmail(),
                usuario.getEstado_u(),
                usuario.getRol().getNombreRol(),
                usuario.isMfaEnabled()));
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        // CHISMOSO 1: Ver qué correo llegó
        System.out.println("DEBUG: Intentando recuperar pass para: " + request.getEmail());

        Optional<Usuario> usuarioOpt = usuarioRepo.findByEmail(request.getEmail());

        if (usuarioOpt.isPresent()) {
            System.out.println("DEBUG: ¡Usuario ENCONTRADO! Generando token...");
            Usuario usuario = usuarioOpt.get();

            String resetToken = jwtUtil.generateToken(usuario.getEmail(), "", "Temporal");
            String resetLink = "https://swci.vercel.app/reset-password?token=" + resetToken;

            try {
                emailService.sendPasswordResetEmail(usuario.getEmail(), resetLink);
                System.out.println("DEBUG: Correo enviado al servicio de email.");
            } catch (Exception e) {
                System.err.println("DEBUG ERROR: Falló el envío de email: " + e.getMessage());
            }
        } else {
            // CHISMOSO 2: Avisar si no se encontró
            System.out.println("DEBUG: Usuario NO encontrado en la base de datos.");
        }

        return ResponseEntity
                .ok("Si existe una cuenta asociada a este correo, se ha enviado un enlace de restablecimiento.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        String token = request.getToken();
        String newPassword = request.getNewPassword();

        try {
            if (jwtUtil.validateToken(token) == null) {
                return ResponseEntity.badRequest().body("Token inválido o expirado.");
            }

            String email = jwtUtil.getEmailFromToken(token);
            Usuario usuario = usuarioRepo.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email del token"));

            String encodedPassword = passwordEncoder.encode(newPassword);
            usuario.setPass(encodedPassword);
            usuarioRepo.save(usuario);

            return ResponseEntity.ok("Contraseña actualizada exitosamente.");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al restablecer la contraseña: " + e.getMessage());
        }
    }

    @PostMapping("/mfa/setup")
    public ResponseEntity<?> setupMfa(Authentication authentication) {
        Usuario usuario = usuarioRepo.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        String secret = mfaService.generateNewSecret();
        String qrCodeUri = mfaService.generateQrCodeImageUri(secret, usuario.getEmail(), "TuAppInventario");

        usuario.setMfaSecret(secret);
        usuario.setMfaEnabled(false);
        usuarioRepo.save(usuario);

        return ResponseEntity.ok(Map.of("secret", secret, "qrCodeUri", qrCodeUri));
    }

    @PostMapping("/mfa/verify")
    public ResponseEntity<?> verifyMfa(@RequestBody Map<String, String> payload, Authentication authentication) {
        String code = payload.get("code");

        Usuario usuario = usuarioRepo.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        if (mfaService.verifyCode(usuario.getMfaSecret(), code)) {
            usuario.setMfaEnabled(true);
            usuarioRepo.save(usuario);
            return ResponseEntity.ok(Map.of("message", "2FA habilitado correctamente"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Código inválido"));
        }
    }

    @PostMapping("/mfa/disable")
    public ResponseEntity<?> disableMfa(Authentication authentication) {
        Usuario usuario = usuarioRepo.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        usuario.setMfaEnabled(false);
        usuario.setMfaSecret(null);
        usuarioRepo.save(usuario);

        return ResponseEntity.ok(Map.of("message", "2FA deshabilitado correctamente"));
    }

    public record LoginResponse(
            Integer id_u,
            String dni,
            String nombre_u,
            String apellido_pat,
            String apellido_mat,
            String telefono,
            String email,
            boolean estado_u,
            String rol,
            boolean mfaEnabled) {
    }
}
