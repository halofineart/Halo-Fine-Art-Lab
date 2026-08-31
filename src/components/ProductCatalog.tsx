import React from 'react';
import { BookFormatId } from '../types';
import { formatPriceARS } from '../data/mockData';
import layflatSpreadImg from '../assets/images/layflat_paper_texture_1788109298366.jpg';
import greenLandscapeImg from '../assets/images/artisan_bookbinding_macro_1788109266332.jpg';
import pocketMiniImg from '../assets/images/archival_box_luxury_1788109342591.jpg';
import linenMacroImg from '../assets/images/linen_swatches_box_1788109313568.jpg';
import pressMacroImg from '../assets/images/gold_foil_stamping_1788109282366.jpg';
import { CheckCircle2 } from 'lucide-react';

interface ProductCatalogProps {
  onSelectFormatToBuild: (formatId: BookFormatId) => void;
  onOpenConcierge: (formatId?: BookFormatId) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onSelectFormatToBuild,
  onOpenConcierge,
}) => {
  return (
    <div id="catalog" className="bg-[#FAF8F5]">
      
      {/* 1. Formatos & Dimensiones (Section matching Stitch) */}
      <section className="py-24 border-b border-[#E8E2D5]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-medium tracking-[0.25em] text-[#8C8275] uppercase block mb-2">
              FORMATOS & DIMENSIONES
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-5xl text-[#1F1C18] font-normal leading-tight">
              Encuentra el tamaño perfecto para tu historia
            </h2>
            <p className="text-xs sm:text-sm text-[#736B60] font-light mt-3">
              Ediciones apaisadas, cinematográficas y pocket para souvenirs. Todos con hojas rígidas y apertura 180° Layflat.
            </p>
          </div>

          {/* Asymmetric Showcase Grid from the mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Big Card (Featured): Gran Cuadrado Fine Art (Col 7) */}
            <div className="lg:col-span-7 bg-[#FDFCF9] border border-[#E8E2D5] p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div>
                {/* Photo of Open Book with Couple */}
                <div className="aspect-[16/10] overflow-hidden bg-[#EAE5D9] mb-8 border border-[#E8E2D5]/60">
                  <img
                    src={layflatSpreadImg}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80';
                    }}
                    alt="Gran Cuadrado Fine Art 30x30 cm"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <span className="inline-block text-[9px] uppercase tracking-[0.16em] text-[#736B60] bg-[#FAF8F5] border border-[#E8E2D5] px-2.5 py-0.5 rounded-none font-medium mb-3">
                  El más elegido
                </span>

                <h3 className="font-serif-luxury text-3xl sm:text-4xl text-[#1F1C18] font-normal">
                  Gran Cuadrado Fine Art
                </h3>
                <p className="text-xs text-[#8C8275] font-mono mt-1">
                  30 x 30 cm | 40 a 120 fotos
                </p>

                <p className="text-xs sm:text-sm text-[#736B60] font-light leading-relaxed mt-4">
                  El formato insignia y más solicitado para bodas, aniversarios y grandes hitos de vida. Presencia imponente y fotos panorámicas espectaculares.
                </p>

                <div className="mt-6">
                  <span className="text-[10px] text-[#A89F91] uppercase tracking-wider block">Precio desde</span>
                  <span className="font-serif-luxury text-2xl font-bold text-[#1F1C18]">
                    {formatPriceARS(145000)} ARS
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => onSelectFormatToBuild('square-30')}
                  className="w-full py-3.5 bg-[#1F1C18] hover:bg-[#3D352E] text-[#FDFCF9] text-xs uppercase tracking-[0.18em] font-semibold transition-all text-center cursor-pointer"
                >
                  Ver Detalles
                </button>
              </div>
            </div>

            {/* Right Column: Clásico Apaisado + Pocket Souvenir (Col 5) */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Card 2: Clásico Apaisado */}
              <div className="bg-[#FDFCF9] border border-[#E8E2D5] p-6 sm:p-7 shadow-xs">
                <div className="aspect-[16/9] overflow-hidden bg-[#EAE5D9] mb-5 border border-[#E8E2D5]/60">
                  <img
                    src={greenLandscapeImg}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80';
                    }}
                    alt="Clásico Apaisado Verde Oliva"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <h3 className="font-serif-luxury text-2xl text-[#1F1C18] font-normal">
                  Clásico Apaisado
                </h3>
                <p className="text-[11px] text-[#8C8275] font-mono mt-0.5">
                  28 x 21 cm | 30 a 80 fotos
                </p>
                <p className="text-xs text-[#736B60] font-light leading-relaxed mt-2">
                  Ideal para fotografía de viajes y paisajes. Formato cinematográfico.
                </p>

                <button
                  type="button"
                  onClick={() => onSelectFormatToBuild('landscape-30-20')}
                  className="mt-5 w-full py-2.5 border border-[#D6CEBE] hover:bg-[#FAF8F5] text-[#1F1C18] text-[11px] uppercase tracking-[0.18em] font-medium transition-all text-center cursor-pointer"
                >
                  Explorar
                </button>
              </div>

              {/* Card 3: Pocket Souvenir */}
              <div className="bg-[#FDFCF9] border border-[#E8E2D5] p-6 sm:p-7 shadow-xs">
                <div className="aspect-[16/9] overflow-hidden bg-[#EAE5D9] mb-5 border border-[#E8E2D5]/60">
                  <img
                    src={pocketMiniImg}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80';
                    }}
                    alt="Pocket Souvenir en manos"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <h3 className="font-serif-luxury text-2xl text-[#1F1C18] font-normal">
                  Pocket Souvenir
                </h3>
                <p className="text-[11px] text-[#8C8275] font-mono mt-0.5">
                  15 x 15 cm | 20 a 50 fotos
                </p>
                <p className="text-xs text-[#736B60] font-light leading-relaxed mt-2">
                  Perfecto para regalar a abuelos o padrinos. Compacto pero premium.
                </p>

                <button
                  type="button"
                  onClick={() => onSelectFormatToBuild('square-15')}
                  className="mt-5 w-full py-2.5 border border-[#D6CEBE] hover:bg-[#FAF8F5] text-[#1F1C18] text-[11px] uppercase tracking-[0.18em] font-medium transition-all text-center cursor-pointer"
                >
                  Explorar
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 2. Materiales Nobles (Dark Contrast Section matching Stitch) */}
      <section id="quality" className="py-24 bg-[#262422] text-[#FDFCF9] border-b border-[#3D352E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Narrative Text (Col 6) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-2 text-[10px] tracking-[0.25em] text-[#C5A059] uppercase font-medium">
                <span>✦</span>
                <span>CALIDAD DE ARCHIVO</span>
              </div>

              <h2 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl text-[#FDFCF9] font-normal leading-[1.12]">
                Materiales nobles para historias que trascienden.
              </h2>

              <p className="text-xs sm:text-sm text-[#A89F91] font-light leading-relaxed max-w-xl">
                Cada ejemplar es una pieza de arte irrepetible. Desde el corte milimétrico del bloque de páginas hasta el grabado térmico de la tipografía, ensamblamos cada fotolibro a mano en nuestro laboratorio en Pilar.
              </p>

              {/* 3 Pillars with Checkmarks */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-4 h-4 text-[#ECC880] mt-1 shrink-0" />
                  <div>
                    <h4 className="text-sm font-serif-luxury font-medium text-[#FDFCF9]">
                      Papel Fotográfico Químico Layflat
                    </h4>
                    <p className="text-xs text-[#A89F91] font-light mt-0.5">
                      Hojas rígidas de 650 g/m² con alma central. Tono continuo sin trama de puntos para negros puros.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-4 h-4 text-[#ECC880] mt-1 shrink-0" />
                  <div>
                    <h4 className="text-sm font-serif-luxury font-medium text-[#FDFCF9]">
                      Linos Puros y Cueros Italianos
                    </h4>
                    <p className="text-xs text-[#A89F91] font-light mt-0.5">
                      Telas naturales y cueros genuinos de primera selección para una experiencia táctil inigualable.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-4 h-4 text-[#ECC880] mt-1 shrink-0" />
                  <div>
                    <h4 className="text-sm font-serif-luxury font-medium text-[#FDFCF9]">
                      Hot Stamping en Oro
                    </h4>
                    <p className="text-xs text-[#A89F91] font-light mt-0.5">
                      Grabado artesanal térmico en bajorrelieve para títulos y monogramas en la tapa.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Photo Mosaic (Col 6) */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              
              {/* Image 1: Linen Fabric Macro */}
              <div className="aspect-[4/5] overflow-hidden bg-[#1A1816] rounded-none border border-white/10">
                <img
                  src={linenMacroImg}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80';
                  }}
                  alt="Textura de lino crudo artesanal"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Stacked Images Column */}
              <div className="space-y-4">
                <div className="aspect-[4/3] overflow-hidden bg-[#1A1816] rounded-none border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80"
                    alt="Libros apilados en lino blanco"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="aspect-[4/3] overflow-hidden bg-[#1A1816] rounded-none border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80"
                    alt="Libro abierto sobre mesa junto a ventana"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Bottom Image 3: Hand Press */}
              <div className="col-span-2 aspect-[16/9] overflow-hidden bg-[#1A1816] rounded-none border border-white/10">
                <img
                  src={pressMacroImg}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1000&q=80';
                  }}
                  alt="Prensa manual de encuadernación en taller"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
};

