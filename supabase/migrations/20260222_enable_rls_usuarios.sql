ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden leer su propio registro" ON usuarios FOR SELECT USING (auth.uid() = id);

ALTER TABLE usuarios ADD COLUMN activo BOOLEAN DEFAULT TRUE;