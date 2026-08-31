import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  UploadCloud, 
  Award, 
  Layers, 
  Heart, 
  Gift, 
  ChevronRight, 
  Smartphone, 
  PenTool, 
  Printer, 
  BookMarked,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import goldFoilImg from '../assets/images/gold_foil_stamping_1788109282366.jpg';
import layflatImg from '../assets/images/layflat_paper_texture_1788109298366.jpg';

interface HeroSectionProps {
  onOpenBuilder: () => void;
  onOpenConcierge: () => void;
  onExploreCatalog: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenBuilder,
  onOpenConcierge,
  onExploreCatalog,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#E8E2D5]">
      {/* Subtle organic gradient glow background */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#E8E0D0] opacity-50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#E5D7C3] opacity-40 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Brand Title & Tagline */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D6CEBE] bg-[#F2ECE1]/80 text-[#8C6D37] text-xs font-semibold tracking-widest uppercase mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Laboratorio de Encuadernación Artesanal & Fine Art</span>
          </div>

          <h1 className="font-serif-luxury text-4xl sm:text-6xl lg:text-7xl font-normal text-[#1F1C18] tracking-tight leading-[1.08] mb-6">
            Tus recuerdos merecen algo más que una pantalla.
          </h1>

          <div className="w-16 h-0.5 bg-[#C5A059] mx-auto mb-6"></div>

          <p className="text-base sm:text-xl text-[#595248] font-light leading-relaxed max-w-2xl mx-auto">
            Transformamos los momentos guardados en tu celular en fotolibros impresos en auténtico <strong className="font-medium text-[#1F1C18]">papel fotográfico químico Layflat</strong> con tapas de lino natural grabadas en oro. Hechos para durar generaciones.
          </p>

          {/* Main Dual CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* CTA 1: Create your own */}
            <button
              type="button"
              onClick={onOpenBuilder}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#1F1C18] text-[#FDFCF9] text-sm uppercase tracking-widest font-semibold hover:bg-[#3D352E] shadow-xl shadow-[#1F1C18]/10 transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-3 group"
            >
              <BookOpen className="w-4 h-4 text-[#ECC880]" />
              <span>Diseñar Mi Propio Álbum</span>
              <ArrowRight className="w-4 h-4 text-[#ECC880] group-hover:translate-x-1 transition-transform" />
            </button>

            {/* CTA 2: Concierge / We design it for you */}
            <button
              type="button"
              onClick={onOpenConcierge}
              className="w-full sm:w-auto px-8 py-4 rounded-full border-2 border-[#8C6D37] bg-[#F8F6F0] text-[#1F1C18] text-sm uppercase tracking-widest font-semibold hover:bg-[#EFE9DE] transition-all flex items-center justify-center gap-3 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#8C6D37]" />
              <span>Solo subí tus fotos (Nosotros diseñamos)</span>
            </button>
          </div>

          {/* Guarantee Pill */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#736B60]">
            <span className="flex items-center gap-1.5 font-medium text-[#1F1C18]">
              <CheckCircle2 className="w-4 h-4 text-[#8C6D37]" />
              Producción artesanal en 4 a 6 días hábiles
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#1F1C18]">
              <CheckCircle2 className="w-4 h-4 text-[#8C6D37]" />
              Entrega sin costo en Pilar y radio de 20 km
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#1F1C18]">
              <CheckCircle2 className="w-4 h-4 text-[#8C6D37]" />
              Envíos por Correo a toda Argentina
            </span>
          </div>
        </div>

        {/* Visual Showcase: 3 Book Covers and Open Layflat Mockup */}
        <div className="mt-12 mb-16 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Card 1: Closed Linen Album with Debossed Gold Foil */}
          <div className="md:col-span-4 group relative overflow-hidden rounded-2xl border border-[#D6CEBE] bg-[#EFE9DE] p-6 shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-[4/5] rounded-xl overflow-hidden relative shadow-inner bg-[#E5DEC9]">
              <img
                src={goldFoilImg}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80';
                }}
                alt="HALO Fine Art Lab Tapa de Lino con Hot Stamping Oro"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[10px] tracking-widest uppercase font-bold text-[#ECC880]">Colección Artesanal</span>
                <h3 className="font-serif-luxury text-xl font-medium">Tapas de Lino con Hot Stamping Oro</h3>
                <p className="text-xs text-stone-200 mt-1">Grabado térmico en bajo relieve con tipografías clásicas</p>
              </div>
            </div>
          </div>

          {/* Card 2: Centerpiece Open 180° Layflat Spread */}
          <div className="md:col-span-8 group relative overflow-hidden rounded-2xl border border-[#D6CEBE] bg-[#FDFCFA] p-6 shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-[16/10] rounded-xl overflow-hidden relative shadow-lg bg-[#F5F2EB] flex flex-col justify-between">
              <img
                src={layflatImg}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80';
                }}
                alt="Apertura Layflat 180 grados papel fotográfico"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 book-gutter-shadow pointer-events-none" />
              
              {/* Overlay Badge for Layflat */}
              <div className="absolute top-4 left-4 bg-[#1F1C18]/85 backdrop-blur-md text-[#FDFCF9] px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase flex items-center gap-2 border border-[#C5A059]/40">
                <span className="w-2 h-2 rounded-full bg-[#ECC880]"></span>
                <span>Apertura 180° Layflat Total</span>
              </div>

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 text-white">
                <div className="max-w-md">
                  <span className="text-xs tracking-widest uppercase font-semibold text-[#ECC880]">
                    Impresión en Revelado Químico
                  </span>
                  <h3 className="font-serif-luxury text-2xl sm:text-3xl font-medium mt-1">
                    Hay historias que merecen ser contadas.
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 mt-2 font-light">
                    Hojas rígidas continuas que se abren 100% planas sin cortes en el centro. Diseños panorámicos que quitan el aliento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The 4-Step Journey from the user's uploaded banner */}
        <div id="how-it-works" className="scroll-mt-28 rounded-3xl border border-[#D6CEBE] bg-[#F4EFE6]/80 p-8 sm:p-12 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold tracking-[0.25em] text-[#8C6D37] uppercase">
              DEL CELULAR A UN RECUERDO PARA SIEMPRE
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#1F1C18] mt-2">
              Un proceso simple, pensado para emocionarte.
            </h2>
            <div className="w-12 h-0.5 bg-[#C5A059] mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#FDFCF9] border border-[#E8E2D5] shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-[#F0ECE1] border border-[#D6CEBE] flex items-center justify-center text-[#8C6D37] mb-4 shadow-inner">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold tracking-widest text-[#8C8275] uppercase">Paso 1</span>
              <h3 className="font-serif-luxury text-xl font-bold text-[#1F1C18] mt-1 mb-2">Elegí tus Fotos</h3>
              <p className="text-xs text-[#595248] leading-relaxed">
                Selecciona tus fotos favoritas desde tu celular o computadora. Subida rápida sin pérdida de calidad.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#FDFCF9] border border-[#E8E2D5] shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-[#F0ECE1] border border-[#D6CEBE] flex items-center justify-center text-[#8C6D37] mb-4 shadow-inner">
                <PenTool className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold tracking-widest text-[#8C8275] uppercase">Paso 2</span>
              <h3 className="font-serif-luxury text-xl font-bold text-[#1F1C18] mt-1 mb-2">Diseñamos tu Historia</h3>
              <p className="text-xs text-[#595248] leading-relaxed">
                Maqueta con nuestro editor visual en minutos o deja que nuestro equipo de diseñadores arme la propuesta perfecta.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#FDFCF9] border border-[#E8E2D5] shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-[#F0ECE1] border border-[#D6CEBE] flex items-center justify-center text-[#8C6D37] mb-4 shadow-inner">
                <Printer className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold tracking-widest text-[#8C8275] uppercase">Paso 3</span>
              <h3 className="font-serif-luxury text-xl font-bold text-[#1F1C18] mt-1 mb-2">Impresión Fine Art</h3>
              <p className="text-xs text-[#595248] leading-relaxed">
                Revelado químico profesional sobre papel fotográfico HD y encuadernación artesanal cosida a mano.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#FDFCF9] border border-[#E8E2D5] shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-[#F0ECE1] border border-[#D6CEBE] flex items-center justify-center text-[#8C6D37] mb-4 shadow-inner">
                <BookMarked className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold tracking-widest text-[#8C8275] uppercase">Paso 4</span>
              <h3 className="font-serif-luxury text-xl font-bold text-[#1F1C18] mt-1 mb-2">Un Recuerdo Para Siempre</h3>
              <p className="text-xs text-[#595248] leading-relaxed">
                Recibes en tu casa un libro de calidad museo, protegido en caja de presentación listo para compartir en familia.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Trust Badges matching the bottom of the user's banner */}
        <div className="mt-14 pt-8 border-t border-[#E8E2D5] grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#EFE9DE] flex items-center justify-center text-[#8C6D37]">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase text-[#1F1C18]">Calidad Premium</span>
            <span className="text-[11px] text-[#736B60]">Encuadernación 100% artesanal</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#EFE9DE] flex items-center justify-center text-[#8C6D37]">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase text-[#1F1C18]">Papeles Fine Art</span>
            <span className="text-[11px] text-[#736B60]">Químico Fuji & Algodón Puro</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#EFE9DE] flex items-center justify-center text-[#8C6D37]">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase text-[#1F1C18]">Hecho Para Durar</span>
            <span className="text-[11px] text-[#736B60]">Garantía de conservación 100+ años</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#EFE9DE] flex items-center justify-center text-[#8C6D37]">
              <Gift className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase text-[#1F1C18]">El Regalo Perfecto</span>
            <span className="text-[11px] text-[#736B60]">Embalaje de lujo para regalar</span>
          </div>
        </div>
      </div>
    </section>
  );
};
