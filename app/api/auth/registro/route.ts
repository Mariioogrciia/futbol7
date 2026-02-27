import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { email, password, nombre, rol } = await request.json();

    if (!email || !password || !nombre || !rol) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    if (!['admin', 'equipo', 'espectador'].includes(rol)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
    }

    // Crear usuario en Supabase Auth (server/admin)
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: { data: { nombre, rol } },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // El trigger on_auth_user_created insertará el usuario automáticamente, 
    // pero vamos a actualizar el rol explícito y el nombre por si el trigger asume valores por defecto.
    const { error: dbError } = await supabaseAdmin
      .from('usuarios')
      .update({ nombre, rol })
      .eq('id', authData.user?.id);

    if (dbError) {
      console.error('Error actualizando usuario post-trigger:', dbError);
    }

    return NextResponse.json(
      { message: 'Usuario creado', user: { id: authData.user?.id, email, nombre, rol } },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
