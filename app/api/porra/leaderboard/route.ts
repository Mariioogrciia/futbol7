import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
    try {
        const { data: leaderboard, error } = await supabaseAdmin
            .from('usuarios')
            .select('id, nombre, saldo_cubiertaspoints')
            .order('saldo_cubiertaspoints', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching leaderboard:', error);
            return NextResponse.json({ error: 'Error al obtener el ranking' }, { status: 500 });
        }

        const ranking = (leaderboard || []).map(u => ({
            id: u.id,
            nombre: u.nombre || 'Hooligan Anónimo',
            puntos: u.saldo_cubiertaspoints || 0
        }));

        return NextResponse.json({ success: true, ranking });
    } catch (err: any) {
        console.error('API Error Leaderboard:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
