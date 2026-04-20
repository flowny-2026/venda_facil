import { OrderRow, MOCK_ORDERS } from '../data/mock';

export class SalesService {
  private static STORAGE_KEY = 'dashboard-vendas-data';

  // Carregar dados do localStorage ou usar dados mock como fallback
  static loadSales(): OrderRow[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Erro ao carregar dados do localStorage:', error);
    }
    
    // Se não há dados salvos, usar dados mock e salvar
    this.saveSales(MOCK_ORDERS);
    return MOCK_ORDERS;
  }

  // Salvar dados no localStorage
  static saveSales(sales: OrderRow[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sales));
    } catch (error) {
      console.error('Erro ao salvar dados no localStorage:', error);
    }
  }

  // Adicionar nova venda
  static addSale(sale: Omit<OrderRow, 'id'>): OrderRow {
    const sales = this.loadSales();
    const newId = `PED-${String(sales.length + 1).padStart(4, '0')}`;
    const newSale: OrderRow = {
      ...sale,
      id: newId,
    };
    
    sales.unshift(newSale); // Adiciona no início da lista
    this.saveSales(sales);
    return newSale;
  }

  // Atualizar venda existente
  static updateSale(id: string, updates: Partial<OrderRow>): OrderRow | null {
    const sales = this.loadSales();
    const index = sales.findIndex(sale => sale.id === id);
    
    if (index === -1) return null;
    
    sales[index] = { ...sales[index], ...updates };
    this.saveSales(sales);
    return sales[index];
  }

  // Deletar venda
  static deleteSale(id: string): boolean {
    const sales = this.loadSales();
    const filteredSales = sales.filter(sale => sale.id !== id);
    
    if (filteredSales.length === sales.length) return false;
    
    this.saveSales(filteredSales);
    return true;
  }

  // Limpar todos os dados (útil para reset)
  static clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Exportar dados para JSON
  static exportData(): string {
    const sales = this.loadSales();
    return JSON.stringify(sales, null, 2);
  }

  // Importar dados de JSON
  static importData(jsonData: string): boolean {
    try {
      const sales = JSON.parse(jsonData);
      if (Array.isArray(sales)) {
        this.saveSales(sales);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }
}