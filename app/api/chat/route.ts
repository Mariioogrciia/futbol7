import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

// Inicializamos el cliente de Google (leerá tu .env.local automáticamente)
const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

export const maxDuration = 30;

export async function POST(req: Request) {
    // Extraemos los mensajes que envía useChat desde el frontend
    const { messages } = await req.json();
    console.log("INCOMING MESSAGES:", JSON.stringify(messages, null, 2));

    // Map UI messages to CoreMessages for streamText
    const coreMessages = messages.map((m: any) => {
        let content = m.content;
        if (!content && m.parts) {
            content = m.parts.map((p: any) => p.text).join('');
        }
        return {
            role: m.role,
            content: content || "",
        };
    });

    const result = streamText({
        model: google('gemini-2.5-flash'),
        system: "Eres 'El Míster', el entrenador del equipo de fútbol amateur Impersed Cubiertas FC. Siempre estás de mal humor, te quejas de que el equipo no corre, fuma mucho en el descanso y de que el árbitro os roba. Responde siempre con respuestas cortas (máximo 2 líneas), usando lenguaje de barrio y mucha ironía. Si te preguntan si van a jugar, diles que calienten banquillo.",
        // Pasamos los mensajes ya formateados
        messages: coreMessages,
    });

    return result.toUIMessageStreamResponse();
}