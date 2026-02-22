import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { matchId, golesEquipo, golesRival, goleadores } = await request.json();
    
    if (!matchId) {
      return NextResponse.json({ error: 'matchId requerido' }, { status: 400 });
    }

    // Obtener el partido para extraer el rival
    const { data: matchData, error: matchError } = await supabaseAdmin
      .from('partidos')
      .select('rival, estado')
      .eq('id', matchId)
      .single();

    if (matchError || !matchData) {
      return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });
    }

    // Determinar resultado
    let resultado: 'victoria' | 'derrota' | 'empate';
    if (golesEquipo > golesRival) {
      resultado = 'victoria';
    } else if (golesEquipo < golesRival) {
      resultado = 'derrota';
    } else {
      resultado = 'empate';
    }

    // Actualizar partido
    const { error: updateError } = await supabaseAdmin
      .from('partidos')
      .update({
        goles_equipo: golesEquipo,
        goles_rival: golesRival,
        estado: 'finalizado',
        resultado: resultado,
      })
      .eq('id', matchId);

    if (updateError) {
      console.error('Error updating match:', updateError);
      return NextResponse.json({ error: 'Error al actualizar partido' }, { status: 500 });
    }

    // Eliminar goleadores anteriores del partido (si existen)
    const { error: deleteError } = await supabaseAdmin
      .from('goleadores_partido')
      .delete()
      .eq('partido_id', matchId);

    if (deleteError) {
      console.error('Error deleting previous scorers:', deleteError);
    }

    // Insertar nuevos goleadores
    if (goleadores && Array.isArray(goleadores) && goleadores.length > 0) {
      const scorersToInsert = goleadores
        .filter((g: any) => g.goles > 0)
        .map((g: any) => ({
          partido_id: matchId,
          jugador_id: g.id,
          nombre: g.nombre,
          posicion: g.posicion,
          dorsal: g.dorsal,
          goles: g.goles,
        }));

      if (scorersToInsert.length > 0) {
        const { error: insertError } = await supabaseAdmin
          .from('goleadores_partido')
          .insert(scorersToInsert);

        if (insertError) {
          console.error('Error inserting scorers:', insertError);
          // No fallar la request, solo loggear
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error updating match', error.message);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
