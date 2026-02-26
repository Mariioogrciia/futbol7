import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
    try {
        const partidoId = request.nextUrl.searchParams.get("partido_id");

        if (!partidoId) {
            return NextResponse.json({ error: "Missing partido_id" }, { status: 400 });
        }

        const { data: convocatorias, error } = await supabaseAdmin
            .from("convocatorias")
            .select(`
        id,
        asiste,
        comentario,
        jugador_id,
        jugadores(nombre, dorsal, posicion)
      `)
            .eq("partido_id", partidoId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Flatten logic
        const results = (convocatorias ?? []).map((c: any) => ({
            id: c.id,
            asiste: c.asiste,
            comentario: c.comentario,
            jugador_id: c.jugador_id,
            nombre: c.jugadores?.nombre ?? "Desconocido",
            dorsal: c.jugadores?.dorsal ?? "",
            posicion: c.jugadores?.posicion ?? ""
        }));

        return NextResponse.json({
            convocatorias: results,
        });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? "Error interno" }, { status: 500 });
    }
}
