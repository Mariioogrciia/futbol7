import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function PUT(request: Request) {
    try {
        let token = request.headers.get('authorization')?.split(' ')[1] || '';
        
        if (!token && (request as any).cookies) {
           token = (request as any).cookies.get('token')?.value || '';
        }

        const body = await request.json();
        const { id, foto_url, posicion, dorsal, stat_ritmo, stat_tiro, stat_pase, stat_regate, stat_defensa, stat_fisico } = body;
        
        if (!id) {
            return NextResponse.json({ error: 'Falta ID del jugador' }, { status: 400 });
        }

        // Verify authorization. The user must be linked to this jugador_id or be an admin.
        let isAuthorized = false;
        if (token) {
            const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
            if (!authError && user) {
                const { data: userData } = await supabaseAdmin.from('usuarios').select('rol, jugador_id').eq('id', user.id).single();
                if (userData && (userData.rol === 'admin' || userData.jugador_id === id)) {
                    isAuthorized = true;
                }
            }
        }

        if (!isAuthorized) {
            return NextResponse.json({ error: 'No autorizado para editar este jugador' }, { status: 403 });
        }

        const updates: any = {};
        if (foto_url !== undefined) updates.foto_url = foto_url;
        if (posicion !== undefined) updates.posicion = posicion;
        if (dorsal !== undefined) updates.dorsal = dorsal;
        if (stat_ritmo !== undefined) updates.stat_ritmo = stat_ritmo;
        if (stat_tiro !== undefined) updates.stat_tiro = stat_tiro;
        if (stat_pase !== undefined) updates.stat_pase = stat_pase;
        if (stat_regate !== undefined) updates.stat_regate = stat_regate;
        if (stat_defensa !== undefined) updates.stat_defensa = stat_defensa;
        if (stat_fisico !== undefined) updates.stat_fisico = stat_fisico;

        const { error: dbError } = await supabaseAdmin
            .from('jugadores')
            .update(updates)
            .eq('id', id);

        if (dbError) {
             console.error('Error actualizando jugador DB:', dbError);
             return NextResponse.json({ error: 'Error actualizando tarjeta de jugador' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Tarjeta de jugador actualizada' });
    } catch (err: any) {
        console.error('API Error Update Jugador:', err);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
