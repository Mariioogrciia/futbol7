import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

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
        const { jugador_id, stats } = body;

        if (!jugador_id || !stats) {
            return NextResponse.json({ error: 'Faltan parámetros jugador_id o stats' }, { status: 400 });
        }

        // Check permissions
        const { data: userData, error: userError } = await supabaseAdmin
            .from('usuarios')
            .select('rol, jugador_id')
            .eq('id', user.id)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: 'Usuario no encontrado en BBDD' }, { status: 403 });
        }

        const isAdmin = userData.rol === 'admin';
        const isOwner = userData.jugador_id === jugador_id;

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: 'No tienes permiso para editar este perfil' }, { status: 403 });
        }

        // Update stats
        const { error: updateError } = await supabaseAdmin
            .from('jugadores')
            .update({
                stat_ritmo: stats.ritmo,
                stat_tiro: stats.tiro,
                stat_pase: stats.pase,
                stat_regate: stats.regate,
                stat_defensa: stats.defensa,
                stat_fisico: stats.fisico,
            })
            .eq('id', jugador_id);

        if (updateError) {
            console.error('Error updating stats:', updateError);
            return NextResponse.json({ error: 'Error al actualizar base de datos' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Estadísticas actualizadas' });

    } catch (err: any) {
        console.error('API Error:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
