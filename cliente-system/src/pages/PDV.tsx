import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUserRole } from '../hooks/useUserRole';
import ReceiptModal from '../components/ReceiptModal';
import QuickCustomerModal from '../components/QuickCustomerModal';
import { ReceiptSale, ReceiptCompany } from '../components/Receipt';
import { 
  ShoppingCart, 
  Plus, 
  Minus,
  Trash2,
  User,
  CreditCard,
  DollarSign,
  Percent,
  Calculator,
  Check,
  Search,
  Package,
  UserPlus
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  promotional_price: number;
  stock_quantity: number;
  track_stock: boolean;
  active: boolean;
  product_categories?: {
    name: string;
    color: string;
  };
}

interface Seller {
  id: string;
  name: string;
  commission_percentage: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export default function PDV() {
  const { permissions, isSeller } = useUserRole();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [discountAmount, setDiscountAmount] = useState<any>('');
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount');
  const [paymentReceived, setPaymentReceived] = useState<any>('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Estados para impressão de cupom
  const [lastSale, setLastSale] = useState<ReceiptSale | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);
  
  // Estados para cadastro de cliente
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Buscar company_id
  useEffect(() => {
    if (permissions?.companyId) {
      setCompanyId(permissions.companyId);
      loadCompanyData(permissions.companyId);
    }
  }, [permissions]);

  // Função para buscar dados da empresa
  const loadCompanyData = async (compId: string) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', compId)
        .single();

      if (!error && data) {
        setCompanyData(data);
      }
    } catch (err) {
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
    if (!companyId) return;
    
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

      if (productsRes.error) throw productsRes.error;
      if (sellersRes.error) throw sellersRes.error;
      if (paymentMethodsRes.error) throw paymentMethodsRes.error;

      setProducts(productsRes.data || []);
      setSellers(sellersRes.data || []);
      setPaymentMethods(paymentMethodsRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    const price = product.promotional_price || product.price;
    
    if (existingItem) {
      // Verificar estoque se controlado
      if (product.track_stock && existingItem.quantity >= product.stock_quantity) {
        alert('Quantidade em estoque insuficiente!');
        return;
      }
      
      setCart(prev => 
        prev.map(item => 
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total_price: (item.quantity + 1) * price
              }
            : item
        )
      );
    } else {
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

  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find(item => item.product.id === productId);
    if (!item) return;

    // Verificar estoque se controlado
    if (item.product.track_stock && newQuantity > item.product.stock_quantity) {
      alert('Quantidade em estoque insuficiente!');
      return;
    }

    setCart(prev => 
      prev.map(item => 
        item.product.id === productId
          ? {
              ...item,
              quantity: newQuantity,
              total_price: newQuantity * item.unit_price
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
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
    } else {
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

  const finalizeSale = async (customerId: string | null) => {
    const { subtotal, discount, total, change } = calculateTotals();
    setProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Busca company_id do usuário logado
      const { data: companyUser } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('active', true)
        .single();

      if (!companyUser) throw new Error('Empresa não encontrada');

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

      if (saleError) throw new Error(`Erro ao criar venda: ${saleError.message}`);

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

      if (itemsError) console.warn('Erro ao criar itens:', itemsError);

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

      const receiptSale: ReceiptSale = {
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
    } catch (error: any) {
      console.error('Erro ao processar venda:', error);
      alert('Erro ao processar venda:\n' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { subtotal, discount, total, change } = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-400">
          <ShoppingCart className="w-5 h-5 animate-pulse" />
          Carregando PDV...
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Produtos */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-100">Produtos</h2>
          <div className="relative flex-1 max-w-md ml-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-200 line-clamp-2">
                  {product.name}
                </h3>
                <Package className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
              </div>
              
              {product.product_categories && (
                <div className="mb-2">
                  <span 
                    className="inline-flex px-2 py-1 text-xs font-medium rounded border"
                    style={{ 
                      backgroundColor: `${product.product_categories.color}15`,
                      borderColor: `${product.product_categories.color}30`,
                      color: product.product_categories.color
                    }}
                  >
                    {product.product_categories.name}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-green-400">
                    {formatCurrency(product.promotional_price || product.price)}
                  </div>
                  {product.promotional_price && (
                    <div className="text-xs text-slate-400 line-through">
                      {formatCurrency(product.price)}
                    </div>
                  )}
                </div>
                
                {product.track_stock && (
                  <div className="text-xs text-slate-400">
                    Estoque: {product.stock_quantity}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carrinho e Checkout */}
      <div className="space-y-4">
        {/* Seleção de Vendedor - Apenas para Gerentes */}
        {!isSeller && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Vendedor
            </label>
            <select
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">Selecione o vendedor</option>
              {sellers.map(seller => (
                <option key={seller.id} value={seller.id}>
                  {seller.name} ({seller.commission_percentage}%)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Informação do Vendedor Logado */}
        {isSeller && permissions?.sellerName && (
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-400">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Vendedor:</span>
              <span className="text-sm font-semibold">{permissions.sellerName}</span>
            </div>
          </div>
        )}

        {/* Carrinho */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">
              <ShoppingCart className="w-5 h-5 inline mr-2" />
              Carrinho ({cart.length})
            </h3>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Limpar
              </button>
            )}
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Carrinho vazio</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="p-4 border-b border-slate-800 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-slate-200 flex-1">
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartItemQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium text-slate-200 w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-slate-400">
                        {formatCurrency(item.unit_price)} x {item.quantity}
                      </div>
                      <div className="text-sm font-medium text-slate-200">
                        {formatCurrency(item.total_price)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Desconto */}
        {cart.length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Percent className="w-4 h-4 inline mr-2" />
              Desconto
            </label>
            <div className="flex gap-2">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'amount' | 'percentage')}
                className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="amount">R$</option>
                <option value="percentage">%</option>
              </select>
              <input
                type="number"
                step="0.01"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="0,00"
              />
            </div>
          </div>
        )}

        {/* Forma de Pagamento */}
        {cart.length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <CreditCard className="w-4 h-4 inline mr-2" />
              Forma de Pagamento
            </label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">Selecione a forma de pagamento</option>
              {paymentMethods.map(method => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Valor Recebido */}
        {cart.length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Valor Recebido
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={paymentReceived}
              onChange={(e) => setPaymentReceived(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="0,00"
            />
          </div>
        )}

        {/* Totais */}
        {cart.length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal:</span>
                <span className="text-slate-200">{formatCurrency(subtotal)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Desconto:</span>
                  <span className="text-red-400">-{formatCurrency(discount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-lg font-bold border-t border-slate-700 pt-2">
                <span className="text-slate-200">Total:</span>
                <span className="text-green-400">{formatCurrency(total)}</span>
              </div>
              
              {paymentReceived > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Troco:</span>
                  <span className={change >= 0 ? 'text-blue-400' : 'text-red-400'}>
                    {formatCurrency(Math.max(0, change))}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botão Finalizar */}
        {cart.length > 0 && (
          <button
            onClick={processSale}
            disabled={processing || !selectedSeller || !selectedPaymentMethod || paymentReceived < total}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {processing ? (
              <Calculator className="w-5 h-5 animate-pulse" />
            ) : (
              <Check className="w-5 h-5" />
            )}
            {processing ? 'Processando...' : 'Finalizar Venda'}
          </button>
        )}
      </div>

      {/* Modal de Cliente */}
      {showCustomerModal && companyId && (
        <QuickCustomerModal
          isOpen={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          onSelectCustomer={(customerId) => {
            setSelectedCustomerId(customerId);
            finalizeSale(customerId);
          }}
          companyId={companyId}
        />
      )}

      {/* Modal de Cupom */}
      {showReceiptModal && lastSale && companyData && (
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          sale={lastSale}
          company={{
            name: companyData.name,
            phone: companyData.phone,
            cnpj: companyData.document || companyData.cnpj,
            address: companyData.address,
            city: companyData.city,
            state: companyData.state,
            logo_url: companyData.logo_url
          }}
        />
      )}
    </div>
  );
}