import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }

    try {
      // Verificar se é admin
      const { data: adminData, error: adminError } = await supabase
        .rpc('is_admin', { user_uuid: user.id });

      if (adminError) throw adminError;
      setIsAdmin(adminData);

      // Verificar se é super admin
      const { data: superAdminData, error: superAdminError } = await supabase
        .rpc('is_super_admin', { user_uuid: user.id });

      if (superAdminError) throw superAdminError;
      setIsSuperAdmin(superAdminData);

    } catch (error) {
      console.error('Erro ao verificar status admin:', error);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    isAdmin,
    isSuperAdmin,
    loading,
    checkAdminStatus
  };
}