/**
 * Mindful SVG Fallback generator for EDSER Digital Stationery
 * Provides instant vector fallbacks matching the warm paper aesthetic
 * in case of network interruption or client-side caching anomalies.
 */

export function getProductFallbackSvg(title: string, category: string = 'planners-organization'): string {
  const isKids = category.includes('kids') || title.toLowerCase().includes('adventure') || title.toLowerCase().includes('park');
  const isMeal = title.toLowerCase().includes('meal') || title.toLowerCase().includes('grocery');
  
  const iconMarkup = isKids
    ? `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#D48B80" opacity="0.8"/>`
    : isMeal
    ? `<rect x="6" y="4" width="12" height="16" rx="2" fill="none" stroke="#70826E" stroke-width="1.5"/><line x1="9" y1="8" x2="15" y2="8" stroke="#70826E" stroke-width="1.5"/><line x1="9" y1="12" x2="15" y2="12" stroke="#70826E" stroke-width="1.5"/><line x1="9" y1="16" x2="13" y2="16" stroke="#70826E" stroke-width="1.5"/>`
    : `<circle cx="12" cy="12" r="9" fill="none" stroke="#D48B80" stroke-width="1.5"/><path d="M12 7v5l3 3" stroke="#D48B80" stroke-width="1.5" stroke-linecap="round"/>`;

  const categoryLabel = isKids ? "Kids' Activity Suite" : isMeal ? "Organization Spreadsheet" : "Mindful Undated Planner";

  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FAF8F5"/>
        <stop offset="100%" stop-color="#EFE9E1"/>
      </linearGradient>
    </defs>
    <rect width="600" height="450" fill="url(#bg)"/>
    <rect x="20" y="20" width="560" height="410" rx="16" fill="#FFFDF9" stroke="#E5DED5" stroke-width="1.5"/>
    <g transform="translate(276, 130) scale(2)">
      ${iconMarkup}
    </g>
    <text x="300" y="235" font-family="serif" font-size="20" font-weight="bold" fill="#2D2A26" text-anchor="middle">${safeTitle}</text>
    <text x="300" y="265" font-family="sans-serif" font-size="12" font-weight="600" letter-spacing="1.5" fill="#70826E" text-anchor="middle" text-transform="uppercase">${categoryLabel}</text>
    <text x="300" y="300" font-family="sans-serif" font-size="11" fill="#8C8275" text-anchor="middle">EDSER Mindful Digital Stationery · Instant Home Download</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function handleImageFallback(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  title: string,
  category?: string
): void {
  const img = event.currentTarget;
  const fallback = getProductFallbackSvg(title, category);
  if (img.src !== fallback) {
    img.src = fallback;
  }
}
