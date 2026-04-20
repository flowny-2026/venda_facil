import { useState } from 'react'
import { X, Mail, Lock, User, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { signIn, signUp, resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) throw error
        onClose()
      } else if (mode === 'register') {
        const { error } = await signUp(email, password, fullName, companyName)
        if (error) throw error
        setSuccess('Verifique seu email para confirmar a conta!')
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email)
        if (error) throw error
        setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitação')
    } finally {
      setLoading(false)
    }
  }

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Entrar'
      case 'register': return 'Criar Conta'
      case 'forgot': return 'Recuperar Senha'
      default: return 'Entrar'
    }
  }

  const getButtonText = () => {
    if (loading) return 'Carregando...'
    switch (mode) {
      case 'login': return 'Entrar'
      case 'register': return 'Criar Conta'
      case 'forgot': return 'Enviar Email'
      default: return 'Entrar'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {mode === 'forgot' && (
              <button
                onClick={() => setMode('login')}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-xl font-semibold text-slate-100">{getTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-300 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome da Empresa
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Nome da sua empresa"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg py-2 text-sm font-medium transition-colors"
          >
            {getButtonText()}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          {mode === 'login' && (
            <>
              <button
                onClick={() => setMode('forgot')}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Esqueci minha senha
              </button>
              <div>
                <button
                  onClick={() => setMode('register')}
                  className="text-sm text-slate-400 hover:text-slate-200"
                >
                  Não tem conta? Criar uma
                </button>
              </div>
            </>
          )}

          {mode === 'register' && (
            <button
              onClick={() => setMode('login')}
              className="text-sm text-slate-400 hover:text-slate-200"
            >
              Já tem conta? Entrar
            </button>
          )}

          {mode === 'forgot' && (
            <button
              onClick={() => setMode('login')}
              className="text-sm text-slate-400 hover:text-slate-200"
            >
              Lembrou da senha? Entrar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}