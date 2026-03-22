import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function PUT(request: Request) {
    try {
        const url = new URL(request.url);
        
        let token = request.headers.get('authorization')?.split(' ')[1] || '';
        // Si usamos fetch normal en next.js client-side, suele usar auth de supabase que guarda la session en localstorage o cookies
        // En este proyecto se está validando auth desde la BBDD, por lo tanto forzaremos enviar userId del body.
        // Pero idealmente se manda el token como Bearer en el header.
        if (!token && (request as any).cookies) {
           token = (request as any).cookies.get('token')?.value || '';
        }

        const body = await request.json();
        const { nombre, avatar_url, user_id } = body;
        
        let targetId = user_id;

        // Intentamos cogerlo de la sesión de Supabase si se envía token
        if (token) {
            const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
            if (!authError && user) {
                targetId = user.id;
            }
        }

        if (!targetId) {
            return NextResponse.json({ error: 'Falta identificación del usuario' }, { status: 401 });
        }

        const updates: any = {};
        if (nombre) updates.nombre = nombre;
        if (avatar_url !== undefined) updates.avatar_url = avatar_url;

        const { error: dbError } = await supabaseAdmin
            .from('usuarios')
            .update(updates)
            .eq('id', targetId);

        if (dbError) {
             console.error('Error actualizando perfil DB:', dbError);
             return NextResponse.json({ error: 'Asegúrate de haber creado la columna avatar_url en la BBDD' }, { status: 500 });
        }

        if (nombre) {
            await supabaseAdmin.auth.admin.updateUserById(targetId, { user_metadata: { nombre }});
        }

        return NextResponse.json({ success: true, message: 'Perfil actualizado correctamente' });
    } catch (err: any) {
        console.error('API Error Update Profile:', err);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
