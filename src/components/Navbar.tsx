import React from 'react';
import { ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenBuilder: () => void;
  onOpenConcierge: () => void;
  onOpenTracker: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  cartCount: number;
  onOpenCart: () => void;
  activeSection?: string;
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBuilder,
  onOpenConcierge,
  onOpenTracker,
  onOpenAuth,
  onOpenProfile,
  cartCount,
  onOpenCart,
  onNavigateSection,
}) => {
  const { user, profile, isLoggedIn } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/90 backdrop-blur-md transition-all border-b border-[#E8E2D5]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo matching Stitch editorial aesthetic */}
          <div 
            onClick={() => onNavigateSection('hero')}
            className="cursor-pointer select-none py-1 group"
          >
            <span className="font-brand text-xl sm:text-2xl font-normal tracking-[0.28em] text-[#1F1C18] group-hover:text-[#8C6D37] transition-colors uppercase">
              HALO FINE ART LAB
            </span>
          </div>

          {/* Navigation Links: Formatos, Procesos, Calidad, Historias, Seguimiento */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-xs uppercase tracking-[0.14em] font-medium text-[#736B60]">
            <button 
              type="button"
              onClick={() => onNavigateSection('catalog')} 
              className="hover:text-[#1F1C18] transition-colors py-1 cursor-pointer"
            >
              Formatos
            </button>
            <button 
              type="button"
              onClick={() => onNavigateSection('how-it-works')} 
              className="hover:text-[#1F1C18] transition-colors py-1 cursor-pointer"
            >
              Procesos
            </button>
            <button 
              type="button"
              onClick={() => onNavigateSection('quality')} 
              className="hover:text-[#1F1C18] transition-colors py-1 cursor-pointer"
            >
              Calidad
            </button>
            <button 
              type="button"
              onClick={() => onNavigateSection('reviews')} 
              className="hover:text-[#1F1C18] transition-colors py-1 cursor-pointer"
            >
              Historias
            </button>
            <button 
              type="button"
              onClick={() => onNavigateSection('tracker')} 
              className="hover:text-[#1F1C18] transition-colors py-1 cursor-pointer"
            >
              Seguimiento
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Botón Principal: DISEÑAR MI LIBRO */}
            <button
              type="button"
              onClick={onOpenBuilder}
              className="px-5 sm:px-6 py-2.5 rounded-none bg-[#735E38] hover:bg-[#5C4A2C] text-[#FDFCF9] text-[11px] uppercase tracking-[0.18em] font-semibold transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              Diseñar mi libro
            </button>

            {/* Shopping Bag Icon */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 text-[#2B2621] hover:text-[#735E38] transition-colors cursor-pointer"
              title="Ver Bolsa de Pedido"
            >
              <ShoppingBag className="w-4 h-4 text-[#1F1C18]" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute 0 right-0 w-3.5 h-3.5 bg-[#735E38] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Login Button */}
            {isLoggedIn ? (
              <button
                type="button"
                onClick={onOpenProfile}
                className="p-2 text-[#1F1C18] hover:text-[#735E38] transition-colors cursor-pointer"
                title="Mi Cuenta HALO"
              >
                <div className="w-5 h-5 rounded-full bg-[#735E38] text-white flex items-center justify-center text-[10px] font-bold">
                  {(profile?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="p-2 text-[#1F1C18] hover:text-[#735E38] transition-colors cursor-pointer"
                title="Iniciar Sesión"
              >
                <User className="w-4 h-4 text-[#1F1C18]" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

