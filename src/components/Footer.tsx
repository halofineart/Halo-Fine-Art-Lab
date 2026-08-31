import React from 'react';
import { Sparkles, Heart, Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react';

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
    <footer className="bg-[#1F1C18] text-[#D6CEBE] pt-16 pb-12 border-t border-[#3D352E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#38312A]">
          {/* Brand & Manifesto */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex flex-col items-start">
              <span className="font-brand text-3xl font-semibold tracking-[0.25em] text-[#FDFCF9]">
                HALO
              </span>
              <span className="text-[10px] tracking-[0.35em] text-[#C5A059] uppercase font-medium -mt-1">
                FINE ART LAB
              </span>
            </div>

            <p className="text-xs text-[#A89F91] leading-relaxed max-w-sm font-light">
              Laboratorio especializado en encuadernación artesanal y revelado químico en papel fotográfico profesional. Creamos reliquias familiares diseñadas para trascender el tiempo.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-8 rounded-full border border-[#52493F] flex items-center justify-center text-[#ECC880] hover:bg-[#3D352E] transition-colors cursor-pointer">
                <Instagram className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-full border border-[#52493F] flex items-center justify-center text-[#ECC880] hover:bg-[#3D352E] transition-colors cursor-pointer">
                <Facebook className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif-luxury text-base text-[#FDFCF9] font-bold tracking-wide">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs text-[#A89F91]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('catalog')}
                  className="hover:text-[#ECC880] transition-colors"
                >
                  Formatos & Precios
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('quality')}
                  className="hover:text-[#ECC880] transition-colors"
                >
                  Papel Fotográfico vs Imprenta
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('how-it-works')}
                  className="hover:text-[#ECC880] transition-colors"
                >
                  Cómo Funciona
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('reviews')}
                  className="hover:text-[#ECC880] transition-colors"
                >
                  Historias de Clientes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('faq')}
                  className="hover:text-[#ECC880] transition-colors"
                >
                  Preguntas Frecuentes
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-serif-luxury text-base text-[#FDFCF9] font-bold tracking-wide">
              Empieza Tu Álbum
            </h4>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={onOpenBuilder}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2C2723] hover:bg-[#3D352E] text-left text-xs text-[#FDFCF9] flex items-center justify-between border border-[#52493F] transition-all"
              >
                <span>Diseñar en el Editor Online</span>
                <span className="text-[#ECC880]">→</span>
              </button>
              <button
                type="button"
                onClick={onOpenConcierge}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2C2723] hover:bg-[#3D352E] text-left text-xs text-[#FDFCF9] flex items-center justify-between border border-[#52493F] transition-all"
              >
                <span>Servicio: Nosotros lo Diseñamos</span>
                <span className="text-[#ECC880]">→</span>
              </button>
            </div>

            <div className="pt-2 text-[11px] text-[#A89F91] space-y-1">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#ECC880]" />
                <span>contacto@halofineartlab.com</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#ECC880]" />
                <span>Atención personalizada por WhatsApp</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#736B60] gap-4">
          <p>© {new Date().getFullYear()} HALO Fine Art Lab. Todos los derechos reservados.</p>
          
          {onOpenAdminWorkshop && (
            <button
              type="button"
              onClick={onOpenAdminWorkshop}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#3D352E] hover:border-[#8C6D37] text-[#A69C8D] hover:text-[#ECC880] transition-colors"
            >
              <span>Admin</span>
            </button>
          )}

          <p className="flex items-center gap-1">
            <span>Encuadernación artesanal hecha con</span>
            <Heart className="w-3 h-3 text-[#ECC880] fill-[#ECC880]" />
            <span>para recuerdos eternos</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
