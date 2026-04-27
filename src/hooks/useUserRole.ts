import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export type UserRole = 'owner' | 'manager' | 'seller';

export interface UserPermissions {
  role: UserRole;
  sellerId: string | null;
  canViewCompanyProfits: boolean;
  canAccessPdv: boolean;
  canViewReports: boolean;
  canManageProducts: boolean;
  canManageSellers: boolean;
  companyId: string;
  companyName: string;
  sellerName: string | null;
}

export function useUserRole() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPermissions(null);
      setLoading(false);
      return;
    }

    loadUserPermissions();
  }, [user]);

  async function loadUserPermissions() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('v_company_users_with_seller')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;

      setPermissions({
        role: data.role as UserRole,
        sellerId: data.seller_id,
        canViewCompanyProfits: data.can_view_company_profits,
        canAccessPdv: data.can_access_pdv,
        canViewReports: data.can_view_reports,
        canManageProducts: data.can_manage_products,
        canManageSellers: data.can_manage_sellers,
        companyId: data.company_id,
        companyName: data.company_name,
        sellerName: data.seller_name
      });
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  }

  const isSeller = permissions?.role === 'seller';
  const isManager = permissions?.role === 'manager' || permissions?.role === 'owner';
  const isOwner = permissions?.role === 'owner';

  return {
    permissions,
    loading,
    isSeller,
    isManager,
    isOwner,
    reload: loadUserPermissions
  };
}
