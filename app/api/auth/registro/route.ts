import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password, nombre, rol } = await request.json();

    if (!email || !password || !nombre || !rol) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (!['admin', 'equipo', 'externo'].includes(rol)) {
      return NextResponse.json(
        { error: 'Rol inválido' },
        { status: 400 }
      );
    }

    // Solo admin puede crear otros admins (verificar token actual)
    if (rol === 'admin') {
      // Aquí iría la verificación del token admin actual
      // Por simplicidad, permitimos crear admins por ahora
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          rol
        }
      }
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Insertar en tabla usuarios
    const { error: dbError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user?.id,
        email,
        nombre,
        rol,
      });

    if (dbError) {
      console.error('Error insertando usuario:', dbError);
      return NextResponse.json(
        { error: 'Error creando usuario' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Usuario creado exitosamente. Revisa tu email para confirmar.',
        user: {
          id: authData.user?.id,
          email,
          nombre,
          rol,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
