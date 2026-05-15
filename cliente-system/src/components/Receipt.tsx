import { jsPDF } from 'jspdf';

// ============================================
// INTERFACES
// ============================================

export interface ReceiptItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface ReceiptCompany {
  name: string;
  phone?: string;
  cnpj?: string;
  address?: string;
  city?: string;
  state?: string;
  logo_url?: string;
}

export interface ReceiptSale {
  id: string;
  receipt_number: string;
  created_at: string;
  seller_name: string;
  payment_method_name: string;
  subtotal: number;
  discount: number;
  total_amount: number;
  payment_received: number;
  change_amount: number;
  items: ReceiptItem[];
}

export interface ReceiptProps {
  sale: ReceiptSale;
  company: ReceiptCompany;
  size?: '58mm' | '80mm';
}

// ============================================
// FUNÇÃO: GERAR PDF DO CUPOM
// ============================================

export const generateReceiptPDF = (
  sale: ReceiptSale,
  company: ReceiptCompany,
  size: '58mm' | '80mm' = '80mm'
) => {
  // Configurar tamanho do papel
  const width = size === '58mm' ? 58 : 80;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [width, 297], // Altura variável
  });

  let y = 10;
  const lineHeight = 5;
  const margin = 5;
  const contentWidth = width - (margin * 2);

  // Função: Texto centralizado
  const addCenteredText = (text: string, fontSize: number = 10, bold: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const textWidth = doc.getTextWidth(text);
    const x = (width - textWidth) / 2;
    doc.text(text, x, y);
    y += lineHeight;
  };

  // Função: Texto à esquerda
  const addLeftText = (text: string, fontSize: number = 9) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    doc.text(text, margin, y);
    y += lineHeight;
  };

  // Função: Duas colunas
  const addTwoColumns = (left: string, right: string, fontSize: number = 9, bold: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(left, margin, y);
    const rightWidth = doc.getTextWidth(right);
    doc.text(right, width - margin - rightWidth, y);
    y += lineHeight;
  };

  // Função: Linha separadora
  const addSeparator = () => {
    doc.setLineWidth(0.1);
    doc.line(margin, y, width - margin, y);
    y += lineHeight;
  };

  // ============================================
  // CABEÇALHO
  // ============================================

  addCenteredText(company.name.toUpperCase(), 12, true);
  
  if (company.phone) {
    addCenteredText(`Tel: ${company.phone}`, 8);
  }
  
  if (company.cnpj) {
    addCenteredText(`CNPJ: ${company.cnpj}`, 8);
  }
  
  if (company.address) {
    const addressLines = doc.splitTextToSize(company.address, contentWidth);
    addressLines.forEach((line: string) => {
      addCenteredText(line, 8);
    });
  }
  
  if (company.city && company.state) {
    addCenteredText(`${company.city} - ${company.state}`, 8);
  }

  y += 2;
  addSeparator();
  
  // ============================================
  // TIPO DE DOCUMENTO
  // ============================================
  
  addCenteredText('CUPOM NÃO FISCAL', 11, true);
  addCenteredText('(Não válido como documento fiscal)', 7);
  
  addSeparator();

  // ============================================
  // INFORMAÇÕES DA VENDA
  // ============================================
  
  const saleDate = new Date(sale.created_at);
  const dateStr = saleDate.toLocaleDateString('pt-BR');
  const timeStr = saleDate.toLocaleTimeString('pt-BR');
  
  addLeftText(`Cupom: ${sale.receipt_number}`, 9);
  addLeftText(`Data: ${dateStr} ${timeStr}`, 9);
  addLeftText(`Vendedor: ${sale.seller_name}`, 9);

  y += 2;
  addSeparator();

  // ============================================
  // PRODUTOS
  // ============================================
  
  addCenteredText('PRODUTOS', 10, true);
  y += 1;

  // Cabeçalho da tabela
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  
  if (size === '80mm') {
    doc.text('Produto', margin, y);
    doc.text('Qtd', margin + 40, y);
    doc.text('Unit', margin + 50, y);
    doc.text('Total', margin + 62, y);
  } else {
    doc.text('Produto', margin, y);
    doc.text('Qtd', margin + 28, y);
    doc.text('Total', margin + 40, y);
  }
  
  y += 4;

  // Itens
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  sale.items.forEach((item) => {
    const maxWidth = size === '80mm' ? 35 : 25;
    const productLines = doc.splitTextToSize(item.product_name, maxWidth);
    
    productLines.forEach((line: string, index: number) => {
      doc.text(line, margin, y);
      
      if (index === 0) {
        if (size === '80mm') {
          doc.text(item.quantity.toString(), margin + 40, y);
          doc.text(`R$ ${item.unit_price.toFixed(2)}`, margin + 50, y);
          doc.text(`R$ ${item.total_price.toFixed(2)}`, margin + 62, y);
        } else {
          doc.text(item.quantity.toString(), margin + 28, y);
          doc.text(`R$ ${item.total_price.toFixed(2)}`, margin + 40, y);
        }
      }
      
      y += 4;
    });
  });

  y += 2;
  addSeparator();

  // ============================================
  // TOTAIS
  // ============================================
  
  addTwoColumns('Subtotal:', `R$ ${sale.subtotal.toFixed(2)}`, 9);
  
  if (sale.discount > 0) {
    addTwoColumns('Desconto:', `- R$ ${sale.discount.toFixed(2)}`, 9);
  }
  
  y += 1;
  addTwoColumns('TOTAL:', `R$ ${sale.total_amount.toFixed(2)}`, 11, true);
  
  y += 1;
  addSeparator();

  // ============================================
  // PAGAMENTO
  // ============================================
  
  addLeftText(`Forma de Pagamento: ${sale.payment_method_name}`, 9);
  addTwoColumns('Valor Recebido:', `R$ ${sale.payment_received.toFixed(2)}`, 9);
  addTwoColumns('Troco:', `R$ ${sale.change_amount.toFixed(2)}`, 9);

  y += 3;
  addSeparator();

  // ============================================
  // RODAPÉ
  // ============================================
  
  addCenteredText('Obrigado pela preferência!', 9, true);
  addCenteredText('Volte sempre!', 9);
  
  y += 3;
  addCenteredText('VendaFácil - Sistema PDV', 7);
  addCenteredText(new Date().toLocaleDateString('pt-BR'), 7);

  return doc;
};

