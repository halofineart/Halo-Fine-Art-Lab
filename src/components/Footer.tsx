import React from 'react';
import { Mail, Phone, Instagram, Facebook } from 'lucide-react';

interface FooterProps {
  onOpenBuilder: () => void;
  onOpenConcierge: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenAdminWorkshop?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenBuilder,
  onOpenConcierge,
  onNavigateSection,
  onOpenAdminWorkshop,
}) => {
  return (
    <footer className="bg-[#1A1816] text-[#A89F91] pt-16 pb-12 border-t border-[#2E2A25]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#2E2A25]">
          
          {/* Brand & Narrative */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex flex-col items-start">
              <span className="font-brand text-2xl tracking-[0.25em] text-[#FDFCF9]">
                HALO
              </span>
              <span className="text-[9px] tracking-[0.35em] text-[#C5A059] uppercase font-medium mt-0.5">
                FINE ART LAB
              </span>
            </div>

            <p className="text-sm text-[#A89F91] leading-relaxed max-w-sm font-normal">
              Laboratorio especializado en encuadernación artesanal y revelado químico sobre auténtico papel fotográfico Layflat. Piezas de arte para guardar lo que de verdad importa.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 border border-[#3D352E] flex items-center justify-center text-[#A89F91] hover:text-[#ECC880] hover:border-[#ECC880] transition-colors cursor-pointer">
                <Instagram className="w-4 h-4" />
              </div>
              <div className="w-9 h-9 border border-[#3D352E] flex items-center justify-center text-[#A89F91] hover:text-[#ECC880] hover:border-[#ECC880] transition-colors cursor-pointer">
                <Facebook className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif-luxury text-base text-[#FDFCF9] font-medium tracking-wide">
              Navegación
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#A89F91] font-light">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('catalog')}
                  className="hover:text-[#FDFCF9] transition-colors cursor-pointer"
                >
                  Formatos & Precios
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('quality')}
                  className="hover:text-[#FDFCF9] transition-colors cursor-pointer"
                >
                  Papel Fotográfico vs Offset
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('how-it-works')}
                  className="hover:text-[#FDFCF9] transition-colors cursor-pointer"
                >
                  Cómo Funciona
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('reviews')}
                  className="hover:text-[#FDFCF9] transition-colors cursor-pointer"
                >
                  Historias de Clientes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('faq')}
                  className="hover:text-[#FDFCF9] transition-colors cursor-pointer"
                >
                  Preguntas Frecuentes
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Actions & Contact */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-serif-luxury text-base text-[#FDFCF9] font-medium tracking-wide">
              Empezar
            </h4>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={onOpenBuilder}
                className="w-full py-3 px-4 bg-[#262320] hover:bg-[#332F2A] text-left text-xs sm:text-sm text-[#FDFCF9] font-medium flex items-center justify-between border border-[#3D352E] transition-all cursor-pointer"
              >
                <span>Diseñar en el Editor Online</span>
                <span className="text-[#ECC880]">→</span>
              </button>
              <button
                type="button"
                onClick={onOpenConcierge}
                className="w-full py-3 px-4 bg-[#262320] hover:bg-[#332F2A] text-left text-xs sm:text-sm text-[#FDFCF9] font-medium flex items-center justify-between border border-[#3D352E] transition-all cursor-pointer"
              >
                <span>Nosotros te lo diseñamos</span>
                <span className="text-[#ECC880]">→</span>
              </button>
            </div>

            <div className="pt-3 text-xs text-[#A89F91] space-y-2 font-light">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#ECC880]" />
                <span>contacto@halofineartlab.com</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#ECC880]" />
                <span>Pilar, Buenos Aires · Envíos a todo el país</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C8275] gap-4">
          <p>© {new Date().getFullYear()} HALO Fine Art Lab. Todos los derechos reservados.</p>
          
          {onOpenAdminWorkshop && (
            <button
              type="button"
              onClick={onOpenAdminWorkshop}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-[#2E2A25] hover:border-[#8C6D37] text-xs text-[#A89F91] hover:text-[#ECC880] transition-colors cursor-pointer"
            >
              <span>Taller / Admin</span>
            </button>
          )}

          <p className="font-light">
            Encuadernación artesanal para recuerdos eternos
          </p>
        </div>
      </div>
    </footer>
  );
};

