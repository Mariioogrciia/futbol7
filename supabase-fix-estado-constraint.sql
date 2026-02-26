-- Actualizar la restricción (CHECK constraint) del estado en la tabla 'partidos'
-- para permitir el nuevo estado 'en_juego'

ALTER TABLE public.partidos DROP CONSTRAINT IF EXISTS partidos_estado_check;

ALTER TABLE public.partidos ADD CONSTRAINT partidos_estado_check 
CHECK (estado IN ('programado', 'finalizado', 'en_juego', 'cancelado', 'aplazado'));
