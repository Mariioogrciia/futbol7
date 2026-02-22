import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Primero intentar auth header
    const auth = request.headers.get('authorization') || '';
    let token = '';
    if (auth.startsWith('Bearer ')) token = auth.split(' ')[1];

    // Si no viene en header, intentar cookie
    if (!token) token = request.cookies.get('token')?.value || '';

    if (!token) return NextResponse.json({ valid: false }, { status: 401 });

    // Verificar token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    // Obtener datos adicionales del usuario
    const { data: userData, error: dbError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError || !userData) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        nombre: userData.nombre,
        rol: userData.rol,
      },
    });
  } catch (err) {
    console.error('Error verificando token:', err);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
