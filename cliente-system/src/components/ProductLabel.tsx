import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface ProductLabelProps {
  name: string;
  price: number;
  promotionalPrice: number | null;
  barcode: string | null;
  sku: string | null;
  productId: string;
}

export default function ProductLabel({
  name,
  price,
  promotionalPrice,
  barcode,
  sku,
  productId
}: ProductLabelProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  
  console.log('ProductLabel recebeu:', { name, price, promotionalPrice, barcode, sku });
  
  // Determinar preço a exibir
  const displayPrice = promotionalPrice || price;
  
  // Gerar código de barras (usar barcode ou id do produto)
  const barcodeValue = barcode || productId.substring(0, 13).padEnd(13, '0');
  const hasMissingBarcode = !barcode;
  
  useEffect(() => {
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, barcodeValue, {
          format: 'CODE128',
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 12,
          margin: 5
        });
      } catch (error) {
        console.error('Erro ao gerar código de barras:', error);
      }
    }
  }, [barcodeValue]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="product-label">
      {/* Nome do Produto */}
      <div 
        className="label-product-name" 
        style={{ 
          color: '#000000', 
          backgroundColor: 'transparent',
          fontSize: '12pt',
          fontWeight: 'bold',
          padding: '1mm 2mm',
          textAlign: 'center',
          lineHeight: '1.2',
          marginBottom: '2mm'
        }}
      >
        {name || 'Produto sem nome'}
      </div>
      
      {/* Preço em destaque */}
      <div className="label-price">
        {formatCurrency(displayPrice)}
        {promotionalPrice && (
          <span className="label-old-price">
            {formatCurrency(price)}
          </span>
        )}
      </div>
      
      {/* Código de Barras */}
      <div className="label-barcode">
        <svg ref={barcodeRef}></svg>
      </div>
      
      {/* SKU e aviso */}
      <div className="label-footer">
        {sku && <div className="label-sku">SKU: {sku}</div>}
        {hasMissingBarcode && (
          <div className="label-warning">⚠️ Código gerado automaticamente</div>
        )}
      </div>
    </div>
  );
}
