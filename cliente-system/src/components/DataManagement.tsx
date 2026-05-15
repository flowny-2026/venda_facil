import { useState } from 'react';
import { Download, Upload, Trash2, RefreshCw } from 'lucide-react';
import { SalesService } from '../services/salesService';

interface DataManagementProps {
  onDataChange: () => void;
}

export default function DataManagement({ onDataChange }: DataManagementProps) {
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    const data = SalesService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendas-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = SalesService.importData(content);
        
        if (success) {
          alert('Dados importados com sucesso!');
          onDataChange();
        } else {
          alert('Erro: Formato de arquivo inválido');
        }
      } catch (error) {
        alert('Erro ao importar arquivo');
      } finally {
        setIsImporting(false);
        // Reset input
        event.target.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      SalesService.clearAllData();
      alert('Dados limpos com sucesso!');
      onDataChange();
    }
  };

  const handleResetToMock = () => {
    if (window.confirm('Deseja restaurar os dados de exemplo? Isso substituirá todos os dados atuais.')) {
      SalesService.clearAllData();
      // Força recarregar os dados mock
      SalesService.loadSales();
      alert('Dados de exemplo restaurados!');
      onDataChange();
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft">
      <h2 className="text-lg font-semibold text-slate-100 mb-4">Gerenciamento de Dados</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar
        </button>

        <label className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-600/30 transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          {isImporting ? 'Importando...' : 'Importar'}
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            disabled={isImporting}
          />
        </label>

        <button
          onClick={handleResetToMock}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg hover:bg-amber-600/30 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Restaurar
        </button>

        <button
          onClick={handleClearData}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Limpar
        </button>
      </div>

      <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
        <p className="text-xs text-slate-400">
          <strong>Dica:</strong> Os dados são salvos automaticamente no navegador. Use "Exportar" para fazer backup 
          ou "Importar" para restaurar dados de outro dispositivo.
        </p>
      </div>
    </div>
  );
}