// Receipt.ts
// ============================================
// INTERFACES
// ============================================

export interface ReceiptItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant_size?: string;
  variant_color?: string;
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
// GERAR HTML DO CUPOM (compartilhado entre PDF e Impressão)
// ============================================

function generateReceiptHTML(
  sale: ReceiptSale,
  company: ReceiptCompany,
  width: '58mm' | '80mm'
): string {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const pageWidth = width === '58mm' ? '58mm' : '80mm';

  const itemsHTML = sale.items
    .map((item) => {
      const variants = [
        item.variant_size && `Tam: ${item.variant_size}`,
        item.variant_color && `Cor: ${item.variant_color}`,
      ].filter(Boolean).join(', ');

      return `
        <div style="margin-bottom: 8px;">
          <p style="font-weight: bold; margin: 0;">
            ${item.product_name}
            ${variants ? `<span style="font-size: 10px; color: #666;"> (${variants})</span>` : ''}
          </p>
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #666;">
            <span>${item.quantity}x ${formatCurrency(item.unit_price)}</span>
            <span>${formatCurrency(item.total_price)}</span>
          </div>
        </div>
      `;
    })
    .join('');

  const saleDate = new Date(sale.created_at);
  const dateStr = saleDate.toLocaleDateString('pt-BR');
  const timeStr = saleDate.toLocaleTimeString('pt-BR');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Cupom - ${sale.receipt_number}</title>
        <style>
          @page { size: ${pageWidth} auto; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            width: ${pageWidth};
            padding: 8px;
            color: #000;
            background: #fff;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .border-b {
            border-bottom: 1px dashed #000;
            padding-bottom: 4px;
            margin-bottom: 4px;
          }
          .border-t {
            border-top: 1px dashed #000;
            padding-top: 4px;
            margin-top: 4px;
          }
          .flex-between { display: flex; justify-content: space-between; }
          .text-xs { font-size: 10px; }
          .mt-2 { margin-top: 8px; }
          .red { color: #c00; }
          .total { font-size: 14px; font-weight: bold; }
          @media print {
            body { width: 100%; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <!-- CABEÇALHO -->
        <div class="center border-b">
          <h2 class="bold" style="font-size: 14px;">${company.name}</h2>
          ${company.phone ? `<p class="text-xs">Tel: ${company.phone}</p>` : ''}
          ${company.cnpj ? `<p class="text-xs">CNPJ: ${company.cnpj}</p>` : ''}
          ${company.address ? `<p class="text-xs">${company.address}</p>` : ''}
          ${company.city && company.state ? `<p class="text-xs">${company.city} - ${company.state}</p>` : ''}
        </div>

        <!-- TIPO -->
        <div class="center border-b">
          <p class="bold">CUPOM NÃO FISCAL</p>
          <p class="text-xs">(Não válido como documento fiscal)</p>
        </div>

        <!-- INFO VENDA -->
        <div class="border-b text-xs" style="line-height: 1.6;">
          <p><span class="bold">Cupom:</span> ${sale.receipt_number}</p>
          <p><span class="bold">Data:</span> ${dateStr} ${timeStr}</p>
          <p><span class="bold">Vendedor:</span> ${sale.seller_name}</p>
        </div>

        <!-- PRODUTOS -->
        <div class="border-b">
          <p class="center bold" style="margin-bottom: 8px;">PRODUTOS</p>
          ${itemsHTML}
        </div>

        <!-- TOTAIS -->
        <div class="border-b text-xs" style="line-height: 1.8;">
          <div class="flex-between">
            <span>Subtotal:</span>
            <span>${formatCurrency(sale.subtotal)}</span>
          </div>
          ${sale.discount > 0 ? `
            <div class="flex-between red">
              <span>Desconto:</span>
              <span>- ${formatCurrency(sale.discount)}</span>
            </div>
          ` : ''}
          <div class="flex-between total border-t">
            <span>TOTAL:</span>
            <span>${formatCurrency(sale.total_amount)}</span>
          </div>
        </div>

        <!-- PAGAMENTO -->
        <div class="border-b text-xs" style="line-height: 1.8;">
          <p><span class="bold">Forma de Pagamento:</span> ${sale.payment_method_name}</p>
          <div class="flex-between">
            <span>Valor Recebido:</span>
            <span>${formatCurrency(sale.payment_received)}</span>
          </div>
          <div class="flex-between">
            <span>Troco:</span>
            <span>${formatCurrency(sale.change_amount)}</span>
          </div>
        </div>

        <!-- RODAPÉ -->
        <div class="center text-xs mt-2">
          <p class="bold">Obrigado pela preferência!</p>
          <p>Volte sempre!</p>
          <p style="color: #666; margin-top: 4px;">VendaFácil - Sistema PDV</p>
          <p style="color: #666;">${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </body>
    </html>
  `;
}

// ============================================
// IMPRIMIR CUPOM (via navegador - funciona com qualquer impressora!)
// ============================================

export const printReceipt = (
  sale: ReceiptSale,
  company: ReceiptCompany,
  size: '58mm' | '80mm' = '80mm'
): void => {
  const printWindow = window.open('', '_blank', 'width=400,height=600');

  if (!printWindow) {
    alert('Por favor, permita popups para imprimir o cupom.');
    return;
  }

  const html = generateReceiptHTML(sale, company, size);

  printWindow.document.write(html.replace('</body>', `
    <div class="no-print" style="margin-top: 20px; text-align: center; padding: 10px;">
      <button onclick="window.print()" style="padding: 12px 24px; font-size: 14px; cursor: pointer; background: #2563eb; color: white; border: none; border-radius: 6px;">
        🖨️ Clique aqui para Imprimir
      </button>
      <p style="margin-top: 10px; font-size: 11px; color: #666;">
        Selecione sua impressora no diálogo que abrirá
      </p>
    </div>
    <script>
      window.onload = function() {
        const btn = document.querySelector('button');
        if (btn) btn.focus();
      };
    </script>
  </body>`));

  printWindow.document.close();
};

// ============================================
// BAIXAR PDF (mantém jsPDF como opção)
// ============================================

export const downloadReceipt = (
  sale: ReceiptSale,
  company: ReceiptCompany,
  size: '58mm' | '80mm' = '80mm'
): void => {
  const html = generateReceiptHTML(sale, company, size);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `cupom-${sale.receipt_number}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ============================================
// COMPARTILHAR WHATSAPP
// ============================================

export const shareReceiptWhatsApp = (
  sale: ReceiptSale,
  company: ReceiptCompany,
  phoneNumber?: string
): void => {
  const message = `
*${company.name}*
${company.phone ? `Tel: ${company.phone}` : ''}
${company.cnpj ? `CNPJ: ${company.cnpj}` : ''}

*CUPOM NÃO FISCAL*
Cupom: ${sale.receipt_number}
Data: ${new Date(sale.created_at).toLocaleString('pt-BR')}
Vendedor: ${sale.seller_name}

*PRODUTOS:*
${sale.items.map(item => {
  let productName = item.product_name;
  if (item.variant_size || item.variant_color) {
    const variants = [];
    if (item.variant_size) variants.push(`Tam: ${item.variant_size}`);
    if (item.variant_color) variants.push(`Cor: ${item.variant_color}`);
    productName += ` (${variants.join(', ')})`;
  }
  return `${productName}\n${item.quantity}x R$ ${item.unit_price.toFixed(2)} = R$ ${item.total_price.toFixed(2)}`;
}).join('\n\n')}

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