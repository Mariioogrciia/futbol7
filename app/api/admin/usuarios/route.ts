import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('usuarios')
            .select('id, nombre, email, saldo_cubiertaspoints, rol, jugador_id, created_at')
            .order('saldo_cubiertaspoints', { ascending: false });

        if (error) {
            console.error('Error fetching admin users:', error);
            return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
        }

        return NextResponse.json({ success: true, usuarios: data });
    } catch (err: any) {
        console.error('API Error Admin Usuarios:', err);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
