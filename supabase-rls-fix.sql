-- Permitir lectura de los partidos a cualquier usuario público (Necesario para el Portal del Jugador)
CREATE POLICY "Public partides are viewable by everyone."
ON public.partidos FOR SELECT
USING ( true );

-- Permitir consultar la lista de jugadores a usuarios públicos
CREATE POLICY "Public jugadores are viewable by everyone."
ON public.jugadores FOR SELECT
USING ( true );
