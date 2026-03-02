import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Falta Authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
        }

        const body = await request.json();
        const { partido_id, apuestas, total_wagered } = body;

        if (!partido_id || !apuestas || !Array.isArray(apuestas) || typeof total_wagered !== 'number') {
            return NextResponse.json({ error: 'Faltan parámetros de apuesta' }, { status: 400 });
        }

        // 1. Verify match is valid and programado
        const { data: partido, error: partidoError } = await supabaseAdmin
            .from('partidos')
            .select('estado')
            .eq('id', partido_id)
            .single();

        if (partidoError || !partido || partido.estado !== 'programado') {
            return NextResponse.json({ error: 'El partido no está programado o no existe' }, { status: 400 });
        }

        // 2. Verify and deduct balance
        // Emplearemos una transacción/RPC si estuviera disponible, pero como es supabaseAdmin podemos hacerlo secuencial
        const { data: perfil, error: perfilError } = await supabaseAdmin
            .from('usuarios')
            .select('saldo_cubiertaspoints')
            .eq('id', user.id)
            .single();

        if (perfilError || !perfil) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        if ((perfil.saldo_cubiertaspoints || 0) < total_wagered) {
            return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 });
        }

        const newBalance = (perfil.saldo_cubiertaspoints || 0) - total_wagered;

        const { error: updateError } = await supabaseAdmin
            .from('usuarios')
            .update({ saldo_cubiertaspoints: newBalance })
            .eq('id', user.id);

        if (updateError) {
            console.error('Error deduct balance:', updateError);
            return NextResponse.json({ error: 'No se pudo procesar el pago' }, { status: 500 });
        }

        // 3. Insert bets
        const betsToInsert = apuestas.map((bet: any) => ({
            usuario_id: user.id,
            partido_id: partido_id,
            mercado_id: bet.id, // the unique id of the option like gs_uuid
            opcion_label: bet.label,
            cuota: bet.odd,
            cantidad_apostada: bet.amount,
            ganancia_potencial: bet.amount * bet.odd,
            estado: 'pendiente'
        }));

        const { error: insertError } = await supabaseAdmin
            .from('apuestas')
            .insert(betsToInsert);

        if (insertError) {
            // Rollback manual
            await supabaseAdmin.from('usuarios').update({ saldo_cubiertaspoints: perfil.saldo_cubiertaspoints }).eq('id', user.id);
            console.error('Error inserting bets:', insertError);
            return NextResponse.json({ error: 'Error al registrar las apuestas' }, { status: 500 });
        }

        return NextResponse.json({ success: true, newBalance, message: 'Apuestas registradas con éxito' });
    } catch (err: any) {
        console.error('API Error APUESTAS:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
