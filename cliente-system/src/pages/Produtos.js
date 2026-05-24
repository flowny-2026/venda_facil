import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Plus, Package, DollarSign, Edit, Trash2, RefreshCw, CheckCircle, XCircle, AlertTriangle, Search } from 'lucide-react';
export default function Produtos() {
    const { user } = useAuth();
    const [companyId, setCompanyId] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        barcode: '',
        sku: '',
        price: '',
        cost_price: '',
        promotional_price: '',
        stock_quantity: '',
        min_stock: '',
        category_id: '',
        track_stock: true
    });
    // Buscar company_id do usuário logado
    useEffect(() => {
        const loadCompanyId = async () => {
            if (!user)
                return;
            try {
                const { data, error } = await supabase
                    .from('company_users')
                    .select('company_id')
                    .eq('user_id', user.id)
                    .single();
                if (error)
                    throw error;
                setCompanyId(data.company_id);
            }
            catch (error) {
                console.error('Erro ao buscar company_id:', error);
            }
        };
        loadCompanyId();
    }, [user]);
    useEffect(() => {
        if (companyId) {
            loadProducts();
            loadCategories();
        }
    }, [companyId]);
    const loadProducts = async () => {
        if (!companyId)
            return;
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
          *,
          product_categories (name, color)
        `)
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            setProducts(data || []);
        }
        catch (error) {
            console.error('Erro ao carregar produtos:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const loadCategories = async () => {
        if (!companyId)
            return;
        try {
            const { data, error } = await supabase
                .from('product_categories')
                .select('*')
                .eq('company_id', companyId)
                .eq('active', true)
                .order('name');
            if (error)
                throw error;
            setCategories(data || []);
        }
        catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    };
    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!companyId) {
            alert('Erro: Empresa não identificada');
            return;
        }
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Você precisa estar logado para cadastrar produtos');
                return;
            }
            console.log('User ID:', user.id);
            console.log('Company ID:', companyId);
            console.log('Product data:', newProduct);
            const productData = {
                name: newProduct.name,
                description: newProduct.description || '',
                barcode: newProduct.barcode || '',
                sku: newProduct.sku || '',
                price: parseFloat(newProduct.price) || 0,
                cost_price: parseFloat(newProduct.cost_price) || 0,
                promotional_price: newProduct.promotional_price ? parseFloat(newProduct.promotional_price) : null,
                stock_quantity: parseInt(newProduct.stock_quantity) || 0,
                min_stock: parseInt(newProduct.min_stock) || 0,
                category_id: newProduct.category_id || null,
                track_stock: newProduct.track_stock,
                company_id: companyId, // CORRETO: usar company_id da empresa
                created_by: user.id
            };
            console.log('Sending to database:', productData);
            const { data, error } = await supabase
                .from('products')
                .insert([productData])
                .select()
                .single();
            if (error) {
                console.error('Database error:', error);
                throw error;
            }
            console.log('Product created:', data);
            setProducts(prev => [data, ...prev]);
            setShowAddModal(false);
            resetForm();
            alert('Produto cadastrado com sucesso!');
        }
        catch (error) {
            console.error('Erro completo:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            let errorMessage = 'Erro desconhecido';
            if (error.message) {
                errorMessage = error.message;
            }
            else if (error.error_description) {
                errorMessage = error.error_description;
            }
            else if (error.details) {
                errorMessage = error.details;
            }
            alert('Erro ao cadastrar produto: ' + errorMessage);
        }
    };
    const handleEditProduct = async (e) => {
        e.preventDefault();
        if (!editingProduct)
            return;
        try {
            const { data, error } = await supabase
                .from('products')
                .update(newProduct)
                .eq('id', editingProduct.id)
                .select(`
          *,
          product_categories (name, color)
        `)
                .single();
            if (error)
                throw error;
            setProducts(prev => prev.map(product => product.id === editingProduct.id ? data : product));
            setEditingProduct(null);
            resetForm();
            alert('Produto atualizado com sucesso!');
        }
        catch (error) {
            console.error('Erro ao atualizar produto:', error);
            alert('Erro ao atualizar produto: ' + error.message);
        }
    };
    const toggleProductStatus = async (productId, currentStatus) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ active: !currentStatus })
                .eq('id', productId);
            if (error)
                throw error;
            setProducts(prev => prev.map(product => product.id === productId
                ? { ...product, active: !currentStatus }
                : product));
        }
        catch (error) {
            console.error('Erro ao alterar status:', error);
        }
    };
    const deleteProduct = async (productId) => {
        if (!confirm('Tem certeza que deseja excluir este produto?'))
            return;
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);
            if (error)
                throw error;
            setProducts(prev => prev.filter(product => product.id !== productId));
            alert('Produto excluído com sucesso!');
        }
        catch (error) {
            console.error('Erro ao excluir produto:', error);
            alert('Erro ao excluir produto: ' + error.message);
        }
    };
    const resetForm = () => {
        setNewProduct({
            name: '',
            description: '',
            barcode: '',
            sku: '',
            price: '',
            cost_price: '',
            promotional_price: '',
            stock_quantity: '',
            min_stock: '',
            category_id: '',
            track_stock: true
        });
    };
    const openEditModal = (product) => {
        setEditingProduct(product);
        setNewProduct({
            name: product.name,
            description: product.description,
            barcode: product.barcode,
            sku: product.sku,
            price: product.price,
            cost_price: product.cost_price,
            promotional_price: product.promotional_price,
            stock_quantity: product.stock_quantity,
            min_stock: product.min_stock,
            category_id: product.category_id,
            track_stock: product.track_stock
        });
        setShowAddModal(true);
    };
    const closeModal = () => {
        setShowAddModal(false);
        setEditingProduct(null);
        resetForm();
    };
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    const getStockStatus = (product) => {
        if (!product.track_stock)
            return { color: 'text-slate-400', text: 'Não controlado' };
        if (product.stock_quantity <= 0)
            return { color: 'text-red-400', text: 'Sem estoque' };
        if (product.stock_quantity <= product.min_stock)
            return { color: 'text-amber-400', text: 'Estoque baixo' };
        return { color: 'text-green-400', text: 'Em estoque' };
    };
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.barcode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.active).length;
    const lowStockProducts = products.filter(p => p.track_stock && p.stock_quantity <= p.min_stock).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "flex items-center gap-2 text-slate-400", children: [_jsx(RefreshCw, { className: "w-5 h-5 animate-spin" }), "Carregando produtos..."] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-100", children: "Produtos" }), _jsx("p", { className: "text-slate-400", children: "Gerencie seu cat\u00E1logo de produtos" })] }), _jsxs("button", { onClick: () => setShowAddModal(true), className: "flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors", children: [_jsx(Plus, { className: "w-4 h-4" }), "Novo Produto"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Package, { className: "w-8 h-8 text-blue-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: totalProducts }), _jsx("div", { className: "text-sm text-slate-400", children: "Total de Produtos" })] })] }) }), _jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(CheckCircle, { className: "w-8 h-8 text-green-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: activeProducts }), _jsx("div", { className: "text-sm text-slate-400", children: "Produtos Ativos" })] })] }) }), _jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(AlertTriangle, { className: "w-8 h-8 text-amber-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: lowStockProducts }), _jsx("div", { className: "text-sm text-slate-400", children: "Estoque Baixo" })] })] }) }), _jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(DollarSign, { className: "w-8 h-8 text-green-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: formatCurrency(totalValue) }), _jsx("div", { className: "text-sm text-slate-400", children: "Valor Total Estoque" })] })] }) })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: "text", placeholder: "Buscar produtos...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50" })] }), _jsxs("select", { value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), className: "bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50", children: [_jsx("option", { value: "all", children: "Todas as categorias" }), categories.map(category => (_jsx("option", { value: category.id, children: category.name }, category.id)))] })] }), _jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden", children: [_jsx("div", { className: "p-6 border-b border-slate-800", children: _jsxs("h3", { className: "text-lg font-semibold text-slate-100", children: ["Produtos (", filteredProducts.length, ")"] }) }), filteredProducts.length === 0 ? (_jsxs("div", { className: "p-12 text-center", children: [_jsx(Package, { className: "w-12 h-12 text-slate-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-slate-300 mb-2", children: searchTerm || selectedCategory !== 'all'
                                    ? 'Nenhum produto encontrado'
                                    : 'Nenhum produto cadastrado' }), _jsx("p", { className: "text-slate-400 mb-4", children: searchTerm || selectedCategory !== 'all'
                                    ? 'Tente alterar os filtros de busca.'
                                    : 'Comece cadastrando seus produtos.' }), !searchTerm && selectedCategory === 'all' && (_jsx("button", { onClick: () => setShowAddModal(true), className: "px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors", children: "Cadastrar Primeiro Produto" }))] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-slate-800/50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Produto" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Categoria" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Pre\u00E7o" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Estoque" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800", children: filteredProducts.map((product) => {
                                        const stockStatus = getStockStatus(product);
                                        return (_jsxs("tr", { className: "hover:bg-slate-800/30", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-slate-200", children: product.name }), _jsxs("div", { className: "text-sm text-slate-400", children: ["SKU: ", product.sku || 'Não informado'] })] }) }), _jsx("td", { className: "px-6 py-4", children: product.product_categories ? (_jsx("span", { className: "inline-flex px-2 py-1 text-xs font-medium rounded-lg border", style: {
                                                            backgroundColor: `${product.product_categories.color}15`,
                                                            borderColor: `${product.product_categories.color}30`,
                                                            color: product.product_categories.color
                                                        }, children: product.product_categories.name })) : (_jsx("span", { className: "text-sm text-slate-400", children: "Sem categoria" })) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-slate-200", children: formatCurrency(product.promotional_price || product.price) }), product.promotional_price && (_jsx("div", { className: "text-xs text-slate-400 line-through", children: formatCurrency(product.price) }))] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-slate-200", children: product.track_stock ? product.stock_quantity : '∞' }), _jsx("div", { className: `text-xs ${stockStatus.color}`, children: stockStatus.text })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: `flex items-center gap-1 ${product.active ? 'text-green-400' : 'text-red-400'}`, children: [product.active ? _jsx(CheckCircle, { className: "w-4 h-4" }) : _jsx(XCircle, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm", children: product.active ? 'Ativo' : 'Inativo' })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => openEditModal(product), className: "p-1 text-blue-400 hover:bg-blue-500/20 rounded", title: "Editar", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => toggleProductStatus(product.id, product.active), className: `p-1 rounded ${product.active
                                                                    ? 'text-amber-400 hover:bg-amber-500/20'
                                                                    : 'text-green-400 hover:bg-green-500/20'}`, title: product.active ? 'Desativar' : 'Ativar', children: product.active ? _jsx(XCircle, { className: "w-4 h-4" }) : _jsx(CheckCircle, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => deleteProduct(product.id), className: "p-1 text-red-400 hover:bg-red-500/20 rounded", title: "Excluir", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, product.id));
                                    }) })] }) }))] }), showAddModal && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-100 mb-4", children: editingProduct ? 'Editar Produto' : 'Novo Produto' }), _jsxs("form", { onSubmit: editingProduct ? handleEditProduct : handleAddProduct, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Nome do Produto" }), _jsx("input", { type: "text", value: newProduct.name, onChange: (e) => setNewProduct({ ...newProduct, name: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "SKU" }), _jsx("input", { type: "text", value: newProduct.sku, onChange: (e) => setNewProduct({ ...newProduct, sku: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Descri\u00E7\u00E3o" }), _jsx("textarea", { value: newProduct.description, onChange: (e) => setNewProduct({ ...newProduct, description: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50", rows: 3 })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "C\u00F3digo de Barras" }), _jsx("input", { type: "text", value: newProduct.barcode, onChange: (e) => setNewProduct({ ...newProduct, barcode: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Categoria" }), _jsxs("select", { value: newProduct.category_id, onChange: (e) => setNewProduct({ ...newProduct, category_id: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50", children: [_jsx("option", { value: "", children: "Selecione uma categoria" }), categories.map(category => (_jsx("option", { value: category.id, children: category.name }, category.id)))] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Pre\u00E7o de Venda (R$)" }), _jsx("input", { type: "number", step: "0.01", min: "0", value: newProduct.price, onChange: (e) => setNewProduct({ ...newProduct, price: e.target.value }), placeholder: "0.00", className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Pre\u00E7o de Custo (R$)" }), _jsx("input", { type: "number", step: "0.01", min: "0", value: newProduct.cost_price, onChange: (e) => setNewProduct({ ...newProduct, cost_price: e.target.value }), placeholder: "0.00", className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Pre\u00E7o Promocional (R$)" }), _jsx("input", { type: "number", step: "0.01", min: "0", value: newProduct.promotional_price, onChange: (e) => setNewProduct({ ...newProduct, promotional_price: e.target.value }), placeholder: "0.00", className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Quantidade em Estoque" }), _jsx("input", { type: "number", min: "0", value: newProduct.stock_quantity, onChange: (e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value }), placeholder: "0", className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50", disabled: !newProduct.track_stock })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Estoque M\u00EDnimo" }), _jsx("input", { type: "number", min: "0", value: newProduct.min_stock, onChange: (e) => setNewProduct({ ...newProduct, min_stock: e.target.value }), placeholder: "0", className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50", disabled: !newProduct.track_stock })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", id: "track_stock", checked: newProduct.track_stock, onChange: (e) => setNewProduct({ ...newProduct, track_stock: e.target.checked }), className: "w-4 h-4 text-green-600 bg-slate-800 border-slate-700 rounded focus:ring-green-500" }), _jsx("label", { htmlFor: "track_stock", className: "text-sm text-slate-300", children: "Controlar estoque deste produto" })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: closeModal, className: "flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors", children: "Cancelar" }), _jsx("button", { type: "submit", className: "flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors", children: editingProduct ? 'Atualizar' : 'Cadastrar' })] })] })] }) }))] }));
}
