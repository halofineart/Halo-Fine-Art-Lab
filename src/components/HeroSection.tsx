import React from 'react';
import { 
  Smartphone, 
  PenTool, 
  Printer, 
  BookMarked,
  CheckCircle2,
  Lock,
  Truck
} from 'lucide-react';
import heroSpreadImg from '../assets/images/layflat_paper_texture_1788109298366.jpg';

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
    <section className="relative overflow-hidden bg-[#FAF8F5] border-b border-[#E8E2D5]/70">
      
      {/* Fixed Parallax Background Section */}
      <div 
        className="relative min-h-[580px] sm:min-h-[660px] lg:min-h-[720px] flex items-center justify-center overflow-hidden bg-fixed bg-center bg-cover"
        style={{
          backgroundImage: `url(${heroSpreadImg})`,
        }}
      >
        {/* Semi-transparent warm veil to create the exact translucent effect from the image */}
        <div className="absolute inset-0 bg-[#FAF8F5]/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5]/75 via-[#FAF8F5]/45 to-[#FAF8F5]" />

        {/* Floating Editorial Content Directly Over the Translucent Background */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 sm:py-24 text-center">
          
          {/* Editorial Top Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#D6CEBE]/90 bg-[#FBF9F5]/90 backdrop-blur-md text-[#595248] text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold mb-8 shadow-xs">
            <Lock className="w-3.5 h-3.5 text-[#8C6D37]" />
            <span>Laboratorio de Encuadernación Artesanal</span>
          </div>

          {/* Main Editorial Headline */}
          <h1 className="font-serif-luxury text-4xl sm:text-6xl lg:text-[76px] font-normal text-[#1F1C18] tracking-tight leading-[1.08] mb-6">
            Tus recuerdos merecen<br className="hidden sm:inline" /> algo más que una pantalla.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-[#4A433A] font-light leading-relaxed max-w-2xl mx-auto mb-10">
            Transformamos los momentos guardados en tu celular en fotolibros impresos en auténtico papel fotográfico químico Layflat con <span className="underline decoration-[#C5A059] underline-offset-4 text-[#1F1C18] font-medium">tapas de lino natural grabadas en oro</span>. Hechos para durar generaciones.
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-9">
            <button
              type="button"
              onClick={onOpenBuilder}
              className="w-full sm:w-auto px-9 py-4 rounded-none bg-[#1F1C18] text-[#FDFCF9] text-xs sm:text-sm uppercase tracking-[0.18em] font-semibold hover:bg-[#3D352E] shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <PenTool className="w-4 h-4 text-[#ECC880]" />
              <span>Diseñar mi propio álbum</span>
            </button>

            <button
              type="button"
              onClick={onOpenConcierge}
              className="w-full sm:w-auto px-9 py-4 rounded-none border border-[#D6CEBE] bg-[#FDFCF9]/95 backdrop-blur-sm text-[#1F1C18] text-xs sm:text-sm uppercase tracking-[0.18em] font-semibold hover:bg-[#F4EFE6] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <span className="text-[#8C6D37] text-base">✦</span>
              <span>Nosotros te lo diseñamos</span>
            </button>
          </div>

          {/* Micro badges below buttons */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs sm:text-sm text-[#595248]">
            <span className="inline-flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#8C6D37]" />
              Producción artesanal
            </span>
            <span className="inline-flex items-center gap-2 font-medium">
              <Truck className="w-4 h-4 text-[#8C6D37]" />
              Envíos a todo Argentina
            </span>
          </div>

        </div>

        {/* Bottom Soft Dissolve Gradient */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/80 to-transparent pointer-events-none" />
      </div>

      {/* Main Central Showcase Image (Restored with refined presentation) */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 relative z-20 mb-20">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#E8E2D5] bg-[#EFE9DE]">
          <img
            src={heroSpreadImg}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80';
            }}
            alt="Fotolibro abierto sobre mesa de lectura con café"
            className="w-full h-[320px] sm:h-[480px] lg:h-[560px] object-cover object-center"
            referrerPolicy="no-referrer"
          />
          {/* Subtle warm overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />
        </div>
      </div>

      {/* Section: Un proceso simple, pensado para emocionarte */}
      <div id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif-luxury text-3xl sm:text-5xl text-[#1F1C18] font-normal tracking-tight">
            Un proceso simple, pensado para emocionarte.
          </h2>
          <p className="text-xs sm:text-sm tracking-[0.2em] uppercase text-[#8C6D37] font-semibold mt-3">
            Del celular a un recuerdo para siempre.
          </p>
        </div>

        {/* 4 Minimalist Process Cards matching Stitch design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center p-8 sm:p-9 bg-[#FDFCF9] border border-[#E8E2D5] shadow-xs hover:border-[#D6CEBE] transition-all">
            <div className="w-14 h-14 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5] flex items-center justify-center text-[#8C6D37] mb-6 shadow-2xs">
              <Smartphone className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <span className="text-xs font-semibold tracking-[0.2em] text-[#8C6D37] uppercase mb-2">Paso 1</span>
            <h3 className="font-serif-luxury text-xl sm:text-2xl font-normal text-[#1F1C18] mb-3">Elegí tus Fotos</h3>
            <p className="text-xs sm:text-sm text-[#595248] leading-relaxed font-normal">
              Selecciona tus fotos favoritas desde tu celular o computadora. Subida rápida sin pérdida de calidad.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center p-8 sm:p-9 bg-[#FDFCF9] border border-[#E8E2D5] shadow-xs hover:border-[#D6CEBE] transition-all">
            <div className="w-14 h-14 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5] flex items-center justify-center text-[#8C6D37] mb-6 shadow-2xs">
              <PenTool className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <span className="text-xs font-semibold tracking-[0.2em] text-[#8C6D37] uppercase mb-2">Paso 2</span>
            <h3 className="font-serif-luxury text-xl sm:text-2xl font-normal text-[#1F1C18] mb-3">Diseñamos tu Historia</h3>
            <p className="text-xs sm:text-sm text-[#595248] leading-relaxed font-normal">
              Maqueta con nuestro editor visual en minutos o deja que nuestro equipo de diseñadores arme la propuesta perfecta.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center p-8 sm:p-9 bg-[#FDFCF9] border border-[#E8E2D5] shadow-xs hover:border-[#D6CEBE] transition-all">
            <div className="w-14 h-14 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5] flex items-center justify-center text-[#8C6D37] mb-6 shadow-2xs">
              <Printer className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <span className="text-xs font-semibold tracking-[0.2em] text-[#8C6D37] uppercase mb-2">Paso 3</span>
            <h3 className="font-serif-luxury text-xl sm:text-2xl font-normal text-[#1F1C18] mb-3">Impresión Fine Art</h3>
            <p className="text-xs sm:text-sm text-[#595248] leading-relaxed font-normal">
              Revelado químico profesional sobre papel fotográfico HD y encuadernación artesanal cosida a mano.
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center p-8 sm:p-9 bg-[#FDFCF9] border border-[#E8E2D5] shadow-xs hover:border-[#D6CEBE] transition-all">
            <div className="w-14 h-14 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5] flex items-center justify-center text-[#8C6D37] mb-6 shadow-2xs">
              <BookMarked className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <span className="text-xs font-semibold tracking-[0.2em] text-[#8C6D37] uppercase mb-2">Paso 4</span>
            <h3 className="font-serif-luxury text-xl sm:text-2xl font-normal text-[#1F1C18] mb-3">Un Recuerdo Para Siempre</h3>
            <p className="text-xs sm:text-sm text-[#595248] leading-relaxed font-normal">
              Recibilo en tu casa: un libro de calidad museo, protegido en caja de presentación listo para compartir en familia.
            </p>
          </div>
        </div>
      </div>

    </section>
  );
};
