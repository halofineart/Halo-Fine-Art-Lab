import React from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  Printer,
  Palette,
  Maximize2,
  FileCheck,
  HelpCircle,
  Layers
} from 'lucide-react';
import { PhotoAsset } from '../types';
import { formatFileSize, getThumbnailSrc } from '../lib/imageProcessor';

interface FineArtQualityModalProps {
  photo: PhotoAsset | null;
  onClose: () => void;
}

export const FineArtQualityModal: React.FC<FineArtQualityModalProps> = ({
  photo,
  onClose,
}) => {
  if (!photo) return null;

  const pre = photo.preflight;
  const rating = pre?.rating || 'buena';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF8F5] w-full max-w-xl rounded-2xl border border-[#D6CEBE] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#F4EFE6] border-b border-[#E8E2D5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1F1C18] text-[#ECC880] flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-luxury font-bold text-base text-[#1F1C18]">
                Control Pre-Vuelo Fine Art
              </h3>
              <p className="text-[11px] text-[#736B60]">
                Análisis de Resolución (DPI) y Perfil de Color (sRGB)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#EAE3D2] text-[#736B60] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-left">
          
          {/* Photo Preview & Quality Status Banner */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-[#E8E2D5]">
            <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-[#D6CEBE] shrink-0 bg-[#1F1C18]/5">
              <img
                src={getThumbnailSrc(photo)}
                alt={photo.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1 rounded">
                {pre?.nativeWidth || photo.width}x{pre?.nativeHeight || photo.height}
              </span>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {rating === 'optima' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Calidad Óptima (300+ DPI)
                  </span>
                )}
                {rating === 'buena' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    Calidad Buena (200-280 DPI)
                  </span>
                )}
                {rating === 'advertencia' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Resolución Moderada (~150 DPI)
                  </span>
                )}
                {rating === 'insuficiente' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                    Calidad Insuficiente (&lt;150 DPI)
                  </span>
                )}

                <span className="text-xs font-mono font-bold bg-[#F4EFE6] px-2 py-0.5 rounded text-[#8C6D37]">
                  Score: {pre?.qualityScore || 85}/100
                </span>
              </div>

              <h4 className="font-semibold text-sm text-[#1F1C18] truncate" title={photo.name}>
                {photo.name}
              </h4>
              <p className="text-xs text-[#736B60]">
                {formatFileSize(photo.originalSizeBytes)} · {pre?.megaPixels || 12} Megapíxeles
              </p>
            </div>
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            
            {/* Color Profile */}
            <div className="bg-white p-3 rounded-xl border border-[#E8E2D5] space-y-1">
              <div className="flex items-center gap-1 text-[#736B60] text-[11px] font-semibold">
                <Palette className="w-3.5 h-3.5 text-[#8C6D37]" />
                <span>Perfil de Color</span>
              </div>
              <p className="font-bold text-[#1F1C18]">
                {pre?.colorSpace || 'sRGB'}
              </p>
              <span className="text-[10px] text-emerald-700 block">
                {pre?.isSrgbCompliant ? '✓ Calibrado para Fuji' : 'Conversión en Lab'}
              </span>
            </div>

            {/* DPI at Page */}
            <div className="bg-white p-3 rounded-xl border border-[#E8E2D5] space-y-1">
              <div className="flex items-center gap-1 text-[#736B60] text-[11px] font-semibold">
                <Maximize2 className="w-3.5 h-3.5 text-[#8C6D37]" />
                <span>DPI en Página Completa</span>
              </div>
              <p className="font-bold text-[#1F1C18]">
                ~{pre?.estimatedDpiAtA4 || 300} DPI
              </p>
              <span className="text-[10px] text-[#736B60] block">
                Min. recomendado: 200 DPI
              </span>
            </div>

            {/* Max Print Size at 300 DPI */}
            <div className="bg-white p-3 rounded-xl border border-[#E8E2D5] space-y-1 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1 text-[#736B60] text-[11px] font-semibold">
                <Layers className="w-3.5 h-3.5 text-[#8C6D37]" />
                <span>Tamaño Máx. (300 DPI)</span>
              </div>
              <p className="font-bold text-[#1F1C18]">
                {pre?.maxPrintCmAt300Dpi?.widthCm || 34} x {pre?.maxPrintCmAt300Dpi?.heightCm || 25} cm
              </p>
              <span className="text-[10px] text-emerald-700 block">
                Nitidez Museo 100%
              </span>
            </div>
          </div>

          {/* Passed Checks */}
          {pre && pre.passedChecks.length > 0 && (
            <div className="space-y-1.5 bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs">
              <h5 className="font-bold text-emerald-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                Validaciones Aprobadas por el Laboratorio
              </h5>
              <ul className="space-y-1 text-emerald-800 text-xs">
                {pre.passedChecks.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings & Issues */}
          {pre && pre.warnings.length > 0 && (
            <div className="space-y-1.5 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
              <h5 className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                Observaciones de Calidad
              </h5>
              <ul className="space-y-1 text-amber-800 text-xs">
                {pre.warnings.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Lab Recommendations */}
          {pre && pre.recommendations.length > 0 && (
            <div className="space-y-1.5 bg-[#F4EFE6] border border-[#D6CEBE] rounded-xl p-3 text-xs">
              <h5 className="font-bold text-[#1F1C18] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#8C6D37]" />
                Recomendación del Taller de Encuadernación
              </h5>
              <ul className="space-y-1 text-[#595248] text-xs">
                {pre.recommendations.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#8C6D37] font-bold">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fine Art Standard Explanation */}
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-[#E8E2D5] text-[11px] text-[#736B60]">
            <HelpCircle className="w-4 h-4 text-[#8C6D37] shrink-0" />
            <p>
              Nuestras prensas Fuji Crystal Archive y papeles fine art de 800 g/m² imprimen a 300 DPI nativos para garantizar fidelidad cromática sin grano digital.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F4EFE6] border-t border-[#E8E2D5] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1F1C18] text-[#ECC880] text-xs font-bold hover:bg-[#3D352E] transition-colors"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
