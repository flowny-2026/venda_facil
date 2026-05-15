import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { 
  Plus, 
  Package, 
  Tag,
  DollarSign,
  BarChart3,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  barcode: string;
  sku: string;
  price: number;
  cost_price: number;
  promotional_price: number;
  stock_quantity: number;
  min_stock: number;
  active: boolean;
  track_stock: boolean;
  created_at: string;
  category_id: string;
  product_categories?: {
    name: string;
    color: string;
  };
}

interface Category {
  id: string;
  name: string;
  color: string;
}

export default function Produtos() {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    barcode: '',
    sku: '',
    price: '' as any,
    cost_price: '' as any,
    promotional_price: '' as any,
    stock_quantity: '' as any,
    min_stock: '' as any,
    category_id: '',
    track_stock: true
  });

  // Buscar company_id do usuário logado
  useEffect(() => {
    const loadCompanyId = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setCompanyId(data.company_id);
      } catch (error) {
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
    if (!companyId) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories (name, color)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    if (!companyId) return;
    
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('company_id', companyId)
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
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
    } catch (error: any) {
      console.error('Erro completo:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Erro desconhecido';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      } else if (error.details) {
        errorMessage = error.details;
      }
      
      alert('Erro ao cadastrar produto: ' + errorMessage);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
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

      if (error) throw error;

      setProducts(prev => 
        prev.map(product => 
          product.id === editingProduct.id ? data : product
        )
      );
      
      setEditingProduct(null);
      resetForm();
      alert('Produto atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar produto:', error);
      alert('Erro ao atualizar produto: ' + error.message);
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => 
        prev.map(product => 
          product.id === productId 
            ? { ...product, active: !currentStatus }
            : product
        )
      );
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.filter(product => product.id !== productId));
      alert('Produto excluído com sucesso!');
    } catch (error: any) {
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
      price: '' as any,
      cost_price: '' as any,
      promotional_price: '' as any,
      stock_quantity: '' as any,
      min_stock: '' as any,
      category_id: '',
      track_stock: true
    });
  };

  const openEditModal = (product: Product) => {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStockStatus = (product: Product) => {
    if (!product.track_stock) return { color: 'text-slate-400', text: 'Não controlado' };
    if (product.stock_quantity <= 0) return { color: 'text-red-400', text: 'Sem estoque' };
    if (product.stock_quantity <= product.min_stock) return { color: 'text-amber-400', text: 'Estoque baixo' };
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Carregando produtos...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Produtos</h1>
          <p className="text-slate-400">Gerencie seu catálogo de produtos</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-slate-100">{totalProducts}</div>
              <div className="text-sm text-slate-400">Total de Produtos</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-slate-100">{activeProducts}</div>
              <div className="text-sm text-slate-400">Produtos Ativos</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            <div>
              <div className="text-2xl font-bold text-slate-100">{lowStockProducts}</div>
              <div className="text-sm text-slate-400">Estoque Baixo</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-slate-100">{formatCurrency(totalValue)}</div>
              <div className="text-sm text-slate-400">Valor Total Estoque</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
        >
          <option value="all">Todas as categorias</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      {/* Lista de Produtos */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-slate-100">
            Produtos ({filteredProducts.length})
          </h3>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Nenhum produto encontrado' 
                : 'Nenhum produto cadastrado'
              }
            </h3>
            <p className="text-slate-400 mb-4">
              {searchTerm || selectedCategory !== 'all'
                ? 'Tente alterar os filtros de busca.'
                : 'Comece cadastrando seus produtos.'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Cadastrar Primeiro Produto
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Preço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Estoque</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <tr key={product.id} className="hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-200">{product.name}</div>
                          <div className="text-sm text-slate-400">
                            SKU: {product.sku || 'Não informado'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {product.product_categories ? (
                          <span 
                            className="inline-flex px-2 py-1 text-xs font-medium rounded-lg border"
                            style={{ 
                              backgroundColor: `${product.product_categories.color}15`,
                              borderColor: `${product.product_categories.color}30`,
                              color: product.product_categories.color
                            }}
                          >
                            {product.product_categories.name}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">Sem categoria</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-200">
                            {formatCurrency(product.promotional_price || product.price)}
                          </div>
                          {product.promotional_price && (
                            <div className="text-xs text-slate-400 line-through">
                              {formatCurrency(product.price)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-200">
                            {product.track_stock ? product.stock_quantity : '∞'}
                          </div>
                          <div className={`text-xs ${stockStatus.color}`}>
                            {stockStatus.text}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1 ${product.active ? 'text-green-400' : 'text-red-400'}`}>
                          {product.active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          <span className="text-sm">{product.active ? 'Ativo' : 'Inativo'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleProductStatus(product.id, product.active)}
                            className={`p-1 rounded ${
                              product.active 
                                ? 'text-amber-400 hover:bg-amber-500/20' 
                                : 'text-green-400 hover:bg-green-500/20'
                            }`}
                            title={product.active ? 'Desativar' : 'Ativar'}
                          >
                            {product.active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Adicionar/Editar Produto */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            
            <form onSubmit={editingProduct ? handleEditProduct : handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nome do Produto</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">SKU</label>
                  <input
                    type="text"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Código de Barras</label>
                  <input
                    type="text"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Categoria</label>
                  <select
                    value={newProduct.category_id}
                    onChange={(e) => setNewProduct({...newProduct, category_id: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="0.00"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.cost_price}
                    onChange={(e) => setNewProduct({...newProduct, cost_price: e.target.value})}
                    placeholder="0.00"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Preço Promocional (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.promotional_price}
                    onChange={(e) => setNewProduct({...newProduct, promotional_price: e.target.value})}
                    placeholder="0.00"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Quantidade em Estoque</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.stock_quantity}
                    onChange={(e) => setNewProduct({...newProduct, stock_quantity: e.target.value})}
                    placeholder="0"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    disabled={!newProduct.track_stock}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Estoque Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.min_stock}
                    onChange={(e) => setNewProduct({...newProduct, min_stock: e.target.value})}
                    placeholder="0"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    disabled={!newProduct.track_stock}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="track_stock"
                  checked={newProduct.track_stock}
                  onChange={(e) => setNewProduct({...newProduct, track_stock: e.target.checked})}
                  className="w-4 h-4 text-green-600 bg-slate-800 border-slate-700 rounded focus:ring-green-500"
                />
                <label htmlFor="track_stock" className="text-sm text-slate-300">
                  Controlar estoque deste produto
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  {editingProduct ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}