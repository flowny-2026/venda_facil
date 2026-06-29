import { useState } from 'react';
import { X, Search, ArrowRightLeft, Check, Trash2, Calendar, Hash, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SaleItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant_size?: string;
  variant_color?: string;
}

interface Sale {
  id: string;
  receipt_number: string;
  created_at: string;
  total_amount: number;
  customer_id?: string;
  customer_name?: string;
  customer_document?: string;
  items: SaleItem[];
}

type SearchType = 'receipt' | 'cpf' | 'date';

interface ExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  onExchangeComplete: (returnedItems: SaleItem[], newTotal: number) => void;
}

export default function ExchangeModal({ isOpen, onClose, companyId, onExchangeComplete }: ExchangeModalProps) {
  const [searchType, setSearchType] = useState<SearchType>('receipt');
  const [searchValue, setSearchValue] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundSales, setFoundSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const searchSales = async () => {
    if (!searchValue.trim() && searchType !== 'date') {
      setError('Digite um valor para buscar');
      return;
    }
    if (searchType === 'date' && !searchDate) {
      setError('Selecione uma data');
      return;
    }

    setSearching(true);
    setError('');
    setFoundSales([]);
    setSelectedSale(null);
    setSelectedItems(new Map());

    try {
      let query = supabase
        .from('sales')
        .select(`
          id,
          receipt_number,
          created_at,
          total_amount,
          customer_id,
          customers:customer_id (name, document)
        `)
        .eq('company_id', companyId)
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(20);

      if (searchType === 'receipt') {
        query = query.ilike('receipt_number', `%${searchValue.trim()}%`);
      } else if (searchType === 'cpf') {
        const { data: customers } = await supabase
          .from('customers')
          .select('id')
          .eq('company_id', companyId)
          .ilike('document', `%${searchValue.trim().replace(/[^0-9]/g, '')}%`)
          .limit(10);

        if (!customers || customers.length === 0) {
          setError('Nenhum cliente encontrado com este CPF');
          setSearching(false);
          return;
        }

        const customerIds = customers.map(c => c.id);
        query = query.in('customer_id', customerIds);
      } else if (searchType === 'date') {
        const startDate = new Date(searchDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(searchDate);
        endDate.setHours(23, 59, 59, 999);

        query = query
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());
      }

      const { data: salesData, error: salesError } = await query;

      if (salesError) {
        setError('Erro ao buscar vendas');
        setSearching(false);
        return;
      }

      if (!salesData || salesData.length === 0) {
        setError('Nenhuma venda encontrada');
        setSearching(false);
        return;
      }

      const salesWithItems: Sale[] = [];
      for (const sale of salesData) {
        const { data: itemsData } = await supabase
          .from('sale_items')
          .select('*')
          .eq('sale_id', sale.id);

        salesWithItems.push({
          id: sale.id,
          receipt_number: sale.receipt_number,
          created_at: sale.created_at,
          total_amount: sale.total_amount,
          customer_id: sale.customer_id,
          customer_name: sale.customers?.name || 'Cliente não identificado',
          customer_document: sale.customers?.document || '',
          items: itemsData || []
        });
      }

      setFoundSales(salesWithItems);
    } catch (err) {
      setError('Erro ao buscar vendas');
    } finally {
      setSearching(false);
    }
  };

  const selectSale = (sale: Sale) => {
    setSelectedSale(sale);
    setSelectedItems(new Map());
  };

  const toggleItem = (itemId: string, maxQuantity: number) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      if (newMap.has(itemId)) {
        newMap.delete(itemId);
      } else {
        newMap.set(itemId, maxQuantity);
      }
      return newMap;
    });
  };

  const updateItemQuantity = (itemId: string, quantity: number, maxQuantity: number) => {
    if (quantity <= 0) {
      setSelectedItems(prev => {
        const newMap = new Map(prev);
        newMap.delete(itemId);
        return newMap;
      });
      return;
    }
    if (quantity > maxQuantity) quantity = maxQuantity;
    
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      newMap.set(itemId, quantity);
      return newMap;
    });
  };

  const calculateReturnTotal = () => {
    if (!selectedSale) return 0;
    return selectedSale.items.reduce((sum, item) => {
      const qty = selectedItems.get(item.id) || 0;
      return sum + (item.unit_price * qty);
    }, 0);
  };

  const handleConfirm = () => {
    if (selectedItems.size === 0) {
      setError('Selecione pelo menos um item para troca');
      return;
    }

    const returnedItems: SaleItem[] = [];
    selectedSale?.items.forEach(item => {
      const qty = selectedItems.get(item.id);
      if (qty && qty > 0) {
        returnedItems.push({
          ...item,
          quantity: qty,
          total_price: item.unit_price * qty
        });
      }
    });

    onExchangeComplete(returnedItems, calculateReturnTotal());
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-amber-400" />
            Troca de Mercadoria
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!selectedSale && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Busque a venda original pelo número do cupom, CPF do cliente ou data da compra.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => { setSearchType('receipt'); setSearchValue(''); setSearchDate(''); setError(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    searchType === 'receipt'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Hash className="w-4 h-4" />
                  Nº Cupom
                </button>
                <button
                  onClick={() => { setSearchType('cpf'); setSearchValue(''); setSearchDate(''); setError(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    searchType === 'cpf'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <User className="w-4 h-4" />
                  CPF Cliente
                </button>
                <button
                  onClick={() => { setSearchType('date'); setSearchValue(''); setSearchDate(''); setError(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    searchType === 'date'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Data
                </button>
              </div>

              <div className="flex gap-2">
                {searchType === 'date' ? (
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                ) : (
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={
                        searchType === 'receipt'
                          ? 'Número do cupom (ex: 00123)'
                          : 'CPF do cliente (somente números)'
                      }
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchSales()}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                )}
                <button
                  onClick={searchSales}
                  disabled={searching}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                >
                  {searching ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {!selectedSale && foundSales.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-slate-300 mb-2">
                {foundSales.length} venda(s) encontrada(s):
              </h4>
              {foundSales.map((sale) => (
                <button
                  key={sale.id}
                  onClick={() => selectSale(sale)}
                  className="w-full text-left p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 hover:border-amber-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        Cupom #{sale.receipt_number}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(sale.created_at)} às {formatTime(sale.created_at)}
                      </p>
                      {sale.customer_name && (
                        <p className="text-xs text-slate-400 mt-1">
                          <User className="w-3 h-3 inline mr-1" />
                          {sale.customer_name}
                          {sale.customer_document && ` (${formatCPF(sale.customer_document)})`}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">
                        {formatCurrency(sale.total_amount)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {sale.items.length} item(s)
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedSale && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-slate-100">
                    Cupom #{selectedSale.receipt_number}
                  </h3>
                  <button
                    onClick={() => { setSelectedSale(null); setSelectedItems(new Map()); setFoundSales([]); }}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Buscar outra
                  </button>
                </div>
                <p className="text-sm text-slate-400">
                  {formatDate(selectedSale.created_at)} às {formatTime(selectedSale.created_at)}
                </p>
                {selectedSale.customer_name && (
                  <p className="text-sm text-slate-400 mt-1">
                    Cliente: {selectedSale.customer_name}
                    {selectedSale.customer_document && ` (${formatCPF(selectedSale.customer_document)})`}
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">
                  Selecione os itens para troca/devolução:
                </h4>
                <div className="space-y-2">
                  {selectedSale.items.map((item) => {
                    const isSelected = selectedItems.has(item.id);
                    const selectedQty = selectedItems.get(item.id) || 0;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-900/20 border-amber-500/50'
                            : 'bg-slate-800/30 border-slate-700 hover:bg-slate-800/50'
                        }`}
                        onClick={() => toggleItem(item.id, item.quantity)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                              isSelected ? 'bg-amber-500 border-amber-500' : 'border-slate-500'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-200">
                                {item.product_name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {formatCurrency(item.unit_price)} cada | Qtd comprada: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-200">
                              {formatCurrency(item.total_price)}
                            </p>
                          </div>
                        </div>

                        {isSelected && item.quantity > 1 && (
                          <div className="mt-3 ml-8 flex items-center gap-2">
                            <span className="text-xs text-slate-400">Qtd para troca:</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateItemQuantity(item.id, selectedQty - 1, item.quantity);
                                }}
                                className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-xs"
                              >
                                -
                              </button>
                              <span className="text-sm font-medium text-slate-200 w-8 text-center">
                                {selectedQty}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateItemQuantity(item.id, selectedQty + 1, item.quantity);
                                }}
                                className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-xs"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedItems.size > 0 && (
                <div className="bg-amber-900/10 border border-amber-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-amber-400 mb-2">
                    Resumo da Troca
                  </h4>
                  <div className="space-y-1">
                    {selectedSale.items.map(item => {
                      const qty = selectedItems.get(item.id);
                      if (!qty) return null;
                      return (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-slate-300">
                            {item.product_name} (x{qty})
                          </span>
                          <span className="text-slate-200 font-medium">
                            {formatCurrency(item.unit_price * qty)}
                          </span>
                        </div>
                      );
                    })}
                    <div className="border-t border-amber-500/20 pt-2 mt-2">
                      <div className="flex justify-between text-base font-bold">
                        <span className="text-amber-400">Valor a ser devolvido:</span>
                        <span className="text-amber-400">{formatCurrency(calculateReturnTotal())}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedSale && (
          <div className="p-6 border-t border-slate-800 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedItems.size === 0}
              className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Confirmar Troca
            </button>
          </div>
        )}
      </div>
    </div>
  );
}