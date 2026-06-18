
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Package, RefreshCw } from 'lucide-react';

interface Variant {
  id?: string;
  attributes: Record<string, string>;
  barcode: string;
  sku: string;
  price: number | string;
  stock_quantity: number | string;
}

interface ProductVariantsManagerProps {
  productId: string;
  companyId: string;
  basePrice: number;
}

const COMMON_ATTRIBUTES = ['Tamanho', 'Cor', 'Voltagem', 'Sabor', 'Volume', 'Material'];

export default function ProductVariantsManager({ productId, companyId, basePrice }: ProductVariantsManagerProps) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attrKeys, setAttrKeys] = useState<string[]>(['Tamanho', 'Cor']);
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newVariant, setNewVariant] = useState<Variant>({
    attributes: {},
    barcode: '',
    sku: '',
    price: basePrice,
    stock_quantity: 0
  });

  useEffect(() => {
    loadVariants();
  }, [productId]);

  const loadVariants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .eq('active', true)
        .order('created_at');
      if (error) throw error;
      setVariants(data || []);
      
      // Descobrir atributos existentes
      if (data && data.length > 0) {
        const keys = new Set<string>();
        data.forEach(v => Object.keys(v.attributes || {}).forEach(k => keys.add(k)));
        if (keys.size > 0) setAttrKeys(Array.from(keys));
      }
    } catch (error) {
      console.error('Erro ao carregar variações:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAttrKey = () => {
    if (!newAttrKey.trim() || attrKeys.includes(newAttrKey.trim())) return;
    setAttrKeys(prev => [...prev, newAttrKey.trim()]);
    setNewAttrKey('');
  };

  const removeAttrKey = (key: string) => {
    setAttrKeys(prev => prev.filter(k => k !== key));
    setNewVariant(prev => {
      const attrs = { ...prev.attributes };
      delete attrs[key];
      return { ...prev, attributes: attrs };
    });
  };

  const handleAddVariant = async () => {
    const missingAttrs = attrKeys.filter(k => !newVariant.attributes[k]);
    if (missingAttrs.length > 0) {
      alert(`Preencha os atributos: ${missingAttrs.join(', ')}`);
      return;
    }
    if (!newVariant.barcode) {
      alert('Código de barras é obrigatório para cada variação');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .insert([{
          product_id: productId,
          company_id: companyId,
          attributes: newVariant.attributes,
          barcode: newVariant.barcode,
          sku: newVariant.sku,
          price: parseFloat(newVariant.price as string) || basePrice,
          stock_quantity: parseInt(newVariant.stock_quantity as string) || 0,
          active: true
        }])
        .select()
        .single();

      if (error) throw error;
      setVariants(prev => [...prev, data]);
      setNewVariant({
        attributes: {},
        barcode: '',
        sku: '',
        price: basePrice,
        stock_quantity: 0
      });
    } catch (error: any) {
      alert('Erro ao adicionar variação: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVariant = async (id: string) => {
    if (!confirm('Remover esta variação?')) return;
    try {
      const { error } = await supabase
        .from('product_variants')
        .update({ active: false })
        .eq('id', id);
      if (error) throw error;
      setVariants(prev => prev.filter(v => v.id !== id));
    } catch (error: any) {
      alert('Erro ao remover variação: ' + error.message);
    }
  };

  const updateVariantStock = async (id: string, qty: number) => {
    try {
      const { error } = await supabase
        .from('product_variants')
        .update({ stock_quantity: qty })
        .eq('id', id);
      if (error) throw error;
      setVariants(prev => prev.map(v => v.id === id ? { ...v, stock_quantity: qty } : v));
    } catch (error: any) {
      alert('Erro ao atualizar estoque: ' + error.message);
    }
  };

  const getAttrLabel = (attrs: Record<string, string>) =>
    Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(' | ');

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 py-4">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Carregando variações...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Atributos */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Atributos das Variações
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {attrKeys.map(key => (
            <span key={key} className="flex items-center gap-1 px-2 py-1 bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-lg text-xs">
              {key}
              <button onClick={() => removeAttrKey(key)} className="hover:text-red-400 ml-1">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <select
            value={newAttrKey}
            onChange={(e) => setNewAttrKey(e.target.value)}
            className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">Selecione ou digite...</option>
            {COMMON_ATTRIBUTES.filter(a => !attrKeys.includes(a)).map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <input
            type="text"
            value={newAttrKey}
            onChange={(e) => setNewAttrKey(e.target.value)}
            placeholder="Ou digite..."
            className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            onKeyDown={(e) => e.key === 'Enter' && addAttrKey()}
          />
          <button onClick={addAttrKey} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Nova variação */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-medium text-slate-300">Adicionar Variação</h4>
        <div className="grid grid-cols-2 gap-3">
          {attrKeys.map(key => (
            <div key={key}>
              <label className="block text-xs text-slate-400 mb-1">{key}</label>
              <input
                type="text"
                value={newVariant.attributes[key] || ''}
                onChange={(e) => setNewVariant(prev => ({
                  ...prev,
                  attributes: { ...prev.attributes, [key]: e.target.value }
                }))}
                placeholder={`Ex: ${key === 'Tamanho' ? 'M' : key === 'Cor' ? 'Azul' : '...'}`}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Código de Barras *</label>
            <input
              type="text"
              value={newVariant.barcode}
              onChange={(e) => setNewVariant(prev => ({ ...prev, barcode: e.target.value }))}
              placeholder="Bipe ou digite..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Estoque</label>
            <input
              type="number"
              min="0"
              value={newVariant.stock_quantity}
              onChange={(e) => setNewVariant(prev => ({ ...prev, stock_quantity: e.target.value }))}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Preço (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newVariant.price}
              onChange={(e) => setNewVariant(prev => ({ ...prev, price: e.target.value }))}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">SKU</label>
            <input
              type="text"
              value={newVariant.sku}
              onChange={(e) => setNewVariant(prev => ({ ...prev, sku: e.target.value }))}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>
        </div>
        <button
          onClick={handleAddVariant}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Adicionar Variação'}
        </button>
      </div>

      {/* Lista de variações */}
      {variants.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Variações Cadastradas ({variants.length})
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {variants.map((v) => (
              <div key={v.id} className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200 truncate">
                    {getAttrLabel(v.attributes)}
                  </div>
                  <div className="text-xs text-slate-400">
                    Barcode: {v.barcode} {v.sku && `| SKU: ${v.sku}`}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <input
                    type="number"
                    min="0"
                    value={v.stock_quantity}
                    onChange={(e) => v.id && updateVariantStock(v.id, parseInt(e.target.value) || 0)}
                    className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 text-center focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                  <span className="text-xs text-slate-500">un</span>
                  <button
                    onClick={() => v.id && handleDeleteVariant(v.id)}
                    className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-400 text-right">
            Total em estoque: {variants.reduce((sum, v) => sum + (parseInt(v.stock_quantity as string) || 0), 0)} unidades
          </div>
        </div>
      )}
    </div>
  );
}
