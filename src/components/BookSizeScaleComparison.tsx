import React, { useState } from 'react';
import { 
  Maximize2, 
  Layers, 
  Eye, 
  Sparkles, 
  Check, 
  Ruler, 
  BookOpen, 
  Compass, 
  Info,
  ArrowRight,
  MoveHorizontal
} from 'lucide-react';
import { BOOK_FORMATS, formatPriceARS } from '../data/mockData';
import { BookFormatId } from '../types';

interface BookSizeScaleComparisonProps {
  selectedFormatId: BookFormatId;
  onSelectFormat: (formatId: BookFormatId) => void;
  onSelectFormatToBuild: (formatId: BookFormatId) => void;
}

type ViewMode = 'desk_scene' | 'layered_overlay' | 'spread_open';
type ReferenceObject = 'smartphone' | 'coffee_cup' | 'laptop_13' | 'hands';

interface ScaleFormatInfo {
  id: BookFormatId;
  widthCm: number;
  heightCm: number;
  openWidthCm: number;
  aspectRatioLabel: string;
  weightGrams: number;
  spineThicknessMm: number;
  bestFor: string;
  colorBg: string;
  coverTexture: string;
  borderColor: string;
}

const SCALE_SPECS: Record<BookFormatId, ScaleFormatInfo> = {
  'square-30': {
    id: 'square-30',
    widthCm: 30,
    heightCm: 30,
    openWidthCm: 60,
    aspectRatioLabel: '1:1 Cuadrado Clásico',
    weightGrams: 1450,
    spineThicknessMm: 18,
    bestFor: 'Bodas, Quinceañeras, Anuarios Familiares y Retratos',
    colorBg: 'bg-[#2A2621]',
    coverTexture: 'Lino Natural Marfil / Hot Stamping Dorado',
    borderColor: 'border-[#C5A059]',
  },
  'landscape-30-20': {
    id: 'landscape-30-20',
    widthCm: 30,
    heightCm: 20,
    openWidthCm: 60,
    aspectRatioLabel: '3:2 Paisaje Clásico',
    weightGrams: 1100,
    spineThicknessMm: 16,
    bestFor: 'Viajes, Paisajes, Escapadas y Fotografía de Naturaleza',
    colorBg: 'bg-[#1D252C]',
    coverTexture: 'Lino Azul Noche / Foil Plata',
    borderColor: 'border-[#8B9EB7]',
  },
  'landscape-40-30': {
    id: 'landscape-40-30',
    widthCm: 40,
    heightCm: 30,
    openWidthCm: 80,
    aspectRatioLabel: '4:3 Coffee Table XXL',
    weightGrams: 2350,
    spineThicknessMm: 22,
    bestFor: 'Grandes Obras, Portafolios Fine Art y Bodas de Lujo',
    colorBg: 'bg-[#1C1A18]',
    coverTexture: 'Cuero Genuino Cognac / Grabado Bajo Relieve',
    borderColor: 'border-[#ECC880]',
  },
  'portrait-20-30': {
    id: 'portrait-20-30',
    widthCm: 20,
    heightCm: 30,
    openWidthCm: 40,
    aspectRatioLabel: '2:3 Vertical Editorial',
    weightGrams: 1050,
    spineThicknessMm: 15,
    bestFor: 'Moda, Sesiones de Estudio, Book Infantil & Retratos',
    colorBg: 'bg-[#2B2320]',
    coverTexture: 'Terciopelo Burdeos / Stamping Oro',
    borderColor: 'border-[#C48B71]',
  },
  'square-20': {
    id: 'square-20',
    widthCm: 20,
    heightCm: 20,
    openWidthCm: 40,
    aspectRatioLabel: '1:1 Cuadrado Mediano',
    weightGrams: 780,
    spineThicknessMm: 14,
    bestFor: 'Cumpleaños, Viajes Íntimos, Anuarios y Regalos Especiales',
    colorBg: 'bg-[#26231F]',
    coverTexture: 'Lino Arena / Hot Stamping Rose Gold',
    borderColor: 'border-[#C5A059]',
  },
  'square-15': {
    id: 'square-15',
    widthCm: 15,
    heightCm: 15,
    openWidthCm: 30,
    aspectRatioLabel: '1:1 Pocket Souvenir',
    weightGrams: 420,
    spineThicknessMm: 12,
    bestFor: 'Réplicas para Padres/Abuelos, Bautismos y Minibooks',
    colorBg: 'bg-[#35322D]',
    coverTexture: 'Lino Crudo / Tapa Dura',
    borderColor: 'border-[#A39B8F]',
  },
};

