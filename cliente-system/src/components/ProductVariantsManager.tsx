
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, RefreshCw } from 'lucide-react';

interface Variant {
  id?: string;
  attributes: Record<string, string>;
  barcode: string;
  stock_quantity: number;
  price: number;
}

interface ProductVariantsManagerProps {
  productId: string;
  companyId: string;
  basePrice: number;
}

export default function ProductVariantsManager({ productId, companyId, basePrice }: ProductVariantsManagerProps) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVariantRow, setNewVariantRow] = useState({ size: '', color: '' });

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
    } catch (error) {
      console.error('Erro ao carregar variações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = async () => {
    if (!newVariantRow.size && !newVariantRow.color) {
      alert('Informe pelo menos tamanho ou cor');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('product_variants')
        .insert([{
          product_id: productId,
          company_id: companyId,
          attributes: {
            ...(newVariantRow.size && { Tamanho: newVariantRow.size }),
            ...(newVariantRow.color && { Cor: newVariantRow.color })
          },
          barcode: '',
          stock_quantity: 0,
          price: basePrice,
          active: true
        }])
        .select()
        .single();

      if (error) throw error;
      setVariants(prev => [...prev, data]);
      setNewVariantRow({ size: '', color: '' });
    } catch (error: any) {
      alert('Erro ao adicionar variação: ' + error.message);
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

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 py-4">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Carregando variações...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Variações adicionadas */}
      {variants.length > 0 && (
        <div className="space-y-1">
          {variants.map((v) => (
            <div key={v.id} className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300">
              <span>
                {v.attributes.Tamanho && `Tamanho: ${v.attributes.Tamanho}`}
                {v.attributes.Tamanho && v.attributes.Cor && ' | '}
                {v.attributes.Cor && `Cor: ${v.attributes.Cor}`}
              </span>
              <button
                type="button"
                onClick={() => v.id && handleDeleteVariant(v.id)}
                className="text-red-400 hover:text-red-300 ml-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Adicionar variação */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Tamanho</label>
          <input
            type="text"
            value={newVariantRow.size}
            onChange={(e) => setNewVariantRow(prev => ({ ...prev, size: e.target.value }))}
            placeholder="Ex: P, M, G, 38..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Cor</label>
          <input
            type="text"
            value={newVariantRow.color}
            onChange={(e) => setNewVariantRow(prev => ({ ...prev, color: e.target.value }))}
            placeholder="Ex: Azul, Preto..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddVariant}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors"
      >
        + Adicionar Variação
      </button>
    </div>
  );
}
