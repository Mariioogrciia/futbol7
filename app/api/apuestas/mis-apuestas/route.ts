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

        // Fetch user's bets ordered by newest first
        const { data: apuestas, error: betsError } = await supabaseAdmin
            .from('apuestas')
            .select('*')
            .eq('usuario_id', user.id)
            .order('created_at', { ascending: false });

        if (betsError) {
            console.error('Error fetching user bets:', betsError);
            return NextResponse.json({ error: 'Error al obtener historial' }, { status: 500 });
        }

        return NextResponse.json({ success: true, apuestas });
    } catch (err: any) {
        console.error('API Error Mis Apuestas:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