// ============================================
// FUNÇÃO: IMPRIMIR CUPOM
// ============================================

export const printReceipt = (
  sale: ReceiptSale,
  company: ReceiptCompany,
  size: '58mm' | '80mm' = '80mm'
) => {
  const doc = generateReceiptPDF(sale, company, size);
  
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

// ============================================
// FUNÇÃO: BAIXAR PDF
// ============================================

export const downloadReceipt = (
  sale: ReceiptSale,
  company: ReceiptCompany,
  size: '58mm' | '80mm' = '80mm'
) => {
  const doc = generateReceiptPDF(sale, company, size);
  const fileName = `cupom_${sale.receipt_number}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

// ============================================
// FUNÇÃO: COMPARTILHAR WHATSAPP
// ============================================

export const shareReceiptWhatsApp = (
  sale: ReceiptSale,
  company: ReceiptCompany,
  phoneNumber?: string
) => {
  const message = `
*${company.name}*
${company.phone ? `Tel: ${company.phone}` : ''}
${company.cnpj ? `CNPJ: ${company.cnpj}` : ''}

*CUPOM NÃO FISCAL*
Cupom: ${sale.receipt_number}
Data: ${new Date(sale.created_at).toLocaleString('pt-BR')}
Vendedor: ${sale.seller_name}

*PRODUTOS:*
${sale.items.map(item => 
  `${item.product_name}\n${item.quantity}x R$ ${item.unit_price.toFixed(2)} = R$ ${item.total_price.toFixed(2)}`
).join('\n\n')}

*TOTAIS:*
Subtotal: R$ ${sale.subtotal.toFixed(2)}
${sale.discount > 0 ? `Desconto: - R$ ${sale.discount.toFixed(2)}\n` : ''}*TOTAL: R$ ${sale.total_amount.toFixed(2)}*

Pagamento: ${sale.payment_method_name}
Valor Recebido: R$ ${sale.payment_received.toFixed(2)}
Troco: R$ ${sale.change_amount.toFixed(2)}

Obrigado pela preferência!
VendaFácil - Sistema PDV
  `.trim();

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = phoneNumber
    ? `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
};

// ============================================
// FUNÇÃO: OBTER BLOB DO PDF
// ============================================

export const getReceiptBlob = (
  sale: ReceiptSale,
  company: ReceiptCompany,
  size: '58mm' | '80mm' = '80mm'
): Blob => {
  const doc = generateReceiptPDF(sale, company, size);
  return doc.output('blob');
};
