-- ============================================
-- SEGURANÇA MÁXIMA - PARTE 3
-- AUDIT LOGS E TRIGGERS
-- ============================================

-- PASSO 1: Criar tabela de audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- RLS para audit_logs (apenas owners veem)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Audit_logs: Apenas owners veem" ON audit_logs;

CREATE POLICY "Audit_logs: Apenas owners veem"
ON audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.user_id = auth.uid()
    AND cu.role = 'owner'
  )
);

-- PASSO 2: Função para registrar mudanças
CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
DECLARE
  user_email_var TEXT;
BEGIN
  -- Obter email do usuário
  SELECT email INTO user_email_var
  FROM auth.users
  WHERE id = auth.uid();

  -- Registrar mudança
  INSERT INTO audit_logs (
    user_id,
    user_email,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    auth.uid(),
    user_email_var,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 3: Criar triggers para tabelas importantes
-- Trigger para sellers
DROP TRIGGER IF EXISTS sellers_audit_trigger ON sellers;
CREATE TRIGGER sellers_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON sellers
  FOR EACH ROW
  EXECUTE FUNCTION log_changes();

-- Trigger para companies
DROP TRIGGER IF EXISTS companies_audit_trigger ON companies;
CREATE TRIGGER companies_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION log_changes();

-- Trigger para company_users
DROP TRIGGER IF EXISTS company_users_audit_trigger ON company_users;
CREATE TRIGGER company_users_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON company_users
  FOR EACH ROW
  EXECUTE FUNCTION log_changes();

-- PASSO 4: Função para limpar logs antigos (manter últimos 90 dias)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 5: Verificar resultado
SELECT 
  '=== AUDIT LOGS TABLE ===' as status,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'audit_logs'
ORDER BY ordinal_position;

SELECT 
  '=== TRIGGERS CRIADOS ===' as status,
  trigger_name,
  event_manipulation as event,
  event_object_table as table_name
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%audit_trigger'
ORDER BY event_object_table;

-- PASSO 6: Testar audit log (fazer uma mudança de teste)
-- Isso vai gerar um registro no audit_logs
UPDATE companies 
SET updated_at = NOW() 
WHERE id IN (SELECT id FROM companies LIMIT 1);

-- Ver logs criados
SELECT 
  '=== LOGS RECENTES ===' as status,
  user_email,
  action,
  table_name,
  created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 5;
