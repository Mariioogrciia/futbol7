import { createGroq } from '@ai-sdk/groq'; // 1. Importación cambiada a Groq
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/admin';

// 2. Inicializamos el cliente de Groq con tu API Key
const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY || "",
});

export const maxDuration = 30;

export async function POST(req: Request) {
    // 3. Comprobamos la clave correcta
    if (!process.env.GROQ_API_KEY) {
        return new Response("Error: GROQ_API_KEY no está configurada.", { status: 500 });
    }

    const { messages } = await req.json();
    console.log("INCOMING MESSAGES:", JSON.stringify(messages, null, 2));

    const coreMessages = messages.map((m: any) => {
        let content = m.content;
        if (content === undefined && m.parts) {
            content = m.parts.map((p: any) => p.text).join('');
        }
        return {
            ...m,
            content: content || "",
        };
    });

    const result = streamText({
        // 4. Cambiamos a Llama 3 (Gratis y muy rápido)
        model: groq('llama-3.3-70b-versatile') as any,
        system: "Eres 'El Míster', el entrenador del equipo de fútbol amateur Impersed Cubiertas FC. Siempre estás de mal humor, te quejas de que el equipo no corre, fuma mucho en el descanso y de que el árbitro os roba. Responde siempre con respuestas cortas (máximo 2 líneas), usando lenguaje de barrio y mucha ironía. Si te preguntan si van a jugar, diles que calienten banquillo. Tienes acceso a la base de datos de la plantilla y del calendario. IMPORTANTE: Extrae SIEMPRE el nombre del jugador, rival o posición que te pregunten y usa las herramientas para obtener la información REAL antes de responder. Nunca te inventes resultados o fechas.",
        messages: coreMessages,
        maxSteps: 5,
        onStepFinish: (step) => {
            console.log("\n[ON STEP FINISH] Step finished with reason:", step.finishReason);
            console.log("[ON STEP FINISH] Usage:", step.usage);
            console.log("[ON STEP FINISH] Tokens:", step.text.length, "Tool calls:", step.toolCalls?.length);
            console.log("[ON STEP FINISH] Warnings:", step.warnings);
            if (step.toolCalls?.length === 0 && step.finishReason === 'tool-calls') {
                console.log("[ON STEP FINISH ERROR] Model returned finishReason: tool-calls but SDK parsed 0 tools. This means Groq emitted malformed JSON arguments.");
            }
        },
        onFinish: (event) => {
            console.log("[STREAM FINISHED]", event.finishReason);
        },

        tools: {
            get_player_stats: tool({
                description: 'Obtiene las estadísticas detalladas (goles, posición, dorsal) de un jugador específico por su nombre.',
                parameters: z.object({
                    nombre: z.string().describe("Nombre del jugador")
                }),
                execute: async (args): Promise<{ error: string | null; jugador: any }> => {
                    const queryName = args.nombre;
                    console.log(`[TOOL CALL] get_player_stats called for: ${queryName}`);

                    if (!queryName) return { error: "Falta el nombre del jugador en la herramienta.", jugador: null };

                    try {
                        const { data, error } = await supabaseAdmin
                            .from('jugadores')
                            .select('nombre, goles, posicion, dorsal')
                            .ilike('nombre', `%${queryName}%`)
                            .limit(1)
                            .single();

                        if (error || !data) {
                            return { error: `No se ha encontrado al jugador ${queryName} en la base de datos. Dile que no está convocado.`, jugador: null };
                        }
                        return { error: null, jugador: data };
                    } catch (e) {
                        return { error: 'Error accediendo a los datos del jugador.', jugador: null };
                    }
                },
            }),
            get_players_by_position: tool({
                description: 'Obtiene una lista de jugadores que juegan en una posición específica (portero, defensa, medio, delantero).',
                parameters: z.object({
                    posicion: z.string().describe("La posición en el campo")
                }),
                execute: async (args): Promise<{ error: string | null; jugadores: any }> => {
                    const queryPos = args.posicion;
                    console.log(`[TOOL CALL] get_players_by_position called for: ${queryPos}`);

                    if (!queryPos) return { error: "Falta la posición en la herramienta.", jugadores: null };

                    try {
                        const { data, error } = await supabaseAdmin
                            .from('jugadores')
                            .select('nombre, goles, dorsal')
                            .ilike('posicion', `%${queryPos}%`);

                        if (error || !data || data.length === 0) {
                            return { error: `No hay jugadores registrados en la posición de ${queryPos}.`, jugadores: null };
                        }
                        return { error: null, jugadores: data };
                    } catch (e) {
                        return { error: 'Error listando jugadores por posición.', jugadores: null };
                    }
                },
            }),
            get_next_match: tool({
                description: 'Úsalo cuando pregunten cuándo, dónde, a qué hora o contra quién es el próximo partido o el siguiente rival.',
                parameters: z.object({
                    consulta: z.boolean().describe("Establece a true para consultar el próximo partido")
                }),
                execute: async (): Promise<{ error: string | null; partido: any }> => {
                    console.log("[TOOL CALL] get_next_match called");
                    try {
                        const { data, error } = await supabaseAdmin
                            .from('partidos')
                            .select('rival, fecha, campo')
                            .eq('jugado', false)
                            .order('fecha', { ascending: true })
                            .limit(1)
                            .single();

                        if (error || !data) {
                            return { error: 'No hay próximos partidos programados en el calendario.', partido: null };
                        }
                        return { error: null, partido: data };
                    } catch (e) {
                        return { error: 'Error del VAR al consultar el calendario.', partido: null };
                    }
                }
            })
        }
    });

    // 6. Respondemos usando el estándar de Data Stream de AI SDK v3/v4 para tool calling
    return result.toDataStreamResponse();
}
