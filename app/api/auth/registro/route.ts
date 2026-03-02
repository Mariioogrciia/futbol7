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

    // Realizamos un upsert para asegurarnos de que el usuario se guarda
    // explícitamente en la tabla 'usuarios' con su ID exacto de Supabase Auth
    const { error: dbError } = await supabaseAdmin
      .from('usuarios')
      .upsert({
        id: authData.user?.id,
        email: email,
        nombre: nombre,
        rol: rol
      });

    if (dbError) {
      console.error('Error insertando/actualizando usuario post-registro:', dbError);
    }

    return NextResponse.json(
      { message: 'Usuario creado', user: { id: authData.user?.id, email, nombre, rol } },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
