ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS jugador_id uuid REFERENCES public.jugadores(id) ON DELETE SET NULL;
