import { Code, Database, Globe, Zap } from 'lucide-react';

export default function ApiIntegrationGuide() {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft">
      <h2 className="text-lg font-semibold text-slate-100 mb-4">🚀 Próximo Nível: Integração com API</h2>
      
      <div className="space-y-4">
        <p className="text-sm text-slate-300">
          Atualmente usando <strong>LocalStorage</strong> para persistência. Para um sistema profissional, 
          considere estas opções:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-blue-400" />
              <h3 className="font-medium text-slate-200">Firebase/Supabase</h3>
            </div>
            <p className="text-xs text-slate-400">
              Backend-as-a-Service com autenticação, banco de dados real-time e hosting.
            </p>
          </div>

          <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-green-400" />
              <h3 className="font-medium text-slate-200">API REST</h3>
            </div>
            <p className="text-xs text-slate-400">
              Node.js + Express + PostgreSQL/MongoDB para controle total.
            </p>
          </div>

          <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <h3 className="font-medium text-slate-200">Serverless</h3>
            </div>
            <p className="text-xs text-slate-400">
              Vercel Functions, Netlify Functions ou AWS Lambda.
            </p>
          </div>

          <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Code className="w-4 h-4 text-amber-400" />
              <h3 className="font-medium text-slate-200">GraphQL</h3>
            </div>
            <p className="text-xs text-slate-400">
              Hasura, Apollo ou Prisma para queries flexíveis.
            </p>
          </div>
        </div>

        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-300">
            💡 <strong>Dica:</strong> Para começar rápido, recomendo <strong>Supabase</strong>. 
            É gratuito, tem interface visual e se integra facilmente com React.
          </p>
        </div>
      </div>
    </div>
  );
}