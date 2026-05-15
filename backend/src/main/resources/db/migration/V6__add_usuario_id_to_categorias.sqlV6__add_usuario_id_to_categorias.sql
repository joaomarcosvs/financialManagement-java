ALTER TABLE categorias 
ADD COLUMN usuario_id UUID REFERENCES usuarios(id);