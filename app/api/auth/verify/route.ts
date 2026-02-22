import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization') || '';
    let token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : '';
    if (!token) token = request.cookies.get('token')?.value || '';
    if (!token) return NextResponse.json({ valid: false }, { status: 401 });

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return NextResponse.json({ valid: false }, { status: 401 });

    const { data: userData, error: dbError } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError || !userData) return NextResponse.json({ valid: false }, { status: 401 });

    return NextResponse.json({
      valid: true,
      user: { id: user.id, email: user.email, nombre: userData.nombre, rol: userData.rol },
    });
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
