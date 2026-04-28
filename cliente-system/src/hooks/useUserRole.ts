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

      // Tentar carregar da view primeiro
      const { data: viewData, error: viewError } = await supabase
        .from('v_company_users_with_seller')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (viewData && !viewError) {
        // View funcionou, usar dados dela
        setPermissions({
          role: viewData.role as UserRole,
          sellerId: viewData.seller_id,
          canViewCompanyProfits: viewData.can_view_company_profits,
          canAccessPdv: viewData.can_access_pdv,
          canViewReports: viewData.can_view_reports,
          canManageProducts: viewData.can_manage_products,
          canManageSellers: viewData.can_manage_sellers,
          companyId: viewData.company_id,
          companyName: viewData.company_name,
          sellerName: viewData.seller_name
        });
        return;
      }

      // Se view não funcionou, buscar dados manualmente
      console.log('View não disponível, buscando dados manualmente...');
      
      const { data: companyUserData, error: companyUserError } = await supabase
        .from('company_users')
        .select(`
          *,
          companies:company_id (
            id,
            name
          ),
          sellers:seller_id (
            id,
            name
          )
        `)
        .eq('user_id', user!.id)
        .maybeSingle();

      if (companyUserError) throw companyUserError;

      if (!companyUserData) {
        console.error('Usuário não encontrado em company_users');
        setPermissions(null);
        return;
      }

      setPermissions({
        role: (companyUserData.role || 'owner') as UserRole,
        sellerId: companyUserData.seller_id || null,
        canViewCompanyProfits: companyUserData.can_view_company_profits ?? true,
        canAccessPdv: companyUserData.can_access_pdv ?? true,
        canViewReports: companyUserData.can_view_reports ?? true,
        canManageProducts: companyUserData.can_manage_products ?? true,
        canManageSellers: companyUserData.can_manage_sellers ?? true,
        companyId: companyUserData.company_id,
        companyName: companyUserData.companies?.name || 'Empresa',
        sellerName: companyUserData.sellers?.name || null
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
