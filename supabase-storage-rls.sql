-- 1. Permitir a todos (incluso anónimos) VER los archivos de la galería
CREATE POLICY "Public Access to galeria"
ON storage.objects FOR SELECT
USING (bucket_id = 'galeria');

-- 2. Permitir que los usuarios AUTENTICADOS (tanto admin como equipo) suban fotos
CREATE POLICY "Allow authenticated uploads to galeria"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'galeria');

-- 3. Permitir que los usuarios AUTENTICADOS puedan borrar archivos de la galería
CREATE POLICY "Allow authenticated deletes from galeria"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'galeria');

-- 4. Permitir actualizar (renombrar o sobreescribir)
CREATE POLICY "Allow authenticated updates to galeria"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'galeria');
