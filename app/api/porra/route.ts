import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Falta Authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
        }

        // Obtener predicciones del usuario
        const { data: predicciones, error } = await supabaseAdmin
            .from('predicciones')
            .select(`
                *,
                partido:partidos(id, equipo_id, rival, estado, goles_equipo, goles_rival, fecha)
            `)
            .eq('usuario_id', user.id);

        if (error) {
            console.error('Error fetching predictions:', error);
            return NextResponse.json({ error: 'Error al obtener predicciones' }, { status: 500 });
        }

        return NextResponse.json({ success: true, predicciones });
    } catch (err: any) {
        console.error('API Error:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Falta Authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
        }

        const body = await request.json();
        const { partido_id, goles_local, goles_visitante, primer_goleador_id } = body;

        if (!partido_id || goles_local === undefined || goles_visitante === undefined) {
            return NextResponse.json({ error: 'Faltan parámetros de predicción' }, { status: 400 });
        }

        // Verificar el estado del partido (solo programado)
        const { data: partido, error: partidoError } = await supabaseAdmin
            .from('partidos')
            .select('estado')
            .eq('id', partido_id)
            .single();

        if (partidoError || !partido) {
            return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });
        }

        if (partido.estado !== 'programado') {
            return NextResponse.json({ error: 'El partido ya ha comenzado o finalizado' }, { status: 400 });
        }

        // Upsert prediction
        const { error: upsertError } = await supabaseAdmin
            .from('predicciones')
            .upsert({
                usuario_id: user.id,
                partido_id,
                goles_local,
                goles_visitante,
                primer_goleador_id,
                updated_at: new Date().toISOString()
            }, { onConflict: 'usuario_id, partido_id' });

        if (upsertError) {
            console.error('Error upserting prediction:', upsertError);
            return NextResponse.json({ error: 'Error al guardar predicción' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Predicción guardada' });
    } catch (err: any) {
        console.error('API Error POST:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
