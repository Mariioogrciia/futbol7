import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { email, password, nombre, rol } = await request.json();

    if (!email || !password || !nombre || !rol) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    if (!['admin', 'equipo', 'externo'].includes(rol)) {
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

    // Insertar en tabla usuarios (server/admin)
    const { error: dbError } = await supabaseAdmin
      .from('usuarios')
      .insert({ id: authData.user?.id, email, nombre, rol });

    if (dbError) {
      return NextResponse.json({ error: 'Error creando usuario' }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Usuario creado', user: { id: authData.user?.id, email, nombre, rol } },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
