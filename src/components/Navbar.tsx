import React from 'react';
import { Sparkles, ShoppingBag, BookOpen, Layers, Heart, MessageSquare, Phone, Package, User, LogIn } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full border-b border-[#E8E2D5] bg-[#FDFCF9]/95 backdrop-blur-md transition-all">
      {/* Top micro-announcement banner */}
      <div className="bg-[#2B2621] text-[#E8E2D5] py-1.5 px-4 text-center text-xs tracking-widest uppercase font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse"></span>
            Laboratorio en Pilar, Bs.As. · Entrega Sin Cargo en radio de 20 km · Envíos a todo el país
          </span>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onOpenTracker}
              className="inline-flex items-center gap-1 text-[#ECC880] hover:text-[#FDFCF9] transition-colors normal-case font-medium text-[11px]"
            >
              <Package className="w-3 h-3 text-[#ECC880]" />
              <span>Rastrear Pedido (4-6 días)</span>
            </button>
            <a
              href="https://wa.me/5491128625916?text=Hola%20HALO%20Fine%20Art%2C%20quisiera%20consultar%20sobre%20los%20fotolibros%20artesanales"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-[#E8E2D5] hover:text-[#FDFCF9] transition-colors normal-case font-normal"
            >
              <Phone className="w-3 h-3 text-[#ECC880]" />
              <span>WhatsApp: <strong>+54 11 2862-5916</strong></span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo matching the uploaded HALO Fine Art Lab identity */}
          <div 
            onClick={() => onNavigateSection('hero')}
            className="cursor-pointer flex flex-col items-center sm:items-start group select-none"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-brand text-2xl sm:text-3xl font-semibold tracking-[0.25em] text-[#1F1C18] group-hover:text-[#8C6D37] transition-colors">
                HALO
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] tracking-[0.35em] text-[#8C8275] uppercase font-medium -mt-1">
              FINE ART LAB
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-medium text-[#595248] whitespace-nowrap">
            <button 
              type="button"
              onClick={() => onNavigateSection('catalog')} 
              className="hover:text-[#1F1C18] transition-colors tracking-wide py-1"
            >
              Formatos & Precios
            </button>
            <button 
              type="button"
              onClick={() => onNavigateSection('quality')} 
              className="hover:text-[#1F1C18] transition-colors tracking-wide py-1"
            >
              Calidad & Papel
            </button>
            <button 
              type="button"
              onClick={() => onNavigateSection('how-it-works')} 
              className="hover:text-[#1F1C18] transition-colors tracking-wide py-1 font-medium"
            >
              Cómo Funciona
            </button>
            <button 
              type="button"
              onClick={() => onNavigateSection('tracker')} 
              className="hover:text-[#8C6D37] transition-colors tracking-wide flex items-center gap-1 font-semibold text-[#8C6D37] py-1"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Tracker</span>
            </button>
            <button 
              type="button"
              onClick={() => onNavigateSection('reviews')} 
              className="hover:text-[#1F1C18] transition-colors tracking-wide py-1"
            >
              Historias Reales
            </button>
            <button 
              type="button"
              onClick={() => onNavigateSection('faq')} 
              className="hover:text-[#1F1C18] transition-colors tracking-wide py-1"
            >
              Preguntas
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 sm:gap-3 pl-3 lg:pl-6 lg:border-l border-[#E8E2D5] shrink-0">
            {/* Tracker Button */}
            <button
              type="button"
              onClick={onOpenTracker}
              className="p-2 sm:px-3 sm:py-2 rounded-full border border-[#D6CEBE] text-xs font-semibold text-[#595248] hover:bg-[#EFE9DE] hover:text-[#1F1C18] transition-colors flex items-center gap-1.5"
              title="Tracker de Pedido"
            >
              <Package className="w-4 h-4 text-[#8C6D37]" />
              <span className="hidden xl:inline">Seguimiento</span>
            </button>

            {/* Servicio Experto */}
            <button
              type="button"
              onClick={onOpenConcierge}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#D6CEBE] bg-[#F7F3EB]/60 text-xs uppercase tracking-wider font-semibold text-[#2B2621] hover:bg-[#EFE9DE] transition-all whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Nosotros lo Diseñamos</span>
            </button>

            {/* Crear mi Álbum (Editor) */}
            <button
              type="button"
              onClick={onOpenBuilder}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-[#1F1C18] text-[#FDFCF9] text-xs uppercase tracking-wider font-semibold hover:bg-[#3D352E] shadow-sm transition-all hover:scale-[1.02] active:scale-98 whitespace-nowrap"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#ECC880]" />
              <span>Diseñar</span>
            </button>

            {/* User Account / Login Button */}
            {isLoggedIn ? (
              <button
                type="button"
                onClick={onOpenProfile}
                className="inline-flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-[#D6CEBE] bg-[#F7F3EB] text-xs font-semibold text-[#1F1C18] hover:bg-[#EFE9DE] transition-all shadow-sm"
                title="Mi Cuenta HALO"
              >
                <div className="w-5 h-5 rounded-full bg-[#C5A059] text-white flex items-center justify-center text-[10px] font-bold">
                  {(profile?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {profile?.fullName ? profile.fullName.split(' ')[0] : 'Mi Taller'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-full border border-[#D6CEBE] text-xs font-semibold text-[#595248] hover:bg-[#EFE9DE] hover:text-[#1F1C18] transition-colors"
                title="Iniciar Sesión"
              >
                <User className="w-4 h-4 text-[#8C6D37]" />
                <span className="hidden md:inline">Ingresar</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 rounded-full border border-[#E8E2D5] bg-[#FDFCF9] text-[#2B2621] hover:bg-[#F2ECE1] transition-colors"
              title="Ver Pedido"
            >
              <ShoppingBag className="w-4 h-4 text-[#2B2621]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C5A059] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
