-- Ejecutar mediante psql -v correo=... -f o por stdin con un operador de la base.
\set ON_ERROR_STOP on
BEGIN;
LOCK TABLE usuarios IN SHARE ROW EXCLUSIVE MODE;
SELECT set_config('sitio.correo_inicial', :'correo', true) IS NOT NULL AS correo_recibido;
DO $$
DECLARE elegido integer;
BEGIN
  IF EXISTS (SELECT 1 FROM usuarios WHERE rol = 'admin') THEN
    RAISE EXCEPTION 'Ya hay un administrador. Usa el panel para gestionar los roles.';
  END IF;
  UPDATE usuarios SET rol = 'admin', mfa_habilitado = false, updated_at = now()
    WHERE email = lower(trim(current_setting('sitio.correo_inicial'))) AND rol = 'editor' AND activo
    RETURNING id INTO STRICT elegido;
  DELETE FROM usuarios_sessions WHERE _parent_id = elegido;
  INSERT INTO auditoria (accion, coleccion_afectada, documento_id, usuario_id, detalle)
    VALUES ('usuario.rol.cambiar', 'usuarios', elegido::text, elegido, '{"origen":"operador de base","rol":"admin"}');
END $$;
COMMIT;
