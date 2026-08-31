import React from 'react';
import { Sparkles, Heart, Clock, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
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
    <section className="py-20 bg-[#24201C] text-[#FDFCF9] relative overflow-hidden border-y border-[#3D352E]">
      {/* Subtle warm glow elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-[#8C6D37]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Editorial Text matching the user's uploaded banner copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#C5A059]/40 bg-[#C5A059]/10 text-[#ECC880] text-xs font-semibold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EL VALOR DE LO TANGIBLE</span>
            </div>

            <h2 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.15] text-[#FDFCF9]">
              ¿Cuántas fotos tenés guardadas y nunca volvés a mirar?
            </h2>

            <p className="font-serif-luxury text-xl sm:text-2xl text-[#D6CEBE] italic font-light">
              Transformalas en algo que puedas volver a vivir.
            </p>

            <div className="w-16 h-0.5 bg-[#C5A059]"></div>

            <p className="text-sm sm:text-base text-[#A89F91] leading-relaxed max-w-xl font-light">
              Pequeños momentos. Grandes recuerdos. Fotolibros hechos para durar y emocionar siempre. No dejes que los recuerdos más importantes de tu vida queden atrapados en la nube o en la memoria del teléfono.
            </p>

            {/* Quick Benefits Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#E8E2D5]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ECC880]" />
                <span>Apertura Layflat 180° sin cortes centrales</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ECC880]" />
                <span>Papel fotográfico químico de 650 g/m²</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ECC880]" />
                <span>Tapas de lino europeo con hot stamping</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ECC880]" />
                <span>Garantía de conservación de más de 100 años</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <button
                type="button"
                onClick={onOpenBuilder}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#ECC880] text-[#1F1C18] text-xs uppercase tracking-widest font-bold hover:bg-[#F2D79E] transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <BookOpen className="w-4 h-4" />
                <span>Crear mi Fotolibro</span>
              </button>

              <button
                type="button"
                onClick={onOpenConcierge}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-[#D6CEBE]/40 text-[#FDFCF9] text-xs uppercase tracking-widest font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#ECC880]" />
                <span>Elegí tus fotos. Nosotros hacemos el resto.</span>
              </button>
            </div>
          </div>

          {/* Right Visual Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md">
              {/* Background tilt card */}
              <div className="absolute inset-0 bg-[#38312A] rounded-3xl transform rotate-3 scale-95 border border-[#52493F] opacity-70" />
              
              {/* Main Card */}
              <div className="relative rounded-3xl overflow-hidden border border-[#52493F] bg-[#2B2621] p-6 shadow-2xl space-y-4">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden relative shadow-inner">
                  <img
                    src={linenSwatchesImg}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80';
                    }}
                    alt="Muestrario de linos y álbum Fine Art HALO"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-3 left-3 bg-[#1F1C18]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-[#ECC880] font-mono tracking-wider">
                    HALO ARTISAN BINDING
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold tracking-widest text-[#ECC880] uppercase">
                    LABORATORIO FINE ART
                  </span>
                  <h3 className="font-serif-luxury text-2xl font-medium text-[#FDFCF9]">
                    Cada página, una emoción tangible.
                  </h3>
                  <p className="text-xs text-[#A89F91] leading-relaxed">
                    Siente el peso del lino crudo en tus manos, el brillo del bajo relieve dorado y la suavidad del papel fotográfico de máxima resolución.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
