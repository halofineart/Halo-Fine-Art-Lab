import React from 'react';
import { PenTool } from 'lucide-react';
import linenSwatchesImg from '../assets/images/linen_swatches_box_1788109313568.jpg';

interface StorytellingBannerProps {
  onOpenBuilder: () => void;
  onOpenConcierge: () => void;
}

export const StorytellingBanner: React.FC<StorytellingBannerProps> = ({
  onOpenBuilder,
  onOpenConcierge,
}) => {
  return (
    <section className="py-24 bg-[#1F1C18] text-[#FDFCF9] border-b border-[#3D352E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Narrative Text */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[10px] font-medium tracking-[0.25em] text-[#C5A059] uppercase block">
              EL VALOR DE LO TANGIBLE
            </span>

            <h2 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.12] text-[#FDFCF9]">
              ¿Cuántas fotos tenés guardadas y nunca volvés a mirar?
            </h2>

            <p className="font-serif-luxury text-xl sm:text-2xl text-[#C7BFA8] italic font-light">
              Transformalas en algo que puedas volver a vivir.
            </p>

            <p className="text-xs sm:text-sm text-[#A89F91] font-light leading-relaxed max-w-xl">
              Pequeños momentos. Grandes recuerdos. Fotolibros hechos para durar y emocionar siempre. No dejes que las imágenes más importantes de tu vida queden sepultadas en la nube o en la memoria del teléfono.
            </p>

            {/* Micro Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-[#E8E2D5] font-light">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ECC880]" />
                <span>Apertura Layflat 180° sin cortes</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ECC880]" />
                <span>Papel químico fotográfico de 650 g/m²</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ECC880]" />
                <span>Tapas de lino con hot stamping oro</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ECC880]" />
                <span>Garantía de archivo +100 años</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3.5">
              <button
                type="button"
                onClick={onOpenBuilder}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#ECC880] text-[#1F1C18] text-xs uppercase tracking-[0.18em] font-semibold hover:bg-[#F2D79E] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Diseñar mi fotolibro</span>
              </button>

              <button
                type="button"
                onClick={onOpenConcierge}
                className="w-full sm:w-auto px-8 py-3.5 border border-[#6E6458] text-[#FDFCF9] text-xs uppercase tracking-[0.18em] font-medium hover:bg-white/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Nosotros te lo diseñamos</span>
              </button>
            </div>
          </div>

          {/* Right Visual Image */}
          <div className="lg:col-span-5">
            <div className="border border-white/10 bg-[#292521] p-4 sm:p-6 shadow-2xl">
              <div className="aspect-[4/3] overflow-hidden bg-[#1A1816]">
                <img
                  src={linenSwatchesImg}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80';
                  }}
                  alt="Muestrario de linos y álbum Fine Art HALO"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#A89F91]">
                <span className="font-serif-luxury text-white">Lino Crudo & Grabado Oro</span>
                <span className="font-mono text-[#ECC880]">Producción Artesanal</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
