import React, { useState, useRef } from 'react';
import { Product } from '../types';
import {
  Printer,
  Maximize2,
  Minimize2,
  FileText,
  Layers,
  Check,
  RotateCw,
  Sparkles,
  Info,
  Compass,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface PrintPreviewProps {
  product: Product;
  onClose?: () => void;
  isInline?: boolean;
}

export type PaperSize = 'letter' | 'a4';
export type PrintColorMode = 'color' | 'grayscale';
export type Orientation = 'portrait' | 'landscape';

export const PrintPreview: React.FC<PrintPreviewProps> = ({
  product,
  onClose,
  isInline = false,
}) => {
  const [paperSize, setPaperSize] = useState<PaperSize>('letter');
  const [colorMode, setColorMode] = useState<PrintColorMode>('color');
  const [showMargins, setShowMargins] = useState<boolean>(true);
  const [showHolePunchGuide, setShowHolePunchGuide] = useState<boolean>(false);
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [orientation, setOrientation] = useState<Orientation>(() => {
    // Meal planner looks especially great in landscape or portrait
    return product.id === 'weekly-meal-planner-spreadsheet' ? 'landscape' : 'portrait';
  });

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Sheets configured per product
  const getSheetsForProduct = () => {
    if (product.id === 'weekly-meal-planner-spreadsheet') {
      return [
        { id: 'weekly-menu', name: 'Weekly Dinner Matrix & Schedule', subtitle: '4-Week Rotating Family Schedule' },
        { id: 'grocery-list', name: 'Aisle-Sorted Grocery Checklist', subtitle: 'Produce, Dairy, Pantry & Protein' },
        { id: 'inventory-staples', name: 'Pantry & Refrigerator Staple Sheet', subtitle: 'Stock Checklist & Expirations' },
      ];
    }
    if (product.id === 'rose-daily-undated-planner') {
      return [
        { id: 'daily-spread', name: 'Undated Daily Mindful Focus Spread', subtitle: 'Priorities, Timeline, Gratitude & Tasks' },
        { id: 'weekly-habits', name: '7-Day Weekly Habit & Goal Tracker', subtitle: 'Daily Routine Matrix & Reflections' },
        { id: 'monthly-grid', name: '12-Month Flexible Undated Calendar', subtitle: 'Spacious Day Blocks & Milestone Goals' },
      ];
    }
    // Kids National Parks Activity Book
    return [
      { id: 'park-coloring', name: 'Yellowstone Wildlife Coloring Sheet', subtitle: 'Bear, Pine Trees & Mountain Outlines' },
      { id: 'trail-maze', name: 'Campsite Scavenger Maze & Trail Quiz', subtitle: 'Kid-friendly puzzle & animal tracks' },
      { id: 'certificate', name: 'Official Junior Explorer Certificate', subtitle: 'Personalized Award with Date & Signature' },
    ];
  };

  const sheets = getSheetsForProduct();
  const currentSheet = sheets[activeSheetIndex] || sheets[0];

  // Paper aspect ratio calculation
  // US Letter: 8.5 x 11 in (ratio 8.5/11 = 0.7727 in portrait; 11/8.5 = 1.294 in landscape)
  // A4: 210 x 297 mm (ratio 210/297 = 0.7071 in portrait; 297/210 = 1.414 in landscape)
  const getAspectRatio = () => {
    if (orientation === 'landscape') {
      return paperSize === 'letter' ? '11 / 8.5' : '297 / 210';
    }
    return paperSize === 'letter' ? '8.5 / 11' : '210 / 297';
  };

  const handlePrintSample = () => {
    triggerHaptic('medium');
    window.print();
  };

  return (
    <div className={`flex flex-col bg-[#FAF8F5] text-[#2D2A26] rounded-xl overflow-hidden border border-[#EFE9E1] ${isInline ? 'p-4 sm:p-6' : 'p-6'}`}>
      
      {/* Header Bar with Product and Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-[#EFE9E1]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#70826E]" aria-hidden="true" />
            <h3 className="text-lg font-serif font-bold text-[#2D2A26] flex items-center gap-2">
              <Printer className="w-4 h-4 text-[#70826E]" />
              Interactive Paper Print Preview
            </h3>
            <span className="text-[11px] bg-[#EEF2ED] text-[#70826E] font-medium px-2 py-0.5 rounded">
              True Dimension Simulation
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Preview realistic scale, safe margin zones, and binding allowances on standard home paper stocks.
          </p>
        </div>

        {/* Action Controls & Print Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintSample}
            className="px-3.5 py-2 bg-[#2D2A26] hover:bg-[#403C36] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs focus-visible:ring-2 focus-visible:ring-[#70826E]"
            title="Open browser print dialogue to test your home printer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Test Print Sheet</span>
          </button>
          {onClose && !isInline && (
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              aria-label="Close Print Preview"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Control Strip (Size, Color, Margins, Orientation, Zoom) */}
      <div className="py-4 border-b border-[#EFE9E1] flex flex-wrap items-center justify-between gap-3 text-xs bg-white/70 px-4 rounded-lg my-4 shadow-2xs">
        
        {/* Paper Size Selector */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px]">Paper Size:</span>
          <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-50">
            <button
              onClick={() => {
                triggerHaptic('light');
                setPaperSize('letter');
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                paperSize === 'letter'
                  ? 'bg-white text-[#2D2A26] shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              US Letter (8.5 × 11")
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setPaperSize('a4');
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                paperSize === 'a4'
                  ? 'bg-white text-[#2D2A26] shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              A4 (210 × 297 mm)
            </button>
          </div>
        </div>

        {/* Orientation Selector */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px]">Orientation:</span>
          <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-50">
            <button
              onClick={() => {
                triggerHaptic('light');
                setOrientation('portrait');
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                orientation === 'portrait'
                  ? 'bg-white text-[#2D2A26] shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Portrait
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setOrientation('landscape');
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                orientation === 'landscape'
                  ? 'bg-white text-[#2D2A26] shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Landscape
            </button>
          </div>
        </div>

        {/* Color / Ink Mode */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px]">Print Mode:</span>
          <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-50">
            <button
              onClick={() => {
                triggerHaptic('light');
                setColorMode('color');
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                colorMode === 'color'
                  ? 'bg-white text-[#2D2A26] shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Full Color
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setColorMode('grayscale');
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                colorMode === 'grayscale'
                  ? 'bg-white text-[#2D2A26] shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              B&W / Grayscale
            </button>
          </div>
        </div>

        {/* Safe Margin & Binding Guides */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showMargins}
              onChange={(e) => {
                triggerHaptic('light');
                setShowMargins(e.target.checked);
              }}
              className="rounded text-[#70826E] focus:ring-[#70826E]"
            />
            <span>0.5" Safe Margins</span>
          </label>

          <label className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showHolePunchGuide}
              onChange={(e) => {
                triggerHaptic('light');
                setShowHolePunchGuide(e.target.checked);
              }}
              className="rounded text-[#70826E] focus:ring-[#70826E]"
            />
            <span>Binder Hole Guide</span>
          </label>

          <button
            onClick={() => {
              triggerHaptic('light');
              setIsZoomed(!isZoomed);
            }}
            className="p-1.5 text-stone-500 hover:text-stone-800 rounded bg-stone-100 hover:bg-stone-200 transition-colors ml-1"
            title={isZoomed ? 'Fit to window' : 'Zoom 100%'}
            aria-label={isZoomed ? 'Fit to window' : 'Zoom 100%'}
          >
            {isZoomed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Sheet / Page Tab Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 no-scrollbar">
        <span className="text-[10px] uppercase font-semibold text-stone-400 shrink-0">Included Sheets:</span>
        {sheets.map((sheet, idx) => (
          <button
            key={sheet.id}
            onClick={() => {
              triggerHaptic('light');
              setActiveSheetIndex(idx);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-2 border ${
              activeSheetIndex === idx
                ? 'bg-[#2D2A26] text-white border-[#2D2A26] shadow-xs'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-stone-200/50 text-[10px] flex items-center justify-center font-bold">
              {idx + 1}
            </span>
            <span>{sheet.name}</span>
          </button>
        ))}
      </div>

      {/* Main Print Stage / Canvas Container */}
      <div className="relative w-full bg-[#EFEBE4] rounded-xl p-4 sm:p-8 flex items-center justify-center overflow-auto min-h-[520px] shadow-inner">
        
        {/* Printable Paper Sheet Container */}
        <div
          ref={printAreaRef}
          style={{
            aspectRatio: getAspectRatio(),
            maxWidth: isZoomed ? '950px' : orientation === 'landscape' ? '720px' : '520px',
            filter: colorMode === 'grayscale' ? 'grayscale(100%) contrast(1.15)' : 'none',
          }}
          className="relative w-full bg-[#FFFDF9] rounded-xs shadow-2xl transition-all duration-300 text-[#2D2A26] flex flex-col justify-between overflow-hidden border border-stone-200 print:w-full print:max-w-none print:shadow-none print:border-none print:m-0"
        >
          {/* Paper Dimension Watermark Tag */}
          <div className="absolute top-2 right-2 text-[9px] font-mono text-stone-400 select-none print:hidden">
            {paperSize === 'letter' ? 'US LETTER 8.5" × 11"' : 'A4 210 × 297 MM'} · {orientation.toUpperCase()}
          </div>

          {/* 0.5" Safe Margin Guide Box (Visible when toggled) */}
          {showMargins && (
            <div
              className="absolute inset-5 border border-dashed border-sky-400/50 pointer-events-none rounded-xs z-20 print:hidden flex items-start justify-end p-1"
              title="0.5-inch home printer safe printable boundary"
            >
              <span className="text-[8px] font-mono text-sky-500 bg-sky-50/80 px-1 rounded">0.5" Safe Margin</span>
            </div>
          )}

          {/* Hole Punch / Spiral Binding Allowance Guide */}
          {showHolePunchGuide && (
            <div className="absolute inset-y-0 left-0 w-8 bg-amber-500/10 border-r border-dashed border-amber-400/60 z-20 flex flex-col justify-around items-center py-10 pointer-events-none print:hidden">
              <div className="w-3.5 h-3.5 rounded-full border border-amber-600 bg-white/70" title="Top Hole Punch" />
              <div className="w-3.5 h-3.5 rounded-full border border-amber-600 bg-white/70" title="Center Hole Punch" />
              <div className="w-3.5 h-3.5 rounded-full border border-amber-600 bg-white/70" title="Bottom Hole Punch" />
              <span className="text-[7px] text-amber-800 -rotate-90 whitespace-nowrap font-mono">0.6" Binding Safe Zone</span>
            </div>
          )}

          {/* REALISTIC HIGH-FIDELITY PRINTABLE SHEET CONTENT */}
          <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between select-none">
            
            {/* PRODUCT 1: WEEKLY MEAL PLANNER & GROCERY LIST */}
            {product.id === 'weekly-meal-planner-spreadsheet' && (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                {/* Header */}
                <div className="border-b-2 border-[#70826E] pb-3 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#70826E]">
                      EDSER MINDFUL LIVING SERIES · 4-WEEK TEMPLATE
                    </span>
                    <h2 className="text-2xl font-serif font-bold text-[#2D2A26] leading-none mt-0.5">
                      {currentSheet.name}
                    </h2>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-stone-500 font-medium">Week of: </span>
                    <span className="inline-block w-28 border-b border-stone-400" />
                  </div>
                </div>

                {/* Sheet Variant 1: Meal Matrix */}
                {activeSheetIndex === 0 && (
                  <div className="flex-1 grid grid-cols-7 gap-2 text-xs">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div key={day} className="border border-stone-200 rounded bg-[#FAF8F5] flex flex-col">
                        <div className="bg-[#EEF2ED] py-1 px-1.5 border-b border-stone-200 text-center font-bold text-[#70826E] text-[11px]">
                          {day}
                        </div>
                        <div className="p-1.5 flex-1 flex flex-col justify-between space-y-2">
                          <div className="space-y-0.5">
                            <span className="text-[9px] uppercase font-semibold text-stone-400">Breakfast</span>
                            <div className="h-4 border-b border-dashed border-stone-200" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] uppercase font-semibold text-stone-400">Lunch</span>
                            <div className="h-4 border-b border-dashed border-stone-200" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] uppercase font-semibold text-[#70826E]">Dinner Focus</span>
                            <div className="h-6 border-b border-stone-300 bg-white rounded p-0.5" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] uppercase font-semibold text-stone-400">Snacks & Prep</span>
                            <div className="h-4 border-b border-dashed border-stone-200" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sheet Variant 2: Grocery Checklist */}
                {activeSheetIndex === 1 && (
                  <div className="flex-1 grid grid-cols-4 gap-3 text-xs">
                    {[
                      { category: 'Fresh Produce', items: ['Organic spinach & kale', 'Honeycrisp apples', 'Avocados & limes', 'Sweet potatoes', 'Fresh rosemary & basil'] },
                      { category: 'Dairy & Refrigerated', items: ['Whole milk / Oat milk', 'Sharp cheddar block', 'Greek plain yogurt', 'Pasture-raised eggs', 'Grass-fed butter'] },
                      { category: 'Pantry & Grains', items: ['Brown basmati rice', 'Rolled gluten-free oats', 'Olive oil & balsamic', 'Raw honey', 'Sourdough flour'] },
                      { category: 'Proteins & Seafood', items: ['Wild-caught salmon fillets', 'Organic chicken breast', 'Black beans & lentils', 'Raw almonds & walnuts', 'Firm tofu'] },
                    ].map((col) => (
                      <div key={col.category} className="border border-stone-200 rounded p-2.5 bg-white">
                        <h4 className="font-bold text-[#70826E] border-b border-stone-200 pb-1 mb-2 text-xs">
                          {col.category}
                        </h4>
                        <ul className="space-y-2 text-[11px] text-stone-600">
                          {col.items.map((it, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded-full border border-stone-300 shrink-0" />
                              <span>{it}</span>
                            </li>
                          ))}
                          {[1, 2, 3].map((blank) => (
                            <li key={`b-${blank}`} className="flex items-center gap-1.5 pt-1">
                              <span className="w-3 h-3 rounded-full border border-stone-300 shrink-0" />
                              <div className="w-full border-b border-dashed border-stone-300 h-2" />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sheet Variant 3: Inventory Tracker */}
                {activeSheetIndex === 2 && (
                  <div className="flex-1 border border-stone-200 rounded bg-white p-3 space-y-3 text-xs">
                    <div className="flex justify-between items-center text-[#70826E] font-bold text-xs pb-1 border-b">
                      <span>Pantry / Freezer Location</span>
                      <span>Item Description</span>
                      <span>Qty on Hand</span>
                      <span>Restock Threshold</span>
                    </div>
                    {[
                      { loc: 'Pantry Shelf A', item: 'Organic rolled oats', qty: '2.5 lbs', restock: '1 lb' },
                      { loc: 'Freezer Drawer 1', item: 'Frozen blueberries', qty: '3 bags', restock: '1 bag' },
                      { loc: 'Spice Cabinet', item: 'Maldon sea salt flakes', qty: '1 box', restock: '1 box' },
                      { loc: 'Pantry Shelf C', item: 'San Marzano canned tomatoes', qty: '4 cans', restock: '2 cans' },
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center text-[11px] border-b border-stone-100 py-1 text-stone-600">
                        <span className="w-1/4 font-mono text-[10px] text-stone-400">{row.loc}</span>
                        <span className="w-2/5 font-medium text-[#2D2A26]">{row.item}</span>
                        <span className="w-1/6">{row.qty}</span>
                        <span className="w-1/6 text-right text-[#70826E]">{row.restock}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer notes */}
                <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-[9px] text-stone-400">
                  <span>© EDSER Printables · www.edser.store</span>
                  <span>Kitchen Clipboard & Refrigerator Magnet Layout</span>
                  <span>Sheet {activeSheetIndex + 1} of 3</span>
                </div>
              </div>
            )}

            {/* PRODUCT 2: ROSE DAILY UNDATED PLANNER */}
            {product.id === 'rose-daily-undated-planner' && (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                {/* Header */}
                <div className="border-b border-[#D48B80]/40 pb-2 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2D2A26] tracking-wide">
                      DAILY INTENTION & FOCUS
                    </h2>
                    <span className="text-[10px] uppercase tracking-widest text-[#D48B80] font-semibold">
                      Undated Serenity Suite · Mindful Daily Rhythm
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-[10px] font-medium text-stone-500">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                        <span key={i} className="w-4 h-4 rounded-full border border-stone-300 flex items-center justify-center">
                          {day}
                        </span>
                      ))}
                    </div>
                    <div className="text-right">
                      <span className="text-stone-400 text-[10px]">Date: </span>
                      <span className="inline-block w-20 border-b border-stone-400" />
                    </div>
                  </div>
                </div>

                {/* Sheet 1: Daily Focus Columns */}
                {activeSheetIndex === 0 && (
                  <div className="flex-1 grid grid-cols-12 gap-4 text-xs">
                    {/* Left Column (5 cols): Hourly Schedule */}
                    <div className="col-span-5 border-r border-[#FAF0EE] pr-3 space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#D48B80] block mb-1">
                        Hourly Schedule
                      </span>
                      {[
                        '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM',
                        '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
                        '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
                      ].map((time) => (
                        <div key={time} className="flex items-center gap-2 text-[10px]">
                          <span className="w-14 text-stone-400 font-mono text-[9px]">{time}</span>
                          <div className="flex-1 border-b border-stone-200 h-3" />
                        </div>
                      ))}
                    </div>

                    {/* Right Column (7 cols): Top Priorities & Gratitude */}
                    <div className="col-span-7 space-y-3 flex flex-col justify-between">
                      {/* Top 3 Priorities */}
                      <div className="bg-[#FAF0EE]/60 border border-[#D48B80]/30 rounded-lg p-2.5 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#D48B80] block">
                          Top 3 Priorities Today
                        </span>
                        {[1, 2, 3].map((num) => (
                          <div key={num} className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-[#D48B80] text-white text-[9px] flex items-center justify-center font-bold">
                              {num}
                            </span>
                            <div className="flex-1 border-b border-stone-300 h-4 bg-white/70 rounded-xs" />
                          </div>
                        ))}
                      </div>

                      {/* Mindful Habit & Water Tracker */}
                      <div className="border border-stone-200 rounded p-2 flex items-center justify-between text-[10px]">
                        <span className="font-medium text-stone-600">Daily Water:</span>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                            <span key={g} className="w-3.5 h-3.5 rounded border border-[#D48B80] text-[#D48B80] flex items-center justify-center text-[8px]">
                              💧
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* To Do Checklist */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                          To-Do Checklist
                        </span>
                        {[1, 2, 3, 4, 5].map((todo) => (
                          <div key={todo} className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-xs border border-stone-300 shrink-0" />
                            <div className="flex-1 border-b border-stone-200 h-3" />
                          </div>
                        ))}
                      </div>

                      {/* Evening Reflection & Gratitude */}
                      <div className="bg-[#FFFDF9] border border-stone-200 rounded p-2.5 space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#70826E] flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#70826E]" />
                          Evening Gratitude & Joy
                        </span>
                        <div className="border-b border-dashed border-stone-300 h-4" />
                        <div className="border-b border-dashed border-stone-300 h-4" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sheet 2: Weekly Spread */}
                {activeSheetIndex === 1 && (
                  <div className="flex-1 grid grid-cols-2 gap-3 text-xs">
                    <div className="border border-stone-200 rounded p-3 space-y-2">
                      <h4 className="font-bold text-[#D48B80] border-b pb-1 text-xs">Weekly Intentions & Milestones</h4>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full border border-stone-300" />
                          <div className="w-full border-b border-dashed border-stone-300 h-3" />
                        </div>
                      ))}
                    </div>
                    <div className="border border-stone-200 rounded p-3 space-y-2">
                      <h4 className="font-bold text-[#70826E] border-b pb-1 text-xs">Weekly Wins & Lessons</h4>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full border border-stone-300" />
                          <div className="w-full border-b border-dashed border-stone-300 h-3" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sheet 3: Monthly Grid */}
                {activeSheetIndex === 2 && (
                  <div className="flex-1 border border-stone-200 rounded p-2 space-y-2">
                    <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-stone-500 bg-[#FAF0EE] py-1 rounded">
                      <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 h-44">
                      {Array.from({ length: 35 }).map((_, idx) => (
                        <div key={idx} className="border border-stone-100 rounded bg-[#FAF8F5]/50 p-1 flex flex-col justify-between">
                          <span className="text-[8px] text-stone-300 font-mono">{idx + 1}</span>
                          <div className="h-1 bg-stone-100 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer notes */}
                <div className="pt-2 border-t border-[#D48B80]/30 flex justify-between items-center text-[9px] text-stone-400">
                  <span>© EDSER Planner Suite · 300 DPI High-Resolution Vector Print</span>
                  <span>Page {activeSheetIndex + 1} of 3</span>
                </div>
              </div>
            )}

            {/* PRODUCT 3: KIDS NATIONAL PARKS ADVENTURE */}
            {product.id === 'my-first-national-parks-adventure' && (
              <div className="flex-1 flex flex-col justify-between space-y-3">
                {/* Header */}
                <div className="border-b-2 border-dashed border-stone-300 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#70826E]" />
                    <div>
                      <h2 className="text-xl sm:text-2xl font-serif font-black tracking-wide text-[#2D2A26]">
                        NATIONAL PARKS JUNIOR EXPLORER
                      </h2>
                      <span className="text-[10px] font-bold text-[#70826E] uppercase tracking-wider">
                        Ages 4–8 · Screen-Free Adventure Series
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-[10px] font-bold text-stone-500 block">PARK RANGER BADGE #24</span>
                  </div>
                </div>

                {/* Sheet 1: Bear & Mountain Coloring Page */}
                {activeSheetIndex === 0 && (
                  <div className="flex-1 border-2 border-stone-800 rounded-lg p-3 flex flex-col items-center justify-between bg-white relative overflow-hidden">
                    {/* Hand-drawn look SVG scene */}
                    <div className="w-full flex justify-between items-center px-4">
                      <span className="text-xs font-serif font-bold text-stone-600">⛰️ YELLOWSTONE ADVENTURE</span>
                      <span className="text-[10px] font-mono border border-stone-400 px-2 py-0.5 rounded">COLOR ME!</span>
                    </div>

                    {/* Vector illustration simulation */}
                    <div className="w-full flex-1 flex flex-col items-center justify-center p-2">
                      <svg viewBox="0 0 400 240" className="w-full max-h-52 stroke-stone-800 fill-none stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
                        {/* Background Mountains */}
                        <path d="M 30 180 L 100 80 L 160 180" />
                        <path d="M 80 110 L 100 80 L 120 110" className="fill-stone-200 stroke-none" />
                        <path d="M 140 180 L 220 50 L 300 180" />
                        <path d="M 200 85 L 220 50 L 240 85" className="fill-stone-200 stroke-none" />
                        <path d="M 270 180 L 330 90 L 380 180" />

                        {/* Pine Trees */}
                        <path d="M 60 180 L 70 140 L 65 140 L 75 120 L 70 120 L 80 100 L 90 120 L 85 120 L 95 140 L 90 140 L 100 180 Z" className="fill-stone-50" />
                        <path d="M 310 180 L 320 140 L 315 140 L 325 120 L 320 120 L 330 100 L 340 120 L 335 120 L 345 140 L 340 140 L 350 180 Z" className="fill-stone-50" />

                        {/* Friendly Ranger Bear */}
                        <circle cx="200" cy="140" r="32" className="fill-stone-100" />
                        {/* Bear Ears */}
                        <circle cx="178" cy="115" r="9" className="fill-stone-100" />
                        <circle cx="222" cy="115" r="9" className="fill-stone-100" />
                        {/* Ranger Hat */}
                        <path d="M 165 118 Q 200 110 235 118" strokeWidth="4" />
                        <path d="M 180 116 L 185 96 L 215 96 L 220 116 Z" className="fill-stone-200" />
                        {/* Face features */}
                        <circle cx="190" cy="135" r="2.5" className="fill-stone-800" />
                        <circle cx="210" cy="135" r="2.5" className="fill-stone-800" />
                        <ellipse cx="200" cy="148" rx="8" ry="5" className="fill-stone-300" />
                        <ellipse cx="200" cy="146" rx="3" ry="2" className="fill-stone-800" />
                        <path d="M 200 148 Q 200 153 196 154" />
                        <path d="M 200 148 Q 200 153 204 154" />

                        {/* River path */}
                        <path d="M 20 220 Q 150 190 200 220 T 380 200" strokeWidth="3" />
                      </svg>
                    </div>

                    <div className="w-full flex justify-between items-center text-[10px] text-stone-500 font-serif border-t border-stone-200 pt-1">
                      <span>Fun Fact: Grizzly bears can run up to 35 miles per hour!</span>
                      <span>Color with crayons, pencils, or markers</span>
                    </div>
                  </div>
                )}

                {/* Sheet 2: Wilderness Maze */}
                {activeSheetIndex === 1 && (
                  <div className="flex-1 border-2 border-stone-800 rounded-lg p-3 bg-white flex flex-col justify-between">
                    <div className="text-center pb-1 border-b">
                      <h4 className="font-bold text-sm font-serif">FOREST TRAIL MAZE</h4>
                      <p className="text-[10px] text-stone-500">Help the Junior Explorer hike back to the tent campsite!</p>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-2">
                      <div className="w-64 h-36 border-2 border-stone-800 grid grid-cols-6 grid-rows-4 gap-1 p-1 bg-stone-50">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div key={i} className={`border border-stone-300 flex items-center justify-center text-[10px] font-bold ${
                            i === 0 ? 'bg-emerald-100 text-emerald-800' : i === 23 ? 'bg-amber-100 text-amber-800' : 'bg-white'
                          }`}>
                            {i === 0 && 'START 🚩'}
                            {i === 23 && 'CAMP ⛺'}
                            {i === 7 && '🌲'}
                            {i === 14 && '🐾'}
                            {i === 16 && '🪨'}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-[9px] text-center text-stone-400">
                      Follow the deer tracks and avoid the boulder slide!
                    </div>
                  </div>
                )}

                {/* Sheet 3: Certificate */}
                {activeSheetIndex === 2 && (
                  <div className="flex-1 border-4 border-double border-[#70826E] rounded-lg p-4 bg-[#FAF8F5] flex flex-col items-center justify-between text-center">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#70826E] tracking-widest uppercase">
                        UNITED STATES WILDERNESS ALLIANCE
                      </span>
                      <h3 className="text-xl font-serif font-black text-[#2D2A26]">
                        JUNIOR EXPLORER CERTIFICATE
                      </h3>
                      <p className="text-[10px] text-stone-500">This official award certifies that</p>
                    </div>

                    <div className="w-3/4 border-b-2 border-stone-800 py-1 my-2">
                      <span className="text-xs text-stone-400 italic">Child's Name</span>
                    </div>

                    <p className="text-[10px] text-stone-600 max-w-sm leading-relaxed">
                      has successfully navigated the wildlife trails, completed all activity challenges, and pledged to protect our natural wonders and wildlife.
                    </p>

                    <div className="w-full flex justify-around items-end pt-3 text-[10px]">
                      <div>
                        <div className="w-24 border-b border-stone-400 mb-1" />
                        <span className="text-stone-400 font-mono text-[9px]">Date</span>
                      </div>
                      <div className="w-12 h-12 rounded-full border-2 border-amber-600 bg-amber-50 flex items-center justify-center text-[10px] font-bold text-amber-800">
                        OFFICIAL<br />SEAL
                      </div>
                      <div>
                        <div className="w-24 border-b border-stone-400 mb-1" />
                        <span className="text-stone-400 font-mono text-[9px]">Head Ranger Signature</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer notes */}
                <div className="pt-1 border-t border-dashed border-stone-300 flex justify-between items-center text-[9px] text-stone-400">
                  <span>© EDSER Screen-Free Activities · Unlimited Home Printing License</span>
                  <span>Sheet {activeSheetIndex + 1} of 3</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Printing Guidance Footer Card */}
      <div className="mt-4 bg-[#EEF2ED]/70 border border-[#D5E0D4] rounded-lg p-3 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#70826E] shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-[#2D2A26]">
          <strong className="font-semibold block text-[#70826E]">
            Recommended Setup for {product.title}:
          </strong>
          <span className="text-stone-600 text-[11px] block">
            <strong>Paper:</strong> {product.printingGuidance.recommendedPaper} · <strong>Printer Settings:</strong> {product.printingGuidance.printerSettings}
          </span>
        </div>
      </div>
    </div>
  );
};
