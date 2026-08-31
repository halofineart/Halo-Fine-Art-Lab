import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export const QualityShowcase: React.FC = () => {
  return (
    <section id="quality-compare" className="py-24 bg-[#FAF8F5] border-b border-[#E8E2D5]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] font-medium tracking-[0.25em] text-[#8C8275] uppercase block mb-2">
            CIENCIA DEL COLOR & ARTE DE ENCUADERNACIÓN
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl text-[#1F1C18] font-normal leading-tight">
            ¿Por qué papel químico fotográfico y no imprenta digital común?
          </h2>
          <p className="text-xs sm:text-sm text-[#736B60] font-light leading-relaxed mt-4 max-w-2xl mx-auto">
            La mayoría de los fotolibros comerciales se imprimen con tinta offset sobre papel fino de revista. En HALO revelamos cada página pliego a pliego con emulsión fotográfica de haluros de plata.
          </p>
        </div>

        {/* 2-Column Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Card 1: Ordinary Digital Print */}
          <div className="bg-[#FDFCF9] border border-[#E8E2D5] p-8 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8E2D5]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8C8275] font-mono">Mercado Estándar</span>
                <h3 className="font-serif-luxury text-2xl font-normal text-[#1F1C18] mt-1">Imprenta Digital / Offset</h3>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#E8E2D5] flex items-center justify-center text-[#8C8275]">
                <XCircle className="w-5 h-5" strokeWidth={1.5} />
              </div>
            </div>

            <ul className="space-y-4 text-xs text-[#736B60] font-light">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A89F91] mt-1.5 shrink-0" />
                <span><strong className="text-[#1F1C18] font-medium">Papel delgado (150–170 g/m²):</strong> Hojas finas y flexibles que se arrugan, traslucen la foto del reverso y se doblan.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A89F91] mt-1.5 shrink-0" />
                <span><strong className="text-[#1F1C18] font-medium">Trama de puntos perceptibles (CMYK):</strong> Pequeños puntitos de tinta visibles que restan nitidez a los rostros y gradientes.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A89F91] mt-1.5 shrink-0" />
                <span><strong className="text-[#1F1C18] font-medium">Encuadernación con canaleta curva:</strong> Se pierde parte de la foto en el lomo central y el libro no queda plano en la mesa.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A89F91] mt-1.5 shrink-0" />
                <span><strong className="text-[#1F1C18] font-medium">Durabilidad efímera:</strong> Las tintas comerciales tienden a perder tono y amarillear en 5 a 10 años.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: HALO Layflat Fuji Quimico */}
          <div className="bg-[#FDFCF9] border-2 border-[#1F1C18] p-8 shadow-sm relative">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8E2D5]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8C6D37] font-mono font-medium">Fuji Crystal Archive HD</span>
                <h3 className="font-serif-luxury text-2xl font-normal text-[#1F1C18] mt-1">Papel Fotográfico Layflat</h3>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#1F1C18] flex items-center justify-center text-[#ECC880]">
                <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
              </div>
            </div>

            <ul className="space-y-4 text-xs text-[#595248] font-light">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D37] mt-0.5 shrink-0" />
                <span><strong className="text-[#1F1C18] font-medium">Hojas rígidas de 650 g/m² con alma central:</strong> Páginas sólidas e indeformables con peso noble.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D37] mt-0.5 shrink-0" />
                <span><strong className="text-[#1F1C18] font-medium">Tono continuo sin trama de puntos:</strong> Transiciones tonales perfectas y negros profundos de rango infinito.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D37] mt-0.5 shrink-0" />
                <span><strong className="text-[#1F1C18] font-medium">Apertura 180° Layflat total:</strong> Las panorámicas cruzan ambas páginas limpiamente sin corte en el centro.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D37] mt-0.5 shrink-0" />
                <span><strong className="text-[#1F1C18] font-medium">Garantía de archivo +100 años:</strong> Resistencia absoluta a la luz UV, envejecimiento y humedad ambiente.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
};
