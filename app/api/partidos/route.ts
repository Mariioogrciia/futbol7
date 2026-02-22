import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';


export async function GET() {
  try {
    const { data: partidos, error } = await supabaseAdmin
      .from('partidos')
      .select(`
        *,
        equipos!partidos_equipo_id_fkey(nombre)
      `)
      .order('fecha', { ascending: true });

    if (error) {
      console.error('Error fetching partidos:', error);
      return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }

    return NextResponse.json(partidos);
  } catch (error: any) {
    console.error('Error fetching partidos', error.message);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
