// Receipt.ts
// ============================================
// FUNÇÃO AUXILIAR: Converter qualquer valor para número de forma segura
// ============================================

/**
 * Converte qualquer valor para número de forma segura
 * Fallback para 0 se o valor for inválido, null, undefined ou NaN
 */
function safeNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (typeof value === 'string') {
    // Remove R$, espaços e troca vírgula por ponto
    const cleaned = value.replace(/[R$\s]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

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
// GERAR HTML DO CUPOM
// ============================================

function generateReceiptHTML(
  sale: ReceiptSale,
  company: ReceiptCompany,
  width: '58mm' | '80mm'
): string {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safeNumber(value));

  const pageWidth = width === '58mm' ? '58mm' : '80mm';

  const itemsHTML = sale.items
    .map((item) => {
      const variants = [
        item.variant_size && `Tam: ${item.variant_size}`,
        item.variant_color && `Cor: ${item.variant_color}`,
      ].filter(Boolean).join(', ');

      return `
        <div style="margin-bottom: 10px;">
          <p style="font-weight: bold; margin: 0; font-size: 13px;">
            ${item.product_name}
            ${variants ? `<span style="font-size: 11px; color: #333;"> (${variants})</span>` : ''}
          </p>
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #000; font-weight: 700;">
            <span>${safeNumber(item.quantity)}x ${formatCurrency(item.unit_price)}</span>
            <span>${formatCurrency(item.total_price)}</span>
          </div>
        </div>
      `;
    })
    .join('');

  const saleDate = new Date(sale.created_at);
  const dateStr = saleDate.toLocaleDateString('pt-BR');
  const timeStr = saleDate.toLocaleTimeString('pt-BR');

  // Valores seguros (nunca NaN)
  const safeSubtotal = safeNumber(sale.subtotal);
  const safeDiscount = safeNumber(sale.discount);
  const safeTotal = safeNumber(sale.total_amount);
  const safeReceived = safeNumber(sale.payment_received);
  const safeChange = safeNumber(sale.change_amount);

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
            font-family: 'Courier New', 'Courier', monospace;
            font-size: 13px;
            line-height: 1.5;
            width: ${pageWidth};
            padding: 10px;
            color: #000;
            background: #fff;
            font-weight: 700;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .border-b {
            border-bottom: 2px dashed #000;
            padding-bottom: 6px;
            margin-bottom: 6px;
          }
          .border-t {
            border-top: 2px dashed #000;
            padding-top: 6px;
            margin-top: 6px;
          }
          .flex-between {
            display: flex;
            justify-content: space-between;
          }
          .text-xs { font-size: 11px; }
          .mt-2 { margin-top: 10px; }
          .red { color: #c00; font-weight: bold; }
          .total {
            font-size: 16px;
            font-weight: bold;
          }
          .label {
            font-weight: bold;
          }
          .value {
            font-weight: bold;
          }
          @media print {
            body { width: 100%; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <!-- CABEÇALHO -->
        <div class="center border-b">
          <h2 class="bold" style="font-size: 16px; margin-bottom: 4px;">${company.name}</h2>
          ${company.phone ? `<p class="text-xs" style="font-weight: bold;">Tel: ${company.phone}</p>` : ''}
          ${company.cnpj ? `<p class="text-xs" style="font-weight: bold;">CNPJ: ${company.cnpj}</p>` : ''}
          ${company.address ? `<p class="text-xs" style="font-weight: bold;">${company.address}</p>` : ''}
          ${company.city && company.state ? `<p class="text-xs" style="font-weight: bold;">${company.city} - ${company.state}</p>` : ''}
        </div>

        <!-- TIPO -->
        <div class="center border-b">
          <p class="bold" style="font-size: 14px;">CUPOM NÃO FISCAL</p>
          <p class="text-xs" style="font-weight: bold;">(Não válido como documento fiscal)</p>
        </div>

        <!-- INFO VENDA -->
        <div class="border-b text-xs" style="line-height: 1.8; font-weight: bold;">
          <p><span class="label">Cupom:</span> ${sale.receipt_number}</p>
          <p><span class="label">Data:</span> ${dateStr} ${timeStr}</p>
          <p><span class="label">Vendedor:</span> ${sale.seller_name}</p>
        </div>

        <!-- PRODUTOS -->
        <div class="border-b">
          <p class="center bold" style="margin-bottom: 10px; font-size: 14px;">PRODUTOS</p>
          ${itemsHTML}
        </div>

        <!-- TOTAIS -->
        <div class="border-b text-xs" style="line-height: 2; font-weight: bold;">
          <div class="flex-between">
            <span class="label">Subtotal:</span>
            <span class="value">${formatCurrency(safeSubtotal)}</span>
          </div>
          ${safeDiscount > 0 ? `
            <div class="flex-between red">
              <span class="label">Desconto:</span>
              <span class="value">- ${formatCurrency(safeDiscount)}</span>
            </div>
          ` : ''}
          <div class="flex-between total border-t">
            <span class="label">TOTAL:</span>
            <span class="value">${formatCurrency(safeTotal)}</span>
          </div>
        </div>

        <!-- PAGAMENTO -->
        <div class="border-b text-xs" style="line-height: 2; font-weight: bold;">
          <p><span class="label">Forma de Pagamento:</span> ${sale.payment_method_name}</p>
          <div class="flex-between">
            <span class="label">Valor Recebido:</span>
            <span class="value">${formatCurrency(safeReceived)}</span>
          </div>
          <div class="flex-between">
            <span class="label">Troco:</span>
            <span class="value">${formatCurrency(safeChange)}</span>
          </div>
        </div>

        <!-- RODAPÉ -->
        <div class="center text-xs mt-2" style="font-weight: bold;">
          <p class="bold" style="font-size: 13px;">Obrigado pela preferência!</p>
          <p style="font-size: 13px;">Volte sempre!</p>
          <p style="color: #333; margin-top: 6px; font-weight: bold;">VendaFácil - Sistema PDV</p>
          <p style="color: #333; font-weight: bold;">${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </body>
    </html>
  `;
}

// ============================================
// IMPRIMIR CUPOM
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
      <button onclick="window.print()" style="padding: 12px 24px; font-size: 14px; cursor: pointer; background: #2563eb; color: white; border: none; border-radius: 6px; font-weight: bold;">
        🖨️ Clique aqui para Imprimir
      </button>
      <p style="margin-top: 10px; font-size: 11px; color: #666; font-weight: bold;">
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
// BAIXAR PDF
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
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safeNumber(value));

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
  return `${productName}\n${safeNumber(item.quantity)}x ${formatCurrency(item.unit_price)} = ${formatCurrency(item.total_price)}`;
}).join('\n\n')}

*TOTAIS:*
Subtotal: ${formatCurrency(sale.subtotal)}
${safeNumber(sale.discount) > 0 ? `Desconto: - ${formatCurrency(sale.discount)}\n` : ''}*TOTAL: ${formatCurrency(sale.total_amount)}*

Pagamento: ${sale.payment_method_name}
Valor Recebido: ${formatCurrency(sale.payment_received)}
Troco: ${formatCurrency(sale.change_amount)}

Obrigado pela preferência!
VendaFácil - Sistema PDV
  `.trim();

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = phoneNumber
    ? `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');
};