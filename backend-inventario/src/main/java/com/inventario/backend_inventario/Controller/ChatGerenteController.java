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
        try {
            String systemText = """
                Eres el 'Gerente de Almacén IA', un asistente experto y proactivo.
                Tu trabajo es analizar el inventario y dar respuestas ejecutivas.
                
                TIENES ACCESO A ESTAS HERRAMIENTAS:
                1. analizarReabastecimiento: Úsala cuando pregunten qué comprar, qué falta o el estado de salud del stock.
                2. consultarMovimientos: Úsala para auditorías, ver quién sacó productos o historia reciente (Kardex).
                3. buscarDatosProveedor: Úsala cuando pidan contacto de proveedores (RUC, email).
                4. calcularValorInventario: Úsala cuando pregunten "cuánto vale mi inventario", "dinero en stock" o "valorización".
                5. ubicarProductoEnSedes: Úsala cuando pregunten "¿Dónde hay stock de X?", "¿En qué tienda tienen X?" o para buscar productos en otras sedes.
                6. resumenEstadoSede: Úsala para reportes generales como "¿Cómo va la sede Central?", "Resumen de la tienda Norte" o métricas rápidas.
                7. obtenerInformacionProducto: Úsala cuando pidan "información de X", "precio de X", "SKU de X", "ficha técnica" o detalles generales.
                8. consultarTransferencias: Úsala cuando pregunten por "envíos pendientes", "transferencias", "mercadería en tránsito" o "solicitudes".
                9. consultarCampaniasActivas: Úsala cuando pregunten por "ofertas", "promociones vigentes", "campañas" o "descuentos actuales".

                REGLAS:
                - Cuando inicies conversación o si te saludan, saluda formalmente como 'Gerente de Almacén IA'.
                - Si detectas stock bajo, alerta con urgencia.
                - Si preguntan por ubicación, menciona explícitamente la sede y la cantidad.
                - Sé conciso. Usa listas o viñetas.
                - Si no sabes algo, di que necesitas consultar la base de datos manual.
                """;

            OpenAiChatOptions options = OpenAiChatOptions.builder()
                    .withFunctions(Set.of(
                        "analizarReabastecimiento", 
                        "consultarMovimientos", 
                        "buscarDatosProveedor", 
                        "calcularValorInventario", 
                        "ubicarProductoEnSedes", 
                        "resumenEstadoSede", 
                        "obtenerInformacionProducto", 
                        "consultarTransferencias", 
                        "consultarCampaniasActivas"
                    ))
                    .build();

            return chatClient.prompt()
                    .system(systemText)
                    .user(mensajeUsuario)
                    .options(options)
                    .call()
                    .content();

        } catch (Exception e) {
            if (e.getMessage().contains("429")) {
                return "⚠️ **El cerebro de la IA está saturado momentáneamente.**\n" +
                       "He alcanzado el límite de velocidad de Groq. Por favor, espera un minuto e intenta de nuevo.";
            }
            return "❌ Ocurrió un error al procesar tu solicitud: " + e.getMessage();
        }
    }
}