import { useState } from "react";
import { Search, Printer, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { OrderRow } from "../data/mock";
import ReceiptModal from "./ReceiptModal";

interface DataTableProps {
  rows: OrderRow[];
}

const ITEMS_PER_PAGE = 10;

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR");
  } catch (e) {
    return "";
  }
};

const formatCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    paid: "bg-green-500/15 text-green-400 border-green-500/30",
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    canceled: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  const labels: Record<string, string> = {
    paid: "Pago",
    pending: "Pendente",
    canceled: "Cancelado",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
};

export default function DataTable({ rows }: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  console.log("📊 DataTable renderizado - rows:", rows.length, "searchQuery:", searchQuery);

  const convertToReceiptSale = (order: OrderRow) => {
    return {
      receipt_number: order.id.slice(0, 8).toUpperCase(),
      created_at: order.date,
      seller_name: "Vendedor PDV",
      items: [{ product_name: order.category, variant_size: "", variant_color: "", quantity: 1, unit_price: order.amount, total_price: order.amount }],
      subtotal: order.amount,
      discount: 0,
      total_amount: order.amount,
      payment_method_name: order.status === "paid" ? "Dinheiro" : "Pendente",
      payment_received: order.status === "paid" ? order.amount : 0,
      change_amount: 0,
    };
  };

  const getCompanyData = () => ({
    name: "VendaFácil PDV",
    phone: "(11) 99999-9999",
    cnpj: "00.000.000/0000-00",
    address: "Rua Exemplo, 123",
    city: "São Paulo",
    state: "SP",
  });

  // BUSCA COM LOGS
  let filteredRows = rows;
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    console.log("🔍 Buscando por:", query);
    filteredRows = rows.filter((order) => {
      try {
        const match =
          order.customer.toLowerCase().includes(query) ||
          order.email.toLowerCase().includes(query) ||
          order.id.toLowerCase().includes(query) ||
          order.category.toLowerCase().includes(query) ||
          order.amount.toString().includes(query) ||
          formatDate(order.date).includes(query);
        return match;
      } catch (e) {
        console.error("❌ Erro ao filtrar order:", order, e);
        return false;
      }
    });
    console.log("✅ Resultados filtrados:", filteredRows.length);
  }

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRows = filteredRows.slice(start, start + ITEMS_PER_PAGE);

  console.log("📄 Página:", currentPage, "de", totalPages, "- Mostrando:", paginatedRows.length, "itens");

  const handleSearch = (value: string) => {
    console.log("✏️ handleSearch chamado com:", value);
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleOpenReceipt = (order: OrderRow) => {
    setSelectedSale(convertToReceiptSale(order));
    setSelectedCompany(getCompanyData());
    setIsReceiptOpen(true);
  };

  const handleCloseReceipt = () => {
    setIsReceiptOpen(false);
    setSelectedSale(null);
    setSelectedCompany(null);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Últimas Vendas</h2>
            <p className="text-sm text-slate-400 mt-0.5">Lista de todas as vendas</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar vendas..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
            {searchQuery && (
              <button onClick={() => handleSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs">Limpar</button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/30">
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">ID</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Data</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Cliente</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Categoria</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Valor</th>
              <th className="text-center px-6 py-3 text-xs font-medium text-slate-400 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  {searchQuery ? (
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-slate-600" />
                      <p>Nenhuma venda encontrada para &quot;{searchQuery}&quot;</p>
                    </div>
                  ) : (
                    <p>Nenhuma venda registrada</p>
                  )}
                </td>
              </tr>
            ) : (
              paginatedRows.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-300 font-mono">{order.id.slice(0, 8)}...</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{formatDate(order.date)}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-200">{order.customer}</div>
                    <div className="text-xs text-slate-500">{order.email}</div>
                  </td>
                  <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">{order.category}</span></td>
                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-200">{formatCurrency(order.amount)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenReceipt(order)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all" title="Visualizar Cupom"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleOpenReceipt(order)} className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all" title="Imprimir Cupom"><Printer className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
          <div className="text-sm text-slate-500">Mostrando {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredRows.length)} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredRows.length)} de {filteredRows.length} resultados</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 text-slate-400 hover:text-slate-200 disabled:text-slate-600 disabled:cursor-not-allowed rounded-lg hover:bg-slate-800 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm text-slate-400 px-2">Página {currentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 text-slate-400 hover:text-slate-200 disabled:text-slate-600 disabled:cursor-not-allowed rounded-lg hover:bg-slate-800 transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {selectedSale && selectedCompany && (
        <ReceiptModal isOpen={isReceiptOpen} onClose={handleCloseReceipt} sale={selectedSale} company={selectedCompany} />
      )}
    </div>
  );
}