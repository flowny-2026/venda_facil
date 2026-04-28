import { useState } from 'react'
import { Database, Key, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'

export default function SupabaseSetup() {
  const [step, setStep] = useState(1)
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseKey, setSupabaseKey] = useState('')

  const handleSaveConfig = () => {
    if (!supabaseUrl || !supabaseKey) {
      alert('Por favor, preencha todos os campos')
      return
    }

    // Salvar no localStorage temporariamente para demonstração
    localStorage.setItem('supabase_url', supabaseUrl)
    localStorage.setItem('supabase_key', supabaseKey)
    
    alert('Configuração salva! Recarregue a página para aplicar as mudanças.')
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-500/15 rounded-lg">
          <Database className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Configuração do Supabase</h2>
          <p className="text-sm text-slate-400">Configure sua conexão com o banco de dados</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Passo 1: Criar conta */}
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
          }`}>
            1
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-slate-200 mb-2">Criar conta no Supabase</h3>
            <p className="text-sm text-slate-400 mb-3">
              Acesse o Supabase e crie uma conta gratuita
            </p>
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-green-600/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-600/30 transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir Supabase
            </a>
          </div>
        </div>

        {/* Passo 2: Criar projeto */}
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
          }`}>
            2
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-slate-200 mb-2">Criar novo projeto</h3>
            <p className="text-sm text-slate-400">
              No painel do Supabase, clique em "New Project" e escolha um nome
            </p>
          </div>
        </div>

        {/* Passo 3: Configurar tabelas */}
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
          }`}>
            3
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-slate-200 mb-2">Executar SQL</h3>
            <p className="text-sm text-slate-400 mb-3">
              Vá em "SQL Editor" e execute este código para criar as tabelas:
            </p>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-300 overflow-x-auto">
              <pre>{`-- Criar tabela de vendas
CREATE TABLE sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT CHECK (category IN ('SaaS', 'Serviços', 'Hardware')) NOT NULL,
  status TEXT CHECK (status IN ('paid', 'pending', 'canceled')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas vendas
CREATE POLICY "Users can view own sales" ON sales
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales" ON sales
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales" ON sales
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales" ON sales
  FOR DELETE USING (auth.uid() = user_id);`}</pre>
            </div>
          </div>
        </div>

        {/* Passo 4: Pegar credenciais */}
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 4 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
          }`}>
            4
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-slate-200 mb-2">Configurar credenciais</h3>
            <p className="text-sm text-slate-400 mb-3">
              Vá em Settings → API e copie suas credenciais:
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Project URL
                </label>
                <div className="relative">
                  <Database className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="https://your-project.supabase.co"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Anon Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  />
                </div>
              </div>

              <button
                onClick={handleSaveConfig}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition-colors"
              >
                Salvar Configuração
              </button>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <p className="text-sm text-amber-300">
            <strong>Importante:</strong> Em produção, use variáveis de ambiente (.env) para as credenciais
          </p>
        </div>
      </div>
    </div>
  )
}