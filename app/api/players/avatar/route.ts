import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { jugador_id, foto_url } = body;

        if (!jugador_id || !foto_url) {
            return NextResponse.json(
                { error: "Faltan parámetros requeridos: jugador_id o foto_url" },
                { status: 400 }
            );
        }

        // En un entorno de producción estricto, aquí verificaríamos la sesión del usuario para ver si tiene permisos
        // const authHeader = req.headers.get("Authorization"); etc...

        const { data, error } = await supabaseAdmin
            .from("jugadores")
            .update({ foto_url: foto_url })
            .eq("id", jugador_id)
            .select();

        if (error) {
            console.error("Error updating avatar in DB:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, jugador: data[0] }, { status: 200 });

    } catch (error: any) {
        console.error("Avatar Update Error:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}
