import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const partido_id = url.searchParams.get('partido_id');

        let query = supabaseAdmin
            .from('apuestas')
            .select(`
                *,
                usuario:usuarios(nombre)
            `)
            .order('created_at', { ascending: false });

        if (partido_id) {
            query = query.eq('partido_id', partido_id);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching admin bets:', error);
            return NextResponse.json({ error: 'Error al obtener apuestas' }, { status: 500 });
        }

        return NextResponse.json({ success: true, apuestas: data });
    } catch (err: any) {
        console.error('API Error Admin Apuestas:', err);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
