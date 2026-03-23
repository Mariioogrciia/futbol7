import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const partido_id = url.searchParams.get('partido_id');

        let query = supabaseAdmin
            .from('apuestas')
            .select('*')
            .order('created_at', { ascending: false });

        if (partido_id) {
            query = query.eq('partido_id', partido_id);
        }

        const { data: apuestas, error } = await query;

        if (error || !apuestas) {
            console.error('Error fetching admin bets:', error);
            return NextResponse.json({ error: 'Error al obtener apuestas' }, { status: 500 });
        }

        // 1. Obtener IDs únicos de usuarios y partidos
        const userIds = [...new Set(apuestas.map((b: any) => b.usuario_id).filter(Boolean))];
        const matchIds = [...new Set(apuestas.map((b: any) => b.partido_id).filter(Boolean))];

        // 2. Consultar detalles de usuarios y partidos en paralelo
        const [usersRes, matchesRes] = await Promise.all([
            supabaseAdmin.from('usuarios').select('id, nombre, rol, jugador_id').in('id', userIds),
            supabaseAdmin.from('partidos').select('id, rival').in('id', matchIds)
        ]);

        // Crear mapas para acceso rápido O(1)
        const usersMap = Object.fromEntries(usersRes.data?.map((u: any) => [u.id, u]) || []);
        const matchesMap = Object.fromEntries(matchesRes.data?.map((m: any) => [m.id, m]) || []);

        // 3. Combinar datos
        const apuestasWithDetails = apuestas.map((b: any) => ({
            ...b,
            usuario: usersMap[b.usuario_id] || null,
            partido: matchesMap[b.partido_id] || null
        }));

        return NextResponse.json({ success: true, apuestas: apuestasWithDetails });
    } catch (err: any) {
        console.error('API Error Admin Apuestas:', err);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

