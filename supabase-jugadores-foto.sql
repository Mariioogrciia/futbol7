-- Añadir columna para foto de perfil a los jugadores
ALTER TABLE public.jugadores ADD COLUMN IF NOT EXISTS foto_url text;
