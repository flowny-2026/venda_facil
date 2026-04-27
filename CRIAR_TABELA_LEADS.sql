-- ========================================
-- TABELA PARA ARMAZENAR LEADS DA LANDING PAGE
-- ========================================

-- Criar tabela de leads
CREATE TABLE IF NOT EXISTS public.landing_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    business_type TEXT,
    message TEXT,
    status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'convertido', 'descartado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_landing_leads_email ON public.landing_leads(contact_email);
CREATE INDEX IF NOT EXISTS idx_landing_leads_status ON public.landing_leads(status);
CREATE INDEX IF NOT EXISTS idx_landing_leads_created_at ON public.landing_leads(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.landing_leads ENABLE ROW LEVEL SECURITY;

-- Política para permitir INSERT público (qualquer pessoa pode enviar o formulário)
CREATE POLICY "Permitir INSERT público de leads"
ON public.landing_leads
FOR INSERT
TO anon
WITH CHECK (true);

-- Política para admins visualizarem todos os leads
CREATE POLICY "Admins podem visualizar leads"
ON public.landing_leads
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE admin_users.user_id = auth.uid()
    )
);

-- Política para admins atualizarem leads (mudar status, adicionar notas)
CREATE POLICY "Admins podem atualizar leads"
ON public.landing_leads
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE admin_users.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE admin_users.user_id = auth.uid()
    )
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_landing_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_landing_leads_updated_at ON public.landing_leads;
CREATE TRIGGER trigger_update_landing_leads_updated_at
    BEFORE UPDATE ON public.landing_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_landing_leads_updated_at();

-- Comentários na tabela
COMMENT ON TABLE public.landing_leads IS 'Armazena leads capturados pela landing page';
COMMENT ON COLUMN public.landing_leads.status IS 'Status do lead: novo, contatado, convertido, descartado';

-- Verificar se a tabela foi criada
SELECT 
    'Tabela landing_leads criada com sucesso!' as mensagem,
    COUNT(*) as total_leads
FROM public.landing_leads;
