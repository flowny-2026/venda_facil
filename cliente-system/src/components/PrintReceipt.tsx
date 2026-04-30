import { jsPDF } from 'jspdf';

interface Sale {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  payment_method_name: string;
  seller_name: string;
  created_at: string;
}

interface Company {
  name: string;
  cnpj?: string;
  address?: string;
  phone?: string;
}

interface PrintReceiptProps {
  sale: Sale;
  company: Company;
}

export const generateReceipt = (sale: Sale, company: Company) => {
  // Criar PDF no formato de cupom (80mm = 226 pixels)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200], // 80mm de largura, altura variável
  });

  let y = 10; // Posição Y inicial
  const lineHeight = 5;
  const pageWidth = 80;
  const margin = 5;
  const contentWidth = pageWidth - (margin * 2);

  // Função auxiliar para adicionar texto centralizado
  const addCenteredText = (text: string, fontSize: number = 10, bold: boolean = false) => {
    doc.setFontSize(fontSize);
    if (bold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    const textWidth = doc.getTextWidth(text);
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, y);
    y += lineHeight;
  };

  // Função auxiliar para adicionar texto alinhado à esquerda
  const addLeftText = (text: string, fontSize: number = 9) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    doc.text(text, margin, y);
    y += lineHeight;
  };

  // Função auxiliar para adicionar linha separadora
  const addSeparator = () => {
    doc.setLineWidth(0.1);
    doc.line(margin, y, pageWidth - margin, y);
    y += lineHeight;
  };

  // Função auxiliar para adicionar texto em duas colunas
  const addTwoColumns = (left: string, right: string, fontSize: number = 9) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    doc.text(left, margin, y);
    const rightWidth = doc.getTextWidth(right);
    doc.text(right, pageWidth - margin - rightWidth, y);
    y += lineHeight;
  };

  // CABEÇALHO
  addCenteredText(company.name.toUpperCase(), 12, true);
  
  if (company.cnpj) {
    addCenteredText(`CNPJ: ${company.cnpj}`, 8);
  }
  
  if (company.address) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const addressLines = doc.splitTextToSize(company.address, contentWidth);
    addressLines.forEach((line: string) => {
      addCenteredText(line, 8);
    });
  }
  
  if (company.phone) {
    addCenteredText(`Tel: ${company.phone}`, 8);
  }

  y += 2;
  addSeparator();
  
  // TIPO DE DOCUMENTO
  addCenteredText('CUPOM NÃO FISCAL', 11, true);
  addCenteredText('(Não válido como documento fiscal)', 7);
  
  addSeparator();

  // INFORMAÇÕES DA VENDA
  const saleDate = new Date(sale.created_at);
  const dateStr = saleDate.toLocaleDateString('pt-BR');
  const timeStr = saleDate.toLocaleTimeString('pt-BR');
  
  addLeftText(`Data: ${dateStr}`, 9);
  addLeftText(`Hora: ${timeStr}`, 9);
  addLeftText(`Cupom: #${sale.id.substring(0, 8).toUpperCase()}`, 9);
  addLeftText(`Vendedor: ${sale.seller_name}`, 9);

  y += 2;
  addSeparator();

  // PRODUTOS
  addCenteredText('PRODUTOS', 10, true);
  y += 1;

  // Cabeçalho da tabela
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Item', margin, y);
  doc.text('Qtd', margin + 35, y);
  doc.text('Valor', margin + 50, y);
  y += 4;

  // Linha do produto
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  // Nome do produto (quebra linha se necessário)
  const productLines = doc.splitTextToSize(sale.product_name, 30);
  productLines.forEach((line: string, index: number) => {
    doc.text(line, margin, y);
    if (index === 0) {
      // Quantidade e valor apenas na primeira linha
      doc.text(sale.quantity.toString(), margin + 35, y);
      doc.text(`R$ ${sale.unit_price.toFixed(2)}`, margin + 50, y);
    }
    y += 4;
  });

  // Subtotal do item
  addTwoColumns('Subtotal:', `R$ ${sale.total_amount.toFixed(2)}`, 9);

  y += 2;
  addSeparator();

  // TOTAIS
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  addTwoColumns('TOTAL:', `R$ ${sale.total_amount.toFixed(2)}`, 11);

  y += 1;
  addSeparator();

  // FORMA DE PAGAMENTO
  addLeftText(`Forma de Pagamento: ${sale.payment_method_name}`, 9);

  y += 3;
  addSeparator();

  // RODAPÉ
  addCenteredText('Obrigado pela preferência!', 9, true);
  addCenteredText('Volte sempre!', 9);
  
  y += 3;
  addCenteredText('VendaFácil - Sistema PDV', 7);
  addCenteredText(new Date().toLocaleDateString('pt-BR'), 7);

  // Retornar o PDF
  return doc;
};

export const printReceipt = (sale: Sale, company: Company) => {
  const doc = generateReceipt(sale, company);
  
  // Abrir em nova janela para impressão
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  const printWindow = window.open(pdfUrl, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

export const downloadReceipt = (sale: Sale, company: Company) => {
  const doc = generateReceipt(sale, company);
  const fileName = `cupom_${sale.id.substring(0, 8)}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

export const getReceiptBlob = (sale: Sale, company: Company): Blob => {
  const doc = generateReceipt(sale, company);
  return doc.output('blob');
};
