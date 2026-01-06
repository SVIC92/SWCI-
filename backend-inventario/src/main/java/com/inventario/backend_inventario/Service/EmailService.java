package com.inventario.backend_inventario.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private String senderEmail = "swciplusinventarios@gmail.com";

    public void sendPasswordResetEmail(String to, String resetLink) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(senderEmail);
            helper.setTo(to);
            helper.setSubject("Restablecimiento de Contraseña - SWCI+");
            String htmlContent = """
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>
                    <div style='background-color: #f8f9fa; padding: 20px; text-align: center;'>
                        <img src='https://swci.vercel.app/logo.png' alt='SWCI Logo' height='80' style='display: block; margin: 0 auto;'/>
                    </div>
                    <div style='padding: 30px; background-color: #ffffff;'>
                        <h2 style='color: #333; margin-top: 0; text-align: center;'>Recuperación de Contraseña</h2>
                        <p style='color: #555; font-size: 16px; line-height: 1.5;'>Hola,</p>
                        <p style='color: #555; font-size: 16px; line-height: 1.5;'>Hemos recibido una solicitud para restablecer tu acceso al sistema SWCI+. Haz clic en el siguiente botón para continuar:</p>
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='%s' style='background-color: #0d6efd; color: #ffffff; padding: 14px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;'>Restablecer Contraseña</a>
                        </div>
                        <p style='color: #999; font-size: 14px; margin-top: 30px; text-align: center;'>Si no solicitaste este cambio, ignora este correo.</p>
                    </div>
                    <div style='background-color: #f8f9fa; padding: 15px; text-align: center; color: #aaa; font-size: 12px;'>
                        &copy; 2025 SWCI+. Sistema Web de Control de Inventario.
                    </div>
                </div>
                """.formatted(resetLink);

            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);

        } catch (MessagingException e) {
            System.err.println("Error enviando correo HTML: " + e.getMessage());
        }
    }
}