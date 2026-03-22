import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('id');

        if (!userId) {
            return NextResponse.json({ error: 'Falta el ID del usuario' }, { status: 400 });
        }

        // 1. Borramos el usuario de la DB. 
        // Nota: si tienes foreign keys con CASCADE no pasaría nada, pero por si acaso.
        const { error: dbError } = await supabaseAdmin
            .from('usuarios')
            .delete()
            .eq('id', userId);

        if (dbError) {
            console.error('Error borrando usuario DB:', dbError);
            return NextResponse.json({ error: 'Error al borrar de BD' }, { status: 500 });
        }

        // 2. Borrar de Auth (esto suele borrar en cascada y public.usuarios tmb si hay trigger, 
        // pero lo hacemos explícito para mayor seguridad)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (authError) {
            console.error('Error borrando usuario Auth:', authError);
            return NextResponse.json({ error: 'Error al borrar de Auth' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Usuario borrado correctamente' });
    } catch (err: any) {
        console.error('API Error Admin Borrar Usuario:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
