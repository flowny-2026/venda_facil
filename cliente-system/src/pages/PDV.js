import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUserRole } from '../hooks/useUserRole';
import ReceiptModal from '../components/ReceiptModal';
import QuickCustomerModal from '../components/QuickCustomerModal';
import { ShoppingCart, Plus, Minus, Trash2, User, CreditCard, DollarSign, Percent, Calculator, Check, Search, Package } from 'lucide-react';
export default function PDV() {
    const { permissions, isSeller } = useUserRole();
    const [companyId, setCompanyId] = useState(null);
    const [products, setProducts] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [cart, setCart] = useState([]);
    const [selectedSeller, setSelectedSeller] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [discountAmount, setDiscountAmount] = useState('');
    const [discountType, setDiscountType] = useState('amount');
    const [paymentReceived, setPaymentReceived] = useState('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    // Estados para impressão de cupom
    const [lastSale, setLastSale] = useState(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [companyData, setCompanyData] = useState(null);
    // Estados para cadastro de cliente
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    // Buscar company_id
    useEffect(() => {
        if (permissions?.companyId) {
            setCompanyId(permissions.companyId);
            loadCompanyData(permissions.companyId);
        }
    }, [permissions]);
    // Função para buscar dados da empresa
    const loadCompanyData = async (compId) => {
        try {
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .eq('id', compId)
                .single();
            if (!error && data) {
                setCompanyData(data);
            }
        }
        catch (err) {
            console.error('Erro ao buscar dados da empresa:', err);
        }
    };
    // Se for vendedor, selecionar automaticamente
    useEffect(() => {
        if (isSeller && permissions?.sellerId) {
            setSelectedSeller(permissions.sellerId);
        }
    }, [isSeller, permissions]);
    useEffect(() => {
        if (companyId) {
            loadData();
        }
    }, [companyId]);
    const loadData = async () => {
        if (!companyId)
            return;
        try {
            const [productsRes, sellersRes, paymentMethodsRes] = await Promise.all([
                supabase
                    .from('products')
                    .select(`
            *,
            product_categories (name, color)
          `)
                    .eq('company_id', companyId)
                    .eq('active', true)
                    .order('name'),
                supabase
                    .from('sellers')
                    .select('*')
                    .eq('company_id', companyId)
                    .eq('active', true)
                    .order('name'),
                supabase
                    .from('payment_methods')
                    .select('*')
                    .eq('company_id', companyId)
                    .eq('active', true)
                    .order('name')
            ]);
            if (productsRes.error)
                throw productsRes.error;
            if (sellersRes.error)
                throw sellersRes.error;
            if (paymentMethodsRes.error)
                throw paymentMethodsRes.error;
            setProducts(productsRes.data || []);
            setSellers(sellersRes.data || []);
            setPaymentMethods(paymentMethodsRes.data || []);
        }
        catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const addToCart = (product) => {
        const existingItem = cart.find(item => item.product.id === product.id);
        const price = product.promotional_price || product.price;
        if (existingItem) {
            // Verificar estoque se controlado
            if (product.track_stock && existingItem.quantity >= product.stock_quantity) {
                alert('Quantidade em estoque insuficiente!');
                return;
            }
            setCart(prev => prev.map(item => item.product.id === product.id
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                    total_price: (item.quantity + 1) * price
                }
                : item));
        }
        else {
            // Verificar estoque se controlado
            if (product.track_stock && product.stock_quantity <= 0) {
                alert('Produto sem estoque!');
                return;
            }
            setCart(prev => [...prev, {
                    product,
                    quantity: 1,
                    unit_price: price,
                    total_price: price
                }]);
        }
    };
    const updateCartItemQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }
        const item = cart.find(item => item.product.id === productId);
        if (!item)
            return;
        // Verificar estoque se controlado
        if (item.product.track_stock && newQuantity > item.product.stock_quantity) {
            alert('Quantidade em estoque insuficiente!');
            return;
        }
        setCart(prev => prev.map(item => item.product.id === productId
            ? {
                ...item,
                quantity: newQuantity,
                total_price: newQuantity * item.unit_price
            }
            : item));
    };
    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };
    const clearCart = () => {
        setCart([]);
        setSelectedSeller('');
        setSelectedPaymentMethod('');
        setDiscountAmount('');
        setPaymentReceived('');
        setSearchTerm('');
    };
    const calculateTotals = () => {
        const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);
        let discount = 0;
        const discountValue = parseFloat(discountAmount) || 0;
        if (discountType === 'percentage') {
            discount = (subtotal * discountValue) / 100;
        }
        else {
            discount = discountValue;
        }
        const total = subtotal - discount;
        const received = parseFloat(paymentReceived) || 0;
        const change = received - total;
        return { subtotal, discount, total, change };
    };
    const processSale = async () => {
        if (cart.length === 0) {
            alert('Adicione produtos ao carrinho!');
            return;
        }
        if (!selectedSeller) {
            alert('Selecione um vendedor!');
            return;
        }
        if (!selectedPaymentMethod) {
            alert('Selecione uma forma de pagamento!');
            return;
        }
        const { subtotal, discount, total, change } = calculateTotals();
        if (parseFloat(paymentReceived) < total) {
            alert('Valor recebido é menor que o total da venda!');
            return;
        }
        // Abrir modal para vincular cliente
        setShowCustomerModal(true);
    };
    const finalizeSale = async (customerId) => {
        const { subtotal, discount, total, change } = calculateTotals();
        setProcessing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user)
                throw new Error('Usuário não autenticado');
            // Busca company_id do usuário logado
            const { data: companyUser } = await supabase
                .from('company_users')
                .select('company_id')
                .eq('user_id', user.id)
                .eq('active', true)
                .single();
            if (!companyUser)
                throw new Error('Empresa não encontrada');
            // Insere a venda
            const { data: sale, error: saleError } = await supabase
                .from('sales')
                .insert([{
                    company_id: companyUser.company_id,
                    user_id: user.id,
                    seller_id: selectedSeller,
                    payment_method_id: selectedPaymentMethod,
                    customer_id: customerId, // Vincular cliente à venda
                    subtotal: subtotal,
                    discount_amount: discount,
                    total_amount: total,
                    payment_received: parseFloat(paymentReceived),
                    change_amount: Math.max(0, change),
                    status: 'paid'
                }])
                .select()
                .single();
            if (saleError)
                throw new Error(`Erro ao criar venda: ${saleError.message}`);
            // Insere os itens da venda
            const saleItems = cart.map(item => ({
                sale_id: sale.id,
                company_id: companyUser.company_id,
                product_id: item.product.id,
                product_name: item.product.name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price
            }));
            const { error: itemsError } = await supabase
                .from('sale_items')
                .insert(saleItems);
            if (itemsError)
                console.warn('Erro ao criar itens:', itemsError);
            // Atualizar estoque dos produtos (se controlado)
            for (const item of cart) {
                if (item.product.track_stock) {
                    await supabase
                        .from('products')
                        .update({
                        stock_quantity: item.product.stock_quantity - item.quantity
                    })
                        .eq('id', item.product.id);
                }
            }
            // Prepara dados para o cupom
            const seller = sellers.find(s => s.id === selectedSeller);
            const paymentMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethod);
            const receiptSale = {
                id: sale.id,
                receipt_number: sale.receipt_number || `TEMP-${Date.now()}`,
                created_at: sale.created_at || new Date().toISOString(),
                seller_name: seller?.name || 'Não informado',
                payment_method_name: paymentMethod?.name || 'Não informado',
                subtotal,
                discount,
                total_amount: total,
                payment_received: parseFloat(paymentReceived) || 0,
                change_amount: Math.max(0, change),
                items: cart.map(item => ({
                    product_name: item.product.name,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    total_price: item.total_price
                }))
            };
            setLastSale(receiptSale);
            setShowReceiptModal(true);
            clearCart();
            loadData();
        }
        catch (error) {
            console.error('Erro ao processar venda:', error);
            alert('Erro ao processar venda:\n' + error.message);
        }
        finally {
            setProcessing(false);
        }
    };
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const { subtotal, discount, total, change } = calculateTotals();
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "flex items-center gap-2 text-slate-400", children: [_jsx(ShoppingCart, { className: "w-5 h-5 animate-pulse" }), "Carregando PDV..."] }) }));
    }
    return (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]", children: [_jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-100", children: "Produtos" }), _jsxs("div", { className: "relative flex-1 max-w-md ml-4", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: "text", placeholder: "Buscar produtos...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" })] })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[calc(100vh-12rem)] overflow-y-auto", children: filteredProducts.map((product) => (_jsxs("div", { onClick: () => addToCart(product), className: "bg-slate-900/50 border border-slate-800 rounded-lg p-4 cursor-pointer hover:bg-slate-800/50 transition-colors", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsx("h3", { className: "text-sm font-medium text-slate-200 line-clamp-2", children: product.name }), _jsx(Package, { className: "w-4 h-4 text-slate-400 flex-shrink-0 ml-2" })] }), product.product_categories && (_jsx("div", { className: "mb-2", children: _jsx("span", { className: "inline-flex px-2 py-1 text-xs font-medium rounded border", style: {
                                            backgroundColor: `${product.product_categories.color}15`,
                                            borderColor: `${product.product_categories.color}30`,
                                            color: product.product_categories.color
                                        }, children: product.product_categories.name }) })), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-lg font-bold text-green-400", children: formatCurrency(product.promotional_price || product.price) }), product.promotional_price && (_jsx("div", { className: "text-xs text-slate-400 line-through", children: formatCurrency(product.price) }))] }), product.track_stock && (_jsxs("div", { className: "text-xs text-slate-400", children: ["Estoque: ", product.stock_quantity] }))] })] }, product.id))) })] }), _jsxs("div", { className: "space-y-4", children: [!isSeller && (_jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-lg p-4", children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(User, { className: "w-4 h-4 inline mr-2" }), "Vendedor"] }), _jsxs("select", { value: selectedSeller, onChange: (e) => setSelectedSeller(e.target.value), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", children: [_jsx("option", { value: "", children: "Selecione o vendedor" }), sellers.map(seller => (_jsxs("option", { value: seller.id, children: [seller.name, " (", seller.commission_percentage, "%)"] }, seller.id)))] })] })), isSeller && permissions?.sellerName && (_jsx("div", { className: "bg-blue-900/20 border border-blue-500/30 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center gap-2 text-blue-400", children: [_jsx(User, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-medium", children: "Vendedor:" }), _jsx("span", { className: "text-sm font-semibold", children: permissions.sellerName })] }) })), _jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-lg", children: [_jsxs("div", { className: "p-4 border-b border-slate-800 flex items-center justify-between", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-100", children: [_jsx(ShoppingCart, { className: "w-5 h-5 inline mr-2" }), "Carrinho (", cart.length, ")"] }), cart.length > 0 && (_jsx("button", { onClick: clearCart, className: "text-red-400 hover:text-red-300 text-sm", children: "Limpar" }))] }), _jsx("div", { className: "max-h-64 overflow-y-auto", children: cart.length === 0 ? (_jsxs("div", { className: "p-8 text-center text-slate-400", children: [_jsx(ShoppingCart, { className: "w-8 h-8 mx-auto mb-2 opacity-50" }), _jsx("p", { children: "Carrinho vazio" })] })) : (cart.map((item) => (_jsxs("div", { className: "p-4 border-b border-slate-800 last:border-b-0", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsx("h4", { className: "text-sm font-medium text-slate-200 flex-1", children: item.product.name }), _jsx("button", { onClick: () => removeFromCart(item.product.id), className: "text-red-400 hover:text-red-300 ml-2", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => updateCartItemQuantity(item.product.id, item.quantity - 1), className: "w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center", children: _jsx(Minus, { className: "w-3 h-3" }) }), _jsx("span", { className: "text-sm font-medium text-slate-200 w-8 text-center", children: item.quantity }), _jsx("button", { onClick: () => updateCartItemQuantity(item.product.id, item.quantity + 1), className: "w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center", children: _jsx(Plus, { className: "w-3 h-3" }) })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-sm text-slate-400", children: [formatCurrency(item.unit_price), " x ", item.quantity] }), _jsx("div", { className: "text-sm font-medium text-slate-200", children: formatCurrency(item.total_price) })] })] })] }, item.product.id)))) })] }), cart.length > 0 && (_jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-lg p-4", children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(Percent, { className: "w-4 h-4 inline mr-2" }), "Desconto"] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("select", { value: discountType, onChange: (e) => setDiscountType(e.target.value), className: "bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", children: [_jsx("option", { value: "amount", children: "R$" }), _jsx("option", { value: "percentage", children: "%" })] }), _jsx("input", { type: "number", step: "0.01", min: "0", value: discountAmount, onChange: (e) => setDiscountAmount(e.target.value), className: "flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", placeholder: "0,00" })] })] })), cart.length > 0 && (_jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-lg p-4", children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(CreditCard, { className: "w-4 h-4 inline mr-2" }), "Forma de Pagamento"] }), _jsxs("select", { value: selectedPaymentMethod, onChange: (e) => setSelectedPaymentMethod(e.target.value), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", children: [_jsx("option", { value: "", children: "Selecione a forma de pagamento" }), paymentMethods.map(method => (_jsx("option", { value: method.id, children: method.name }, method.id)))] })] })), cart.length > 0 && (_jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-lg p-4", children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(DollarSign, { className: "w-4 h-4 inline mr-2" }), "Valor Recebido"] }), _jsx("input", { type: "number", step: "0.01", min: "0", value: paymentReceived, onChange: (e) => setPaymentReceived(e.target.value), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", placeholder: "0,00" })] })), cart.length > 0 && (_jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-lg p-4", children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-400", children: "Subtotal:" }), _jsx("span", { className: "text-slate-200", children: formatCurrency(subtotal) })] }), discount > 0 && (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-400", children: "Desconto:" }), _jsxs("span", { className: "text-red-400", children: ["-", formatCurrency(discount)] })] })), _jsxs("div", { className: "flex justify-between text-lg font-bold border-t border-slate-700 pt-2", children: [_jsx("span", { className: "text-slate-200", children: "Total:" }), _jsx("span", { className: "text-green-400", children: formatCurrency(total) })] }), paymentReceived > 0 && (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-400", children: "Troco:" }), _jsx("span", { className: change >= 0 ? 'text-blue-400' : 'text-red-400', children: formatCurrency(Math.max(0, change)) })] }))] }) })), cart.length > 0 && (_jsxs("button", { onClick: processSale, disabled: processing || !selectedSeller || !selectedPaymentMethod || paymentReceived < total, className: "w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors", children: [processing ? (_jsx(Calculator, { className: "w-5 h-5 animate-pulse" })) : (_jsx(Check, { className: "w-5 h-5" })), processing ? 'Processando...' : 'Finalizar Venda'] }))] }), showCustomerModal && companyId && (_jsx(QuickCustomerModal, { isOpen: showCustomerModal, onClose: () => setShowCustomerModal(false), onSelectCustomer: (customerId) => {
                    setSelectedCustomerId(customerId);
                    finalizeSale(customerId);
                }, companyId: companyId })), showReceiptModal && lastSale && companyData && (_jsx(ReceiptModal, { isOpen: showReceiptModal, onClose: () => setShowReceiptModal(false), sale: lastSale, company: {
                    name: companyData.name,
                    phone: companyData.phone,
                    cnpj: companyData.document || companyData.cnpj,
                    address: companyData.address,
                    city: companyData.city,
                    state: companyData.state,
                    logo_url: companyData.logo_url
                } }))] }));
}
