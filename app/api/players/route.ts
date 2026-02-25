import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const equipoId = request.nextUrl.searchParams.get("equipo_id");

        if (!equipoId) {
            return NextResponse.json({ error: "Falta el parámetro equipo_id" }, { status: 400 });
        }

        // 1. Consulta: Traemos a los jugadores (ya contienen sus 'goles')
        const { data: jugadores, error: jugadoresError } = await supabaseAdmin
            .from("jugadores")
            .select("*")
            .eq("equipo_id", equipoId)
            .order("dorsal", { ascending: true });

        if (jugadoresError) {
            return NextResponse.json({ error: jugadoresError.message }, { status: 500 });
        }

        // 2. Procesamos los datos para estructurar la respuesta
        const jugadoresConGoles = jugadores?.map((jugador) => {
            return {
                ...jugador,
                goles_totales: jugador.goles || 0, // Añadimos el nuevo campo calculado para compatibilidad
            };
        }) || [];

        // 3. Extra (Consideración oportuna): Creamos un ranking de los máximos goleadores
        const topGoleadores = [...jugadoresConGoles]
            .sort((a, b) => b.goles_totales - a.goles_totales)
            .slice(0, 15);

        return NextResponse.json({
            jugadores: jugadoresConGoles,
            total_jugadores: jugadoresConGoles.length, // Evitamos hacer la consulta count() extra
            top_goleadores: topGoleadores
        });

    } catch (error: any) {
        return NextResponse.json({ error: error?.message || "Error interno del servidor" }, { status: 500 });
    }
}
