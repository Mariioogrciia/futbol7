import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1] || '';
        
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'El archivo debe ser una imagen' }, { status: 400 });
        }

        // Max 5MB
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'La imagen no puede superar 5MB' }, { status: 400 });
        }

        const ext = file.name.split('.').pop() || 'jpg';
        const filePath = `avatars/users/${user.id}-${Date.now()}.${ext}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabaseAdmin.storage
            .from('galeria')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: true,
            });

        if (uploadError) {
            console.error('Error uploading user avatar:', uploadError);
            return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 500 });
        }

        const { data: publicUrlData } = supabaseAdmin.storage
            .from('galeria')
            .getPublicUrl(filePath);

        const publicUrl = publicUrlData.publicUrl;

        // Update the avatar_url in the usuarios table
        const { error: dbError } = await supabaseAdmin
            .from('usuarios')
            .update({ avatar_url: publicUrl })
            .eq('id', user.id);

        if (dbError) {
            console.error('Error updating usuario avatar_url:', dbError);
            return NextResponse.json({ error: 'Error actualizando perfil' }, { status: 500 });
        }

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (err: any) {
        console.error('API Error Upload User Avatar:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
