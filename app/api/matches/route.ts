import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";



export async function GET(request: NextRequest) {
    try {
        const equipoId = request.nextUrl.searchParams.get("equipo_id");
        if (!equipoId) {
            return NextResponse.json({ error: "Missing equipo_id" }, { status: 400 });
        }

        // Partidos de ese equipo (todos los formatos)
        const { data: partidos, error: partidosError } = await supabaseAdmin
            .from("partidos")
            .select("*")
            .eq("equipo_id", equipoId)
            .order("fecha", { ascending: true });

        if (partidosError) {
            return NextResponse.json({ error: partidosError.message }, { status: 500 });
        }

        const partidoIds = (partidos ?? []).map((p: any) => p.id);

        // Goleadores (con nombre del jugador via relación FK)
        let goleadoresFlat: any[] = [];
        if (partidoIds.length > 0) {
            const { data: goleadores, error: goleadoresError } = await supabaseAdmin
                .from("goleadores_partido")
                .select("id, partido_id, jugador_id, goles, jugadores(nombre)")
                .in("partido_id", partidoIds);

            if (goleadoresError) {
                return NextResponse.json({ error: goleadoresError.message }, { status: 500 });
            }

            goleadoresFlat = (goleadores ?? []).map((g: any) => ({
                id: g.id,
                partido_id: g.partido_id,
                jugador_id: g.jugador_id,
                goles: g.goles,
                nombre: g.jugadores?.nombre ?? "",
            }));
        }

        return NextResponse.json({
            partidos: partidos ?? [],
            goleadores: goleadoresFlat,
        });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? "Error interno" }, { status: 500 });
    }
}
