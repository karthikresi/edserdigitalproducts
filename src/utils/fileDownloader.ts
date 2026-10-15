import { Product } from '../types';

export function downloadProductPackage(product: Product, orderId: string = 'EDSER-DEMO') {
  const content = `========================================================================
EDSER — MINDFUL DIGITAL DOWNLOADS
Thank you for your purchase!
Order: #${orderId}
Product: ${product.title}
Price: $${product.price.toFixed(2)} USD
========================================================================

DIGITAL PRODUCT ACCESS GUARANTEE:
- Lifetime download access
- Personal & immediate household license
- Zero DRM barriers — ready to print or load into your favorite apps

INCLUDED FILE FORMATS:
${product.formats.map((f, i) => `  ${i + 1}. ${f}`).join('\n')}

COMPATIBILITY REQUIREMENTS:
${product.compatibility.map((c) => `  • ${c}`).join('\n')}

HOME & PRINT SHOP PRINTING GUIDANCE:
• Paper Recommendation: ${product.printingGuidance.recommendedPaper}
• Print Settings: ${product.printingGuidance.printerSettings}
• Margins: ${product.printingGuidance.margins}
${product.printingGuidance.bindingTips ? `• Binding & Finishing: ${product.printingGuidance.bindingTips}\n` : ''}

INCLUDED CONTENTS & TEMPLATES:
${product.includedContents.map((item, idx) => `  [#${idx + 1}] ${item}`).join('\n')}

CUSTOMER CARE & STORE OWNER ASSISTANCE:
Questions or need custom page formatting? Contact EDSER at support@edserstationery.com.

Plan your days. Make room for joy.
© EDSER Digital Stationery. All rights reserved.
========================================================================`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${product.id}-access-package.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
