-- Primero actualizamos a los usuarios que puedan tener el rol 'externo' a 'espectador'
UPDATE public.usuarios SET rol = 'espectador' WHERE rol = 'externo';

-- Luego eliminamos la restricción antigua que validaba los roles
ALTER TABLE public.usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;

-- Y creamos la nueva restricción que acepta 'espectador'
ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_rol_check CHECK (rol IN ('admin', 'equipo', 'espectador'));
