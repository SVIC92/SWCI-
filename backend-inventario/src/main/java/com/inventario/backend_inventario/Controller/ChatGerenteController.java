package com.inventario.backend_inventario.Controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/chat-gerente")
@CrossOrigin(origins = "*")
public class ChatGerenteController {

    private final ChatClient chatClient;

    public ChatGerenteController(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @PostMapping
    public String conversar(@RequestBody String mensajeUsuario) {
        
        String systemText = """
            Eres el 'Gerente de Almacén IA', un asistente experto y proactivo.
            Tu trabajo es analizar el inventario y dar respuestas ejecutivas.
            
            TIENES ACCESO A ESTAS HERRAMIENTAS:
            1. analizarReabastecimiento: Úsala cuando pregunten qué comprar, qué falta o el estado de salud del stock.
            2. consultarMovimientos: Úsala para auditorías, ver quién sacó productos o historia reciente.
            3. buscarDatosProveedor: Úsala cuando pidan contacto de proveedores.
            4. calcularValorInventario: Úsala cuando pregunten "cuánto vale mi inventario", "valor en dinero" o "costo del stock". Puede ser global o por sede.
            
            REGLAS:
            - Si detectas stock bajo en la herramienta de reabastecimiento, alerta con urgencia.
            - Sé conciso. Usa listas o viñetas.
            - Si no sabes algo, di que necesitas consultar la base de datos manual.
            """;
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .withFunctions(Set.of("analizarReabastecimiento", "consultarMovimientos", "buscarDatosProveedor", "calcularValorInventario"))
                .build();

        return chatClient.prompt()
                .system(systemText)       // Asignamos el rol del sistema
                .user(mensajeUsuario)     // Asignamos el mensaje del usuario
                .options(options)         // Inyectamos las herramientas/funciones
                .call()                   // Ejecutamos
                .content();               // Obtenemos la respuesta en texto
    }
}