-- Script SQL para la tabla Convocatorias y el rol Jugador

-- 1. Crear tabla Convocatorias
CREATE TABLE IF NOT EXISTS public.convocatorias (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  partido_id uuid REFERENCES public.partidos(id) NOT NULL,
  jugador_id uuid REFERENCES public.jugadores(id) NOT NULL,
  asiste boolean NOT NULL,
  comentario text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(partido_id, jugador_id) -- Un jugador solo puede votar una vez por partido
);

-- 2. Habilitar Seguridad de Nivel de Fila (RLS)
ALTER TABLE public.convocatorias ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas para que cualquiera pueda leer/escribir (o ajustarlas después)
CREATE POLICY "Permitir select a todos en convocatorias" ON public.convocatorias
  FOR SELECT USING (true);

CREATE POLICY "Permitir insert a todos en convocatorias" ON public.convocatorias
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir update a todos en convocatorias" ON public.convocatorias
  FOR UPDATE USING (true);
