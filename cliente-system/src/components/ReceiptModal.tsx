import { X, Printer, Download, Share2 } from 'lucide-react';
import { ReceiptSale, ReceiptCompany, printReceipt, downloadReceipt, shareReceiptWhatsApp } from './Receipt';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: ReceiptSale;
  company: ReceiptCompany;
}

export default function ReceiptModal({ isOpen, onClose, sale, company }: ReceiptModalProps) {
  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Printer className="w-6 h-6 text-emerald-400" />
            Venda Finalizada!
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview do Cupom */}
        <div className="bg-white text-black p-6 rounded-lg mb-6 text-sm">
          {/* Cabeçalho da Empresa */}
          <div className="text-center mb-4 border-b border-gray-300 pb-4">
            <h2 className="text-lg font-bold">{company.name}</h2>
            {company.phone && <p className="text-xs">Tel: {company.phone}</p>}
            {company.cnpj && <p className="text-xs">CNPJ: {company.cnpj}</p>}
            {company.address && <p className="text-xs">{company.address}</p>}
            {company.city && company.state && (
              <p className="text-xs">{company.city} - {company.state}</p>
            )}
          </div>

          {/* Tipo de Documento */}
          <div className="text-center mb-4 border-b border-gray-300 pb-4">
            <p className="font-bold">CUPOM NÃO FISCAL</p>
            <p className="text-xs text-gray-600">(Não válido como documento fiscal)</p>
          </div>

          {/* Informações da Venda */}
          <div className="mb-4 text-xs space-y-1">
            <p><strong>Cupom:</strong> {sale.receipt_number}</p>
            <p><strong>Data:</strong> {new Date(sale.created_at).toLocaleString('pt-BR')}</p>
            <p><strong>Vendedor:</strong> {sale.seller_name}</p>
          </div>

          {/* Produtos */}
          <div className="mb-4 border-t border-b border-gray-300 py-4">
            <p className="font-bold text-center mb-2">PRODUTOS</p>
            <div className="space-y-2">
              {sale.items.map((item, index) => (
                <div key={index} className="text-xs">
                  <p className="font-medium">{item.product_name}</p>
                  <div className="flex justify-between text-gray-600">
                    <span>{item.quantity}x {formatCurrency(item.unit_price)}</span>
                    <span>{formatCurrency(item.total_price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totais */}
          <div className="mb-4 text-xs space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Desconto:</span>
                <span>- {formatCurrency(sale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t border-gray-300 pt-2">
              <span>TOTAL:</span>
              <span>{formatCurrency(sale.total_amount)}</span>
            </div>
          </div>

          {/* Pagamento */}
          <div className="mb-4 text-xs space-y-1 border-t border-gray-300 pt-4">
            <p><strong>Forma de Pagamento:</strong> {sale.payment_method_name}</p>
            <div className="flex justify-between">
              <span>Valor Recebido:</span>
              <span>{formatCurrency(sale.payment_received)}</span>
            </div>
            <div className="flex justify-between">
              <span>Troco:</span>
              <span>{formatCurrency(sale.change_amount)}</span>
            </div>
          </div>

          {/* Rodapé */}
          <div className="text-center text-xs border-t border-gray-300 pt-4">
            <p className="font-bold mb-1">Obrigado pela preferência!</p>
            <p className="mb-2">Volte sempre!</p>
            <p className="text-gray-600">VendaFácil - Sistema PDV</p>
            <p className="text-gray-600">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3">
          {/* Imprimir 80mm */}
          <button
            onClick={() => printReceipt(sale, company, '80mm')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Imprimir Cupom (80mm)
          </button>

          {/* Imprimir 58mm */}
          <button
            onClick={() => printReceipt(sale, company, '58mm')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Imprimir Cupom (58mm)
          </button>

          {/* Baixar PDF */}
          <button
            onClick={() => downloadReceipt(sale, company, '80mm')}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Baixar PDF
          </button>

          {/* Compartilhar WhatsApp */}
          <button
            onClick={() => shareReceiptWhatsApp(sale, company)}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Compartilhar WhatsApp
          </button>

          {/* Fechar */}
          <button
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-3 rounded-lg font-medium transition-colors"
          >
            Fechar
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-4">
          Cupom não fiscal - Não válido como documento fiscal
        </p>
      </div>
    </div>
  );
}
