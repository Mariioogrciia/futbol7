import { createGroq } from '@ai-sdk/groq';
import { streamText, tool, jsonSchema } from 'ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { z } from 'zod';

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY || "",
});

async function main() {
    console.log("Starting test...");
    try {
        const result = streamText({
            model: groq('llama-3.3-70b-versatile'),
            messages: [{ role: 'user', content: 'De momento dime cuantos goles lleva mario' }],
            maxSteps: 5,
            onStepFinish: (step) => {
                console.log("\n[ON STEP FINISH] Reason:", step.finishReason);
                console.log("[ON STEP FINISH] Tokens:", step.text.length, "Tool calls:", step.toolCalls?.length);
            },
            tools: {
                get_player_stats: tool({
                    description: 'Obtiene las estadísticas detalladas (goles, posición, dorsal) de un jugador específico por su nombre.',
                    parameters: z.object({
                        player_name: z.string().describe("El nombre o apodo del jugador, ej. 'Mario', 'Chino', 'Edu'"),
                    }),
                    execute: async ({ player_name }) => {
                        console.log(`\n\n[TOOL EXEC] Fetching stats for: ${player_name}\n\n`);
                        return { error: null, nombre: player_name, goles: 5 };
                    }
                }),
                get_players_by_position: tool({
                    description: 'Obtiene una lista de jugadores que juegan en una posición específica (portero, defensa, medio, delantero).',
                    parameters: z.object({
                        position: z.enum(['portero', 'defensa', 'medio', 'delantero']).describe("La posición en el campo"),
                    }),
                    execute: async ({ position }) => {
                        console.log(`\n\n[TOOL EXEC] Fetching position: ${position}\n\n`);
                        return { error: null, jugadores: [{nombre: 'Paco', posicion: position}] };
                    }
                }),
                get_next_match: tool({
                    description: 'Úsalo cuando pregunten cuándo, dónde, a qué hora o contra quién es el próximo partido o el siguiente rival.',
                    parameters: z.object({}),
                    execute: async () => {
                        console.log(`\n\n[TOOL EXEC] Fetching next match\n\n`);
                        return { error: null, partido: { rival: "Rayo" } };
                    }
                })
            }
        });

        for await (const chunk of result.fullStream) {
            if (chunk.type === 'text-delta') {
                process.stdout.write(chunk.textDelta);
            } else if (chunk.type === 'tool-call') {
                console.log('\n[RAW TOOL CALL CHUNK]:', JSON.stringify(chunk, null, 2));
                console.log('\n[TOOL CALL]:', chunk.toolName, chunk.args);
            } else if (chunk.type === 'tool-result') {
                console.log('\n[TOOL RESULT]:', chunk.toolName, chunk.args, chunk.result);
            } else if (chunk.type === 'finish') {
                console.log('\n[FINISH REASON]:', chunk.finishReason, 'Usage:', chunk.usage);
            } else if (chunk.type === 'error') {
                console.error('\n[STREAM ERROR]:', chunk.error);
            }
        }
        console.log("\nDone.");
    } catch (e) {
        console.error("\nFatal error stringified:", JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
    }
}

main();
