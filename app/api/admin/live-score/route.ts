import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { matchId, golesEquipo, golesRival, estado } = body;

        if (!matchId || !estado) {
            return NextResponse.json({ error: "Faltan datos (matchId o estado)" }, { status: 400 });
        }

        const { error: updateError } = await supabaseAdmin
            .from("partidos")
            .update({
                goles_equipo: golesEquipo,
                goles_rival: golesRival,
                estado: estado
            })
            .eq("id", matchId);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
