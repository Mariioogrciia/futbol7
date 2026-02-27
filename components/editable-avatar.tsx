"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EditableAvatarProps {
    jugadorId: string;
    currentFotoUrl: string | null;
    jugadorNombre: string;
}

export function EditableAvatar({ jugadorId, currentFotoUrl, jugadorNombre }: EditableAvatarProps) {
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(jugadorNombre)}&background=0D8ABC&color=fff&size=200`;
    const [avatarUrl, setAvatarUrl] = useState(currentFotoUrl || defaultAvatar);
    const [isUploading, setIsUploading] = useState(false);
    const [canEdit, setCanEdit] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        setAvatarUrl(currentFotoUrl || defaultAvatar);
    }, [currentFotoUrl, defaultAvatar]);

    useEffect(() => {
        // Check if the current user has permission to edit this avatar
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: userData } = await supabase
                    .from('usuarios')
                    .select('rol, jugador_id')
                    .eq('id', session.user.id)
                    .single();

                if (userData?.rol === 'admin' || userData?.jugador_id === jugadorId) {
                    setCanEdit(true);
                }
            }
        };
        checkAuth();
    }, [jugadorId]);

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setIsUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error("Debes seleccionar una imagen para subir.");
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `avatars/${jugadorId}-${Math.random()}.${fileExt}`;

            // 1. Upload to Supabase Storage in 'galeria' bucket (or a new 'avatars' folder inside it)
            const { error: uploadError, data } = await supabase.storage
                .from('galeria')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                throw uploadError;
            }

            // 2. Get public URL
            const { data: publicUrlData } = supabase.storage
                .from('galeria')
                .getPublicUrl(filePath);

            const publicUrl = publicUrlData.publicUrl;

            // 3. Update the 'jugadores' table via our new API endpoint (or direct client if RLS allows)
            // It's safer to use an API endpoint to bypass RLS if needed, or if RLS allows users to update.
            // Let's call an API route we will create next.
            const response = await fetch('/api/players/avatar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jugador_id: jugadorId,
                    foto_url: publicUrl,
                }),
            });

            if (!response.ok) {
                const resData = await response.json();
                throw new Error(resData.error || "Error actualizando el perfil del jugador");
            }

            setAvatarUrl(publicUrl);
            toast.success("Foto de perfil actualizada correctamente");
            router.refresh(); // Tells Next.js to re-fetch Server Components

        } catch (error: any) {
            console.error("Error uploading avatar:", error);
            toast.error(error.message || "No se pudo subir la foto de perfil.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Reset input
            }
        }
    };

    return (
        <div className="relative h-48 w-48 sm:h-64 sm:w-64 rounded-2xl overflow-hidden border-4 border-card shadow-xl ring-4 ring-accent/20 bg-muted group">
            <Image src={avatarUrl} alt={jugadorNombre} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />

            {canEdit && (
                <>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="bg-accent/90 hover:bg-accent text-accent-foreground rounded-full p-4 shadow-lg transform transition-transform hover:scale-110 flex flex-col items-center justify-center"
                        >
                            {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Camera className="h-8 w-8" />}
                            <span className="text-xs font-bold mt-1">{isUploading ? 'Subiendo...' : 'Cambiar Foto'}</span>
                        </button>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={uploadAvatar}
                        disabled={isUploading}
                    />
                </>
            )}
        </div>
    );
}
