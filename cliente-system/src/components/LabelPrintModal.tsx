import { useState } from 'react';
import { X, Printer, Plus, Minus } from 'lucide-react';
import ProductLabel from './ProductLabel';

interface Product {
  id: string;
  name: string;
  price: number;
  promotional_price: number | null;
  barcode: string | null;
  sku: string | null;
}

interface LabelPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export default function LabelPrintModal({ isOpen, onClose, product }: LabelPrintModalProps) {
  const [quantity, setQuantity] = useState<number>(1);
  
  if (!isOpen) return null;
  
  const handleQuantityChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num >= 1 && num <= 500) {
      setQuantity(num);
    }
  };
  
  const handleIncrement = () => {
    if (quantity < 500) {
      setQuantity(quantity + 1);
    }
  };
  
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  // Gerar array com quantidade de etiquetas
  const labels = Array.from({ length: quantity }, (_, i) => i);

  return (
    <>
      {/* Modal */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Imprimir Etiquetas</h2>
              <p className="text-sm text-slate-400 mt-1">{product.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controle de Quantidade */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Quantidade de Etiquetas (1 a 500)
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="p-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 disabled:cursor-not-allowed text-slate-200 rounded-lg transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <input
                type="number"
                min="1"
                max="500"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="w-32 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-center text-lg font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
              
              <button
                onClick={handleIncrement}
                disabled={quantity >= 500}
                className="p-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 disabled:cursor-not-allowed text-slate-200 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
              
              <div className="ml-auto">
                <span className="text-sm text-slate-400">
                  {quantity} {quantity === 1 ? 'etiqueta' : 'etiquetas'}
                </span>
              </div>
            </div>
          </div>

          {/* Pré-visualização */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Pré-visualização
            </label>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 flex justify-center">
              <div className="label-preview-container">
                <ProductLabel
                  name={product.name}
                  price={product.price}
                  promotionalPrice={product.promotional_price}
                  barcode={product.barcode}
                  sku={product.sku}
                  productId={product.id}
                />
              </div>
            </div>
            {!product.barcode && (
              <p className="text-amber-400 text-xs mt-2 flex items-center gap-1">
                ⚠️ Este produto não possui código de barras cadastrado. Um código será gerado automaticamente para impressão.
              </p>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir {quantity} {quantity === 1 ? 'Etiqueta' : 'Etiquetas'}
            </button>
          </div>
        </div>
      </div>

      {/* Área de Impressão (oculta na tela, visível na impressão) */}
      <div className="print-only">
        <div className="labels-grid">
          {labels.map((index) => (
            <div key={index} className="label-wrapper">
              <ProductLabel
                name={product.name}
                price={product.price}
                promotionalPrice={product.promotional_price}
                barcode={product.barcode}
                sku={product.sku}
                productId={product.id}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
