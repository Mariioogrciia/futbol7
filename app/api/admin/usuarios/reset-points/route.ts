import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { usuario_id, cantidad = 1000 } = body;

        if (!usuario_id) {
            return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('usuarios')
            .update({ saldo_cubiertaspoints: cantidad })
            .eq('id', usuario_id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, message: `Puntos restablecidos a ${cantidad}` });
    } catch (err: any) {
        console.error('API Error Admin Reset Usuario Points:', err);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
