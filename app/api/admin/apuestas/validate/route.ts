import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { bet_id, nuevo_estado } = body; // 'ganada', 'perdida', 'nula'

        if (!bet_id || !nuevo_estado || !['ganada', 'perdida', 'nula'].includes(nuevo_estado)) {
            return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
        }

        // 1. Fetch the bet
        const { data: bet, error: betError } = await supabaseAdmin
            .from('apuestas')
            .select('*')
            .eq('id', bet_id)
            .single();

        if (betError || !bet) {
            return NextResponse.json({ error: 'Apuesta no encontrada' }, { status: 404 });
        }

        // If already validated and we re-validate, we'd need complex logic to rollback points. 
        // For simplicity, we only allow validating pending bets or we just handle it? Let's assume they only validate once or we adjust differences. 
        // Actually, let's keep it simple: if modifying, we need to adjust properly, but if it's 'pendiente' we just give points.
        if (bet.estado !== 'pendiente') {
            return NextResponse.json({ error: 'La apuesta ya fue validada previamente. No se puede deshacer de forma automática.' }, { status: 400 });
        }

        // 2. Update the bet
        const { error: updateError } = await supabaseAdmin
            .from('apuestas')
            .update({ estado: nuevo_estado })
            .eq('id', bet_id);

        if (updateError) {
            return NextResponse.json({ error: 'Error al actualizar apuesta' }, { status: 500 });
        }
        
        // 3. Logic: if simple bet OR combinada parent, give points
        let pointsToAdd = 0;
        let userIdToUpdate = null;

        if (bet.mercado_id.startsWith('comb_')) {
            const parentId = bet.mercado_id.replace('comb_', '');
            
            // Check all children of this parent
            const { data: children } = await supabaseAdmin
                .from('apuestas')
                .select('estado')
                .eq('mercado_id', `comb_${parentId}`);
                
            if (children) {
                const isPerdida = children.some(c => c.estado === 'perdida');
                const isGanada = children.every(c => c.estado === 'ganada');
                
                if (isPerdida || isGanada) {
                    const parentNuevoEstado = isPerdida ? 'perdida' : 'ganada';
                    
                    // Fetch parent to check current state
                    const { data: parentBet } = await supabaseAdmin.from('apuestas').select('*').eq('id', parentId).single();
                    if (parentBet && parentBet.estado === 'pendiente') {
                        // Update parent!
                        await supabaseAdmin.from('apuestas').update({ estado: parentNuevoEstado }).eq('id', parentId);
                        
                        if (parentNuevoEstado === 'ganada') {
                            pointsToAdd = parentBet.ganancia_potencial;
                            userIdToUpdate = parentBet.usuario_id;
                        }
                    }
                }
            }
        } else {
            // It's a normal bet or a Combinada explicitly forced by admin
            if (nuevo_estado === 'ganada') {
                pointsToAdd = bet.ganancia_potencial;
                userIdToUpdate = bet.usuario_id;
            } else if (nuevo_estado === 'nula') {
                pointsToAdd = bet.cantidad_apostada;
                userIdToUpdate = bet.usuario_id;
            }
        }

        // 4. Give points if Ganada or Nula, and it's a Parent/Simple bet
        if (pointsToAdd > 0 && userIdToUpdate) {
            // Fetch user
            const { data: user } = await supabaseAdmin.from('usuarios').select('saldo_cubiertaspoints').eq('id', userIdToUpdate).single();
            if (user) {
                await supabaseAdmin.from('usuarios')
                    .update({ saldo_cubiertaspoints: user.saldo_cubiertaspoints + pointsToAdd })
                    .eq('id', userIdToUpdate);
            }
        }

        return NextResponse.json({ success: true, message: 'Apuesta validada' });
    } catch (err: any) {
        console.error('API Error Validate Apuesta:', err);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
