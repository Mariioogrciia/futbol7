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

    // 1. Obtener goleadores anteriores de este partido para calcular el Delta
    const { data: previousScorers } = await supabaseAdmin
      .from('goleadores_partido')
      .select('jugador_id, goles')
      .eq('partido_id', matchId);

    const previousGoalsMap = new Map<string, number>();
    if (previousScorers) {
      for (const scorer of previousScorers) {
        previousGoalsMap.set(scorer.jugador_id, scorer.goles);
      }
    }

    // AHORA Eliminar TODOS los goleadores anteriores del partido en la base de datos relacional
    await supabaseAdmin
      .from('goleadores_partido')
      .delete()
      .eq('partido_id', matchId);

    // Mapa de goles NUEVOS dictados por el formulario
    const newGoalsMap = new Map<string, number>();
    const scorersToInsert: any[] = [];

    if (goleadores && Array.isArray(goleadores)) {
      for (const g of goleadores) {
        if (g.goles > 0) {
          newGoalsMap.set(g.id, g.goles);
          scorersToInsert.push({
            partido_id: matchId,
            jugador_id: g.id,
            nombre: g.nombre,
            posicion: g.posicion,
            dorsal: g.dorsal,
            goles: g.goles,
          });
        }
      }
    }

    // 2. Calcular los DELTAS (diferencia matemática = nuevos - viejos)
    const playerDeltas = new Map<string, number>();

    // Primero arrastramos a formato negativo todo lo que tenían antes (para quitarles los goles)
    for (const [playerId, oldGoals] of previousGoalsMap.entries()) {
      playerDeltas.set(playerId, -oldGoals);
    }

    // Luego le sumamos lo nuevo (balance)
    for (const [playerId, newGoals] of newGoalsMap.entries()) {
      const currentDelta = playerDeltas.get(playerId) || 0;
      playerDeltas.set(playerId, currentDelta + newGoals);
    }

    // 3. Insertar los nuevos registros validados
    if (scorersToInsert.length > 0) {
      await supabaseAdmin
        .from('goleadores_partido')
        .insert(scorersToInsert);
    }

    // 4. Actualizar la tabla general de Jugadores sumando/restando el Delta matemáticamente
    for (const [playerId, delta] of playerDeltas.entries()) {
      if (delta === 0) continue;

      const { data: playerData } = await supabaseAdmin
        .from('jugadores')
        .select('goles')
        .eq('id', playerId)
        .single();

      if (playerData) {
        const nuevoTotal = Math.max(0, (playerData.goles || 0) + delta);

        await supabaseAdmin
          .from('jugadores')
          .update({
            goles: nuevoTotal
          })
          .eq('id', playerId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error updating match', error.message);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
