import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, nombre, email, password, rol, saldo_cubiertaspoints, jugador_id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Falta el ID del usuario' }, { status: 400 });
        }

        const updates: any = {};
        if (nombre !== undefined) updates.nombre = nombre;
        if (email !== undefined) updates.email = email;
        if (rol !== undefined) updates.rol = rol;
        if (saldo_cubiertaspoints !== undefined) updates.saldo_cubiertaspoints = saldo_cubiertaspoints;
        
        // Asignar jugador_id solo si es equipo, de lo contrario null
        if (rol !== undefined || jugador_id !== undefined) {
             const finalRol = rol !== undefined ? rol : undefined; // we would need to check existing rol but usually frontend sends all
             // Actually, if rol is specified, we can logic it:
             if (rol === 'equipo') {
                 updates.jugador_id = jugador_id || null;
             } else if (rol !== undefined) {
                 updates.jugador_id = null;
             } else if (jugador_id !== undefined) {
                 updates.jugador_id = jugador_id || null;
             }
        }

        // Si se va a cambiar el email o el password, usar supabaseAdmin auth
        if (email !== undefined || password) {
            const authUpdates: any = { email_confirm: true };
            if (email) authUpdates.email = email;
            if (password) authUpdates.password = password;
            // update UserMetadata inside auth optionally 
            if (nombre || rol) {
                authUpdates.user_metadata = {
                    ...(nombre && { nombre }),
                    ...(rol && { rol })
                };
            }

            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdates);
            
            if (authError) {
                console.error("Error updating user Auth:", authError);
                return NextResponse.json({ error: 'Error actualizando correo/contraseña en Auth: ' + authError.message }, { status: 400 });
            }
        }

        const { error: dbError } = await supabaseAdmin
            .from('usuarios')
            .update(updates)
            .eq('id', id);

        if (dbError) {
            console.error('Error DB User Edit:', dbError);
            return NextResponse.json({ error: 'Error actualizando la BD de usuarios' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Usuario actualizado correctamente' });

    } catch (err: any) {
        console.error('API Error Admin Editar Usuario:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
