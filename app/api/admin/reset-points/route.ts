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

        // Verify if user is admin
        const { data: perfil } = await supabaseAdmin
            .from('usuarios')
            .select('rol')
            .eq('id', user.id)
            .single();

        if (perfil?.rol !== 'admin') {
            return NextResponse.json({ error: 'No tienes permisos de administrador' }, { status: 403 });
        }

        // Reset all points to 1000
        const { error: resetError } = await supabaseAdmin
            .from('usuarios')
            .update({ saldo_cubiertaspoints: 1000 })
            .neq('id', '00000000-0000-0000-0000-000000000000'); // dummy condition to match all

        if (resetError) {
            console.error('Error resetting points:', resetError);
            return NextResponse.json({ error: 'Error al restablecer puntos' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Todos los CubiertasPoints han sido restablecidos a 1000' });
    } catch (err: any) {
        console.error('API Error Reset Points:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
