import React from 'react';
import { Award, Layers, Sparkles, CheckCircle2, XCircle, ShieldCheck, Microscope } from 'lucide-react';
import bookbindingImg from '../assets/images/artisan_bookbinding_macro_1788109266332.jpg';
import goldFoilImg from '../assets/images/gold_foil_stamping_1788109282366.jpg';
import archivalBoxImg from '../assets/images/archival_box_luxury_1788109342591.jpg';

export const QualityShowcase: React.FC = () => {
  return (
    <section id="quality" className="py-20 bg-[#F4EFE6] border-b border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-[0.25em] text-[#8C6D37] uppercase">
            CIENCIA DEL COLOR & ARTE DE ENCUADERNACIÓN
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-5xl text-[#1F1C18] mt-2 mb-4 font-normal">
            ¿Por qué papel fotográfico químico y no imprenta digital común?
          </h2>
          <div className="w-16 h-0.5 bg-[#C5A059] mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-[#595248] font-light leading-relaxed">
            La mayoría de los fotolibros del mercado se imprimen en prensas digitales comerciales de tinta sobre papel fino de revista. En HALO revelamos cada página fotograma a fotograma con haluros de plata de alta definición.
          </p>
        </div>

        {/* Comparison Table / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Card 1: Ordinary Digital Print */}
          <div className="rounded-3xl border border-[#D6CEBE] bg-[#FDFCF9] p-8 shadow-sm relative opacity-85">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8E2D5]">
              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-[#736B60]">Mercado Estándar</span>
                <h3 className="font-serif-luxury text-2xl font-semibold text-[#1F1C18]">Imprenta Digital / Tóner</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                <XCircle className="w-6 h-6" />
              </div>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-[#595248]">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-2 shrink-0" />
                <span><strong>Papel delgado (150–170 g/m²):</strong> Hojas finas y flexibles que se arrugan, traslucen la foto del reverso y se doblan con la humedad.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-2 shrink-0" />
                <span><strong>Puntos de trama perceptibles (CMYK):</strong> Al mirar de cerca se observan pequeños puntitos de tinta, perdiendo detalle en rostros y sombras.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-2 shrink-0" />
                <span><strong>Encuadernación en lomo curvo:</strong> Parte de la foto se pierde en la canaleta central y el libro no permanece abierto sobre la mesa.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-2 shrink-0" />
                <span><strong>Durabilidad limitada:</strong> Las tintas de pigmento estándar tienden a decolorarse y amarillear en 5 a 10 años.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: HALO Fine Art Lab Authentic Photographic Chemical Paper */}
          <div className="rounded-3xl border-2 border-[#8C6D37] bg-[#FDFCF9] p-8 shadow-xl relative ring-4 ring-[#8C6D37]/10">
            <span className="absolute -top-3.5 right-8 bg-[#8C6D37] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow">
              CALIDAD MUSEO HALO
            </span>

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8E2D5]">
              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-[#8C6D37]">Fuji Crystal Archive HD</span>
                <h3 className="font-serif-luxury text-2xl font-bold text-[#1F1C18]">Papel Fotográfico Químico Layflat</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#EFE9DE] flex items-center justify-center text-[#8C6D37]">
                <CheckCircle2 className="w-6 h-6 text-[#8C6D37]" />
              </div>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-[#1F1C18]">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D37] mt-1 shrink-0" />
                <span><strong>Hojas rígidas de 650 g/m² con alma central:</strong> Páginas sólidas con peso aristocrático que no se curvan jamás.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D37] mt-1 shrink-0" />
                <span><strong>Tono continuo sin trama de puntos:</strong> Transiciones de luz y piel hiperrealistas con negros puros y rango dinámico infinito.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D37] mt-1 shrink-0" />
                <span><strong>Apertura 100% plana Layflat 180°:</strong> Las fotos panorámicas cruzan ambas páginas de extremo a extremo sin perder ni 1 milímetro en el centro.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D37] mt-1 shrink-0" />
                <span><strong>Garantía de conservación de más de 100 años:</strong> Resistencia absoluta a la luz UV, envejecimiento y humedad ambiente.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 3 Pillars Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-16">
          <div className="p-6 rounded-2xl bg-[#FDFCF9] border border-[#D6CEBE]">
            <div className="w-12 h-12 rounded-2xl bg-[#EFE9DE] flex items-center justify-center text-[#8C6D37] mx-auto mb-4">
              <Microscope className="w-6 h-6" />
            </div>
            <h4 className="font-serif-luxury text-lg font-bold text-[#1F1C18] mb-1">Revelado Químico HD</h4>
            <p className="text-xs text-[#595248]">
              Emulsión fotográfica tradicional de halogenuros de plata sensible a la luz láser de ultra alta definición.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FDFCF9] border border-[#D6CEBE]">
            <div className="w-12 h-12 rounded-2xl bg-[#EFE9DE] flex items-center justify-center text-[#8C6D37] mx-auto mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="font-serif-luxury text-lg font-bold text-[#1F1C18] mb-1">Montaje Layflat Artesanal</h4>
            <p className="text-xs text-[#595248]">
              Cada pliego se ensambla dorso contra dorso con un alma rígida intercalada y adhesivo flexible de archivo.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FDFCF9] border border-[#D6CEBE]">
            <div className="w-12 h-12 rounded-2xl bg-[#EFE9DE] flex items-center justify-center text-[#8C6D37] mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-serif-luxury text-lg font-bold text-[#1F1C18] mb-1">Acabado Antihuellas</h4>
            <p className="text-xs text-[#595248]">
              Textura Lustre semi-mate que repele las marcas de dedos al hojearlo en familia y no genera reflejos en luz diurna.
            </p>
          </div>
        </div>

        {/* Visual Craft Atelier Gallery */}
        <div className="rounded-3xl border border-[#D6CEBE] bg-[#FDFCF9] p-6 sm:p-10 shadow-lg">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold tracking-[0.2em] text-[#8C6D37] uppercase">
              EL TALLER EN PILAR
            </span>
            <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#1F1C18] mt-1 font-bold">
              Cada ejemplar, una pieza de arte irrepetible
            </h3>
            <p className="text-xs sm:text-sm text-[#595248] mt-2">
              Desde el corte milimétrico del bloque de páginas hasta el grabado térmico de la tipografía y el pulido de cantos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative rounded-2xl overflow-hidden border border-[#D6CEBE] bg-[#EFE9DE] shadow-sm">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={bookbindingImg}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80';
                  }}
                  alt="Encuadernación artesanal con plegadera de hueso en taller HALO"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4 bg-[#FDFCF9]">
                <h5 className="font-serif-luxury text-sm font-bold text-[#1F1C18]">Prensado Manual & Plegadera</h5>
                <p className="text-[11px] text-[#595248] mt-0.5">Ajuste artesanal pliego por pliego para garantizar la apertura perfecta a 180°.</p>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden border border-[#D6CEBE] bg-[#EFE9DE] shadow-sm">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={goldFoilImg}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80';
                  }}
                  alt="Hot Stamping oro sobre lino natural"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4 bg-[#FDFCF9]">
                <h5 className="font-serif-luxury text-sm font-bold text-[#1F1C18]">Estampado Térmico Hot Stamping</h5>
                <p className="text-[11px] text-[#595248] mt-0.5">Grabado en bajo relieve con láminas metálicas de oro y plata de máxima fijación.</p>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden border border-[#D6CEBE] bg-[#EFE9DE] shadow-sm">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={archivalBoxImg}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80';
                  }}
                  alt="Caja de conservación de lujo con cinta de extracción de seda"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4 bg-[#FDFCF9]">
                <h5 className="font-serif-luxury text-sm font-bold text-[#1F1C18]">Caja Clamshell de Conservación</h5>
                <p className="text-[11px] text-[#595248] mt-0.5">Estuche rígido a medida forrado en lino para proteger tu libro por generaciones.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