export const BookSizeScaleComparison: React.FC<BookSizeScaleComparisonProps> = ({
  selectedFormatId,
  onSelectFormat,
  onSelectFormatToBuild,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('desk_scene');
  const [showRefObjects, setShowRefObjects] = useState(true);
  const [activeReference, setActiveReference] = useState<ReferenceObject>('smartphone');
  const [isHoveringFormat, setIsHoveringFormat] = useState<BookFormatId | null>(null);

  const activeFormatInfo = SCALE_SPECS[selectedFormatId] || SCALE_SPECS['square-30'];
  const formatData = BOOK_FORMATS.find(f => f.id === selectedFormatId) || BOOK_FORMATS[0];

  // Base scale ratio in pixels per cm for desk visualization (scaled down to fit UI container)
  // Max width of desk canvas ~ 700px. 40cm * 10 = 400px; 80cm open spread = ~560px.
  const pxPerCm = viewMode === 'spread_open' ? 6.5 : 8.5;

  return (
    <div className="rounded-3xl border border-[#D6CEBE] bg-[#FAF8F5] overflow-hidden shadow-xl mb-16">
      
      {/* Header Bar */}
      <div className="bg-[#1F1C18] text-[#FDFCF9] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3D352E]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#8C6D37]/30 text-[#ECC880] border border-[#ECC880]/30 flex items-center gap-1">
              <Ruler className="w-3 h-3" />
              Simulador Óptico 1:1
            </span>
            <span className="text-xs text-[#A69C8D]">Calibración de escala física</span>
          </div>
          <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#FDFCF9]">
            Comparativa de Tamaños a Escala Real
          </h3>
          <p className="text-xs sm:text-sm text-[#D6CEBE] mt-1 font-light max-w-xl">
            Visualiza y compara las proporciones exactas de cada fotolibro sobre una superficie de escritorio real junto a objetos cotidianos.
          </p>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-[#2C2723] rounded-xl border border-white/10 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('desk_scene')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'desk_scene'
                ? 'bg-[#8C6D37] text-white shadow-xs'
                : 'text-[#D6CEBE] hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Escritorio Real</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('layered_overlay')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'layered_overlay'
                ? 'bg-[#8C6D37] text-white shadow-xs'
                : 'text-[#D6CEBE] hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Superposición Apilada</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('spread_open')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'spread_open'
                ? 'bg-[#8C6D37] text-white shadow-xs'
                : 'text-[#D6CEBE] hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Abierto 180° Layflat</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left / Center: Interactive Real-Scale Canvas (Col 8) */}
        <div className="lg:col-span-8 p-6 sm:p-10 flex flex-col justify-between relative bg-radial from-[#F4EFE6] to-[#EAE2D2] min-h-[460px] overflow-hidden border-b lg:border-b-0 lg:border-r border-[#D6CEBE]">
          
          {/* Surface Texture & Reference Objects Controls */}
          <div className="flex items-center justify-between z-10 mb-4">
            <div className="flex items-center gap-2 text-xs text-[#736B60]">
              <span className="font-semibold text-[#1F1C18]">Referencia visual:</span>
              <div className="flex items-center gap-1">
                {[
                  { id: 'smartphone', label: '📱 iPhone 15 Pro (14.6 cm)' },
                  { id: 'coffee_cup', label: '☕ Taza de Cerámica (8.5 cm)' },
                  { id: 'laptop_13', label: '💻 MacBook 13" (30.4 cm)' },
                ].map((ref) => (
                  <button
                    key={ref.id}
                    type="button"
                    onClick={() => {
                      setActiveReference(ref.id as ReferenceObject);
                      setShowRefObjects(true);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      showRefObjects && activeReference === ref.id
                        ? 'bg-[#1F1C18] text-[#ECC880] shadow-xs'
                        : 'bg-[#FDFCF9] text-[#736B60] hover:bg-[#E8E2D5] border border-[#D6CEBE]'
                    }`}
                  >
                    {ref.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRefObjects(!showRefObjects)}
              className="text-[11px] font-semibold text-[#8C6D37] hover:underline"
            >
              {showRefObjects ? 'Ocultar referencias' : 'Mostrar referencias'}
            </button>
          </div>

          {/* DESK STAGE CANVAS */}
          <div className="flex-1 flex items-center justify-center relative my-4 py-8">
            
            {/* Subtle Desk Ruler & Grid Background */}
            <div className="absolute inset-0 border border-dashed border-[#C5BBAA]/50 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
              <div className="flex justify-between text-[9px] font-mono text-[#A39B8F]">
                <span>0 cm</span>
                <span>20 cm</span>
                <span>40 cm</span>
                <span>60 cm</span>
                <span>80 cm</span>
              </div>
              <div className="text-center text-[10px] font-serif-luxury italic text-[#A39B8F]/70 tracking-widest uppercase">
                Superficie de Escritorio Fine Art · Pilar Lab
              </div>
              <div className="flex justify-between text-[9px] font-mono text-[#A39B8F]">
                <span>Escala Proporcional 1:1</span>
                <span>Apertura 180° Layflat</span>
              </div>
            </div>

            {/* 1. DESK SCENE MODE (Selected Book on Desk with Reference Object) */}
            {viewMode === 'desk_scene' && (
              <div className="relative flex items-end justify-center gap-8 z-10">
                {/* Active Book representation */}
                <div
                  style={{
                    width: `${activeFormatInfo.widthCm * pxPerCm}px`,
                    height: `${activeFormatInfo.heightCm * pxPerCm}px`,
                  }}
                  className={`relative rounded-sm shadow-2xl transition-all duration-500 border-2 ${activeFormatInfo.borderColor} flex flex-col justify-between p-3.5 overflow-hidden group cursor-pointer ${activeFormatInfo.colorBg}`}
                >
                  {/* Embossed Luxury Book Spine Effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 via-black/10 to-transparent pointer-events-none" />
                  
                  {/* Subtle Book Cover Texture & Gold Foil Stamping */}
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#ECC880] opacity-90">
                      HALO · Fine Art
                    </span>
                    <span className="text-[10px] font-mono text-white/70">
                      {activeFormatInfo.widthCm}×{activeFormatInfo.heightCm} cm
                    </span>
                  </div>

                  <div className="text-center my-auto px-2">
                    <h4 className="font-serif-luxury text-sm sm:text-base font-bold text-[#FDFCF9] tracking-wider drop-shadow-xs">
                      {formatData.name.toUpperCase()}
                    </h4>
                    <p className="text-[9px] text-[#ECC880] tracking-widest uppercase mt-0.5">
                      {activeFormatInfo.aspectRatioLabel}
                    </p>
                  </div>

                  <div className="flex justify-between items-end text-[9px] text-white/60 font-mono">
                    <span>{activeFormatInfo.weightGrams}g</span>
                    <span className="text-[#ECC880]">180° Layflat</span>
                  </div>

                  {/* Dimension overlay tags */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#1F1C18] text-[#ECC880] px-2 py-0.5 rounded text-[9px] font-mono shadow-xs">
                    Ancho: {activeFormatInfo.widthCm} cm
                  </div>
                  <div className="absolute -right-7 top-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap bg-[#1F1C18] text-[#ECC880] px-2 py-0.5 rounded text-[9px] font-mono shadow-xs">
                    Alto: {activeFormatInfo.heightCm} cm
                  </div>
                </div>

                {/* Reference Object beside the book */}
                {showRefObjects && (
                  <div className="flex flex-col items-center justify-end pb-1 animate-fade-in transition-all">
                    {activeReference === 'smartphone' && (
                      <div 
                        style={{
                          width: `${7.1 * pxPerCm}px`,
                          height: `${14.6 * pxPerCm}px`,
                        }}
                        className="bg-[#1A1A1A] rounded-xl border border-[#444] shadow-lg p-1.5 flex flex-col justify-between relative overflow-hidden"
                      >
                        {/* Dynamic Island */}
                        <div className="w-4 h-1 bg-black rounded-full mx-auto" />
                        <div className="text-center text-[7px] text-zinc-400 font-mono">iPhone 15 Pro</div>
                        <div className="w-6 h-0.5 bg-zinc-600 rounded-full mx-auto" />
                        <div className="absolute -bottom-5 text-[8px] font-mono text-[#736B60] whitespace-nowrap">
                          14.6 cm
                        </div>
                      </div>
                    )}

                    {activeReference === 'coffee_cup' && (
                      <div 
                        style={{
                          width: `${8.5 * pxPerCm}px`,
                          height: `${9.5 * pxPerCm}px`,
                        }}
                        className="bg-[#EAE5D9] rounded-b-2xl rounded-t-sm border border-[#A69C8D] shadow-md relative flex items-center justify-center"
                      >
                        {/* Handle */}
                        <div className="absolute -right-3 top-2 w-3 h-5 border-2 border-[#A69C8D] rounded-r-full" />
                        <span className="text-[8px] text-[#736B60] font-serif-luxury italic">Taza Café</span>
                        <div className="absolute -bottom-5 text-[8px] font-mono text-[#736B60] whitespace-nowrap">
                          9.5 cm
                        </div>
                      </div>
                    )}

                    {activeReference === 'laptop_13' && (
                      <div 
                        style={{
                          width: `${30.4 * pxPerCm}px`,
                          height: `${21.2 * pxPerCm}px`,
                        }}
                        className="bg-[#C8C8CC] rounded-lg border border-[#999] shadow-xl p-2 flex flex-col justify-between relative"
                      >
                        <div className="w-full h-full bg-[#111] rounded p-1 flex items-center justify-center">
                          <span className="text-[8px] text-zinc-400 font-mono">MacBook 13"</span>
                        </div>
                        <div className="absolute -bottom-5 text-[8px] font-mono text-[#736B60] whitespace-nowrap">
                          30.4 × 21.2 cm
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. LAYERED OVERLAY MODE (All sizes nested together to see relative proportions) */}
            {viewMode === 'layered_overlay' && (
              <div className="relative flex items-center justify-center z-10 w-full min-h-[300px]">
                {BOOK_FORMATS.map((fmt, idx) => {
                  const spec = SCALE_SPECS[fmt.id];
                  const isSelected = fmt.id === selectedFormatId;
                  const isHovered = fmt.id === isHoveringFormat;

                  return (
                    <div
                      key={fmt.id}
                      onClick={() => onSelectFormat(fmt.id)}
                      onMouseEnter={() => setIsHoveringFormat(fmt.id)}
                      onMouseLeave={() => setIsHoveringFormat(null)}
                      style={{
                        width: `${spec.widthCm * pxPerCm}px`,
                        height: `${spec.heightCm * pxPerCm}px`,
                        zIndex: 10 + (5 - idx),
                      }}
                      className={`absolute rounded-sm transition-all duration-300 cursor-pointer flex items-end p-2.5 border-2 ${
                        isSelected
                          ? `${spec.borderColor} shadow-2xl scale-102 ring-4 ring-[#8C6D37]/30 bg-opacity-95`
                          : isHovered
                          ? 'border-white shadow-xl scale-101'
                          : 'border-white/40 shadow-md hover:border-white'
                      } ${spec.colorBg}`}
                    >
                      <div className="flex items-center justify-between w-full text-[10px] font-bold text-white drop-shadow-xs">
                        <span className="font-serif-luxury tracking-wide">{fmt.name}</span>
                        <span className="font-mono text-[#ECC880]">{spec.widthCm}×{spec.heightCm} cm</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. SPREAD OPEN 180° LAYFLAT MODE (Panoramic View) */}
            {viewMode === 'spread_open' && (
              <div className="relative flex flex-col items-center justify-center z-10">
                <div
                  style={{
                    width: `${activeFormatInfo.openWidthCm * pxPerCm}px`,
                    height: `${activeFormatInfo.heightCm * pxPerCm}px`,
                  }}
                  className="relative rounded-sm shadow-2xl border-2 border-[#D6CEBE] bg-[#FDFCF9] flex overflow-hidden group"
                >
                  {/* Left Page */}
                  <div className="w-1/2 h-full border-r border-[#E8E2D5] p-4 flex flex-col justify-between bg-gradient-to-r from-[#F7F3EB] to-[#FAF8F5]">
                    <span className="text-[9px] uppercase font-mono text-[#736B60]">
                      Página Izquierda (Pág. 12)
                    </span>
                    <div className="text-center">
                      <span className="font-serif-luxury text-sm font-bold text-[#1F1C18] block">
                        Fotografía a Plena Página
                      </span>
                      <span className="text-[9px] text-[#8C6D37] font-mono">
                        {activeFormatInfo.widthCm} × {activeFormatInfo.heightCm} cm
                      </span>
                    </div>
                    <span className="text-[8px] text-[#A69C8D]">Papel Químico Fuji Lustre 400g</span>
                  </div>

                  {/* Continuous Seamless Layflat Crease (No gutter loss) */}
                  <div className="w-[2px] h-full bg-gradient-to-b from-[#D6CEBE]/70 via-[#C5A059]/40 to-[#D6CEBE]/70 shadow-xs" />

                  {/* Right Page */}
                  <div className="w-1/2 h-full p-4 flex flex-col justify-between bg-gradient-to-l from-[#F7F3EB] to-[#FAF8F5]">
                    <span className="text-[9px] uppercase font-mono text-[#736B60] text-right">
                      Página Derecha (Pág. 13)
                    </span>
                    <div className="text-center">
                      <span className="font-serif-luxury text-sm font-bold text-[#1F1C18] block">
                        Apertura Continua 180°
                      </span>
                      <span className="text-[9px] text-emerald-700 font-semibold">
                        Cero pérdida de imagen en el pliegue central
                      </span>
                    </div>
                    <span className="text-[8px] text-[#A69C8D] text-right">Pliego Panorámico Completo</span>
                  </div>

                  {/* Top Panoramic Badge */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#1F1C18] text-[#ECC880] px-3 py-0.5 rounded-full text-[9px] font-mono shadow-xs">
                    Pliego Abierto Total: {activeFormatInfo.openWidthCm} cm × {activeFormatInfo.heightCm} cm
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-[#595248]">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>
                    El formato <strong>{formatData.name}</strong> abierto alcanza <strong>{activeFormatInfo.openWidthCm} cm de impacto visual continuo</strong>.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Format Selector Pills inside Simulator */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-[#E8E2D5]">
            {BOOK_FORMATS.map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => onSelectFormat(fmt.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  selectedFormatId === fmt.id
                    ? 'bg-[#8C6D37] text-white shadow-xs scale-105'
                    : 'bg-[#FDFCF9] text-[#736B60] hover:bg-[#EFE9DE] border border-[#D6CEBE]'
                }`}
              >
                <span>{fmt.name}</span>
                <span className="font-mono text-[10px] opacity-80">({fmt.dimensions.split(' ')[0]} cm)</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Detailed Format Anatomy & Decision Guide (Col 4) */}
        <div className="lg:col-span-4 p-6 sm:p-8 bg-[#FDFCF9] flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C6D37] block">
                ANÁLISIS DE FORMATO SELECCIONADO
              </span>
              <h4 className="font-serif-luxury text-2xl font-bold text-[#1F1C18] mt-1">
                {formatData.name}
              </h4>
              <p className="text-xs text-[#736B60] font-mono mt-0.5">
                Cerrado: {activeFormatInfo.widthCm}×{activeFormatInfo.heightCm} cm · Abierto: {activeFormatInfo.openWidthCm}×{activeFormatInfo.heightCm} cm
              </p>
            </div>

            {/* Price Badge */}
            <div className="p-3.5 rounded-2xl bg-[#F7F3EB] border border-[#E8E2D5] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#736B60] block">Precio Base (20 pág)</span>
                <span className="font-serif-luxury text-xl font-bold text-[#1F1C18]">
                  {formatPriceARS(formatData.basePrice)} ARS
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-[#736B60] block">Pliego Extra (+2 pág)</span>
                <span className="font-mono text-xs font-bold text-[#8C6D37]">
                  +{formatPriceARS(formatData.extraSpreadPrice)} ARS
                </span>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D5]">
                <span className="text-[#736B60] flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-[#8C6D37]" /> Proporción Óptica:
                </span>
                <strong className="text-[#1F1C18]">{activeFormatInfo.aspectRatioLabel}</strong>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D5]">
                <span className="text-[#736B60] flex items-center gap-1.5">
                  <MoveHorizontal className="w-3.5 h-3.5 text-[#8C6D37]" /> Ancho Panorámico Abierto:
                </span>
                <strong className="text-[#1F1C18]">{activeFormatInfo.openWidthCm} cm Layflat</strong>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D5]">
                <span className="text-[#736B60] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#8C6D37]" /> Grosor Lomo / Peso:
                </span>
                <strong className="text-[#1F1C18]">{activeFormatInfo.spineThicknessMm} mm · {activeFormatInfo.weightGrams}g</strong>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D5]">
                <span className="text-[#736B60] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#8C6D37]" /> Capacidad Fotos Recomendada:
                </span>
                <strong className="text-[#1F1C18]">{formatData.idealPhotos}</strong>
              </div>
            </div>

            {/* Ideal Use Recommendation */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#D6CEBE] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#8C6D37] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#C5A059]" /> Recomendado especialmente para:
              </span>
              <p className="text-xs text-[#595248] font-medium leading-relaxed">
                {activeFormatInfo.bestFor}
              </p>
            </div>
          </div>

          {/* Direct Actions */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => onSelectFormatToBuild(selectedFormatId)}
              className="w-full py-3.5 rounded-xl bg-[#1F1C18] hover:bg-[#3D352E] text-[#FDFCF9] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <span>Elegir este Tamaño y Diseñar</span>
              <ArrowRight className="w-4 h-4 text-[#ECC880]" />
            </button>
            <p className="text-[10px] text-center text-[#736B60]">
              Incluye caja archivadora rígida de conservación y envío gratis en Pilar.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
