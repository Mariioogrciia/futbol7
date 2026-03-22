import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, nombre, rol, jugador_id } = body;

        if (!email || !password || !nombre || !rol) {
            return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
        }

        if (!['admin', 'equipo', 'espectador'].includes(rol)) {
            return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
        }

        // Crear usuario con privilegios de administrador para saltar confirmación de email y no autologuearse
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                nombre,
                rol
            }
        });

        if (authError || !authData.user) {
            console.error('Error Admin createUser:', authError);
            return NextResponse.json({ error: authError?.message || 'Error al crear usuario en Auth' }, { status: 400 });
        }

        // Inserción en tabla usuarios. DB default de saldo_cubiertaspoints debería ser 1000,
        // pero lo forzamos por si acaso al ser creado por admin.
        const finalJugadorId = rol === 'equipo' ? (jugador_id || null) : null;
        
        const { error: dbError } = await supabaseAdmin
            .from('usuarios')
            .upsert({
                id: authData.user.id,
                email: email,
                nombre: nombre,
                rol: rol,
                jugador_id: finalJugadorId,
                saldo_cubiertaspoints: 1000
            });

        if (dbError) {
            console.error('Error insertando usuario post-creación:', dbError);
            // Podríamos querer hacer un fallback y borrarlo de Auth si falla la DB
            return NextResponse.json({ error: 'Usuario creado en Auth pero falló registro en BD' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Usuario creado y confirmado exitosamente',
            user: { id: authData.user.id, email, nombre, rol, saldo_cubiertaspoints: 1000 }
        });

    } catch (err: any) {
        console.error('API Error Admin Crear Usuario:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
