import React, { useState } from 'react';
import { BookOpen, Sparkles, Check, ArrowRight, ShieldCheck, Layers, Gift, Clock, Truck } from 'lucide-react';
import { BOOK_FORMATS, COVER_MATERIALS, PAPER_FINISHES, formatPriceARS } from '../data/mockData';
import { BookFormatId, CoverMaterial } from '../types';
import { BookSizeScaleComparison } from './BookSizeScaleComparison';
import layflatImg from '../assets/images/layflat_paper_texture_1788109298366.jpg';
import bookbindingImg from '../assets/images/artisan_bookbinding_macro_1788109266332.jpg';
import goldFoilImg from '../assets/images/gold_foil_stamping_1788109282366.jpg';
import archivalBoxImg from '../assets/images/archival_box_luxury_1788109342591.jpg';

interface ProductCatalogProps {
  onSelectFormatToBuild: (formatId: BookFormatId) => void;
  onOpenConcierge: (formatId?: BookFormatId) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onSelectFormatToBuild,
  onOpenConcierge,
}) => {
  const [selectedFormatTab, setSelectedFormatTab] = useState<BookFormatId>('square-30');
  const [activeMaterialCategory, setActiveMaterialCategory] = useState<'all' | 'lino' | 'cuero' | 'terciopelo' | 'fotografica'>('all');

  const currentFmt = BOOK_FORMATS.find((f) => f.id === selectedFormatTab) || BOOK_FORMATS[0];

  const filteredMaterials = activeMaterialCategory === 'all'
    ? COVER_MATERIALS
    : COVER_MATERIALS.filter((m) => m.category === activeMaterialCategory);

  return (
    <section id="catalog" className="py-20 bg-[#FDFCF9] border-b border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold tracking-[0.25em] text-[#8C6D37] uppercase">
            FORMATOS & DIMENSIONES FINE ART
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-5xl text-[#1F1C18] mt-2 mb-4 font-normal">
            Encuentra el tamaño perfecto para tu historia
          </h2>
          <div className="w-16 h-0.5 bg-[#C5A059] mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-[#595248] font-light">
            Desde el colosal Gran Cuadrado 30×30 hasta ediciones apaisadas cinematográficas y pocket para souvenirs. Todos con hojas rígidas y apertura 180° Layflat en auténtico papel químico Fuji.
          </p>
        </div>

        {/* Interactive Real Scale Desk Simulator */}
        <BookSizeScaleComparison
          selectedFormatId={selectedFormatTab}
          onSelectFormat={setSelectedFormatTab}
          onSelectFormatToBuild={onSelectFormatToBuild}
        />

        {/* Format Selector Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {BOOK_FORMATS.map((fmt) => (
            <button
              key={fmt.id}
              type="button"
              onClick={() => setSelectedFormatTab(fmt.id)}
              className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                selectedFormatTab === fmt.id
                  ? 'bg-[#1F1C18] text-[#FDFCF9] shadow-md scale-105'
                  : 'bg-[#F2ECE1] text-[#736B60] hover:bg-[#E8E0D0] hover:text-[#1F1C18]'
              }`}
            >
              {fmt.name} ({fmt.dimensions.split(' ')[0]} cm)
            </button>
          ))}
        </div>

        {/* Spotlight Card for Selected Format */}
        <div className="rounded-3xl border border-[#D6CEBE] bg-[#F4EFE6]/70 p-6 sm:p-10 shadow-lg mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Photo & Realistic Scale Visualizer */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-[#D6CEBE] bg-[#EFE9DE]">
                <img
                  src={
                    selectedFormatTab === 'square-30'
                      ? layflatImg
                      : selectedFormatTab === 'landscape-30-20' || selectedFormatTab === 'landscape-40-30'
                      ? bookbindingImg
                      : selectedFormatTab === 'portrait-20-30'
                      ? goldFoilImg
                      : archivalBoxImg
                  }
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80';
                  }}
                  alt={currentFmt.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-[#1F1C18]/85 text-[#ECC880] px-3 py-1 rounded-full text-[10px] font-mono tracking-wider">
                  DIMENSIONES: {currentFmt.dimensions}
                </div>
                {currentFmt.popular && (
                  <div className="absolute top-3 right-3 bg-[#8C6D37] text-white px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                    MÁS ELEGIDO
                  </div>
                )}
              </div>
            </div>

            {/* Right Details & Direct Customization Action */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold tracking-widest text-[#8C6D37] uppercase block">
                    DETALLES DEL FORMATO
                  </span>
                  <h3 className="font-serif-luxury text-3xl font-bold text-[#1F1C18] mt-1">
                    {currentFmt.name}
                  </h3>
                  <p className="text-sm font-mono text-[#8C6D37] font-semibold mt-1">
                    {currentFmt.dimensions}
                  </p>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] uppercase tracking-wider text-[#736B60] block">Precio Base</span>
                  <span className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1F1C18]">
                    {formatPriceARS(currentFmt.basePrice)} ARS
                  </span>
                </div>
              </div>

              <p className="text-sm text-[#595248] leading-relaxed">
                {currentFmt.description}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 rounded-2xl border border-[#D6CEBE] bg-[#FDFCF9] p-4 text-xs">
                <div>
                  <span className="text-[#736B60] block mb-0.5">Páginas incluidas:</span>
                  <strong className="text-[#1F1C18]">{currentFmt.basePages} páginas rígidas (10 pliegos)</strong>
                </div>
                <div>
                  <span className="text-[#736B60] block mb-0.5">Fotos recomendadas:</span>
                  <strong className="text-[#1F1C18]">{currentFmt.idealPhotos}</strong>
                </div>
                <div>
                  <span className="text-[#736B60] block mb-0.5">Pliego adicional (+2 pág):</span>
                  <strong className="text-[#1F1C18]">+{formatPriceARS(currentFmt.extraSpreadPrice)} ARS</strong>
                </div>
                <div>
                  <span className="text-[#736B60] block mb-0.5">Apertura:</span>
                  <strong className="text-[#1F1C18]">100% Plana Layflat 180°</strong>
                </div>
              </div>

              {/* Production & Logistics Highlights */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#736B60] pt-1">
                <span className="flex items-center gap-1.5 font-medium text-[#1F1C18]">
                  <Clock className="w-3.5 h-3.5 text-[#8C6D37]" />
                  Producción: 4 a 6 días hábiles
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[#1F1C18]">
                  <Truck className="w-3.5 h-3.5 text-[#8C6D37]" />
                  Entrega sin cargo en Pilar (radio 20 km)
                </span>
              </div>

              {/* Dual Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onSelectFormatToBuild(currentFmt.id)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#1F1C18] text-[#FDFCF9] text-xs uppercase tracking-wider font-bold hover:bg-[#3D352E] flex items-center justify-center gap-2 shadow-md"
                >
                  <BookOpen className="w-4 h-4 text-[#ECC880]" />
                  <span>Diseñar en este Formato</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenConcierge(currentFmt.id)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-[#8C6D37] bg-[#FDFCF9] text-[#1F1C18] text-xs uppercase tracking-wider font-semibold hover:bg-[#EFE9DE] flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#8C6D37]" />
                  <span>Pedir que HALO lo Diseñe</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Materials Swatches Showcase */}
        <div className="rounded-3xl border border-[#D6CEBE] bg-[#FDFCF9] p-8 sm:p-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold tracking-widest text-[#8C6D37] uppercase">
              CATÁLOGO DE TAPAS & TEXTURAS
            </span>
            <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#1F1C18] mt-1">
              Linos Puros, Cueros Artisan & Terciopelos Italianos
            </h3>
            <p className="text-xs sm:text-sm text-[#595248] mt-2">
              Explora nuestra paleta completa de telas y cueros con grabado Hot Stamping en relieve térmico de oro, bronce o plata.
            </p>

            {/* Material Category Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {[
                { id: 'all', label: 'Todos los Materiales' },
                { id: 'lino', label: 'Linos Naturales' },
                { id: 'cuero', label: 'Cueros Artisan' },
                { id: 'terciopelo', label: 'Terciopelos' },
                { id: 'fotografica', label: 'Tapa Fotográfica' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveMaterialCategory(cat.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                    activeMaterialCategory === cat.id
                      ? 'bg-[#8C6D37] text-white shadow-sm font-semibold'
                      : 'bg-[#F4EFE6] text-[#736B60] hover:bg-[#E8E2D5]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMaterials.map((cov) => (
              <div 
                key={cov.id} 
                className="group rounded-2xl border border-[#D6CEBE] bg-[#F4EFE6]/40 p-4 text-center space-y-2 hover:bg-[#F4EFE6] transition-colors"
              >
                <div
                  className="w-12 h-12 rounded-full border border-black/15 mx-auto shadow-inner group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: cov.colorHex }}
                />
                <h4 className="font-serif-luxury text-sm font-bold text-[#1F1C18]">{cov.name}</h4>
                <p className="text-[11px] text-[#595248] leading-tight">{cov.description}</p>
                {cov.priceDelta > 0 && (
                  <span className="inline-block text-[10px] font-mono text-[#8C6D37] font-semibold">
                    +{formatPriceARS(cov.priceDelta)} ARS
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
