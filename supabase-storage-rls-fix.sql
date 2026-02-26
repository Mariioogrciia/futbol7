-- Permitir que los usuarios autenticados suban archivos al bucket "galeria"
CREATE POLICY "Allow authenticated uploads to galeria"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'galeria'
);

-- Permitir que los usuarios autenticados modifiquen sus propios archivos (opcional, pero buena práctica)
CREATE POLICY "Allow authenticated updates to galeria"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'galeria'
);

-- Permitir que los usuarios autenticados eliminen archivos del bucket "galeria"
CREATE POLICY "Allow authenticated deletes from galeria"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'galeria'
);
