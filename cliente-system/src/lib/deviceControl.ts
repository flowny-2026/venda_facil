// ============================================
// CONTROLE DE DISPOSITIVOS POR LOJA
// ============================================

import { supabase } from './supabase';

export interface DeviceInfo {
  fingerprint: string;
  name: string;
  ip?: string;
  userAgent: string;
}

/**
 * Gera um fingerprint simples do navegador
 * (em produção, use @fingerprintjs/fingerprintjs para mais precisão)
 */
export function generateDeviceFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    navigator.hardwareConcurrency || 'unknown',
  ];

  // Hash simples (em produção use uma lib de hash)
  let hash = 0;
  const str = components.join('||');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'fp_' + Math.abs(hash).toString(16);
}

/**
 * Pega informações do dispositivo atual
 */
export function getDeviceInfo(): DeviceInfo {
  return {
    fingerprint: generateDeviceFingerprint(),
    name: `${navigator.platform} - ${navigator.userAgent.split(' ')[0]}`,
    userAgent: navigator.userAgent,
  };
}

/**
 * Verifica se o dispositivo pode acessar a empresa
 * Retorna: { allowed: boolean, message?: string, deviceId?: string }
 */
export async function checkDeviceAccess(companyId: string): Promise<{
  allowed: boolean;
  message?: string;
  deviceId?: string;
  canKick?: boolean;
}> {
  try {
    const deviceInfo = getDeviceInfo();

    // 1. Buscar limite de dispositivos da empresa
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('max_devices, name')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return { allowed: false, message: 'Empresa não encontrada.' };
    }

    const maxDevices = company.max_devices || 1;

    // 2. Verificar se este dispositivo já está registrado
    const { data: existingDevice } = await supabase
      .from('company_devices')
      .select('*')
      .eq('company_id', companyId)
      .eq('device_fingerprint', deviceInfo.fingerprint)
      .eq('is_active', true)
      .maybeSingle();

    if (existingDevice) {
      // Dispositivo já registrado, atualizar last_login
      await supabase
        .from('company_devices')
        .update({ last_login: new Date().toISOString() })
        .eq('id', existingDevice.id);

      return { allowed: true, deviceId: existingDevice.id };
    }

    // 3. Contar dispositivos ativos
    const { count, error: countError } = await supabase
      .from('company_devices')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_active', true);

    if (countError) throw countError;

    const activeDevices = count || 0;

    // 4. Verificar se pode registrar novo dispositivo
    if (activeDevices >= maxDevices) {
      return {
        allowed: false,
        message: `Limite de ${maxDevices} dispositivo(s) atingido para a loja "${company.name}".\n\nVocê já tem ${activeDevices} dispositivo(s) logado(s). Deslogue de um para continuar, ou adquira mais licenças.`,
        canKick: true,
      };
    }

    // 5. Registrar novo dispositivo
    const { data: newDevice, error: insertError } = await supabase
      .from('company_devices')
      .insert([{
        company_id: companyId,
        device_fingerprint: deviceInfo.fingerprint,
        device_name: deviceInfo.name,
        user_agent: deviceInfo.userAgent,
        is_active: true,
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    return { allowed: true, deviceId: newDevice.id };

  } catch (error: any) {
    console.error('Erro ao verificar dispositivo:', error);
    return { allowed: false, message: 'Erro ao verificar acesso. Tente novamente.' };
  }
}

/**
 * Desloga um dispositivo específico (kick)
 */
export async function kickDevice(deviceId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('company_devices')
      .update({ is_active: false })
      .eq('id', deviceId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao deslogar dispositivo:', error);
    return false;
  }
}

/**
 * Lista dispositivos ativos de uma empresa
 */
export async function listActiveDevices(companyId: string) {
  const { data, error } = await supabase
    .from('company_devices')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('last_login', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Desloga TODOS os dispositivos da empresa (útil quando o admin quer forçar relogin)
 */
export async function kickAllDevices(companyId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('company_devices')
      .update({ is_active: false })
      .eq('company_id', companyId)
      .eq('is_active', true);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao deslogar todos os dispositivos:', error);
    return false;
  }
}

/**
 * Hook para verificar acesso periodicamente (chamar no useEffect do app)
 */
export function startDeviceCheck(companyId: string, onBlocked: () => void) {
  // Verificar a cada 30 segundos se o dispositivo ainda está ativo
  const interval = setInterval(async () => {
    const deviceInfo = getDeviceInfo();

    const { data: device } = await supabase
      .from('company_devices')
      .select('is_active')
      .eq('company_id', companyId)
      .eq('device_fingerprint', deviceInfo.fingerprint)
      .maybeSingle();

    if (!device || !device.is_active) {
      // Dispositivo foi deslogado pelo admin ou outro motivo
      onBlocked();
    }
  }, 30000); // 30 segundos

  return () => clearInterval(interval);
}