import { useState, useEffect, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Interface para o controle de dispositivos
interface DeviceCheckResult {
  allowed: boolean
  message?: string
  canKick?: boolean
  deviceId?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [deviceBlocked, setDeviceBlocked] = useState(false)
  const [blockMessage, setBlockMessage] = useState('')
  const deviceCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Pegar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Se tem sessão, iniciar verificação de dispositivo
      if (session?.user) {
        startDeviceCheck(session.user.id)
      }
    })

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Limpar verificação se deslogou
      if (!session) {
        stopDeviceCheck()
        setDeviceBlocked(false)
        setBlockMessage('')
      }
    })

    return () => {
      subscription.unsubscribe()
      stopDeviceCheck()
    }
  }, [])

  // ============================================
  // FUNÇÕES DE CONTROLE DE DISPOSITIVO
  // ============================================

  /**
   * Gera um fingerprint simples do navegador
   */
  function generateDeviceFingerprint(): string {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage,
      navigator.hardwareConcurrency || 'unknown',
    ]

    let hash = 0
    const str = components.join('||')
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return 'fp_' + Math.abs(hash).toString(16)
  }

  /**
   * Verifica se o dispositivo pode acessar a empresa
   */
  async function checkDeviceAccess(userId: string): Promise<DeviceCheckResult> {
    try {
      const fingerprint = generateDeviceFingerprint()

      // 1. Buscar a empresa do usuário
      const { data: userCompany, error: companyError } = await supabase
        .from('company_users')
        .select('company_id, companies(id, name, max_devices)')
        .eq('user_id', userId)
        .maybeSingle()

      if (companyError || !userCompany) {
        return { allowed: false, message: 'Usuário não vinculado a nenhuma empresa.' }
      }

      const companyId = userCompany.company_id
      const maxDevices = userCompany.companies?.max_devices || 1

      // 2. Verificar se este dispositivo já está registrado
      const { data: existingDevice } = await supabase
        .from('company_devices')
        .select('id')
        .eq('company_id', companyId)
        .eq('device_fingerprint', fingerprint)
        .eq('is_active', true)
        .maybeSingle()

      if (existingDevice) {
        // Dispositivo já registrado, atualizar last_login
        await supabase
          .from('company_devices')
          .update({ last_login: new Date().toISOString() })
          .eq('id', existingDevice.id)

        return { allowed: true, deviceId: existingDevice.id }
      }

      // 3. Contar dispositivos ativos
      const { count, error: countError } = await supabase
        .from('company_devices')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('is_active', true)

      if (countError) throw countError

      const activeDevices = count || 0

      // 4. Verificar se pode registrar novo dispositivo
      if (activeDevices >= maxDevices) {
        // Buscar nome da empresa
        const { data: company } = await supabase
          .from('companies')
          .select('name')
          .eq('id', companyId)
          .single()

        return {
          allowed: false,
          message: `Limite de ${maxDevices} dispositivo(s) atingido para a loja "${company?.name || 'Empresa'}".\n\nVocê já tem ${activeDevices} dispositivo(s) logado(s). Entre em contato com o administrador para adquirir mais licenças.`,
          canKick: false,
        }
      }

      // 5. Registrar novo dispositivo
      const { data: newDevice, error: insertError } = await supabase
        .from('company_devices')
        .insert([{
          company_id: companyId,
          device_fingerprint: fingerprint,
          device_name: `${navigator.platform} - ${navigator.userAgent.split(' ')[0]}`,
          user_agent: navigator.userAgent,
          is_active: true,
        }])
        .select()
        .single()

      if (insertError) throw insertError

      return { allowed: true, deviceId: newDevice.id }

    } catch (error: any) {
      console.error('Erro ao verificar dispositivo:', error)
      return { allowed: false, message: 'Erro ao verificar acesso. Tente novamente.' }
    }
  }

  /**
   * Inicia verificação periódica do dispositivo
   * Se o admin deslogar o dispositivo, o usuário é expulso
   */
  function startDeviceCheck(userId: string) {
    // Verificar a cada 30 segundos
    deviceCheckInterval.current = setInterval(async () => {
      const fingerprint = generateDeviceFingerprint()

      // Buscar empresa do usuário
      const { data: userCompany } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', userId)
        .maybeSingle()

      if (!userCompany) return

      // Verificar se dispositivo ainda está ativo
      const { data: device } = await supabase
        .from('company_devices')
        .select('is_active')
        .eq('company_id', userCompany.company_id)
        .eq('device_fingerprint', fingerprint)
        .maybeSingle()

      if (!device || !device.is_active) {
        // Dispositivo foi deslogado pelo admin
        setDeviceBlocked(true)
        setBlockMessage('Seu acesso foi revogado pelo administrador. Entre em contato para mais informações.')
        await signOut()
      }
    }, 30000) // 30 segundos
  }

  /**
   * Para a verificação periódica
   */
  function stopDeviceCheck() {
    if (deviceCheckInterval.current) {
      clearInterval(deviceCheckInterval.current)
      deviceCheckInterval.current = null
    }
  }

  // ============================================
  // FUNÇÕES DE AUTENTICAÇÃO (COM BLOQUEIO)
  // ============================================

  // Função para fazer login
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { data: null, error }
      }

      // LOGIN BEM-SUCEDIDO — Verificar dispositivo
      if (data.user) {
        const deviceCheck = await checkDeviceAccess(data.user.id)

        if (!deviceCheck.allowed) {
          // Bloqueia o login e desloga do auth
          await supabase.auth.signOut()
          setUser(null)
          setSession(null)
          setDeviceBlocked(true)
          setBlockMessage(deviceCheck.message || 'Acesso negado.')

          return {
            data: null,
            error: {
              message: deviceCheck.message || 'Acesso negado.',
              name: 'DeviceBlockedError',
            } as Error,
          }
        }

        // Tudo certo — iniciar verificação periódica
        startDeviceCheck(data.user.id)
      }

      return { data, error: null }

    } catch (err: any) {
      console.error('Erro no login:', err)
      return {
        data: null,
        error: {
          message: err.message || 'Erro ao fazer login.',
          name: 'AuthError',
        } as Error,
      }
    }
  }

  // Função para fazer cadastro
  const signUp = async (email: string, password: string, fullName: string, companyName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName || '',
        },
        emailRedirectTo: window.location.origin,
      },
    })
    return { data, error }
  }

  // Função para fazer logout
  const signOut = async () => {
    try {
      // Parar verificação de dispositivo
      stopDeviceCheck()

      // Marcar dispositivo como inativo
      if (user) {
        const fingerprint = generateDeviceFingerprint()
        const { data: userCompany } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (userCompany) {
          await supabase
            .from('company_devices')
            .update({ is_active: false })
            .eq('company_id', userCompany.company_id)
            .eq('device_fingerprint', fingerprint)
        }
      }

      // Limpar sessão do Supabase
      const { error } = await supabase.auth.signOut()

      // Limpar estados locais
      setUser(null)
      setSession(null)
      setDeviceBlocked(false)
      setBlockMessage('')

      // Limpar localStorage
      const keysToRemove = [
        'supabase.auth.token',
        'sb-cvmjjzhvdmpbxquxepue-auth-token',
        'dashboard-vendas-data',
        'theme'
      ]

      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key)
        } catch (e) {
          console.warn(`Erro ao remover ${key}:`, e)
        }
      })

      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          try {
            localStorage.removeItem(key)
          } catch (e) {
            console.warn(`Erro ao remover ${key}:`, e)
          }
        }
      })

      // Forçar reload
      setTimeout(() => {
        window.location.reload()
      }, 100)

      return { error }
    } catch (err) {
      console.error('Erro no logout:', err)
      return { error: err }
    }
  }

  // Função para resetar senha
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  return {
    user,
    session,
    loading,
    deviceBlocked,
    blockMessage,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }
}