// app/api/team/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
    try {
        const equipoId = request.nextUrl.searchParams.get("equipo_id");

        if (!equipoId) {
            return NextResponse.json({ error: "Falta el parámetro equipo_id" }, { status: 400 });
        }

        // 1. Obtener la lista completa de jugadores
        const { data: jugadores, error: jugadoresError } = await supabaseAdmin
            .from("jugadores")
            .select("*")
            .eq("equipo_id", equipoId)
            .order("dorsal", { ascending: true }); // Ordenados por dorsal

        if (jugadoresError) {
            return NextResponse.json({ error: jugadoresError.message }, { status: 500 });
        }

        // 2. Obtener el conteo exacto de jugadores
        const { count, error: countError } = await supabaseAdmin
            .from("jugadores")
            .select("*", { count: "exact", head: true })
            .eq("equipo_id", equipoId);

        if (countError) {
            console.error("Error al contar jugadores:", countError.message);
        }

        return NextResponse.json({
            jugadores: jugadores || [],
            total_jugadores: count || 0,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error?.message || "Error interno del servidor" }, { status: 500 });
    }
}
