import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
    try {
        const { data: leaderboard, error } = await supabaseAdmin
            .from('predicciones')
            .select(`
                puntos,
                usuario:usuarios(id, nombre)
            `);

        if (error) {
            console.error('Error fetching leaderboard:', error);
            return NextResponse.json({ error: 'Error al obtener el ranking' }, { status: 500 });
        }

        // Calcular puntos totales por usuario
        const userPoints = new Map<string, { id: string, nombre: string, puntos: number }>();

        leaderboard.forEach((p: any) => {
            if (!p.usuario) return;
            // Handle array or single object from PostgREST
            const user = Array.isArray(p.usuario) ? p.usuario[0] : p.usuario;

            if (!user) return;

            const existing = userPoints.get(user.id) || { id: user.id, nombre: user.nombre, puntos: 0 };
            existing.puntos += (p.puntos || 0);
            userPoints.set(user.id, existing);
        });

        const ranking = Array.from(userPoints.values());

        // Ordenar de mayor a menor y filtrar los que tienen 0 (opcional, dejamos todos para ver)
        ranking.sort((a, b) => b.puntos - a.puntos);

        return NextResponse.json({ success: true, ranking: ranking.slice(0, 50) }); // Top 50
    } catch (err: any) {
        console.error('API Error Leaderboard:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
