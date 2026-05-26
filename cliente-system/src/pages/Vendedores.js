import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, User, Target, Percent, Edit, Trash2, RefreshCw, CheckCircle, XCircle, Key, BarChart3 } from 'lucide-react';
import CreateSellerLoginModal from '../components/CreateSellerLoginModal';
import SellerPerformanceCard from '../components/SellerPerformanceCard';
export default function Vendedores() {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSeller, setEditingSeller] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedSellerForLogin, setSelectedSellerForLogin] = useState(null);
    const [companyAccessType, setCompanyAccessType] = useState('shared'); // 'shared' ou 'individual'
    const [sellersStats, setSellersStats] = useState([]);
    const [loadingStats, setLoadingStats] = useState(false);
    const [newSeller, setNewSeller] = useState({
        name: '',
        email: '',
        phone: '',
        document: '',
        commission_percentage: 0,
        monthly_goal: 0
    });
    useEffect(() => {
        loadCompanyAccessType();
        loadSellers();
    }, []);
    useEffect(() => {
        // Carregar estatísticas apenas para empresas com acesso compartilhado
        if (companyAccessType === 'shared' && sellers.length > 0) {
            loadSellersStats();
        }
    }, [companyAccessType, sellers]);
    const loadSellersStats = async () => {
        try {
            setLoadingStats(true);
            // Usar UTC para evitar problemas de timezone
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            console.log('📊 Calculando estatísticas:');
            console.log('   - Hoje:', today.toISOString());
            console.log('   - Amanhã:', tomorrow.toISOString());
            console.log('   - Primeiro dia do mês:', firstDayOfMonth.toISOString());
            // Buscar vendas do dia e do mês para cada vendedor
            const statsPromises = sellers.map(async (seller) => {
                console.log(`🔍 Buscando vendas para ${seller.name} (${seller.id})`);
                // Vendas do dia (usando range de datas)
                const { data: todaySales, error: todayError } = await supabase
                    .from('sales')
                    .select('id, total_amount')
                    .eq('seller_id', seller.id)
                    .gte('created_at', today.toISOString())
                    .lt('created_at', tomorrow.toISOString());
                if (todayError) {
                    console.error(`❌ Erro ao buscar vendas de hoje para ${seller.name}:`, todayError);
                }
                else {
                    console.log(`📈 ${seller.name} - Vendas hoje:`, todaySales?.length || 0);
                }
                // Vendas do mês (usando range de datas)
                const { data: monthSales, error: monthError } = await supabase
                    .from('sales')
                    .select('id, total_amount')
                    .eq('seller_id', seller.id)
                    .gte('created_at', firstDayOfMonth.toISOString())
                    .lt('created_at', firstDayOfNextMonth.toISOString());
                if (monthError) {
                    console.error(`❌ Erro ao buscar vendas do mês para ${seller.name}:`, monthError);
                }
                else {
                    console.log(`📈 ${seller.name} - Vendas do mês:`, monthSales?.length || 0);
                }
                // Buscar itens das vendas (aproximação - cada venda = 1 item se não tiver sale_items)
                const { data: todayItems } = await supabase
                    .from('sale_items')
                    .select('quantity')
                    .in('sale_id', todaySales?.map(s => s.id) || []);
                const { data: monthItems } = await supabase
                    .from('sale_items')
                    .select('quantity')
                    .in('sale_id', monthSales?.map(s => s.id) || []);
                const todayCount = todaySales?.length || 0;
                const todayItemsCount = todayItems?.reduce((sum, item) => sum + (item.quantity || 1), 0) || todayCount;
                const todayTotal = todaySales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
                const todayAvg = todayCount > 0 ? todayTotal / todayCount : 0;
                const monthCount = monthSales?.length || 0;
                const monthItemsCount = monthItems?.reduce((sum, item) => sum + (item.quantity || 1), 0) || monthCount;
                const monthTotal = monthSales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
                const monthAvg = monthCount > 0 ? monthTotal / monthCount : 0;
                const stats = {
                    sellerId: seller.id,
                    sellerName: seller.name,
                    todaySales: todayCount,
                    todayItemsCount: todayItemsCount,
                    todayTicketAvg: todayAvg,
                    monthSales: monthCount,
                    monthItemsCount: monthItemsCount,
                    monthTicketAvg: monthAvg,
                    commission: seller.commission_percentage
                };
                console.log(`✅ Estatísticas para ${seller.name}:`, stats);
                return stats;
            });
            const stats = await Promise.all(statsPromises);
            setSellersStats(stats);
        }
        catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
        finally {
            setLoadingStats(false);
        }
    };
    const loadCompanyAccessType = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user)
                return;
            // Buscar o access_type da empresa do usuário
            const { data: companyData, error } = await supabase
                .from('company_users')
                .select('companies(access_type)')
                .eq('user_id', user.id)
                .single();
            if (error) {
                console.error('Erro ao buscar tipo de acesso:', error);
                return;
            }
            const accessType = companyData?.companies?.access_type || 'shared';
            setCompanyAccessType(accessType);
            console.log('🔑 Tipo de acesso da empresa:', accessType);
        }
        catch (error) {
            console.error('Erro ao carregar tipo de acesso:', error);
        }
    };
    const loadSellers = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user)
                return;
            // Buscar company_id do usuário
            const { data: companyData, error: companyError } = await supabase
                .from('company_users')
                .select('company_id')
                .eq('user_id', user.id)
                .single();
            if (companyError || !companyData) {
                console.error('Erro ao buscar empresa:', companyError);
                return;
            }
            const companyId = companyData.company_id;
            // Carregar vendedores DA EMPRESA
            const { data: sellersData, error: sellersError } = await supabase
                .from('sellers')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });
            if (sellersError)
                throw sellersError;
            // Verificar quais vendedores têm login
            const { data: companyUsersData } = await supabase
                .from('company_users')
                .select('seller_id')
                .eq('company_id', companyId)
                .not('seller_id', 'is', null);
            const sellersWithLogin = new Set(companyUsersData?.map(cu => cu.seller_id) || []);
            // Adicionar flag has_login
            const sellersWithLoginFlag = (sellersData || []).map(seller => ({
                ...seller,
                has_login: sellersWithLogin.has(seller.id)
            }));
            setSellers(sellersWithLoginFlag);
        }
        catch (error) {
            console.error('Erro ao carregar vendedores:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddSeller = async (e) => {
        e.preventDefault();
        // Prevenir múltiplos cliques
        if (saving)
            return;
        try {
            setSaving(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Usuário não autenticado');
                return;
            }
            // Buscar company_id correto do banco de dados
            const { data: companyUserData, error: companyError } = await supabase
                .from('company_users')
                .select('company_id')
                .eq('user_id', user.id)
                .eq('active', true)
                .single();
            if (companyError || !companyUserData) {
                alert('Erro: Usuário não está vinculado a nenhuma empresa');
                console.error('Erro ao buscar empresa:', companyError);
                return;
            }
            const companyId = companyUserData.company_id;
            const { data, error } = await supabase
                .from('sellers')
                .insert([{
                    ...newSeller,
                    company_id: companyId,
                    created_by: user.id
                }])
                .select()
                .single();
            if (error)
                throw error;
            setSellers(prev => [{ ...data, has_login: false }, ...prev]);
            setShowAddModal(false);
            resetForm();
            alert('Vendedor cadastrado com sucesso!');
        }
        catch (error) {
            console.error('Erro ao cadastrar vendedor:', error);
            alert('Erro ao cadastrar vendedor: ' + error.message);
        }
        finally {
            setSaving(false);
        }
    };
    const handleEditSeller = async (e) => {
        e.preventDefault();
        if (!editingSeller || saving)
            return;
        try {
            setSaving(true);
            const { data, error } = await supabase
                .from('sellers')
                .update(newSeller)
                .eq('id', editingSeller.id)
                .select()
                .single();
            if (error)
                throw error;
            setSellers(prev => prev.map(seller => seller.id === editingSeller.id ? { ...data, has_login: seller.has_login } : seller));
            setEditingSeller(null);
            resetForm();
            alert('Vendedor atualizado com sucesso!');
        }
        catch (error) {
            console.error('Erro ao atualizar vendedor:', error);
            alert('Erro ao atualizar vendedor: ' + error.message);
        }
        finally {
            setSaving(false);
        }
    };
    const toggleSellerStatus = async (sellerId, currentStatus) => {
        try {
            const { error } = await supabase
                .from('sellers')
                .update({ active: !currentStatus })
                .eq('id', sellerId);
            if (error)
                throw error;
            setSellers(prev => prev.map(seller => seller.id === sellerId
                ? { ...seller, active: !currentStatus }
                : seller));
        }
        catch (error) {
            console.error('Erro ao alterar status:', error);
        }
    };
    const deleteSeller = async (sellerId) => {
        const seller = sellers.find(s => s.id === sellerId);
        if (!seller)
            return;
        const confirmMessage = `⚠️ ATENÇÃO: Excluir vendedor "${seller.name}"?\n\n` +
            `Esta ação irá:\n` +
            `• Remover o vendedor do sistema\n` +
            `• Remover o login (se existir)\n` +
            `• Manter as vendas registradas (para histórico)\n` +
            `• NÃO PODE SER DESFEITA\n\n` +
            `Tem certeza que deseja continuar?`;
        if (!confirm(confirmMessage))
            return;
        try {
            console.log('========================================');
            console.log('🗑️ INICIANDO EXCLUSÃO DE VENDEDOR');
            console.log('========================================');
            console.log(`👤 Vendedor: ${seller.name}`);
            console.log(`🆔 ID: ${sellerId}`);
            console.log(`🔑 Tem login: ${seller.has_login ? 'Sim' : 'Não'}`);
            // PASSO 1: Se o vendedor tem login, buscar o user_id e deletar o usuário
            if (seller.has_login) {
                console.log('🔍 Buscando user_id do vendedor...');
                const { data: companyUserData, error: companyUserError } = await supabase
                    .from('company_users')
                    .select('user_id')
                    .eq('seller_id', sellerId)
                    .maybeSingle();
                if (companyUserData && companyUserData.user_id) {
                    const userId = companyUserData.user_id;
                    console.log(`✅ User ID encontrado: ${userId}`);
                    // Desvincular vendas
                    console.log('🔄 Desvinculando vendas...');
                    await supabase
                        .from('sales')
                        .update({ user_id: null })
                        .eq('user_id', userId);
                    console.log('✅ Vendas desvinculadas');
                    // Deletar vinculação em company_users
                    console.log('🔄 Removendo vinculação...');
                    await supabase
                        .from('company_users')
                        .delete()
                        .eq('user_id', userId);
                    console.log('✅ Vinculação removida');
                    // Deletar usuário do auth.users usando função especial
                    console.log('🔄 Deletando usuário do auth.users...');
                    const { error: deleteUserError } = await supabase.rpc('delete_auth_user', { target_user_id: userId });
                    if (deleteUserError) {
                        console.warn('⚠️ Não foi possível deletar do auth.users:', deleteUserError);
                        console.log('ℹ️ Continuando com exclusão do vendedor...');
                    }
                    else {
                        console.log('✅ Usuário deletado do auth.users');
                    }
                }
            }
            // PASSO 2: Desvincular vendas do vendedor (manter para histórico)
            console.log('🔄 Desvinculando vendas do vendedor...');
            await supabase
                .from('sales')
                .update({ seller_id: null })
                .eq('seller_id', sellerId);
            console.log('✅ Vendas desvinculadas');
            // PASSO 3: Deletar o vendedor da tabela sellers
            console.log('🔄 Deletando vendedor da tabela sellers...');
            const { error } = await supabase
                .from('sellers')
                .delete()
                .eq('id', sellerId);
            if (error)
                throw error;
            console.log('✅ Vendedor deletado');
            // PASSO 4: Atualizar estado local
            setSellers(prev => prev.filter(s => s.id !== sellerId));
            console.log('========================================');
            console.log('✅ EXCLUSÃO CONCLUÍDA COM SUCESSO');
            console.log('========================================');
            alert(`✅ Vendedor "${seller.name}" excluído com sucesso!`);
        }
        catch (error) {
            console.error('========================================');
            console.error('❌ ERRO NA EXCLUSÃO');
            console.error('========================================');
            console.error('📋 Erro:', error);
            console.error('📋 Mensagem:', error.message);
            alert(`❌ Erro ao excluir vendedor:\n\n${error.message}\n\nVerifique o console (F12) para mais detalhes.`);
            // Recarregar lista para garantir consistência
            loadSellers();
        }
    };
    const resetForm = () => {
        setNewSeller({
            name: '',
            email: '',
            phone: '',
            document: '',
            commission_percentage: 0,
            monthly_goal: 0
        });
    };
    const openEditModal = (seller) => {
        setEditingSeller(seller);
        setNewSeller({
            name: seller.name,
            email: seller.email,
            phone: seller.phone,
            document: seller.document,
            commission_percentage: seller.commission_percentage,
            monthly_goal: seller.monthly_goal
        });
        setShowAddModal(true);
    };
    const closeModal = () => {
        setShowAddModal(false);
        setEditingSeller(null);
        resetForm();
    };
    const openLoginModal = (seller) => {
        setSelectedSellerForLogin(seller);
        setShowLoginModal(true);
    };
    const closeLoginModal = () => {
        setShowLoginModal(false);
        setSelectedSellerForLogin(null);
    };
    const handleLoginSuccess = () => {
        loadSellers(); // Recarregar lista para atualizar status de login
    };
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "flex items-center gap-2 text-slate-400", children: [_jsx(RefreshCw, { className: "w-5 h-5 animate-spin" }), "Carregando vendedores..."] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-100", children: "Vendedores" }), _jsx("p", { className: "text-slate-400", children: "Gerencie sua equipe de vendas" })] }), _jsxs("button", { onClick: () => setShowAddModal(true), className: "flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors", children: [_jsx(Plus, { className: "w-4 h-4" }), "Novo Vendedor"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(User, { className: "w-8 h-8 text-blue-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: sellers.length }), _jsx("div", { className: "text-sm text-slate-400", children: "Total de Vendedores" })] })] }) }), _jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(CheckCircle, { className: "w-8 h-8 text-green-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: sellers.filter(s => s.active).length }), _jsx("div", { className: "text-sm text-slate-400", children: "Vendedores Ativos" })] })] }) }), _jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Percent, { className: "w-8 h-8 text-purple-400" }), _jsxs("div", { children: [_jsxs("div", { className: "text-2xl font-bold text-slate-100", children: [sellers.length > 0
                                                    ? (sellers.reduce((sum, s) => sum + s.commission_percentage, 0) / sellers.length).toFixed(1)
                                                    : 0, "%"] }), _jsx("div", { className: "text-sm text-slate-400", children: "Comiss\u00E3o M\u00E9dia" })] })] }) }), _jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Target, { className: "w-8 h-8 text-amber-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: formatCurrency(sellers.reduce((sum, s) => sum + s.monthly_goal, 0)) }), _jsx("div", { className: "text-sm text-slate-400", children: "Meta Total" })] })] }) })] }), companyAccessType === 'shared' && sellers.length > 0 && (_jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden", children: [_jsxs("div", { className: "p-6 border-b border-slate-800 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(BarChart3, { className: "w-6 h-6 text-blue-400" }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-slate-100", children: "Performance dos Vendedores" }), _jsx("p", { className: "text-sm text-slate-400", children: "M\u00E9tricas em tempo real de cada vendedor" })] })] }), _jsxs("button", { onClick: loadSellersStats, disabled: loadingStats, className: "flex items-center gap-2 px-4 py-2 text-sm border border-slate-700 rounded-lg hover:border-slate-600 transition-colors disabled:opacity-50", children: [_jsx(RefreshCw, { className: `w-4 h-4 ${loadingStats ? 'animate-spin' : ''}` }), loadingStats ? 'Atualizando...' : 'Atualizar'] })] }), _jsx("div", { className: "p-6", children: loadingStats ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsxs("div", { className: "flex items-center gap-2 text-slate-400", children: [_jsx(RefreshCw, { className: "w-5 h-5 animate-spin" }), "Carregando estat\u00EDsticas..."] }) })) : sellersStats.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: sellersStats.map((stats) => (_jsx(SellerPerformanceCard, { stats: stats }, stats.sellerId))) })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(BarChart3, { className: "w-12 h-12 text-slate-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-slate-300 mb-2", children: "Nenhuma venda registrada" }), _jsx("p", { className: "text-slate-400", children: "As estat\u00EDsticas aparecer\u00E3o quando houver vendas." })] })) })] })), _jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden", children: [_jsx("div", { className: "p-6 border-b border-slate-800", children: _jsx("h3", { className: "text-lg font-semibold text-slate-100", children: "Equipe de Vendas" }) }), sellers.length === 0 ? (_jsxs("div", { className: "p-12 text-center", children: [_jsx(User, { className: "w-12 h-12 text-slate-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-slate-300 mb-2", children: "Nenhum vendedor cadastrado" }), _jsx("p", { className: "text-slate-400 mb-4", children: "Comece cadastrando sua equipe de vendas." }), _jsx("button", { onClick: () => setShowAddModal(true), className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors", children: "Cadastrar Primeiro Vendedor" })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-slate-800/50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Vendedor" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Contato" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Comiss\u00E3o" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Meta Mensal" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Login" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800", children: sellers.map((seller) => (_jsxs("tr", { className: "hover:bg-slate-800/30", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-slate-200", children: seller.name }), _jsxs("div", { className: "text-sm text-slate-400", children: ["CPF: ", seller.document || 'Não informado'] })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { children: [_jsx("div", { className: "text-sm text-slate-200", children: seller.email || 'Não informado' }), _jsx("div", { className: "text-sm text-slate-400", children: seller.phone || 'Não informado' })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("span", { className: "text-sm font-medium text-purple-400", children: [seller.commission_percentage, "%"] }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: "text-sm font-medium text-slate-200", children: formatCurrency(seller.monthly_goal) }) }), _jsx("td", { className: "px-6 py-4", children: companyAccessType === 'individual' ? (seller.has_login ? (_jsxs("div", { className: "flex items-center gap-1 text-green-400", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm", children: "Configurado" })] })) : (_jsxs("button", { onClick: () => openLoginModal(seller), className: "flex items-center gap-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors", children: [_jsx(Key, { className: "w-3 h-3" }), "Criar Login"] }))) : (_jsx("div", { className: "flex items-center gap-1 text-slate-500", children: _jsx("span", { className: "text-sm", children: "Acesso Compartilhado" }) })) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: `flex items-center gap-1 ${seller.active ? 'text-green-400' : 'text-red-400'}`, children: [seller.active ? _jsx(CheckCircle, { className: "w-4 h-4" }) : _jsx(XCircle, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm", children: seller.active ? 'Ativo' : 'Inativo' })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => openEditModal(seller), className: "p-1 text-blue-400 hover:bg-blue-500/20 rounded", title: "Editar", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => toggleSellerStatus(seller.id, seller.active), className: `p-1 rounded ${seller.active
                                                                ? 'text-amber-400 hover:bg-amber-500/20'
                                                                : 'text-green-400 hover:bg-green-500/20'}`, title: seller.active ? 'Desativar' : 'Ativar', children: seller.active ? _jsx(XCircle, { className: "w-4 h-4" }) : _jsx(CheckCircle, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => deleteSeller(seller.id), className: "p-1 text-red-400 hover:bg-red-500/20 rounded", title: "Excluir", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, seller.id))) })] }) }))] }), showAddModal && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-100 mb-4", children: editingSeller ? 'Editar Vendedor' : 'Novo Vendedor' }), _jsxs("form", { onSubmit: editingSeller ? handleEditSeller : handleAddSeller, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Nome Completo" }), _jsx("input", { type: "text", value: newSeller.name, onChange: (e) => setNewSeller({ ...newSeller, name: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Email" }), _jsx("input", { type: "email", value: newSeller.email, onChange: (e) => setNewSeller({ ...newSeller, email: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Telefone" }), _jsx("input", { type: "tel", value: newSeller.phone, onChange: (e) => setNewSeller({ ...newSeller, phone: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "CPF" }), _jsx("input", { type: "text", value: newSeller.document, onChange: (e) => setNewSeller({ ...newSeller, document: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Comiss\u00E3o (%)" }), _jsx("input", { type: "number", step: "0.01", min: "0", max: "100", value: newSeller.commission_percentage, onChange: (e) => setNewSeller({ ...newSeller, commission_percentage: parseFloat(e.target.value) || 0 }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Meta Mensal (R$)" }), _jsx("input", { type: "number", step: "0.01", min: "0", value: newSeller.monthly_goal, onChange: (e) => setNewSeller({ ...newSeller, monthly_goal: parseFloat(e.target.value) || 0 }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: closeModal, className: "flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors", disabled: saving, children: "Cancelar" }), _jsx("button", { type: "submit", className: "flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed", disabled: saving, children: saving ? 'Salvando...' : (editingSeller ? 'Atualizar' : 'Cadastrar') })] })] })] }) })), showLoginModal && selectedSellerForLogin && (_jsx(CreateSellerLoginModal, { seller: selectedSellerForLogin, onClose: closeLoginModal, onSuccess: handleLoginSuccess }))] }));
}
