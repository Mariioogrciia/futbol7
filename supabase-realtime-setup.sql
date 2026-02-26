-- Habilitar la extensión Realtime si no lo está
-- (Normalmente ya está habilitada en Supabase, pero lo indicamos por seguridad)

-- Asegurarnos de que la tabla 'partidos' emite eventos de INSERT, UPDATE y DELETE
ALTER PUBLICATION supabase_realtime ADD TABLE public.partidos;

-- REPLICA IDENTITY FULL asegura que se envíe toda la fila vieja en los eventos UPDATE/DELETE si fuese necesario
ALTER TABLE public.partidos REPLICA IDENTITY FULL;
