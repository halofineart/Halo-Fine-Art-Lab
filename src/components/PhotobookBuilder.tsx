import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  Type, 
  Layout, 
  Check, 
  Eye, 
  BookOpen, 
  Layers, 
  Gift, 
  RotateCw,
  Maximize2,
  Minimize2,
  FolderOpen,
  Save,
  CheckCircle2,
  Cloud,
  AlertTriangle,
  AlertOctagon,
  Printer,
  Info,
  ZoomIn,
  ZoomOut,
  Sliders,
  Move,
  ArrowLeftRight,
  Grid,
  Copy,
  Scissors,
  Wand2,
  Sparkle,
  Undo2,
  Redo2,
  FlipHorizontal,
  Hand,
  SlidersHorizontal,
  Palette,
  Crop,
  MousePointerClick,
  RotateCcw
} from 'lucide-react';
import { 
  BookFormatId, 
  CoverMaterialId, 
  FoilColor, 
  PaperFinishId, 
  PhotobookProject, 
  PhotobookSpread, 
  PageLayoutId, 
  PhotoAsset,
  PhotoFilterMode,
  PageSlot
} from '../types';
import { 
  BOOK_FORMATS, 
  COVER_MATERIALS, 
  FOIL_OPTIONS, 
  PAPER_FINISHES, 
  SAMPLE_PHOTO_PACKS,
  formatPriceARS
} from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { saveUserProject } from '../lib/supabase';
import { 
  batchProcessPhotoFiles, 
  formatFileSize, 
  getThumbnailSrc, 
  calculatePhotoSavingsSummary 
} from '../lib/imageProcessor';
import { FineArtQualityModal } from './FineArtQualityModal';

interface PhotobookBuilderProps {
  onClose: () => void;
  onAddToCart: (project: PhotobookProject, totalPrice: number) => void;
  initialProject?: PhotobookProject | null;
  onOpenAuth?: () => void;
}

export const PhotobookBuilder: React.FC<PhotobookBuilderProps> = ({
  onClose,
  onAddToCart,
  initialProject,
  onOpenAuth,
}) => {
  const { user, profile, isLoggedIn } = useAuth();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Current Builder Step
  const [currentStep, setCurrentStep] = useState<'format' | 'cover' | 'paper' | 'editor' | 'preview'>('format');

  // Photobook Configuration State
  const [projectId, setProjectId] = useState<string>(initialProject?.id || `proj-${Date.now()}`);
  const [formatId, setFormatId] = useState<BookFormatId>(initialProject?.formatId || 'square-30');
  const [coverMaterialId, setCoverMaterialId] = useState<CoverMaterialId>(initialProject?.coverMaterialId || 'linen-natural');
  const [foilColor, setFoilColor] = useState<FoilColor>(initialProject?.foilColor || 'gold');
  const [foilTitleText, setFoilTitleText] = useState(initialProject?.foilTitleText || 'NUESTRA HISTORIA');
  const [foilSubtitleText, setFoilSubtitleText] = useState(initialProject?.foilSubtitleText || 'MEMORIAS INOLVIDABLES · 2026');
  const [hasCoverWindow, setHasCoverWindow] = useState(initialProject?.hasCoverWindow || false);
  const [paperFinishId, setPaperFinishId] = useState<PaperFinishId>(initialProject?.paperFinishId || 'photo-lustre');
  const [giftBoxIncluded, setGiftBoxIncluded] = useState(initialProject?.giftBoxIncluded ?? true);

  // Photos Library
  const [uploadedPhotos, setUploadedPhotos] = useState<PhotoAsset[]>(() => {
    return initialProject?.photos && initialProject.photos.length > 0 
      ? initialProject.photos 
      : [...SAMPLE_PHOTO_PACKS.boda.photos];
  });
  const [selectedPhotoForSlot, setSelectedPhotoForSlot] = useState<string | null>(null);
  const [isOptimizingPhotos, setIsOptimizingPhotos] = useState(false);
  const [optimizingProgress, setOptimizingProgress] = useState<{ current: number; total: number } | null>(null);
  const [inspectedPhotoForQuality, setInspectedPhotoForQuality] = useState<PhotoAsset | null>(null);
  const [qualityFilter, setQualityFilter] = useState<'all' | 'issues' | 'optimal'>('all');

  // Lock background body scroll while builder modal is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Spreads State (each spread has left and right page)
  const [spreads, setSpreads] = useState<PhotobookSpread[]>(() => {
    if (initialProject?.spreads && initialProject.spreads.length > 0) {
      return initialProject.spreads;
    }
    return [
      {
        id: 'spread-1',
        spreadNumber: 1,
        leftPage: {
          id: 'p-1',
          layout: 'editorial-text-photo',
          slots: [{ id: 's-1', photoId: 'w-1', caption: 'Donde todo comenzó' }],
          customTextHeading: 'Capítulo I',
          customTextBody: 'Las mejores historias de amor no terminan nunca; simplemente se transforman en recuerdos que perduran para siempre.',
        },
        rightPage: {
          id: 'p-2',
          layout: 'single-bordered',
          slots: [{ id: 's-2', photoId: 'w-2', caption: 'La primera mirada' }],
        }
      },
      {
        id: 'spread-2',
        spreadNumber: 2,
        leftPage: {
          id: 'p-3',
          layout: 'two-vertical',
          slots: [
            { id: 's-3', photoId: 'w-3', caption: 'Detalles' },
            { id: 's-4', photoId: 'w-4', caption: 'El camino' }
          ],
        },
        rightPage: {
          id: 'p-4',
          layout: 'single-full',
          slots: [{ id: 's-5', photoId: 'w-5' }],
        }
      },
      {
        id: 'spread-3',
        spreadNumber: 3,
        isFullSpreadBleed: true,
        fullSpreadPhotoId: 'w-6',
        leftPage: {
          id: 'p-5',
          layout: 'full-bleed-spread',
          slots: [{ id: 's-6', photoId: 'w-6' }],
        },
        rightPage: {
          id: 'p-6',
          layout: 'full-bleed-spread',
          slots: [{ id: 's-7', photoId: 'w-6' }],
        }
      }
    ];
  });

  const [activeSpreadIndex, setActiveSpreadIndex] = useState(0);
  const [activePageSide, setActivePageSide] = useState<'left' | 'right'>('left');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [activeLayoutMenuSide, setActiveLayoutMenuSide] = useState<'left' | 'right' | 'spread' | null>(null);
  const [showSafeMarginGuides, setShowSafeMarginGuides] = useState(true);
  const [activeEditorTab, setActiveEditorTab] = useState<'photos' | 'layouts' | 'text'>('photos');

  // Zno Designer Toolbar & Customization State
  const [bottomBarMode, setBottomBarMode] = useState<'layouts' | 'pages'>('layouts');
  const [layoutPhotoFilter, setLayoutPhotoFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5+' | 'panoramic' | 'text'>('all');
  const [spreadBgColor, setSpreadBgColor] = useState<string>('#FDFCFA');
  const [spreadPhotoGap, setSpreadPhotoGap] = useState<number>(8);
  const [showBgColorMenu, setShowBgColorMenu] = useState(false);
  const [showGapMenu, setShowGapMenu] = useState(false);
  const [showBorderMenuSlotId, setShowBorderMenuSlotId] = useState<string | null>(null);
  const [showFilterMenuSlotId, setShowFilterMenuSlotId] = useState<string | null>(null);
  const [showSwapPickerSlotId, setShowSwapPickerSlotId] = useState<string | null>(null);

  // Undo / Redo History Stack (Zno Deshacer / Rehacer)
  const [history, setHistory] = useState<PhotobookSpread[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Interactive Pan / Image Displacement State (Zno Pan Tool)
  const [panningSlotId, setPanningSlotId] = useState<string | null>(null);
  const panDragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    slotId: string;
    hasMoved: boolean;
  } | null>(null);

  // Save history snapshot before making changes
  const recordHistorySnapshot = (currentSpreads: PhotobookSpread[]) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(currentSpreads)));
      if (newHistory.length > 25) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 24));
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetState = history[historyIndex - 1];
      if (targetState) {
        setSpreads(JSON.parse(JSON.stringify(targetState)));
        setHistoryIndex(historyIndex - 1);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetState = history[historyIndex + 1];
      if (targetState) {
        setSpreads(JSON.parse(JSON.stringify(targetState)));
        setHistoryIndex(historyIndex + 1);
      }
    }
  };

  // Interactive Frame Node Resize State & Rotation State
  const [resizingHandle, setResizingHandle] = useState<{
    slotId: string;
    handle: string;
    wDelta: number;
    hDelta: number;
  } | null>(null);

  const [rotatingSlotState, setRotatingSlotState] = useState<{
    slotId: string;
    deg: number;
  } | null>(null);

  // Live Panning Drag Handler for image displacement inside frame
  const handleStartPan = (slot: PageSlot, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPanningSlotId(slot.id);
    const currentPos = slot.customPosition || { x: 0, y: 0 };
    panDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentPos.x,
      initialY: currentPos.y,
      slotId: slot.id,
      hasMoved: false
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!panDragRef.current) return;
      const dx = moveEvent.clientX - panDragRef.current.startX;
      const dy = moveEvent.clientY - panDragRef.current.startY;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        panDragRef.current.hasMoved = true;
      }
      const newX = Math.round(panDragRef.current.initialX + dx);
      const newY = Math.round(panDragRef.current.initialY + dy);

      setSpreads((prevSpreads) => {
        const activeSpread = prevSpreads[activeSpreadIndex];
        if (!activeSpread) return prevSpreads;

        const updateSlots = (page: any) => ({
          ...page,
          slots: page.slots.map((s: PageSlot) =>
            s.id === panDragRef.current?.slotId ? { ...s, customPosition: { x: newX, y: newY } } : s
          )
        });

        const updatedSpread = {
          ...activeSpread,
          leftPage: updateSlots(activeSpread.leftPage),
          rightPage: updateSlots(activeSpread.rightPage)
        };

        return prevSpreads.map((s, i) => (i === activeSpreadIndex ? updatedSpread : s));
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      if (panDragRef.current?.hasMoved) {
        recordHistorySnapshot(spreads);
      }
      setPanningSlotId(null);
      panDragRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Interactive Frame Node Resize Handler (8 Bounding Box Handles)
  const handleStartResize = (
    slot: PageSlot,
    handle: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w',
    e: React.PointerEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialW = slot.frameWidthDelta || 0;
    const initialH = slot.frameHeightDelta || 0;
    const initialOffX = slot.frameOffsetX || 0;
    const initialOffY = slot.frameOffsetY || 0;

    let hasMoved = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        hasMoved = true;
      }

      let newW = initialW;
      let newH = initialH;
      let newOffX = initialOffX;
      let newOffY = initialOffY;

      if (handle === 'se') {
        newW = initialW + dx;
        newH = initialH + dy;
      } else if (handle === 'e') {
        newW = initialW + dx;
      } else if (handle === 's') {
        newH = initialH + dy;
      } else if (handle === 'sw') {
        newW = initialW - dx;
        newH = initialH + dy;
        newOffX = initialOffX + dx;
      } else if (handle === 'w') {
        newW = initialW - dx;
        newOffX = initialOffX + dx;
      } else if (handle === 'ne') {
        newW = initialW + dx;
        newH = initialH - dy;
        newOffY = initialOffY + dy;
      } else if (handle === 'n') {
        newH = initialH - dy;
        newOffY = initialOffY + dy;
      } else if (handle === 'nw') {
        newW = initialW - dx;
        newH = initialH - dy;
        newOffX = initialOffX + dx;
        newOffY = initialOffY + dy;
      }

      newW = Math.max(-150, Math.min(600, Math.round(newW)));
      newH = Math.max(-150, Math.min(600, Math.round(newH)));
      newOffX = Math.round(newOffX);
      newOffY = Math.round(newOffY);

      setResizingHandle({ slotId: slot.id, handle, wDelta: newW, hDelta: newH });

      setSpreads((prevSpreads) => {
        const activeSpread = prevSpreads[activeSpreadIndex];
        if (!activeSpread) return prevSpreads;

        const updateSlots = (page: any) => ({
          ...page,
          slots: page.slots.map((s: PageSlot) =>
            s.id === slot.id
              ? {
                  ...s,
                  frameWidthDelta: newW,
                  frameHeightDelta: newH,
                  frameOffsetX: newOffX,
                  frameOffsetY: newOffY,
                }
              : s
          ),
        });

        const updatedSpread = {
          ...activeSpread,
          leftPage: updateSlots(activeSpread.leftPage),
          rightPage: updateSlots(activeSpread.rightPage),
        };

        return prevSpreads.map((s, i) => (i === activeSpreadIndex ? updatedSpread : s));
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      if (hasMoved) {
        recordHistorySnapshot(spreads);
      }
      setResizingHandle(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Interactive Rotation Handler (Drag Top Node)
  const handleStartRotateInteractive = (slot: PageSlot, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const targetEl = document.getElementById(slot.id);
    let centerX = e.clientX;
    let centerY = e.clientY + 50;

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;
    }

    let hasMoved = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - centerX;
      const dy = moveEvent.clientY - centerY;
      hasMoved = true;

      const angleRad = Math.atan2(dy, dx);
      let deg = Math.round((angleRad * 180) / Math.PI) + 90;
      if (deg < 0) deg += 360;
      deg = deg % 360;

      // Snap near angles 0, 45, 90, 135, 180, 225, 270, 315, 360
      for (const snap of [0, 45, 90, 135, 180, 225, 270, 315, 360]) {
        if (Math.abs(deg - snap) <= 4) {
          deg = snap % 360;
          break;
        }
      }

      setRotatingSlotState({ slotId: slot.id, deg });

      setSpreads((prevSpreads) => {
        const activeSpread = prevSpreads[activeSpreadIndex];
        if (!activeSpread) return prevSpreads;

        const updateSlots = (page: any) => ({
          ...page,
          slots: page.slots.map((s: PageSlot) =>
            s.id === slot.id ? { ...s, rotation: deg } : s
          ),
        });

        const updatedSpread = {
          ...activeSpread,
          leftPage: updateSlots(activeSpread.leftPage),
          rightPage: updateSlots(activeSpread.rightPage),
        };

        return prevSpreads.map((s, i) => (i === activeSpreadIndex ? updatedSpread : s));
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      if (hasMoved) {
        recordHistorySnapshot(spreads);
      }
      setRotatingSlotState(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Interactive Frame Move Handler (Move entire frame on page)
  const handleStartFrameMove = (slot: PageSlot, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialOffX = slot.frameOffsetX || 0;
    const initialOffY = slot.frameOffsetY || 0;
    let hasMoved = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        hasMoved = true;
      }

      const newOffX = Math.round(initialOffX + dx);
      const newOffY = Math.round(initialOffY + dy);

      setSpreads((prevSpreads) => {
        const activeSpread = prevSpreads[activeSpreadIndex];
        if (!activeSpread) return prevSpreads;

        const updateSlots = (page: any) => ({
          ...page,
          slots: page.slots.map((s: PageSlot) =>
            s.id === slot.id
              ? { ...s, frameOffsetX: newOffX, frameOffsetY: newOffY }
              : s
          ),
        });

        const updatedSpread = {
          ...activeSpread,
          leftPage: updateSlots(activeSpread.leftPage),
          rightPage: updateSlots(activeSpread.rightPage),
        };

        return prevSpreads.map((s, i) => (i === activeSpreadIndex ? updatedSpread : s));
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      if (hasMoved) {
        recordHistorySnapshot(spreads);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleResetSlotPosition = (slotId: string) => {
    updateActiveSlot(slotId, (slot) => ({
      ...slot,
      customPosition: { x: 0, y: 0 }
    }));
  };

  const handleNudgeSlotPosition = (slotId: string, dx: number, dy: number) => {
    updateActiveSlot(slotId, (slot) => {
      const cur = slot.customPosition || { x: 0, y: 0 };
      return {
        ...slot,
        customPosition: { x: cur.x + dx, y: cur.y + dy }
      };
    });
  };

  // Photo Dragging & Drop Slot State
  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null);
  const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null);

  // File upload reference
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to count how many times a photo is used across all spreads
  const getPhotoUsageCount = (photoId: string): number => {
    let count = 0;
    spreads.forEach((spread) => {
      if (spread.isFullSpreadBleed && spread.fullSpreadPhotoId === photoId) {
        count++;
      }
      spread.leftPage.slots.forEach((s) => {
        if (s.photoId === photoId) count++;
      });
      spread.rightPage.slots.forEach((s) => {
        if (s.photoId === photoId) count++;
      });
    });
    return count;
  };

  // Helper to update a single slot in active spread with history tracking
  const updateActiveSlot = (slotId: string, updater: (slot: PageSlot) => PageSlot) => {
    const activeSpread = spreads[activeSpreadIndex];
    if (!activeSpread) return;

    recordHistorySnapshot(spreads);

    const updatePageSlots = (page: any) => ({
      ...page,
      slots: page.slots.map((s: PageSlot) => (s.id === slotId ? updater(s) : s))
    });

    const updatedSpread: PhotobookSpread = {
      ...activeSpread,
      leftPage: updatePageSlots(activeSpread.leftPage),
      rightPage: updatePageSlots(activeSpread.rightPage),
    };

    setSpreads((prev) => prev.map((s, i) => (i === activeSpreadIndex ? updatedSpread : s)));
  };

  // Zoom / Pan / Rotate / Filter / Flip / Fit handlers for active slot
  const handleSlotZoom = (slotId: string, delta: number) => {
    updateActiveSlot(slotId, (slot) => {
      const currentScale = slot.customScale || 1;
      const nextScale = Math.min(3, Math.max(1, +(currentScale + delta).toFixed(2)));
      return { ...slot, customScale: nextScale };
    });
  };

  const handleSlotSetScale = (slotId: string, scale: number) => {
    const nextScale = Math.min(3, Math.max(1, +(scale).toFixed(2)));
    setSpreads((prevSpreads) => {
      const activeSpread = prevSpreads[activeSpreadIndex];
      if (!activeSpread) return prevSpreads;

      const updateSlots = (page: any) => ({
        ...page,
        slots: page.slots.map((s: PageSlot) => (s.id === slotId ? { ...s, customScale: nextScale } : s))
      });

      return prevSpreads.map((s, i) =>
        i === activeSpreadIndex
          ? {
              ...s,
              leftPage: updateSlots(s.leftPage),
              rightPage: updateSlots(s.rightPage),
            }
          : s
      );
    });
  };

  const handleSlotSetPositionX = (slotId: string, x: number) => {
    setSpreads((prevSpreads) => {
      const activeSpread = prevSpreads[activeSpreadIndex];
      if (!activeSpread) return prevSpreads;

      const updateSlots = (page: any) => ({
        ...page,
        slots: page.slots.map((s: PageSlot) => {
          if (s.id !== slotId) return s;
          const cur = s.customPosition || { x: 0, y: 0 };
          return { ...s, customPosition: { ...cur, x } };
        })
      });

      return prevSpreads.map((s, i) =>
        i === activeSpreadIndex
          ? {
              ...s,
              leftPage: updateSlots(s.leftPage),
              rightPage: updateSlots(s.rightPage),
            }
          : s
      );
    });
  };

  const handleSlotSetPositionY = (slotId: string, y: number) => {
    setSpreads((prevSpreads) => {
      const activeSpread = prevSpreads[activeSpreadIndex];
      if (!activeSpread) return prevSpreads;

      const updateSlots = (page: any) => ({
        ...page,
        slots: page.slots.map((s: PageSlot) => {
          if (s.id !== slotId) return s;
          const cur = s.customPosition || { x: 0, y: 0 };
          return { ...s, customPosition: { ...cur, y } };
        })
      });

      return prevSpreads.map((s, i) =>
        i === activeSpreadIndex
          ? {
              ...s,
              leftPage: updateSlots(s.leftPage),
              rightPage: updateSlots(s.rightPage),
            }
          : s
      );
    });
  };

  const handleSlotSetFrameWidth = (slotId: string, delta: number) => {
    updateActiveSlot(slotId, (slot) => ({ ...slot, frameWidthDelta: delta }));
  };

  const handleSlotSetFrameHeight = (slotId: string, delta: number) => {
    updateActiveSlot(slotId, (slot) => ({ ...slot, frameHeightDelta: delta }));
  };

  const handleSlotSetFrameOffsetX = (slotId: string, offset: number) => {
    updateActiveSlot(slotId, (slot) => ({ ...slot, frameOffsetX: offset }));
  };

  const handleSlotSetFrameOffsetY = (slotId: string, offset: number) => {
    updateActiveSlot(slotId, (slot) => ({ ...slot, frameOffsetY: offset }));
  };

  const handleResetFrameDimensions = (slotId: string) => {
    updateActiveSlot(slotId, (slot) => ({
      ...slot,
      frameWidthDelta: 0,
      frameHeightDelta: 0,
      frameOffsetX: 0,
      frameOffsetY: 0,
    }));
  };

  const handleSlotRotate = (slotId: string) => {
    updateActiveSlot(slotId, (slot) => {
      const currentRot = slot.rotation || 0;
      const nextRot = (currentRot + 90) % 360;
      return { ...slot, rotation: nextRot };
    });
  };

  const handleSlotSetRotation = (slotId: string, rot: number) => {
    updateActiveSlot(slotId, (slot) => ({ ...slot, rotation: rot % 360 }));
  };

  const handleSlotFlipH = (slotId: string) => {
    updateActiveSlot(slotId, (slot) => ({
      ...slot,
      flipH: !slot.flipH
    }));
  };

  const handleSlotFitMode = (slotId: string) => {
    updateActiveSlot(slotId, (slot) => ({
      ...slot,
      fitMode: slot.fitMode === 'contain' ? 'cover' : 'contain'
    }));
  };

  const handleSlotBorder = (slotId: string, borderWidth: number, borderColor = '#FFFFFF') => {
    updateActiveSlot(slotId, (slot) => ({
      ...slot,
      borderWidth,
      borderColor,
      borderRadius: borderWidth > 0 ? 4 : 0
    }));
    setShowBorderMenuSlotId(null);
  };

  const handleSlotFilter = (slotId: string, filter: PhotoFilterMode) => {
    updateActiveSlot(slotId, (slot) => ({ ...slot, filter }));
    setShowFilterMenuSlotId(null);
  };

  const handleRemovePhotoFromSlot = (slotId: string) => {
    updateActiveSlot(slotId, (slot) => ({
      ...slot,
      photoId: undefined,
      customScale: 1,
      customPosition: { x: 0, y: 0 },
      filter: 'none',
      rotation: 0,
      flipH: false
    }));
    setSelectedSlotId(null);
  };

  // Add photo slot dynamically to active page (Zno "Agregar Marco")
  const handleAddPhotoSlotToPage = (side: 'left' | 'right') => {
    const activeSpread = spreads[activeSpreadIndex];
    if (!activeSpread) return;

    recordHistorySnapshot(spreads);

    const targetPage = side === 'left' ? activeSpread.leftPage : activeSpread.rightPage;
    const newSlotId = `slot-add-${Date.now()}`;
    const newSlot: PageSlot = { id: newSlotId };

    const updatedPage = {
      ...targetPage,
      slots: [...targetPage.slots, newSlot]
    };

    const updatedSpread: PhotobookSpread = {
      ...activeSpread,
      [side === 'left' ? 'leftPage' : 'rightPage']: updatedPage
    };

    setSpreads((prev) => prev.map((s, i) => (i === activeSpreadIndex ? updatedSpread : s)));
    setSelectedSlotId(newSlotId);
  };

  // Invert left and right pages in current spread (Zno "Voltear")
  const handleFlipSpreadSides = () => {
    const activeSpread = spreads[activeSpreadIndex];
    if (!activeSpread) return;

    recordHistorySnapshot(spreads);

    const updatedSpread: PhotobookSpread = {
      ...activeSpread,
      leftPage: { ...activeSpread.rightPage, id: `p-${Date.now()}-L` },
      rightPage: { ...activeSpread.leftPage, id: `p-${Date.now()}-R` }
    };

    setSpreads((prev) => prev.map((s, i) => (i === activeSpreadIndex ? updatedSpread : s)));
  };

  const handleDuplicateSpread = (index: number) => {
    const spreadToCopy = spreads[index];
    if (!spreadToCopy) return;

    const newSpread: PhotobookSpread = {
      ...spreadToCopy,
      id: `spread-dup-${Date.now()}`,
      spreadNumber: spreads.length + 1,
      leftPage: {
        ...spreadToCopy.leftPage,
        id: `p-dup-L-${Date.now()}`,
        slots: spreadToCopy.leftPage.slots.map((s, idx) => ({ ...s, id: `s-dup-L-${Date.now()}-${idx}` }))
      },
      rightPage: {
        ...spreadToCopy.rightPage,
        id: `p-dup-R-${Date.now()}`,
        slots: spreadToCopy.rightPage.slots.map((s, idx) => ({ ...s, id: `s-dup-R-${Date.now()}-${idx}` }))
      }
    };

    const newSpreads = [...spreads];
    newSpreads.splice(index + 1, 0, newSpread);
    const renumbered = newSpreads.map((s, idx) => ({ ...s, spreadNumber: idx + 1 }));
    setSpreads(renumbered);
    setActiveSpreadIndex(index + 1);
  };

  // Swap photos between two slots
  const handleSwapSlots = (slotIdA: string, slotIdB: string) => {
    const activeSpread = spreads[activeSpreadIndex];
    if (!activeSpread) return;

    const allSlots = [...activeSpread.leftPage.slots, ...activeSpread.rightPage.slots];
    const slotA = allSlots.find((s) => s.id === slotIdA);
    const slotB = allSlots.find((s) => s.id === slotIdB);
    if (!slotA || !slotB) return;

    const photoA = slotA.photoId;
    const photoB = slotB.photoId;

    const swapInPage = (page: any) => ({
      ...page,
      slots: page.slots.map((s: PageSlot) => {
        if (s.id === slotIdA) return { ...s, photoId: photoB };
        if (s.id === slotIdB) return { ...s, photoId: photoA };
        return s;
      })
    });

    const updatedSpread: PhotobookSpread = {
      ...activeSpread,
      leftPage: swapInPage(activeSpread.leftPage),
      rightPage: swapInPage(activeSpread.rightPage),
    };

    setSpreads((prev) => prev.map((s, i) => (i === activeSpreadIndex ? updatedSpread : s)));
  };

  // Calculate pricing
  const currentFormat = BOOK_FORMATS.find((f) => f.id === formatId) || BOOK_FORMATS[0];
  const currentCover = COVER_MATERIALS.find((c) => c.id === coverMaterialId) || COVER_MATERIALS[0];
  const currentPaper = PAPER_FINISHES.find((p) => p.id === paperFinishId) || PAPER_FINISHES[0];

  const totalPages = spreads.length * 2;
  const extraPages = Math.max(0, totalPages - currentFormat.basePages);
  const extraSpreads = Math.ceil(extraPages / 2);
  const extraPagesCost = extraSpreads * currentFormat.extraSpreadPrice;
  const giftBoxCost = giftBoxIncluded ? 28000 : 0;
  const coverUpgradeCost = currentCover.priceDelta;
  const paperUpgradeCost = currentPaper.priceDelta;
  const totalPrice = currentFormat.basePrice + extraPagesCost + giftBoxCost + coverUpgradeCost + paperUpgradeCost;

  // Handlers for photos
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsOptimizingPhotos(true);
    setOptimizingProgress({ current: 0, total: files.length });

    try {
      const processedAssets = await batchProcessPhotoFiles(
        files,
        { maxDimension: 380, quality: 0.8 },
        (processed, total) => {
          setOptimizingProgress({ current: processed, total });
        }
      );

      setUploadedPhotos((prev) => [...processedAssets, ...prev]);
    } catch (err) {
      console.error('Error processing uploaded photos:', err);
    } finally {
      setIsOptimizingPhotos(false);
      setOptimizingProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLoadSamplePack = (packKey: 'boda' | 'familia' | 'viaje') => {
    const pack = SAMPLE_PHOTO_PACKS[packKey];
    if (!pack) return;
    setUploadedPhotos(pack.photos);
  };

  // Spread manipulations
  const handleAddSpread = () => {
    const newSpreadNumber = spreads.length + 1;
    const newSpread: PhotobookSpread = {
      id: `spread-${Date.now()}`,
      spreadNumber: newSpreadNumber,
      leftPage: {
        id: `p-${Date.now()}-L`,
        layout: 'single-bordered',
        slots: [{ id: `s-${Date.now()}-1` }],
      },
      rightPage: {
        id: `p-${Date.now()}-R`,
        layout: 'two-vertical',
        slots: [{ id: `s-${Date.now()}-2` }, { id: `s-${Date.now()}-3` }],
      }
    };
    setSpreads((prev) => [...prev, newSpread]);
    setActiveSpreadIndex(spreads.length);
  };

  const handleDeleteSpread = (index: number) => {
    if (spreads.length <= 1) return;
    const filtered = spreads.filter((_, i) => i !== index);
    // re-number
    const renumbered = filtered.map((s, idx) => ({ ...s, spreadNumber: idx + 1 }));
    setSpreads(renumbered);
    setActiveSpreadIndex(Math.max(0, Math.min(index, renumbered.length - 1)));
  };

  // Change page layout
  const handleChangePageLayout = (side: 'left' | 'right', newLayout: PageLayoutId) => {
    const activeSpread = spreads[activeSpreadIndex];
    if (!activeSpread) return;

    let newSlots = [{ id: `slot-${Date.now()}-1` }];
    if (newLayout === 'two-vertical' || newLayout === 'two-horizontal') {
      newSlots = [
        { id: `slot-${Date.now()}-1` },
        { id: `slot-${Date.now()}-2` }
      ];
    } else if (newLayout === 'three-collage') {
      newSlots = [
        { id: `slot-${Date.now()}-1` },
        { id: `slot-${Date.now()}-2` },
        { id: `slot-${Date.now()}-3` }
      ];
    } else if (newLayout === 'four-grid') {
      newSlots = [
        { id: `slot-${Date.now()}-1` },
        { id: `slot-${Date.now()}-2` },
        { id: `slot-${Date.now()}-3` },
        { id: `slot-${Date.now()}-4` }
      ];
    } else if (newLayout === 'full-bleed-spread') {
      // Makes both pages full bleed with one photo
      const updatedSpread: PhotobookSpread = {
        ...activeSpread,
        isFullSpreadBleed: true,
        fullSpreadPhotoId: uploadedPhotos[0]?.id,
        leftPage: { ...activeSpread.leftPage, layout: 'full-bleed-spread' },
        rightPage: { ...activeSpread.rightPage, layout: 'full-bleed-spread' },
      };
      setSpreads((prev) => prev.map((s, i) => (i === activeSpreadIndex ? updatedSpread : s)));
      setActiveLayoutMenuSide(null);
      return;
    }

    const updatedSpread: PhotobookSpread = {
      ...activeSpread,
      isFullSpreadBleed: false,
      [side === 'left' ? 'leftPage' : 'rightPage']: {
        ...activeSpread[side === 'left' ? 'leftPage' : 'rightPage'],
        layout: newLayout,
        slots: newSlots,
      }
    };

    setSpreads((prev) => prev.map((s, i) => (i === activeSpreadIndex ? updatedSpread : s)));
    setActiveLayoutMenuSide(null);
  };

  // Assign photo to slot
  const handleAssignPhotoToSlot = (slotId: string, photoId: string) => {
    const activeSpread = spreads[activeSpreadIndex];
    if (!activeSpread) return;

    const updateSideSlots = (page: any) => ({
      ...page,
      slots: page.slots.map((s: any) => (s.id === slotId ? { ...s, photoId } : s))
    });

    const updatedSpread: PhotobookSpread = {
      ...activeSpread,
      leftPage: updateSideSlots(activeSpread.leftPage),
      rightPage: updateSideSlots(activeSpread.rightPage),
    };

    setSpreads((prev) => prev.map((s, i) => (i === activeSpreadIndex ? updatedSpread : s)));
    setSelectedSlotId(null);
  };

  // Smart Auto Fill
  const handleAutoLayout = () => {
    if (uploadedPhotos.length === 0) return;
    recordHistorySnapshot(spreads);

    let photoIdx = 0;
    const newSpreads: PhotobookSpread[] = [];
    const spreadCount = Math.max(3, Math.ceil(uploadedPhotos.length / 3));

    for (let i = 0; i < spreadCount; i++) {
      const p1 = uploadedPhotos[photoIdx % uploadedPhotos.length];
      const p2 = uploadedPhotos[(photoIdx + 1) % uploadedPhotos.length];
      const p3 = uploadedPhotos[(photoIdx + 2) % uploadedPhotos.length];
      photoIdx += 3;

      newSpreads.push({
        id: `spread-auto-${i + 1}`,
        spreadNumber: i + 1,
        leftPage: {
          id: `p-${i}-L`,
          layout: i === 0 ? 'editorial-text-photo' : i % 2 === 0 ? 'single-bordered' : 'two-vertical',
          slots: [
            { id: `s-${i}-1`, photoId: p1?.id },
            { id: `s-${i}-2`, photoId: p2?.id }
          ],
          customTextHeading: i === 0 ? foilTitleText : undefined,
          customTextBody: i === 0 ? 'Cada página guarda un instante irrepetible.' : undefined,
        },
        rightPage: {
          id: `p-${i}-R`,
          layout: i % 2 === 0 ? 'two-vertical' : 'single-full',
          slots: [
            { id: `s-${i}-3`, photoId: p3?.id }
          ],
        }
      });
    }

    setSpreads(newSpreads);
    setActiveSpreadIndex(0);
  };

  const handleAutoPopulateSpreads = handleAutoLayout;

  // Save Project Draft
  const handleSaveDraft = async () => {
    setSaveStatus('saving');
    const project: PhotobookProject = {
      id: projectId,
      title: foilTitleText || 'Fotolibro Fine Art',
      subtitle: foilSubtitleText,
      formatId,
      coverMaterialId,
      foilColor,
      foilTitleText,
      foilSubtitleText,
      paperFinishId,
      hasCoverWindow,
      photos: uploadedPhotos,
      spreads,
      giftBoxIncluded,
      createdAt: initialProject?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const currentUserId = user?.id || profile?.id || 'local-user';
    await saveUserProject(currentUserId, project, totalPrice);

    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  // Finalize Project
  const handleFinishAndOrder = () => {
    const project: PhotobookProject = {
      id: projectId || `album-${Date.now()}`,
      title: foilTitleText || 'Fotolibro Fine Art',
      subtitle: foilSubtitleText,
      formatId,
      coverMaterialId,
      foilColor,
      foilTitleText,
      foilSubtitleText,
      paperFinishId,
      hasCoverWindow,
      photos: uploadedPhotos,
      spreads,
      giftBoxIncluded,
      createdAt: initialProject?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddToCart(project, totalPrice);
  };

  const activeSpread = spreads[activeSpreadIndex] || spreads[0];

  // Interactive Slot Renderer with Zno Cloud Pro Editing Controls
  const renderSlotInteractive = (slot?: PageSlot, containerClasses = '') => {
    if (!slot) return null;

    const photo = uploadedPhotos.find((p) => p.id === slot.photoId);
    const isSelected = selectedSlotId === slot.id;
    const isDragOver = dragOverSlotId === slot.id;
    const scale = slot.customScale || 1;
    const rotation = slot.rotation || 0;
    const flipH = slot.flipH || false;
    const fitMode = slot.fitMode || 'cover';
    const filter = slot.filter || 'none';
    const borderWidth = slot.borderWidth || 0;
    const borderColor = slot.borderColor || '#FFFFFF';

    // CSS filter styling mapping
    const getFilterClass = (f: PhotoFilterMode) => {
      switch (f) {
        case 'fine-art-bw':
          return 'grayscale contrast-125';
        case 'warm-vintage':
          return 'sepia-[0.45] contrast-105 saturate-110';
        case 'high-contrast':
          return 'contrast-135 saturate-115 brightness-95';
        case 'fuji-film':
          return 'saturate-120 contrast-110 hue-rotate-[350deg]';
        case 'kodak-chrome':
          return 'sepia-[0.15] contrast-125 saturate-130';
        case 'matte-portrait':
          return 'contrast-90 brightness-105 saturate-95';
        default:
          return '';
      }
    };

    return (
      <div
        key={slot.id}
        id={slot.id}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedSlotId(slot.id);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOverSlotId(slot.id);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (dragOverSlotId === slot.id) setDragOverSlotId(null);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOverSlotId(null);
          if (draggedPhotoId) {
            handleAssignPhotoToSlot(slot.id, draggedPhotoId);
          }
        }}
        onWheel={(e) => {
          if (photo) {
            e.preventDefault();
            e.stopPropagation();
            if (selectedSlotId !== slot.id) {
              setSelectedSlotId(slot.id);
            }
            const delta = e.deltaY < 0 ? 0.08 : -0.08;
            const currentScale = slot.customScale || 1;
            const nextScale = Math.min(3, Math.max(1, +(currentScale + delta).toFixed(2)));
            handleSlotSetScale(slot.id, nextScale);
          }
        }}
        style={{
          borderWidth: borderWidth > 0 ? `${borderWidth}px` : undefined,
          borderColor: borderWidth > 0 ? borderColor : undefined,
          transform: (slot.frameOffsetX || slot.frameOffsetY)
            ? `translate(${slot.frameOffsetX || 0}px, ${slot.frameOffsetY || 0}px)`
            : undefined,
          width: slot.frameWidthDelta ? `calc(100% + ${slot.frameWidthDelta}px)` : undefined,
          height: slot.frameHeightDelta ? `calc(100% + ${slot.frameHeightDelta}px)` : undefined,
          zIndex: isSelected ? 35 : (slot.frameOffsetX || slot.frameOffsetY || slot.frameWidthDelta || slot.frameHeightDelta) ? 20 : undefined,
        }}
        className={`group relative overflow-visible rounded-lg transition-all cursor-pointer select-none ${containerClasses} ${
          isSelected
            ? 'ring-2 ring-[#0091FF] shadow-lg'
            : isDragOver
            ? 'border-dashed border-2 border-[#8C6D37] bg-[#8C6D37]/15 scale-[1.01]'
            : 'border border-[#D6CEBE]/80 hover:border-[#1F1C18]'
        } bg-[#EFE9DE]`}
      >
        {/* Content Container */}
        <div 
          className={`w-full h-full relative overflow-hidden rounded-md flex items-center justify-center bg-black/5 ${
            isSelected && photo ? (panningSlotId === slot.id ? 'cursor-grabbing' : 'cursor-grab') : ''
          }`}
          onPointerDown={(e) => {
            if (isSelected && photo) {
              handleStartPan(slot, e);
            }
          }}
        >
          {photo ? (
            <div className="w-full h-full relative overflow-hidden flex items-center justify-center pointer-events-none">
              {/* The Photo with transform (Zoom, Rotate, Flip, Fit, Position) */}
              <img
                src={photo.url}
                alt={photo.name}
                draggable={false}
                className={`w-full h-full transition-transform duration-75 ease-out select-none ${
                  fitMode === 'contain' ? 'object-contain' : 'object-cover'
                } ${getFilterClass(filter)}`}
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) translate(${slot.customPosition?.x || 0}px, ${slot.customPosition?.y || 0}px)`,
                }}
              />

              {/* Quick DPI & Filter Tags */}
              <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                {filter !== 'none' && (
                  <span className="px-1 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[8px] uppercase font-mono">
                    {filter}
                  </span>
                )}
                {scale > 1 && (
                  <span className="px-1 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[8px] font-mono">
                    {Math.round(scale * 100)}%
                  </span>
                )}
                {(slot.customPosition?.x !== 0 || slot.customPosition?.y !== 0) && (
                  <span className="px-1 py-0.5 rounded bg-[#0091FF]/80 backdrop-blur-xs text-white text-[8px] font-mono">
                    Encuadre ({slot.customPosition?.x || 0}px, {slot.customPosition?.y || 0}px)
                  </span>
                )}
                {Boolean(slot.frameWidthDelta || slot.frameHeightDelta || slot.frameOffsetX || slot.frameOffsetY) && (
                  <span className="px-1 py-0.5 rounded bg-[#8C6D37]/90 backdrop-blur-xs text-white text-[8px] font-mono">
                    Marco Personalizado
                  </span>
                )}
                {flipH && (
                  <span className="px-1 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[8px] font-mono">
                    Espejo
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Empty Slot / Placeholder */
            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-[#736B60]">
              <ImageIcon className="w-6 h-6 mb-1 text-[#8C6D37]/50" />
              <span className="text-[10px] font-bold text-[#595248] block leading-tight">
                {isDragOver ? 'Soltar foto aquí' : isSelected ? 'Haz clic en una foto' : 'Ranura Vacía'}
              </span>
              <span className="text-[8px] text-[#A89F91]">Arrastra o selecciona</span>
            </div>
          )}
        </div>

        {/* ZNO CLOUD SELECTION HANDLES & OVERLAYS WHEN SELECTED (Screenshot 2 Match) */}
        {isSelected && photo && (
          <>
            {/* Top Rotation Pivot Handle */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto z-40">
              <button
                type="button"
                onPointerDown={(e) => handleStartRotateInteractive(slot, e)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSlotRotate(slot.id);
                }}
                title="Arrastra para rotar libremente o haz clic para girar 90°"
                className={`w-6 h-6 rounded-full bg-white border-2 border-[#0091FF] text-[#0091FF] hover:bg-[#0091FF] hover:text-white flex items-center justify-center shadow-lg transition-transform ${
                  rotatingSlotState?.slotId === slot.id ? 'scale-125 ring-2 ring-[#0091FF]' : 'hover:scale-110'
                } cursor-grab active:cursor-grabbing`}
              >
                <RotateCw className="w-3 h-3" />
              </button>
              <div className="w-[1.5px] h-2.5 bg-[#0091FF]" />
            </div>

            {/* 8 Bounding Control Handles (Cyan / Blue Zno Style) - Fully Interactive Nodes */}
            {/* Top-Left (NW) */}
            <div
              onPointerDown={(e) => handleStartResize(slot, 'nw', e)}
              title="Redimensionar esquina superior izquierda"
              className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-white border-2 border-[#0091FF] hover:bg-[#0091FF] hover:scale-125 transition-transform shadow-md pointer-events-auto z-40 cursor-nwse-resize"
            />
            {/* Top-Center (N) */}
            <div
              onPointerDown={(e) => handleStartResize(slot, 'n', e)}
              title="Redimensionar altura superior"
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#0091FF] hover:bg-[#0091FF] hover:scale-125 transition-transform shadow-md pointer-events-auto z-40 cursor-ns-resize"
            />
            {/* Top-Right (NE) */}
            <div
              onPointerDown={(e) => handleStartResize(slot, 'ne', e)}
              title="Redimensionar esquina superior derecha"
              className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white border-2 border-[#0091FF] hover:bg-[#0091FF] hover:scale-125 transition-transform shadow-md pointer-events-auto z-40 cursor-nesw-resize"
            />
            {/* Left-Center (W) */}
            <div
              onPointerDown={(e) => handleStartResize(slot, 'w', e)}
              title="Redimensionar ancho izquierdo"
              className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#0091FF] hover:bg-[#0091FF] hover:scale-125 transition-transform shadow-md pointer-events-auto z-40 cursor-ew-resize"
            />
            {/* Right-Center (E) */}
            <div
              onPointerDown={(e) => handleStartResize(slot, 'e', e)}
              title="Redimensionar ancho derecho"
              className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#0091FF] hover:bg-[#0091FF] hover:scale-125 transition-transform shadow-md pointer-events-auto z-40 cursor-ew-resize"
            />
            {/* Bottom-Left (SW) */}
            <div
              onPointerDown={(e) => handleStartResize(slot, 'sw', e)}
              title="Redimensionar esquina inferior izquierda"
              className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-white border-2 border-[#0091FF] hover:bg-[#0091FF] hover:scale-125 transition-transform shadow-md pointer-events-auto z-40 cursor-nesw-resize"
            />
            {/* Bottom-Center (S) */}
            <div
              onPointerDown={(e) => handleStartResize(slot, 's', e)}
              title="Redimensionar altura inferior"
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#0091FF] hover:bg-[#0091FF] hover:scale-125 transition-transform shadow-md pointer-events-auto z-40 cursor-ns-resize"
            />
            {/* Bottom-Right (SE) */}
            <div
              onPointerDown={(e) => handleStartResize(slot, 'se', e)}
              title="Redimensionar esquina inferior derecha"
              className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-white border-2 border-[#0091FF] hover:bg-[#0091FF] hover:scale-125 transition-transform shadow-md pointer-events-auto z-40 cursor-nwse-resize"
            />

            {/* Top-Left Circular Swap Icon Button (Zno Screenshot 2) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSwapPickerSlotId(showSwapPickerSlotId === slot.id ? null : slot.id);
              }}
              title="Intercambiar con otra foto"
              className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-[#0091FF] hover:bg-[#0077D4] text-white flex items-center justify-center shadow-md z-40 transition-transform hover:scale-110"
            >
              <ArrowLeftRight className="w-3 h-3" />
            </button>

            {/* Frame Move Button (Move entire frame box on page) */}
            <div
              onPointerDown={(e) => handleStartFrameMove(slot, e)}
              title="Arrastra para mover la posición del marco en la página"
              className="absolute -top-2.5 right-6 w-6 h-6 rounded-full bg-[#1F1C18] text-white flex items-center justify-center shadow-md z-40 cursor-move hover:scale-110 transition-transform"
            >
              <Move className="w-3 h-3" />
            </div>

            {/* Live Active HUD indicator */}
            {resizingHandle?.slotId === slot.id && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1F1C18] text-white text-[10px] font-mono px-2.5 py-1 rounded-full shadow-2xl border border-white/20 z-50 whitespace-nowrap pointer-events-none flex items-center gap-1.5">
                <span className="text-[#0091FF] font-bold">Marco:</span>
                <span>Ancho {resizingHandle.wDelta >= 0 ? `+${resizingHandle.wDelta}` : resizingHandle.wDelta}px</span>
                <span className="text-white/40">|</span>
                <span>Alto {resizingHandle.hDelta >= 0 ? `+${resizingHandle.hDelta}` : resizingHandle.hDelta}px</span>
              </div>
            )}
            {rotatingSlotState?.slotId === slot.id && (
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#1F1C18] text-white text-[10px] font-mono px-2.5 py-1 rounded-full shadow-2xl border border-white/20 z-50 whitespace-nowrap pointer-events-none flex items-center gap-1.5">
                <RotateCw className="w-3 h-3 text-[#0091FF]" />
                <span>Rotación: {rotatingSlotState.deg}°</span>
              </div>
            )}

            {/* Central Pan Hand Tool - Supports interactive drag & displacement */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <div
                onPointerDown={(e) => handleStartPan(slot, e)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleResetSlotPosition(slot.id);
                }}
                title="Arrastra para desplazar la foto / Doble clic para centrar"
                className={`w-11 h-11 rounded-full bg-black/80 hover:bg-black text-white flex flex-col items-center justify-center shadow-2xl backdrop-blur-xs pointer-events-auto transition-transform ${
                  panningSlotId === slot.id ? 'cursor-grabbing scale-110 ring-2 ring-[#0091FF]' : 'cursor-grab hover:scale-105 active:scale-95'
                }`}
              >
                <Hand className="w-5 h-5" />
              </div>
            </div>

            {/* Floating Dark Action Toolbar - Located inside bottom edge of slot */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center bg-[#242220]/95 text-white rounded-xl shadow-2xl px-2 py-1.5 gap-1.5 z-40 border border-white/20 backdrop-blur-md"
            >
              {/* 1. Recortar / Zoom */}
              <button
                type="button"
                onClick={() => handleSlotZoom(slot.id, scale > 1 ? -0.2 : 0.3)}
                title={scale > 1 ? "Reducir Zoom" : "Aumentar Zoom / Encuadre"}
                className={`p-1.5 rounded hover:bg-white/20 transition-colors ${scale > 1 ? 'text-[#0091FF]' : 'text-white'}`}
              >
                <Crop className="w-3.5 h-3.5" />
              </button>

              {/* Reset Pan / Center Button if moved */}
              {(slot.customPosition?.x !== 0 || slot.customPosition?.y !== 0) && (
                <button
                  type="button"
                  onClick={() => handleResetSlotPosition(slot.id)}
                  title="Restablecer posición centrada"
                  className="px-1.5 py-0.5 rounded bg-[#0091FF]/30 hover:bg-[#0091FF] text-[#0091FF] hover:text-white text-[9px] font-bold transition-colors"
                >
                  Centrar
                </button>
              )}

              {/* Reset Frame Size/Position if resized or moved */}
              {Boolean(slot.frameWidthDelta || slot.frameHeightDelta || slot.frameOffsetX || slot.frameOffsetY) && (
                <button
                  type="button"
                  onClick={() => handleResetFrameDimensions(slot.id)}
                  title="Restablecer tamaño y posición del marco al diseño original"
                  className="px-1.5 py-0.5 rounded bg-[#8C6D37]/50 hover:bg-[#8C6D37] text-[#ECC880] hover:text-white text-[9px] font-bold transition-colors"
                >
                  Reset Marco
                </button>
              )}

              <div className="w-[1px] h-3.5 bg-white/20" />

              {/* 2. Girar 90° */}
              <button
                type="button"
                onClick={() => handleSlotRotate(slot.id)}
                title="Girar 90°"
                className="p-1.5 rounded hover:bg-white/20 text-white transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              {/* 3. Voltear Espejo / Mirror */}
              <button
                type="button"
                onClick={() => handleSlotFlipH(slot.id)}
                title="Voltear horizontalmente (Espejo)"
                className={`p-1.5 rounded hover:bg-white/20 transition-colors ${flipH ? 'text-[#0091FF]' : 'text-white'}`}
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
              </button>

              {/* 4. Ajustar vs Llenar Marco (Fit / Cover) */}
              <button
                type="button"
                onClick={() => handleSlotFitMode(slot.id)}
                title={fitMode === 'contain' ? "Llenar todo el marco (Cover)" : "Ajustar foto completa al marco (Contain)"}
                className={`p-1.5 rounded hover:bg-white/20 transition-colors ${fitMode === 'contain' ? 'text-[#0091FF]' : 'text-white'}`}
              >
                {fitMode === 'contain' ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              <div className="w-[1px] h-3.5 bg-white/20" />

              {/* 5. Marco & Bordes (Passepartout) */}
              <button
                type="button"
                onClick={() => {
                  setShowFilterMenuSlotId(null);
                  setShowBorderMenuSlotId(showBorderMenuSlotId === slot.id ? null : slot.id);
                }}
                title="Agregar Marco / Bordes"
                className={`p-1.5 rounded hover:bg-white/20 transition-colors ${borderWidth > 0 || showBorderMenuSlotId === slot.id ? 'text-[#ECC880] bg-white/10' : 'text-white'}`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>

              {/* 6. Filtros & Retoque Fine Art */}
              <button
                type="button"
                onClick={() => {
                  setShowBorderMenuSlotId(null);
                  setShowFilterMenuSlotId(showFilterMenuSlotId === slot.id ? null : slot.id);
                }}
                title="Retocar / Filtros Fine Art"
                className={`p-1.5 rounded hover:bg-white/20 transition-colors ${filter !== 'none' || showFilterMenuSlotId === slot.id ? 'text-[#ECC880] bg-white/10' : 'text-[#ECC880]'}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-3.5 bg-white/20" />

              {/* 7. Eliminar Foto de la Ranura */}
              <button
                type="button"
                onClick={() => handleRemovePhotoFromSlot(slot.id)}
                title="Eliminar foto de esta ranura"
                className="p-1.5 rounded hover:bg-rose-600 text-white/90 hover:text-white transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* POPOVER 1: Filtros Fine Art - Opens UPWARDS so it's never covered by the bottom layouts bar */}
              {showFilterMenuSlotId === slot.id && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#1F1C18] text-white p-3 rounded-2xl shadow-2xl border border-white/25 z-50 w-64 space-y-2 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between border-b border-white/15 pb-1.5">
                    <span className="text-[11px] font-bold text-[#ECC880] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#ECC880]" />
                      Filtros Fine Art
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setShowFilterMenuSlotId(null)}
                      className="text-white/60 hover:text-white p-0.5 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {[
                      { id: 'none', label: 'Original' },
                      { id: 'fine-art-bw', label: 'B&N Fine Art' },
                      { id: 'warm-vintage', label: 'Warm Vintage' },
                      { id: 'high-contrast', label: 'Alto Contraste' },
                      { id: 'fuji-film', label: 'Fuji Astia' },
                      { id: 'kodak-chrome', label: 'Kodak Portra' },
                      { id: 'matte-portrait', label: 'Matte Portrait' },
                    ].map((fItem) => (
                      <button
                        key={fItem.id}
                        type="button"
                        onClick={() => handleSlotFilter(slot.id, fItem.id as any)}
                        className={`p-2 rounded-lg text-left transition-colors font-medium ${
                          filter === fItem.id ? 'bg-[#8C6D37] text-white font-bold shadow-xs' : 'bg-white/10 hover:bg-white/20 text-white/90'
                        }`}
                      >
                        {fItem.label}
                      </button>
                    ))}
                  </div>
                  {/* Arrow Indicator pointing down to the button */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1F1C18]" />
                </div>
              )}

              {/* POPOVER 2: Border / Passepartout Menu - Opens UPWARDS */}
              {showBorderMenuSlotId === slot.id && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#1F1C18] text-white p-3 rounded-2xl shadow-2xl border border-white/25 z-50 w-56 space-y-2.5 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between border-b border-white/15 pb-1.5">
                    <span className="text-[11px] font-bold text-[#ECC880] uppercase tracking-wider">
                      Marco & Passepartout
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setShowBorderMenuSlotId(null)}
                      className="text-white/60 hover:text-white p-0.5 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-white/70 block mb-1">Grosor de Borde:</span>
                    <div className="grid grid-cols-4 gap-1">
                      {[0, 2, 4, 8].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => handleSlotBorder(slot.id, w, borderColor)}
                          className={`py-1 rounded-lg text-center text-[10px] font-bold transition-colors ${
                            borderWidth === w ? 'bg-[#8C6D37] text-white' : 'bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          {w === 0 ? 'Sin' : `${w}px`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-white/70 block mb-1">Color de Marco:</span>
                    <div className="flex gap-2">
                      {[
                        { color: '#FFFFFF', name: 'Blanco' },
                        { color: '#C5A059', name: 'Oro Fine Art' },
                        { color: '#1F1C18', name: 'Negro' },
                        { color: '#EFE9DE', name: 'Marfil' },
                      ].map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => handleSlotBorder(slot.id, borderWidth > 0 ? borderWidth : 4, c.color)}
                          className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 shadow-xs ${
                            borderColor === c.color && borderWidth > 0 ? 'ring-2 ring-[#ECC880] scale-105' : 'border-white/40'
                          }`}
                          style={{ backgroundColor: c.color }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Arrow Indicator pointing down */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1F1C18]" />
                </div>
              )}
            </div>

            {/* Swap Photo Picker Popover - Opens UPWARDS */}
            {showSwapPickerSlotId === slot.id && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-full mb-3 left-0 bg-[#1F1C18] text-white p-3 rounded-2xl shadow-2xl border border-white/25 z-50 w-72 space-y-2 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between border-b border-white/15 pb-1.5">
                  <span className="text-[11px] font-bold text-[#ECC880] uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#ECC880]" />
                    Reemplazar Foto
                  </span>
                  <button type="button" onClick={() => setShowSwapPickerSlotId(null)} className="text-white/60 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {uploadedPhotos.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        handleAssignPhotoToSlot(slot.id, p.id);
                        setShowSwapPickerSlotId(null);
                      }}
                      className="aspect-square rounded-lg overflow-hidden border border-white/20 hover:border-[#0091FF] hover:scale-105 transition-all shadow-xs"
                    >
                      <img src={getThumbnailSrc(p)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                {/* Arrow Indicator pointing down */}
                <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-[#1F1C18]" />
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const selectedSlotData = (() => {
    if (!selectedSlotId) return null;
    const activeSpread = spreads[activeSpreadIndex];
    if (!activeSpread) return null;
    const leftSlots = activeSpread.leftPage?.slots || [];
    const rightSlots = activeSpread.rightPage?.slots || [];
    const leftSlotIndex = leftSlots.findIndex((s) => s.id === selectedSlotId);
    if (leftSlotIndex !== -1) {
      const slot = leftSlots[leftSlotIndex];
      const photo = uploadedPhotos.find((p) => p.id === slot.photoId);
      return {
        slot,
        photo,
        pageSide: 'left' as const,
        pageNumber: activeSpreadIndex * 2 + 1,
        slotIndex: leftSlotIndex + 1,
      };
    }
    const rightSlotIndex = rightSlots.findIndex((s) => s.id === selectedSlotId);
    if (rightSlotIndex !== -1) {
      const slot = rightSlots[rightSlotIndex];
      const photo = uploadedPhotos.find((p) => p.id === slot.photoId);
      return {
        slot,
        photo,
        pageSide: 'right' as const,
        pageNumber: activeSpreadIndex * 2 + 2,
        slotIndex: rightSlotIndex + 1,
      };
    }
    return null;
  })();

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F7F5EE] text-[#1F1C18] select-none overflow-hidden">
      {/* Top Header / Step Bar */}
      <div className="flex items-center justify-between border-b border-[#E0D8C8] bg-[#FDFCF9] px-4 sm:px-6 py-3.5 shadow-sm shrink-0 z-10">
        {/* Brand & Project Title */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[#736B60] hover:bg-[#F2ECE1] hover:text-[#1F1C18] transition-colors"
            title="Cerrar y Volver"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-brand text-sm tracking-widest text-[#8C6D37] font-semibold">HALO STUDIO</span>
              <span className="text-xs text-[#A89F91]">/</span>
              <span className="text-xs font-semibold text-[#1F1C18]">{foilTitleText || 'Nuevo Fotolibro'}</span>
            </div>
            <p className="text-[11px] text-[#736B60] hidden sm:block">
              {currentFormat.name} · {currentCover.name} · {totalPages} páginas
            </p>
          </div>
        </div>

        {/* Step Tabs */}
        <div className="hidden md:flex items-center gap-1 rounded-full border border-[#D6CEBE] bg-[#F2ECE1]/70 p-1 text-xs">
          {[
            { id: 'format', label: '1. Formato' },
            { id: 'cover', label: '2. Tapa & Grabado' },
            { id: 'paper', label: '3. Papel' },
            { id: 'editor', label: '4. Diseñar Páginas' },
            { id: 'preview', label: '5. Hojeado 3D' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentStep(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
                currentStep === tab.id
                  ? 'bg-[#1F1C18] text-[#FDFCF9] shadow-sm'
                  : 'text-[#736B60] hover:text-[#1F1C18]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Price & Action Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Save to Account / Draft button */}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-3.5 py-2 rounded-full border border-[#D6CEBE] bg-[#F7F3EB] hover:bg-[#EFE9DE] text-xs font-semibold text-[#1F1C18] transition-all flex items-center gap-1.5 shadow-sm"
            title="Guardar borrador en mi cuenta de Supabase"
          >
            {saveStatus === 'saving' ? (
              <div className="w-3.5 h-3.5 border-2 border-[#8C6D37] border-t-transparent rounded-full animate-spin"></div>
            ) : saveStatus === 'saved' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Save className="w-3.5 h-3.5 text-[#8C6D37]" />
            )}
            <span className="hidden sm:inline">
              {saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'saved' ? '¡Guardado!' : 'Guardar en mi Cuenta'}
            </span>
          </button>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase tracking-wider text-[#736B60] block">Inversión Total</span>
            <span className="font-serif-luxury text-lg sm:text-xl font-bold text-[#1F1C18]">
              {formatPriceARS(totalPrice)} ARS
            </span>
          </div>

          <button
            type="button"
            onClick={handleFinishAndOrder}
            className="px-4 sm:px-5 py-2.5 rounded-full bg-[#1F1C18] text-[#FDFCF9] text-xs uppercase tracking-wider font-semibold hover:bg-[#3D352E] shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#ECC880]" />
            <span>Finalizar y Pedir</span>
          </button>
        </div>
      </div>

      {/* Main Workspace based on Step */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* STEP 1: FORMAT & SIZES */}
        {currentStep === 'format' && (
          <div className="w-full flex-1 overflow-y-auto min-h-0">
            <div className="max-w-5xl mx-auto p-6 sm:p-10 pb-24">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="text-xs font-bold tracking-widest text-[#8C6D37] uppercase">Paso 1 de 5</span>
                <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#1F1C18] mt-1">
                  Elegí el formato y tamaño de tu libro
                </h2>
                <p className="text-xs sm:text-sm text-[#595248] mt-2">
                  Todos nuestros álbumes cuentan con encuadernación rígida 100% Layflat de apertura plana a 180°.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {BOOK_FORMATS.map((fmt) => {
                  const isSelected = fmt.id === formatId;
                  return (
                    <div
                      key={fmt.id}
                      onClick={() => setFormatId(fmt.id)}
                      className={`cursor-pointer rounded-2xl border p-6 transition-all relative ${
                        isSelected
                          ? 'border-[#8C6D37] bg-[#FDFCF9] shadow-xl ring-2 ring-[#8C6D37]/30'
                          : 'border-[#D6CEBE] bg-[#F4EFE6]/60 hover:bg-[#FDFCF9] hover:border-[#B8AB98]'
                      }`}
                    >
                      {fmt.popular && (
                        <span className="absolute top-4 right-4 bg-[#8C6D37] text-white text-[10px] tracking-widest uppercase font-bold px-2.5 py-0.5 rounded-full">
                          Más Elegido
                        </span>
                      )}

                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="font-serif-luxury text-2xl font-bold text-[#1F1C18]">{fmt.name}</h3>
                          <p className="font-mono text-xs text-[#8C6D37] font-semibold mt-0.5">{fmt.dimensions}</p>
                        </div>
                        <span className="font-serif-luxury text-xl font-bold text-[#1F1C18]">
                          {formatPriceARS(fmt.basePrice)}
                        </span>
                      </div>

                      <p className="text-xs text-[#595248] leading-relaxed mb-4">{fmt.description}</p>

                      <div className="flex items-center justify-between border-t border-[#E8E2D5] pt-3 text-[11px] text-[#736B60]">
                        <span>Incluye {fmt.basePages} páginas rígidas</span>
                        <span className="font-medium text-[#1F1C18]">Recomendado: {fmt.idealPhotos}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep('cover')}
                  className="px-6 py-3 rounded-full bg-[#1F1C18] text-[#FDFCF9] text-xs uppercase tracking-wider font-semibold hover:bg-[#3D352E] flex items-center gap-2"
                >
                  <span>Continuar a Tapa & Grabado</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: COVER, MATERIAL & FOIL STAMPING */}
        {currentStep === 'cover' && (
          <div className="w-full flex-1 overflow-y-auto min-h-0">
            <div className="max-w-6xl mx-auto p-6 sm:p-10 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Live 3D Cover Mockup */}
              <div className="lg:col-span-6 flex flex-col items-center">
                <div className="sticky top-6 w-full max-w-md">
                  <span className="text-[11px] font-bold tracking-widest text-[#8C6D37] uppercase mb-2 block text-center">
                    VISTA PREVIA DE PORTADA REAL
                  </span>

                  {/* The Luxury Book Cover Card */}
                  <div 
                    className={`aspect-[4/5] rounded-2xl p-8 flex flex-col justify-between shadow-2xl relative border-2 border-black/10 transition-all duration-500 overflow-hidden ${currentCover.textureClass}`}
                    style={{ backgroundColor: currentCover.colorHex }}
                  >
                    <div className="absolute inset-0 linen-texture opacity-30 pointer-events-none" />

                    {/* Left Spine Crease Shadow */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/25 via-black/10 to-transparent pointer-events-none" />

                    {/* Optional Cover Photo Window */}
                    {hasCoverWindow ? (
                      <div className="w-32 h-32 mx-auto my-auto rounded-xl border-4 border-[#C5A059]/40 overflow-hidden shadow-2xl relative bg-white">
                        <img
                          src={uploadedPhotos[0]?.url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'}
                          alt="Foto de Portada"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10" />
                    )}

                    {/* Embossed & Stamped Hot Foil Title */}
                    <div className="text-center relative z-10 my-auto">
                      <span 
                        className="font-brand text-2xl sm:text-3xl font-bold tracking-[0.25em] block uppercase foil-stamping-emboss drop-shadow-sm"
                        style={{
                          color: FOIL_OPTIONS.find(f => f.id === foilColor)?.colorHex || '#D4AF37',
                        }}
                      >
                        {foilTitleText || 'HALO FINE ART'}
                      </span>

                      <span 
                        className="font-serif-luxury text-sm tracking-[0.2em] block uppercase mt-2 font-medium opacity-90 foil-stamping-emboss"
                        style={{
                          color: FOIL_OPTIONS.find(f => f.id === foilColor)?.colorHex || '#D4AF37',
                        }}
                      >
                        {foilSubtitleText}
                      </span>
                    </div>

                    {/* Bottom Spine & Brand Stamp */}
                    <div className="text-center text-[9px] tracking-[0.3em] uppercase opacity-60 font-brand">
                      FINE ART LAB
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Customization Controls */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="text-xs font-bold tracking-widest text-[#8C6D37] uppercase">Paso 2 de 5</span>
                  <h2 className="font-serif-luxury text-3xl font-bold text-[#1F1C18]">Tapas, Telas & Grabado</h2>
                  <p className="text-xs text-[#595248] mt-1">
                    Grabado térmico artesanal prensado sobre linos naturales europeos o cuero vegano.
                  </p>
                </div>

                {/* Cover Material Selection */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1F1C18] block mb-2">
                    Material y Color de Tapa:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {COVER_MATERIALS.map((cov) => {
                      const isSelected = cov.id === coverMaterialId;
                      return (
                        <button
                          key={cov.id}
                          type="button"
                          onClick={() => setCoverMaterialId(cov.id)}
                          className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'border-[#8C6D37] bg-[#FDFCF9] shadow-md ring-2 ring-[#8C6D37]/30'
                              : 'border-[#D6CEBE] bg-[#F4EFE6]/50 hover:bg-[#FDFCF9]'
                          }`}
                        >
                          <div
                            className="w-7 h-7 rounded-full border border-black/15 shadow-sm mb-1.5"
                            style={{ backgroundColor: cov.colorHex }}
                          />
                          <span className="text-[11px] font-semibold text-[#1F1C18] line-clamp-1">{cov.name}</span>
                          <span className="text-[9px] text-[#736B60]">
                            {cov.priceDelta > 0 ? `+${formatPriceARS(cov.priceDelta)}` : 'Incluido'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Foil Stamping Color */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1F1C18] block mb-2">
                    Color de Grabado en Hot Stamping:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FOIL_OPTIONS.map((f) => {
                      const isSelected = f.id === foilColor;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFoilColor(f.id)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-[#8C6D37] bg-[#FDFCF9] shadow-sm ring-1 ring-[#8C6D37]'
                              : 'border-[#D6CEBE] bg-[#F4EFE6]/50 hover:bg-[#FDFCF9]'
                          }`}
                        >
                          <div
                            className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: f.colorHex }}
                          />
                          <span className="text-xs font-medium text-[#1F1C18] truncate">{f.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Foil Title Input */}
                <div className="space-y-3 rounded-2xl border border-[#D6CEBE] bg-[#FDFCF9] p-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F1C18] block mb-1">
                      Título Principal en Tapa:
                    </label>
                    <input
                      type="text"
                      value={foilTitleText}
                      onChange={(e) => setFoilTitleText(e.target.value.toUpperCase())}
                      placeholder="EJ: NUESTRA HISTORIA, SOFÍA & MATEO"
                      className="w-full rounded-lg border border-[#D6CEBE] bg-[#F4EFE6]/40 px-3 py-2 text-xs font-brand tracking-widest text-[#1F1C18] focus:border-[#8C6D37] focus:outline-none"
                      maxLength={35}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F1C18] block mb-1">
                      Subtítulo / Fecha / Lugar:
                    </label>
                    <input
                      type="text"
                      value={foilSubtitleText}
                      onChange={(e) => setFoilSubtitleText(e.target.value.toUpperCase())}
                      placeholder="EJ: 14 DE NOVIEMBRE DE 2025 · PATAGONIA"
                      className="w-full rounded-lg border border-[#D6CEBE] bg-[#F4EFE6]/40 px-3 py-2 text-xs font-serif-luxury tracking-wider text-[#1F1C18] focus:border-[#8C6D37] focus:outline-none"
                      maxLength={45}
                    />
                  </div>

                  {/* Cover Window toggle */}
                  <div className="flex items-center justify-between border-t border-[#E8E2D5] pt-3">
                    <div>
                      <span className="text-xs font-bold text-[#1F1C18] block">Ventana Fotográfica Calada</span>
                      <span className="text-[11px] text-[#736B60]">Troquelado con marco biselado en el centro</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={hasCoverWindow}
                      onChange={(e) => setHasCoverWindow(e.target.checked)}
                      className="w-4 h-4 accent-[#8C6D37] rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('format')}
                    className="text-xs font-semibold text-[#736B60] hover:text-[#1F1C18] flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Volver a Formatos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep('paper')}
                    className="px-6 py-3 rounded-full bg-[#1F1C18] text-[#FDFCF9] text-xs uppercase tracking-wider font-semibold hover:bg-[#3D352E] flex items-center gap-2"
                  >
                    <span>Continuar a Papel</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PAPER & LAYFLAT */}
        {currentStep === 'paper' && (
          <div className="w-full flex-1 overflow-y-auto min-h-0">
            <div className="max-w-5xl mx-auto p-6 sm:p-10 pb-24">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="text-xs font-bold tracking-widest text-[#8C6D37] uppercase">Paso 3 de 5</span>
                <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#1F1C18] mt-1">
                  Auténtico Papel Fotográfico Fine Art
                </h2>
                <p className="text-xs sm:text-sm text-[#595248] mt-2">
                  No utilizamos imprenta digital común. Cada página es revelada químicamente para brindar la máxima gama tonal y longevidad de 100+ años.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PAPER_FINISHES.map((paper) => {
                  const isSelected = paper.id === paperFinishId;
                  return (
                    <div
                      key={paper.id}
                      onClick={() => setPaperFinishId(paper.id)}
                      className={`cursor-pointer rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'border-[#8C6D37] bg-[#FDFCF9] shadow-xl ring-2 ring-[#8C6D37]/30'
                          : 'border-[#D6CEBE] bg-[#F4EFE6]/60 hover:bg-[#FDFCF9]'
                      }`}
                    >
                      <div>
                        <span className="inline-block bg-[#8C6D37]/15 text-[#8C6D37] text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full mb-3">
                          {paper.badge}
                        </span>
                        <h3 className="font-serif-luxury text-xl font-bold text-[#1F1C18] mb-1">{paper.name}</h3>
                        <p className="text-xs text-[#8C6D37] font-semibold mb-3">{paper.subtitle}</p>
                        <p className="text-xs text-[#595248] leading-relaxed mb-4">{paper.description}</p>
                      </div>

                      <div className="border-t border-[#E8E2D5] pt-3 flex items-center justify-between text-xs">
                        <span className="text-[#736B60] font-mono">{paper.grammage}</span>
                        <span className="font-bold text-[#1F1C18]">
                          {paper.priceDelta > 0 ? `+${formatPriceARS(paper.priceDelta)} ARS` : 'Incluido'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Gift Box Addon */}
              <div className="mt-8 rounded-2xl border border-[#D6CEBE] bg-[#FDFCF9] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#EFE9DE] flex items-center justify-center text-[#8C6D37] shrink-0">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif-luxury text-lg font-bold text-[#1F1C18]">Cofre / Caja de Presentación en Lino</h4>
                    <p className="text-xs text-[#595248]">
                      Caja rígida forrada en la misma tela con cinta de satén para extracción suave y protección eterna.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-serif-luxury text-base font-bold text-[#1F1C18]">
                    +{formatPriceARS(28000)} ARS
                  </span>
                  <input
                    type="checkbox"
                    checked={giftBoxIncluded}
                    onChange={(e) => setGiftBoxIncluded(e.target.checked)}
                    className="w-5 h-5 accent-[#8C6D37] rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep('cover')}
                  className="text-xs font-semibold text-[#736B60] hover:text-[#1F1C18] flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Volver a Tapas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep('editor')}
                  className="px-6 py-3 rounded-full bg-[#1F1C18] text-[#FDFCF9] text-xs uppercase tracking-wider font-semibold hover:bg-[#3D352E] flex items-center gap-2"
                >
                  <span>Comenzar a Diseñar Páginas</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: INTERACTIVE SPREAD & PHOTO EDITOR (Zno Designer / CXEditor Engine) */}
        {currentStep === 'editor' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Sidebar: Photo Media Library & Smart Tools */}
            <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[#E0D8C8] bg-[#FDFCF9] p-3.5 flex flex-col overflow-hidden shrink-0">
              {/* Sidebar Tabs: Fotos / Plantillas / Texto */}
              <div className="flex items-center gap-1 p-1 bg-[#EFE9DE] rounded-xl mb-3">
                <button
                  type="button"
                  onClick={() => setActiveEditorTab('photos')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeEditorTab === 'photos'
                      ? 'bg-[#1F1C18] text-[#FDFCF9] shadow-xs'
                      : 'text-[#736B60] hover:text-[#1F1C18]'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Fotos ({uploadedPhotos.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEditorTab('layouts')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeEditorTab === 'layouts'
                      ? 'bg-[#1F1C18] text-[#FDFCF9] shadow-xs'
                      : 'text-[#736B60] hover:text-[#1F1C18]'
                  }`}
                >
                  <Layout className="w-3.5 h-3.5" />
                  <span>Layouts</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEditorTab('text')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeEditorTab === 'text'
                      ? 'bg-[#1F1C18] text-[#FDFCF9] shadow-xs'
                      : 'text-[#736B60] hover:text-[#1F1C18]'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Texto</span>
                </button>
              </div>

              {/* TAB 1: PHOTOS */}
              {activeEditorTab === 'photos' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#595248]">
                      Arrastra o haz clic
                    </span>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-[#8C6D37]/10 text-xs font-semibold text-[#8C6D37] hover:bg-[#8C6D37] hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Subir Fotos</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Sample Packs */}
                  <div className="mb-2.5 flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                    <span className="text-[#736B60] shrink-0 font-medium">Demos:</span>
                    <button
                      type="button"
                      onClick={() => handleLoadSamplePack('boda')}
                      className="px-2 py-0.5 rounded-md bg-[#EFE9DE] hover:bg-[#E2D8C7] text-[#1F1C18] font-medium shrink-0"
                    >
                      Boda
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSamplePack('familia')}
                      className="px-2 py-0.5 rounded-md bg-[#EFE9DE] hover:bg-[#E2D8C7] text-[#1F1C18] font-medium shrink-0"
                    >
                      Familia
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSamplePack('viaje')}
                      className="px-2 py-0.5 rounded-md bg-[#EFE9DE] hover:bg-[#E2D8C7] text-[#1F1C18] font-medium shrink-0"
                    >
                      Viaje
                    </button>
                  </div>

                  {/* Smart Auto Layout Quick Card */}
                  <div className="mb-2.5 rounded-xl border border-[#C5A059]/40 bg-[#F4EFE6] p-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#1F1C18] block">Auto-Fill Inteligente</span>
                      <span className="text-[9px] text-[#736B60]">Distribuye todo el álbum en 1 clic</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoLayout}
                      className="px-2.5 py-1.5 rounded-lg bg-[#8C6D37] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#73582A] flex items-center gap-1 shadow-xs"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Auto-Fill</span>
                    </button>
                  </div>

                  {/* In-Browser Thumbnail Optimization Progress Banner */}
                  {isOptimizingPhotos && optimizingProgress && (
                    <div className="mb-2 rounded-xl border border-blue-200 bg-blue-50/90 p-2 space-y-1 animate-pulse">
                      <div className="flex items-center justify-between text-[10px] font-bold text-blue-900">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-blue-600 animate-spin" />
                          Optimizando miniaturas...
                        </span>
                        <span>{optimizingProgress.current} / {optimizingProgress.total}</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-1 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-1 rounded-full transition-all duration-200"
                          style={{ width: `${(optimizingProgress.current / Math.max(1, optimizingProgress.total)) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Preflight & Optimization Summary */}
                  {(() => {
                    const savings = calculatePhotoSavingsSummary(uploadedPhotos);
                    return (
                      <div className="mb-2 space-y-1">
                        <div className="px-2 py-1 rounded-lg bg-[#F4EFE6] border border-[#D6CEBE] flex items-center justify-between text-[9px]">
                          <div className="flex items-center gap-1 font-semibold text-[#1F1C18]">
                            <Printer className="w-3 h-3 text-[#8C6D37]" />
                            <span>Pre-Vuelo Fine Art</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {savings.optimalCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                                {savings.optimalCount} Óptimas
                              </span>
                            )}
                            {savings.hasIssues && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                {savings.warningCount + savings.insufficientCount} Avisos
                              </span>
                            )}
                          </div>
                        </div>

                        {savings.hasIssues && (
                          <div className="flex items-center gap-1 text-[9px] font-bold">
                            <button
                              type="button"
                              onClick={() => setQualityFilter('all')}
                              className={`px-2 py-0.5 rounded-md transition-colors ${
                                qualityFilter === 'all'
                                  ? 'bg-[#1F1C18] text-[#ECC880]'
                                  : 'bg-white border border-[#D6CEBE] text-[#736B60]'
                              }`}
                            >
                              Todas ({uploadedPhotos.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setQualityFilter('issues')}
                              className={`px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 ${
                                qualityFilter === 'issues'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-amber-50 border border-amber-200 text-amber-800'
                              }`}
                            >
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Avisos ({savings.warningCount + savings.insufficientCount})
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Photo Thumbnails Grid with Drag & Drop & Usage Badges */}
                  <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-1.5 pr-1 min-h-0">
                    {uploadedPhotos
                      .filter((photo) => {
                        if (qualityFilter === 'issues') {
                          return photo.preflight?.rating === 'advertencia' || photo.preflight?.rating === 'insuficiente';
                        }
                        if (qualityFilter === 'optimal') {
                          return photo.preflight?.rating === 'optima';
                        }
                        return true;
                      })
                      .map((photo) => {
                        const rating = photo.preflight?.rating || 'buena';
                        const usageCount = getPhotoUsageCount(photo.id);

                        return (
                          <div
                            key={photo.id}
                            draggable
                            onDragStart={() => setDraggedPhotoId(photo.id)}
                            onDragEnd={() => setDraggedPhotoId(null)}
                            onClick={() => {
                              if (selectedSlotId) {
                                handleAssignPhotoToSlot(selectedSlotId, photo.id);
                              }
                            }}
                            className={`group relative aspect-square rounded-lg overflow-hidden border cursor-grab active:cursor-grabbing transition-all ${
                              selectedSlotId
                                ? 'border-[#8C6D37] hover:scale-105 shadow-md ring-2 ring-[#8C6D37]'
                                : 'border-[#D6CEBE] hover:border-[#1F1C18]'
                            }`}
                          >
                            <img 
                              src={getThumbnailSrc(photo)} 
                              alt={photo.name} 
                              loading="lazy"
                              className="w-full h-full object-cover" 
                            />
                            
                            {/* Quality Badge Overlay */}
                            <div className="absolute top-1 left-1 flex items-center gap-0.5">
                              {rating === 'optima' && (
                                <span 
                                  title="Calidad Fine Art Óptima (300+ DPI / sRGB)"
                                  className="w-3.5 h-3.5 rounded-full bg-emerald-500/90 text-white flex items-center justify-center shadow-xs"
                                >
                                  <Check className="w-2 h-2 stroke-[3]" />
                                </span>
                              )}
                              {rating === 'advertencia' && (
                                <span 
                                  title="Resolución moderada (~150 DPI). Clic para ver recomendaciones"
                                  className="w-3.5 h-3.5 rounded-full bg-amber-500/90 text-white flex items-center justify-center shadow-xs"
                                >
                                  <AlertTriangle className="w-2 h-2" />
                                </span>
                              )}
                              {rating === 'insuficiente' && (
                                <span 
                                  title="Calidad insuficiente (<150 DPI). Riesgo de pixelación"
                                  className="w-3.5 h-3.5 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-xs"
                                >
                                  <AlertOctagon className="w-2 h-2" />
                                </span>
                              )}
                            </div>

                            {/* Usage Count Badge (Zno style) */}
                            {usageCount > 0 && (
                              <span 
                                title={`Usada ${usageCount} ${usageCount === 1 ? 'vez' : 'veces'} en el álbum`}
                                className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded-md bg-[#1F1C18]/80 text-[#ECC880] text-[9px] font-bold font-mono shadow-xs backdrop-blur-xs"
                              >
                                {usageCount}×
                              </span>
                            )}

                            {/* Inspector trigger button on hover */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectedPhotoForQuality(photo);
                              }}
                              title="Inspeccionar DPI, sRGB y resolución Fine Art"
                              className="absolute top-1 right-1 p-0.5 rounded bg-black/60 hover:bg-black text-white text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5"
                            >
                              <Info className="w-2.5 h-2.5" />
                              <span>DPI</span>
                            </button>

                            {selectedSlotId && (
                              <div className="absolute inset-0 bg-[#8C6D37]/35 flex items-center justify-center text-white text-[9px] font-bold text-center p-1">
                                Clic p/ colocar
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* TAB 2: LAYOUT TEMPLATES GALLERY */}
              {activeEditorTab === 'layouts' && (
                <div className="flex-1 flex flex-col overflow-y-auto space-y-4 pr-1 min-h-0">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1F1C18] block mb-2">
                      Pliego Completo (Layflat 180°)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleChangePageLayout('left', 'full-bleed-spread')}
                      className="w-full p-3 rounded-xl border border-[#D6CEBE] bg-[#FDFCF9] hover:bg-[#F4EFE6] text-left flex items-center gap-3 transition-colors"
                    >
                      <div className="w-14 h-9 rounded bg-[#E8E2D5] border border-dashed border-[#8C6D37] flex items-center justify-center">
                        <Maximize2 className="w-4 h-4 text-[#8C6D37]" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#1F1C18] block">Panorámica Doble Página</span>
                        <span className="text-[10px] text-[#736B60]">1 sola foto que cruza el pliego continuo</span>
                      </div>
                    </button>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1F1C18] block mb-2">
                      Plantillas para Página Izquierda / Derecha
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'single-full', label: '1 Foto Sangrada', desc: '100% de la página', icon: '1' },
                        { id: 'single-bordered', label: '1 Foto c/ Passepartout', desc: 'Margen artístico blanco', icon: '◻' },
                        { id: 'two-vertical', label: '2 Fotos Verticales', desc: 'Columnas paralelas', icon: '▮▮' },
                        { id: 'two-horizontal', label: '2 Fotos Horizontales', desc: 'Filas apiladas', icon: '〓' },
                        { id: 'three-collage', label: '3 Fotos Mosaico', desc: 'Principal + 2 detalle', icon: '◫' },
                        { id: 'four-grid', label: '4 Fotos Grilla', desc: 'Cuadrícula 2x2 simétrica', icon: '▦' },
                        { id: 'editorial-text-photo', label: 'Editorial / Texto', desc: 'Título, fecha y dedicatoria', icon: 'T' },
                        { id: 'blank', label: 'Página en Blanco', desc: 'Espacio de descanso visual', icon: '○' },
                      ].map((item) => (
                        <div key={item.id} className="p-2.5 rounded-xl border border-[#D6CEBE] bg-[#FDFCF9] flex flex-col justify-between">
                          <div>
                            <span className="text-xs font-bold text-[#1F1C18] block leading-tight">{item.label}</span>
                            <span className="text-[9px] text-[#736B60] block mb-2">{item.desc}</span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleChangePageLayout('left', item.id as PageLayoutId)}
                              className="flex-1 py-1 rounded bg-[#EFE9DE] hover:bg-[#1F1C18] hover:text-white text-[9px] font-bold transition-colors"
                            >
                              Aplicar Izq
                            </button>
                            <button
                              type="button"
                              onClick={() => handleChangePageLayout('right', item.id as PageLayoutId)}
                              className="flex-1 py-1 rounded bg-[#EFE9DE] hover:bg-[#1F1C18] hover:text-white text-[9px] font-bold transition-colors"
                            >
                              Aplicar Der
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TEXT & STORYTELLING */}
              {activeEditorTab === 'text' && (
                <div className="flex-1 flex flex-col overflow-y-auto space-y-3 min-h-0">
                  <div className="rounded-xl border border-[#D6CEBE] bg-[#FDFCF9] p-3 space-y-2">
                    <span className="text-xs font-bold uppercase text-[#1F1C18] block">Tipografía Editorial</span>
                    <p className="text-[10px] text-[#736B60]">
                      Escribe un título de capítulo o una dedicatoria en la página actual.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleChangePageLayout('left', 'editorial-text-photo')}
                      className="w-full py-2 rounded-lg bg-[#8C6D37] text-white text-xs font-bold hover:bg-[#73582A] flex items-center justify-center gap-1.5"
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span>Convertir Página Izq a Editorial</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F4EFE6] border border-[#D6CEBE] space-y-1.5 text-xs text-[#595248]">
                    <span className="font-bold text-[#1F1C18] block">Sugerencias de Redacción:</span>
                    <p className="text-[10px] italic">“Hay momentos que merecen durar para siempre.”</p>
                    <p className="text-[10px] italic">“Nuestro primer viaje juntos · Mendoza 2026”</p>
                    <p className="text-[10px] italic">“Capítulo I: El comienzo de la mayor aventura.”</p>
                  </div>
                </div>
              )}
            </div>

            {/* Center Area: Double Page Spread Canvas (Zno CXEditor Style) */}
            <div className="flex-1 flex flex-col overflow-y-auto p-2 sm:p-4 bg-[#EFECE3] items-center justify-between min-h-0">
              {/* TOP SECONDARY TOOLBAR (Zno Cloud Designer Signature Top Bar - Screenshot 1 Match) */}
              <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-1.5 mb-2 bg-[#FDFCF9] p-2 rounded-2xl border border-[#D6CEBE] shadow-xs select-none">
                <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-xs text-[#1F1C18]">
                  {/* Auto-fill button */}
                  <button
                    type="button"
                    onClick={handleAutoPopulateSpreads}
                    title="Autocompletar inteligentemente todas las páginas con las fotos subidas"
                    className="px-2.5 py-1.5 rounded-lg bg-[#8C6D37]/10 hover:bg-[#8C6D37] text-[#8C6D37] hover:text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Autocompletar</span>
                  </button>

                  <div className="h-4 w-[1px] bg-[#D6CEBE] hidden sm:block" />

                  {/* Background Color Picker Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowBgColorMenu(!showBgColorMenu)}
                      title="Cambiar color de fondo del pliego"
                      className="px-2.5 py-1.5 rounded-lg border border-[#D6CEBE] hover:bg-[#F4EFE6] font-semibold text-[11px] flex items-center gap-1.5"
                    >
                      <Palette className="w-3.5 h-3.5 text-[#8C6D37]" />
                      <span>Fondo</span>
                      <div className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: spreadBgColor }} />
                    </button>

                    {showBgColorMenu && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-full mt-1 left-0 bg-[#1F1C18] text-white p-2 rounded-xl shadow-2xl border border-white/20 z-50 w-52 space-y-2 text-xs"
                      >
                        <span className="text-[10px] font-bold text-[#ECC880] uppercase tracking-wider block">Fondo del Pliego</span>
                        <div className="grid grid-cols-2 gap-1 text-[10px]">
                          {[
                            { color: '#FDFCFA', name: 'Blanco Puro' },
                            { color: '#F4EFE6', name: 'Lino Cálido' },
                            { color: '#EFE9DE', name: 'Marfil Algodón' },
                            { color: '#2B2B2B', name: 'Gris Carbón' },
                            { color: '#E2E6DF', name: 'Salvia Editorial' },
                          ].map((c) => (
                            <button
                              key={c.color}
                              type="button"
                              onClick={() => {
                                setSpreadBgColor(c.color);
                                setShowBgColorMenu(false);
                              }}
                              className="flex items-center gap-1.5 p-1 rounded hover:bg-white/15 text-left"
                            >
                              <div className="w-3.5 h-3.5 rounded-full border border-white/40" style={{ backgroundColor: c.color }} />
                              <span>{c.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add Text Block Button */}
                  <button
                    type="button"
                    onClick={() => {
                      recordHistorySnapshot(spreads);
                      handleChangePageLayout('left', 'editorial-text-photo');
                    }}
                    title="Agregar página de texto editorial"
                    className="px-2.5 py-1.5 rounded-lg border border-[#D6CEBE] hover:bg-[#F4EFE6] font-semibold text-[11px] flex items-center gap-1.5"
                  >
                    <Type className="w-3.5 h-3.5 text-[#736B60]" />
                    <span>Texto</span>
                  </button>

                  {/* Add Photo Slot / Frame Button (Zno "Agregar Marco") */}
                  <div className="flex items-center border border-[#D6CEBE] rounded-lg overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => handleAddPhotoSlotToPage('left')}
                      title="Agregar marco de foto en página izquierda"
                      className="px-2 py-1.5 hover:bg-[#F4EFE6] text-[11px] font-semibold flex items-center gap-1 border-r border-[#D6CEBE]"
                    >
                      <Plus className="w-3 h-3 text-[#8C6D37]" />
                      <span>+ Marco Izq</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPhotoSlotToPage('right')}
                      title="Agregar marco de foto en página derecha"
                      className="px-2 py-1.5 hover:bg-[#F4EFE6] text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-[#8C6D37]" />
                      <span>+ Marco Der</span>
                    </button>
                  </div>

                  {/* Swap / Flip Left and Right (Zno "Voltear") */}
                  <button
                    type="button"
                    onClick={handleFlipSpreadSides}
                    title="Intercambiar diseño entre página izquierda y derecha"
                    className="px-2.5 py-1.5 rounded-lg border border-[#D6CEBE] hover:bg-[#F4EFE6] font-semibold text-[11px] flex items-center gap-1.5"
                  >
                    <FlipHorizontal className="w-3.5 h-3.5 text-[#736B60]" />
                    <span>Voltear Pliego</span>
                  </button>

                  <div className="h-4 w-[1px] bg-[#D6CEBE] hidden sm:block" />

                  {/* Undo & Redo (Zno Deshacer / Rehacer) */}
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={handleUndo}
                      disabled={historyIndex <= 0}
                      title="Deshacer último cambio (Ctrl+Z)"
                      className="p-1.5 rounded-lg border border-[#D6CEBE] hover:bg-[#F4EFE6] disabled:opacity-30 text-[#1F1C18]"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRedo}
                      disabled={historyIndex >= history.length - 1}
                      title="Rehacer cambio (Ctrl+Y)"
                      className="p-1.5 rounded-lg border border-[#D6CEBE] hover:bg-[#F4EFE6] disabled:opacity-30 text-[#1F1C18]"
                    >
                      <Redo2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Photo Gap / Spacing (Zno Modificar plantilla) */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowGapMenu(!showGapMenu)}
                      title="Ajustar espacio entre fotos"
                      className="px-2.5 py-1.5 rounded-lg border border-[#D6CEBE] hover:bg-[#F4EFE6] font-semibold text-[11px] flex items-center gap-1.5"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#736B60]" />
                      <span>Espaciado: {spreadPhotoGap}px</span>
                    </button>

                    {showGapMenu && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-full mt-1 left-0 bg-[#1F1C18] text-white p-2.5 rounded-xl shadow-2xl border border-white/20 z-50 w-44 space-y-2 text-xs"
                      >
                        <span className="text-[10px] font-bold text-[#ECC880] uppercase tracking-wider block">Espacio entre Fotos</span>
                        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                          {[
                            { gap: 0, label: '0px (Flush)' },
                            { gap: 8, label: '8px (Normal)' },
                            { gap: 16, label: '16px (Galería)' },
                            { gap: 24, label: '24px (Passepartout)' },
                          ].map((g) => (
                            <button
                              key={g.gap}
                              type="button"
                              onClick={() => {
                                setSpreadPhotoGap(g.gap);
                                setShowGapMenu(false);
                              }}
                              className={`p-1.5 rounded text-center transition-colors ${
                                spreadPhotoGap === g.gap ? 'bg-[#8C6D37] text-white font-bold' : 'bg-white/10 hover:bg-white/20'
                              }`}
                            >
                              {g.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right controls: Bleed guides and Fine Art Inspector */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowSafeMarginGuides(!showSafeMarginGuides)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                      showSafeMarginGuides
                        ? 'bg-[#8C6D37]/15 text-[#8C6D37] border border-[#8C6D37]/40'
                        : 'border border-[#D6CEBE] text-[#736B60] hover:bg-[#EFE9DE]'
                    }`}
                    title="Mostrar/Ocultar guías de margen de seguridad y sangría de corte"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Líneas de Sangrado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const firstPhoto = uploadedPhotos[0];
                      if (firstPhoto) setInspectedPhotoForQuality(firstPhoto);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#1F1C18] text-[#FDFCF9] hover:bg-[#3D352E] text-[11px] font-bold flex items-center gap-1.5 shadow-xs"
                    title="Auditar resolución DPI y perfil sRGB Fine Art"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#ECC880]" />
                    <span className="hidden md:inline">Auditoría Fine Art</span>
                  </button>
                </div>
              </div>

              {/* The 180° Layflat Open Book Spread Canvas */}
              <div 
                className="w-full max-w-5xl aspect-[16/10] rounded-2xl shadow-2xl border border-[#D6CEBE] overflow-hidden flex relative paper-texture select-none transition-colors duration-200"
                style={{ backgroundColor: spreadBgColor }}
              >
                {/* Central Gutter / Spine Fold Shadow */}
                <div className="absolute inset-y-0 left-1/2 -ml-4 w-8 book-gutter-shadow pointer-events-none z-20" />
                <div className="absolute inset-y-0 left-1/2 w-[1px] bg-black/15 z-20 pointer-events-none" />

                {/* Safe Margins & Bleed Overlay Guides (Zno CXEditor Feature) */}
                {showSafeMarginGuides && (
                  <div className="absolute inset-2 print-safe-guide pointer-events-none z-20 rounded">
                    <span className="absolute top-1 left-2 text-[8px] font-mono text-blue-500/80 uppercase font-bold tracking-wider">
                      Área Segura de Impresión Fine Art
                    </span>
                    <span className="absolute top-1 right-2 text-[8px] font-mono text-blue-500/80 uppercase font-bold tracking-wider">
                      Corte 3mm Bleed
                    </span>
                  </div>
                )}

                {/* FULL SPREAD PANORAMA OVERRIDE */}
                {activeSpread.isFullSpreadBleed ? (
                  <div 
                    className="w-full h-full relative group cursor-pointer"
                    onClick={() => setSelectedSlotId('full-spread')}
                    onDragOver={(e) => { e.preventDefault(); setDragOverSlotId('full-spread'); }}
                    onDragLeave={() => setDragOverSlotId(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverSlotId(null);
                      if (draggedPhotoId) {
                        setSpreads((prev) =>
                          prev.map((s, i) =>
                            i === activeSpreadIndex ? { ...s, fullSpreadPhotoId: draggedPhotoId } : s
                          )
                        );
                      }
                    }}
                  >
                    {activeSpread.fullSpreadPhotoId && uploadedPhotos.find((p) => p.id === activeSpread.fullSpreadPhotoId) ? (
                      <img
                        src={uploadedPhotos.find((p) => p.id === activeSpread.fullSpreadPhotoId)?.url}
                        alt="Foto Panorámica"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#EFE9DE] flex flex-col items-center justify-center text-[#736B60]">
                        <ImageIcon className="w-12 h-12 mb-2 opacity-50 text-[#8C6D37]" />
                        <span className="text-xs font-bold">Arrastra o haz clic para colocar una foto panorámica a doble página</span>
                      </div>
                    )}

                    {/* Change layout back button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChangePageLayout('left', 'single-bordered');
                      }}
                      className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-[#1F1C18]/85 text-[#FDFCF9] text-xs font-bold hover:bg-[#1F1C18] flex items-center gap-1 z-30 shadow-md"
                    >
                      <Layout className="w-3 h-3" />
                      <span>Volver a 2 Páginas Separadas</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* LEFT PAGE CONTAINER */}
                    <div className="w-1/2 h-full p-4 sm:p-6 flex flex-col justify-between relative border-r border-[#EAE4D8]">
                      {/* Left Layout Quick Switcher */}
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <button
                          type="button"
                          onClick={() => setActiveLayoutMenuSide(activeLayoutMenuSide === 'left' ? null : 'left')}
                          className="px-2 py-0.5 rounded bg-[#1F1C18]/75 text-[#FDFCF9] text-[9px] uppercase font-bold tracking-wider hover:bg-[#1F1C18] flex items-center gap-1 shadow-xs backdrop-blur-xs"
                        >
                          <Layout className="w-2.5 h-2.5" />
                          <span>Layout Izq</span>
                        </button>
                      </div>

                      {/* Content of Left Page */}
                      <div className="flex-1 flex flex-col justify-center items-center h-full w-full">
                        {/* 1. EDITORIAL TEXT */}
                        {activeSpread.leftPage.layout === 'editorial-text-photo' && (
                          <div className="w-full h-full flex flex-col justify-center text-center px-4">
                            <input
                              type="text"
                              value={activeSpread.leftPage.customTextHeading || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSpreads((prev) =>
                                  prev.map((s, i) =>
                                    i === activeSpreadIndex
                                      ? { ...s, leftPage: { ...s.leftPage, customTextHeading: val } }
                                      : s
                                  )
                                );
                              }}
                              placeholder="Título del Pliego"
                              className="font-serif-luxury text-xl sm:text-2xl text-center text-[#1F1C18] font-bold bg-transparent border-b border-dashed border-[#D6CEBE] mb-2 focus:outline-none focus:border-[#8C6D37]"
                            />
                            <textarea
                              value={activeSpread.leftPage.customTextBody || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSpreads((prev) =>
                                  prev.map((s, i) =>
                                    i === activeSpreadIndex
                                      ? { ...s, leftPage: { ...s.leftPage, customTextBody: val } }
                                      : s
                                  )
                                );
                              }}
                              placeholder="Escribe una memoria, dedicatoria o poesía aquí..."
                              className="text-[11px] sm:text-xs text-[#595248] text-center italic bg-transparent border border-dashed border-[#D6CEBE] p-2 rounded-lg resize-none focus:outline-none focus:border-[#8C6D37]"
                              rows={3}
                            />
                          </div>
                        )}

                        {/* 2. SINGLE FULL */}
                        {activeSpread.leftPage.layout === 'single-full' && (
                          <div className="w-full h-full">
                            {renderSlotInteractive(activeSpread.leftPage.slots[0], 'w-full h-full')}
                          </div>
                        )}

                        {/* 3. SINGLE BORDERED / PASSEPARTOUT */}
                        {activeSpread.leftPage.layout === 'single-bordered' && (
                          <div className="w-5/6 h-5/6 shadow-lg bg-[#EFE9DE] border border-[#D6CEBE] p-2.5 rounded-lg flex items-center justify-center">
                            {renderSlotInteractive(activeSpread.leftPage.slots[0], 'w-full h-full rounded')}
                          </div>
                        )}

                        {/* 4. TWO VERTICAL */}
                        {activeSpread.leftPage.layout === 'two-vertical' && (
                          <div className="w-full h-full grid grid-cols-2" style={{ gap: `${spreadPhotoGap}px` }}>
                            {activeSpread.leftPage.slots.map((slot) => renderSlotInteractive(slot, 'h-full'))}
                          </div>
                        )}

                        {/* 5. TWO HORIZONTAL */}
                        {activeSpread.leftPage.layout === 'two-horizontal' && (
                          <div className="w-full h-full grid grid-rows-2" style={{ gap: `${spreadPhotoGap}px` }}>
                            {activeSpread.leftPage.slots.map((slot) => renderSlotInteractive(slot, 'w-full h-full'))}
                          </div>
                        )}

                        {/* 6. THREE COLLAGE */}
                        {activeSpread.leftPage.layout === 'three-collage' && (
                          <div className="w-full h-full grid grid-cols-2" style={{ gap: `${spreadPhotoGap}px` }}>
                            <div className="h-full">
                              {renderSlotInteractive(activeSpread.leftPage.slots[0], 'h-full')}
                            </div>
                            <div className="h-full grid grid-rows-2" style={{ gap: `${spreadPhotoGap}px` }}>
                              {renderSlotInteractive(activeSpread.leftPage.slots[1], 'h-full')}
                              {renderSlotInteractive(activeSpread.leftPage.slots[2], 'h-full')}
                            </div>
                          </div>
                        )}

                        {/* 7. FOUR GRID */}
                        {activeSpread.leftPage.layout === 'four-grid' && (
                          <div className="w-full h-full grid grid-cols-2 grid-rows-2" style={{ gap: `${spreadPhotoGap}px` }}>
                            {activeSpread.leftPage.slots.map((slot) => renderSlotInteractive(slot, 'h-full'))}
                          </div>
                        )}

                        {/* 8. BLANK */}
                        {activeSpread.leftPage.layout === 'blank' && (
                          <div className="w-full h-full flex items-center justify-center text-[#A89F91] text-xs italic">
                            Espacio en blanco Fine Art
                          </div>
                        )}
                      </div>

                      {/* Page number */}
                      <span className="text-[9px] font-mono text-[#A89F91] text-left">
                        {activeSpreadIndex * 2 + 1}
                      </span>
                    </div>

                    {/* RIGHT PAGE CONTAINER */}
                    <div className="w-1/2 h-full p-4 sm:p-6 flex flex-col justify-between relative">
                      {/* Right Layout Quick Switcher */}
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <button
                          type="button"
                          onClick={() => setActiveLayoutMenuSide(activeLayoutMenuSide === 'right' ? null : 'right')}
                          className="px-2 py-0.5 rounded bg-[#1F1C18]/75 text-[#FDFCF9] text-[9px] uppercase font-bold tracking-wider hover:bg-[#1F1C18] flex items-center gap-1 shadow-xs backdrop-blur-xs"
                        >
                          <Layout className="w-2.5 h-2.5" />
                          <span>Layout Der</span>
                        </button>
                      </div>

                      {/* Content of Right Page */}
                      <div className="flex-1 flex flex-col justify-center items-center h-full w-full">
                        {/* 1. EDITORIAL TEXT */}
                        {activeSpread.rightPage.layout === 'editorial-text-photo' && (
                          <div className="w-full h-full flex flex-col justify-center text-center px-4">
                            <input
                              type="text"
                              value={activeSpread.rightPage.customTextHeading || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSpreads((prev) =>
                                  prev.map((s, i) =>
                                    i === activeSpreadIndex
                                      ? { ...s, rightPage: { ...s.rightPage, customTextHeading: val } }
                                      : s
                                  )
                                );
                              }}
                              placeholder="Título de la Página"
                              className="font-serif-luxury text-xl sm:text-2xl text-center text-[#1F1C18] font-bold bg-transparent border-b border-dashed border-[#D6CEBE] mb-2 focus:outline-none focus:border-[#8C6D37]"
                            />
                            <textarea
                              value={activeSpread.rightPage.customTextBody || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSpreads((prev) =>
                                  prev.map((s, i) =>
                                    i === activeSpreadIndex
                                      ? { ...s, rightPage: { ...s.rightPage, customTextBody: val } }
                                      : s
                                  )
                                );
                              }}
                              placeholder="Escribe una dedicatoria o texto..."
                              className="text-[11px] sm:text-xs text-[#595248] text-center italic bg-transparent border border-dashed border-[#D6CEBE] p-2 rounded-lg resize-none focus:outline-none focus:border-[#8C6D37]"
                              rows={3}
                            />
                          </div>
                        )}

                        {/* 2. SINGLE FULL */}
                        {activeSpread.rightPage.layout === 'single-full' && (
                          <div className="w-full h-full">
                            {renderSlotInteractive(activeSpread.rightPage.slots[0], 'w-full h-full')}
                          </div>
                        )}

                        {/* 3. SINGLE BORDERED */}
                        {activeSpread.rightPage.layout === 'single-bordered' && (
                          <div className="w-5/6 h-5/6 shadow-lg bg-[#EFE9DE] border border-[#D6CEBE] p-2.5 rounded-lg flex items-center justify-center">
                            {renderSlotInteractive(activeSpread.rightPage.slots[0], 'w-full h-full rounded')}
                          </div>
                        )}

                        {/* 4. TWO VERTICAL */}
                        {activeSpread.rightPage.layout === 'two-vertical' && (
                          <div className="w-full h-full grid grid-cols-2" style={{ gap: `${spreadPhotoGap}px` }}>
                            {activeSpread.rightPage.slots.map((slot) => renderSlotInteractive(slot, 'h-full'))}
                          </div>
                        )}

                        {/* 5. TWO HORIZONTAL */}
                        {activeSpread.rightPage.layout === 'two-horizontal' && (
                          <div className="w-full h-full grid grid-rows-2" style={{ gap: `${spreadPhotoGap}px` }}>
                            {activeSpread.rightPage.slots.map((slot) => renderSlotInteractive(slot, 'w-full h-full'))}
                          </div>
                        )}

                        {/* 6. THREE COLLAGE */}
                        {activeSpread.rightPage.layout === 'three-collage' && (
                          <div className="w-full h-full grid grid-cols-2" style={{ gap: `${spreadPhotoGap}px` }}>
                            <div className="h-full">
                              {renderSlotInteractive(activeSpread.rightPage.slots[0], 'h-full')}
                            </div>
                            <div className="h-full grid grid-rows-2" style={{ gap: `${spreadPhotoGap}px` }}>
                              {renderSlotInteractive(activeSpread.rightPage.slots[1], 'h-full')}
                              {renderSlotInteractive(activeSpread.rightPage.slots[2], 'h-full')}
                            </div>
                          </div>
                        )}

                        {/* 7. FOUR GRID */}
                        {activeSpread.rightPage.layout === 'four-grid' && (
                          <div className="w-full h-full grid grid-cols-2 grid-rows-2" style={{ gap: `${spreadPhotoGap}px` }}>
                            {activeSpread.rightPage.slots.map((slot) => renderSlotInteractive(slot, 'h-full'))}
                          </div>
                        )}

                        {/* 8. BLANK */}
                        {activeSpread.rightPage.layout === 'blank' && (
                          <div className="w-full h-full flex items-center justify-center text-[#A89F91] text-xs italic">
                            Espacio en blanco Fine Art
                          </div>
                        )}
                      </div>

                      {/* Page number */}
                      <span className="text-[9px] font-mono text-[#A89F91] text-right">
                        {activeSpreadIndex * 2 + 2}
                      </span>
                    </div>
                  </>
                )}

                {/* Floating Layout Selector Modal Drawer */}
                {activeLayoutMenuSide && (
                  <div
                    className={`absolute top-10 ${
                      activeLayoutMenuSide === 'left' ? 'left-4' : 'right-4'
                    } z-30 w-72 rounded-2xl border border-[#D6CEBE] bg-[#FDFCF9] p-3 shadow-2xl`}
                  >
                    <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-2 mb-2">
                      <span className="text-xs font-bold uppercase text-[#1F1C18]">
                        Layout Página {activeLayoutMenuSide === 'left' ? 'Izquierda' : 'Derecha'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveLayoutMenuSide(null)}
                        className="text-[#736B60] hover:text-[#1F1C18]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleChangePageLayout(activeLayoutMenuSide, 'single-full')}
                        className="p-2 rounded-lg border border-[#D6CEBE] hover:bg-[#F4EFE6] text-left font-medium"
                      >
                        1 Foto Sangrada
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChangePageLayout(activeLayoutMenuSide, 'single-bordered')}
                        className="p-2 rounded-lg border border-[#D6CEBE] hover:bg-[#F4EFE6] text-left font-medium"
                      >
                        1 Foto c/ Passepartout
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChangePageLayout(activeLayoutMenuSide, 'two-vertical')}
                        className="p-2 rounded-lg border border-[#D6CEBE] hover:bg-[#F4EFE6] text-left font-medium"
                      >
                        2 Fotos Verticales
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChangePageLayout(activeLayoutMenuSide, 'two-horizontal')}
                        className="p-2 rounded-lg border border-[#D6CEBE] hover:bg-[#F4EFE6] text-left font-medium"
                      >
                        2 Fotos Horizontales
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChangePageLayout(activeLayoutMenuSide, 'three-collage')}
                        className="p-2 rounded-lg border border-[#D6CEBE] hover:bg-[#F4EFE6] text-left font-medium"
                      >
                        3 Fotos Mosaico
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChangePageLayout(activeLayoutMenuSide, 'four-grid')}
                        className="p-2 rounded-lg border border-[#D6CEBE] hover:bg-[#F4EFE6] text-left font-medium"
                      >
                        4 Fotos Grilla
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChangePageLayout(activeLayoutMenuSide, 'editorial-text-photo')}
                        className="p-2 rounded-lg border border-[#D6CEBE] hover:bg-[#F4EFE6] text-left font-medium"
                      >
                        Página de Texto
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChangePageLayout(activeLayoutMenuSide, 'blank')}
                        className="p-2 rounded-lg border border-[#D6CEBE] hover:bg-[#F4EFE6] text-left font-medium"
                      >
                        Página en Blanco
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTTOM ZNO CLOUD BAR: PREDEFINED LAYOUTS CAROUSEL & FILMSTRIP (Screenshot 1 Match) */}
              <div className="w-full max-w-5xl mt-2 bg-[#FDFCF9] rounded-2xl border border-[#D6CEBE] p-2.5 shadow-xs select-none space-y-2">
                {/* Mode Selector & Filter Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E2D5] pb-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setBottomBarMode('layouts')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        bottomBarMode === 'layouts'
                          ? 'bg-[#1F1C18] text-[#FDFCF9] shadow-xs'
                          : 'bg-[#EFE9DE] text-[#736B60] hover:text-[#1F1C18]'
                      }`}
                    >
                      <Layout className="w-3.5 h-3.5 text-[#ECC880]" />
                      <span>Diseños Predefinidos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBottomBarMode('pages')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        bottomBarMode === 'pages'
                          ? 'bg-[#1F1C18] text-[#FDFCF9] shadow-xs'
                          : 'bg-[#EFE9DE] text-[#736B60] hover:text-[#1F1C18]'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-[#ECC880]" />
                      <span>Tira de Pliegos ({spreads.length})</span>
                    </button>
                  </div>

                  {/* Photo Count Filters when in 'layouts' mode */}
                  {bottomBarMode === 'layouts' && (
                    <div className="flex flex-wrap items-center gap-1 text-[10px]">
                      <span className="text-[#736B60] font-semibold mr-1">Filtrar fotos:</span>
                      {[
                        { id: 'all', label: 'Todo' },
                        { id: '1', label: '1 foto' },
                        { id: '2', label: '2 fotos' },
                        { id: '3', label: '3 fotos' },
                        { id: '4', label: '4 fotos' },
                        { id: 'panoramic', label: 'Panorámica' },
                        { id: 'text', label: 'Texto' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setLayoutPhotoFilter(tab.id as any)}
                          className={`px-2 py-0.5 rounded-full font-medium transition-colors ${
                            layoutPhotoFilter === tab.id
                              ? 'bg-[#8C6D37] text-white font-bold'
                              : 'bg-[#EFE9DE] text-[#595248] hover:bg-[#E2D8C7]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Filmstrip Quick Actions when in 'pages' mode */}
                  {bottomBarMode === 'pages' && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicateSpread(activeSpreadIndex)}
                        className="px-2.5 py-1 rounded-lg border border-[#D6CEBE] bg-white text-[11px] font-semibold hover:bg-[#F4EFE6] flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3 text-[#736B60]" />
                        <span>Duplicar Pliego</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddSpread}
                        className="px-3 py-1 rounded-lg bg-[#1F1C18] text-[#FDFCF9] text-[11px] font-bold hover:bg-[#3D352E] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3 text-[#ECC880]" />
                        <span>+ Pliego</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* CONTENT AREA: 1. PREDEFINED LAYOUT TEMPLATES WIREFRAME GALLERY */}
                {bottomBarMode === 'layouts' && (
                  <div className="flex items-center gap-2.5 overflow-x-auto py-1.5 px-1 scrollbar-thin">
                    {[
                      {
                        id: 'single-full',
                        title: '1 Foto Sangrada',
                        photos: 1,
                        diagram: (
                          <div className="w-full h-full bg-[#8C6D37]/30 border border-[#8C6D37] rounded-xs flex items-center justify-center text-[9px] font-bold text-[#8C6D37]">
                            1
                          </div>
                        ),
                      },
                      {
                        id: 'single-bordered',
                        title: 'Passepartout',
                        photos: 1,
                        diagram: (
                          <div className="w-full h-full bg-white border border-[#D6CEBE] p-1 flex items-center justify-center">
                            <div className="w-4/5 h-4/5 bg-[#8C6D37]/30 border border-[#8C6D37] rounded-xs flex items-center justify-center text-[8px] font-bold text-[#8C6D37]">
                              1
                            </div>
                          </div>
                        ),
                      },
                      {
                        id: 'two-vertical',
                        title: '2 Verticales',
                        photos: 2,
                        diagram: (
                          <div className="w-full h-full grid grid-cols-2 gap-1 p-0.5">
                            <div className="bg-[#8C6D37]/30 border border-[#8C6D37] rounded-xs" />
                            <div className="bg-[#8C6D37]/30 border border-[#8C6D37] rounded-xs" />
                          </div>
                        ),
                      },
                      {
                        id: 'two-horizontal',
                        title: '2 Horizontales',
                        photos: 2,
                        diagram: (
                          <div className="w-full h-full grid grid-rows-2 gap-1 p-0.5">
                            <div className="bg-[#8C6D37]/30 border border-[#8C6D37] rounded-xs" />
                            <div className="bg-[#8C6D37]/30 border border-[#8C6D37] rounded-xs" />
                          </div>
                        ),
                      },
                      {
                        id: 'three-collage',
                        title: '3 Mosaico',
                        photos: 3,
                        diagram: (
                          <div className="w-full h-full grid grid-cols-2 gap-1 p-0.5">
                            <div className="bg-[#8C6D37]/30 border border-[#8C6D37] rounded-xs" />
                            <div className="grid grid-rows-2 gap-1">
                              <div className="bg-[#8C6D37]/30 border border-[#8C6D37] rounded-xs" />
                              <div className="bg-[#8C6D37]/30 border border-[#8C6D37] rounded-xs" />
                            </div>
                          </div>
                        ),
                      },
                      {
                        id: 'four-grid',
                        title: '4 Grilla 2x2',
                        photos: 4,
                        diagram: (
                          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 p-0.5">
                            <div className="bg-[#8C6D37]/30 border border-[#8C6D37] rounded-xs" />
                            <div className="bg-[#8C6D37]/30 border border-[#8C6D37] rounded-xs" />
                            <div className="bg-[#8C6D37]/30 border border-[#8C6D37] rounded-xs" />
                            <div className="bg-[#8C6D37]/30 border border-[#8C6D37] rounded-xs" />
                          </div>
                        ),
                      },
                      {
                        id: 'full-bleed-spread',
                        title: 'Panorámica 180°',
                        photos: 'panoramic',
                        diagram: (
                          <div className="w-full h-full bg-[#1F1C18] text-[#ECC880] flex items-center justify-center text-[8px] font-bold rounded-xs">
                            Panorámica
                          </div>
                        ),
                      },
                      {
                        id: 'editorial-text-photo',
                        title: 'Editorial / Texto',
                        photos: 'text',
                        diagram: (
                          <div className="w-full h-full bg-[#F4EFE6] border border-[#D6CEBE] p-1 flex flex-col items-center justify-center text-[7px] text-[#595248] italic font-serif">
                            <span>“Título”</span>
                            <span className="text-[5px]">texto editorial</span>
                          </div>
                        ),
                      },
                      {
                        id: 'blank',
                        title: 'Blanco Fine Art',
                        photos: 0,
                        diagram: (
                          <div className="w-full h-full bg-white border border-[#D6CEBE] flex items-center justify-center text-[7px] text-[#A89F91]">
                            Vacío
                          </div>
                        ),
                      },
                    ]
                      .filter((tmpl) => {
                        if (layoutPhotoFilter === 'all') return true;
                        if (layoutPhotoFilter === 'panoramic') return tmpl.id === 'full-bleed-spread';
                        if (layoutPhotoFilter === 'text') return tmpl.id === 'editorial-text-photo';
                        return String(tmpl.photos) === layoutPhotoFilter;
                      })
                      .map((tmpl) => (
                        <div
                          key={tmpl.id}
                          className="flex-shrink-0 group/card bg-white rounded-xl border border-[#D6CEBE] hover:border-[#8C6D37] hover:shadow-md transition-all p-1.5 flex flex-col items-center gap-1 w-28"
                        >
                          {/* Miniature Wireframe Diagram */}
                          <div className="w-24 h-16 rounded bg-[#EFE9DE] overflow-hidden border border-[#D6CEBE]/50">
                            {tmpl.diagram}
                          </div>

                          <span className="text-[10px] font-bold text-[#1F1C18] truncate w-full text-center">
                            {tmpl.title}
                          </span>

                          {/* Quick Apply Buttons (Izq, Der, or Spread) */}
                          <div className="w-full flex gap-1 mt-0.5">
                            {tmpl.id === 'full-bleed-spread' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  recordHistorySnapshot(spreads);
                                  handleChangePageLayout('left', 'full-bleed-spread');
                                }}
                                className="w-full py-1 rounded bg-[#8C6D37] text-white text-[9px] font-bold hover:bg-[#73582A]"
                              >
                                Aplicar a Pliego
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    recordHistorySnapshot(spreads);
                                    handleChangePageLayout('left', tmpl.id as PageLayoutId);
                                  }}
                                  className="flex-1 py-0.5 rounded bg-[#EFE9DE] hover:bg-[#1F1C18] hover:text-white text-[9px] font-bold transition-colors"
                                >
                                  Izq
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    recordHistorySnapshot(spreads);
                                    handleChangePageLayout('right', tmpl.id as PageLayoutId);
                                  }}
                                  className="flex-1 py-0.5 rounded bg-[#EFE9DE] hover:bg-[#1F1C18] hover:text-white text-[9px] font-bold transition-colors"
                                >
                                  Der
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* CONTENT AREA: 2. SPREADS FILMSTRIP */}
                {bottomBarMode === 'pages' && (
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveSpreadIndex((prev) => Math.max(0, prev - 1))}
                      disabled={activeSpreadIndex === 0}
                      className="p-2 rounded-full border border-[#D6CEBE] bg-[#FDFCF9] text-[#736B60] hover:text-[#1F1C18] disabled:opacity-30 shrink-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Filmstrip thumbnails */}
                    <div className="flex-1 flex items-center gap-2 overflow-x-auto py-1 px-2 scrollbar-thin">
                      {spreads.map((s, idx) => {
                        const isCurrent = idx === activeSpreadIndex;
                        const leftPhoto = uploadedPhotos.find((p) => p.id === s.leftPage.slots[0]?.photoId);
                        const rightPhoto = uploadedPhotos.find((p) => p.id === s.rightPage.slots[0]?.photoId);

                        return (
                          <div
                            key={s.id}
                            onClick={() => setActiveSpreadIndex(idx)}
                            className={`group relative flex-shrink-0 cursor-pointer rounded-xl border-2 transition-all p-1 ${
                              isCurrent
                                ? 'border-[#8C6D37] bg-white ring-2 ring-[#8C6D37]/30 shadow-md'
                                : 'border-[#D6CEBE] bg-[#FDFCF9] hover:border-[#1F1C18]'
                            }`}
                          >
                            {/* Mini open spread preview */}
                            <div className="w-24 h-15 rounded bg-[#EFE9DE] overflow-hidden flex border border-[#D6CEBE]/60">
                              {s.isFullSpreadBleed ? (
                                <div className="w-full h-full bg-[#E2D8C7] flex items-center justify-center overflow-hidden">
                                  {uploadedPhotos.find((p) => p.id === s.fullSpreadPhotoId) ? (
                                    <img
                                      src={getThumbnailSrc(uploadedPhotos.find((p) => p.id === s.fullSpreadPhotoId)!)}
                                      alt="Spread"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-[8px] font-bold text-[#736B60]">Panorámica</span>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <div className="w-1/2 h-full border-r border-[#D6CEBE] bg-[#F4EFE6] overflow-hidden flex items-center justify-center">
                                    {leftPhoto ? (
                                      <img src={getThumbnailSrc(leftPhoto)} alt="L" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-[7px] text-[#A89F91]">P.{idx * 2 + 1}</span>
                                    )}
                                  </div>
                                  <div className="w-1/2 h-full bg-[#F4EFE6] overflow-hidden flex items-center justify-center">
                                    {rightPhoto ? (
                                      <img src={getThumbnailSrc(rightPhoto)} alt="R" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-[7px] text-[#A89F91]">P.{idx * 2 + 2}</span>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Label */}
                            <span
                              className={`block text-center text-[10px] font-bold mt-1 ${
                                isCurrent ? 'text-[#8C6D37]' : 'text-[#736B60]'
                              }`}
                            >
                              Pliego {idx + 1}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveSpreadIndex((prev) => Math.min(spreads.length - 1, prev + 1))}
                      disabled={activeSpreadIndex === spreads.length - 1}
                      className="p-2 rounded-full border border-[#D6CEBE] bg-[#FDFCF9] text-[#736B60] hover:text-[#1F1C18] disabled:opacity-30 shrink-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar: Permanent Inspector & Tool Sliders Panel */}
            <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-[#E0D8C8] bg-[#FDFCF9] flex flex-col overflow-y-auto shrink-0 z-20">
              {/* Panel Header */}
              <div className="p-3.5 border-b border-[#E0D8C8] bg-[#F9F6EE] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#8C6D37]" />
                  <span className="font-bold text-xs uppercase tracking-wider text-[#1F1C18]">
                    Herramientas & Ajustes
                  </span>
                </div>
                {selectedSlotData ? (
                  <span className="px-2 py-0.5 rounded-full bg-[#0091FF]/10 text-[#0091FF] font-bold text-[10px] border border-[#0091FF]/30">
                    Pág. {selectedSlotData.pageNumber}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-[#8C6D37]/10 text-[#8C6D37] font-bold text-[10px] border border-[#8C6D37]/30">
                    Pliego {activeSpreadIndex + 1}
                  </span>
                )}
              </div>

              {/* Panel Body: Mode 1 - Selected Slot Inspector & Sliders */}
              {selectedSlotData ? (
                <div className="p-4 space-y-5">
                  {/* Photo Header Card */}
                  <div className="p-2.5 rounded-xl border border-[#D6CEBE] bg-[#F4EFE6]/70 flex items-center justify-between gap-2.5">
                    {selectedSlotData.photo ? (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={getThumbnailSrc(selectedSlotData.photo)}
                            alt=""
                            className="w-11 h-11 rounded-lg object-cover border border-[#D6CEBE] shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-[#1F1C18] truncate block">
                              {selectedSlotData.photo.name}
                            </span>
                            <span className="text-[9px] text-emerald-700 font-semibold flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" />
                              Calidad Óptima (300 DPI)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowSwapPickerSlotId(selectedSlotData.slot.id)}
                            className="p-1.5 rounded-lg bg-white hover:bg-[#E2D8C7] border border-[#D6CEBE] text-[#1F1C18] text-[10px] font-semibold"
                            title="Cambiar foto"
                          >
                            <ArrowLeftRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePhotoFromSlot(selectedSlotData.slot.id)}
                            className="p-1.5 rounded-lg bg-white hover:bg-rose-50 border border-[#D6CEBE] text-rose-600 text-[10px] font-semibold"
                            title="Quitar foto"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full text-center py-1">
                        <span className="text-xs font-semibold text-[#736B60] block">Ranura sin Foto</span>
                        <span className="text-[10px] text-[#A89F91]">Arrastra una foto de la izquierda</span>
                      </div>
                    )}
                  </div>

                  {/* 1. CONTROL DESLIZANTE: ZOOM DEL ENCUADRE */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#595248] flex items-center gap-1.5">
                        <ZoomIn className="w-3.5 h-3.5 text-[#8C6D37]" />
                        <span>Zoom del Encuadre</span>
                      </label>
                      <span className="font-mono font-bold text-xs text-[#8C6D37] bg-[#8C6D37]/10 px-2 py-0.5 rounded-md">
                        {Math.round((selectedSlotData.slot.customScale || 1) * 100)}% ({((selectedSlotData.slot.customScale || 1)).toFixed(1)}x)
                      </span>
                    </div>

                    {/* Range Slider */}
                    <input
                      type="range"
                      min="1.0"
                      max="3.0"
                      step="0.05"
                      value={selectedSlotData.slot.customScale || 1}
                      onChange={(e) => handleSlotSetScale(selectedSlotData.slot.id, parseFloat(e.target.value))}
                      className="w-full h-2 bg-[#EFE9DE] rounded-lg appearance-none cursor-pointer accent-[#8C6D37]"
                    />

                    {/* Quick Presets & Precision Steppers */}
                    <div className="flex items-center justify-between gap-1 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleSlotZoom(selectedSlotData.slot.id, -0.1)}
                        className="px-2.5 py-1 rounded bg-[#EFE9DE] hover:bg-[#E2D8C7] text-xs font-bold text-[#1F1C18]"
                        title="Reducir zoom 10%"
                      >
                        -
                      </button>
                      <div className="flex items-center gap-1">
                        {[1, 1.25, 1.5, 2, 3].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleSlotSetScale(selectedSlotData.slot.id, val)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                              Math.abs((selectedSlotData.slot.customScale || 1) - val) < 0.05
                                ? 'bg-[#8C6D37] text-white shadow-xs'
                                : 'bg-[#EFE9DE] hover:bg-[#E2D8C7] text-[#595248]'
                            }`}
                          >
                            {val === 1 ? '1x' : `${val}x`}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSlotZoom(selectedSlotData.slot.id, 0.1)}
                        className="px-2.5 py-1 rounded bg-[#EFE9DE] hover:bg-[#E2D8C7] text-xs font-bold text-[#1F1C18]"
                        title="Aumentar zoom 10%"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-[10px] text-[#736B60] italic bg-[#FAF6EF] p-1.5 rounded-lg border border-[#E8E0D2] flex items-center gap-1.5">
                      <span className="text-xs">🖱️</span>
                      <span>Puedes hacer zoom con la rueda (scroll) del ratón sobre la foto.</span>
                    </p>
                  </div>

                  {/* 2. CONTROLES DESLIZANTES: DESPLAZAMIENTO / ENCUADRE (X & Y) */}
                  <div className="space-y-2 pt-1 border-t border-[#E8E2D5]">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#595248] flex items-center gap-1.5">
                        <Move className="w-3.5 h-3.5 text-[#8C6D37]" />
                        <span>Desplazamiento del Encuadre</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleResetSlotPosition(selectedSlotData.slot.id)}
                        className="text-[10px] font-bold text-[#8C6D37] hover:underline"
                      >
                        Centrar
                      </button>
                    </div>

                    {/* Horizontal X Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#736B60]">
                        <span>Horizontal (Eje X)</span>
                        <span className="font-mono font-bold text-[#1F1C18]">
                          {selectedSlotData.slot.customPosition?.x || 0} px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-150"
                        max="150"
                        step="2"
                        value={selectedSlotData.slot.customPosition?.x || 0}
                        onChange={(e) => handleSlotSetPositionX(selectedSlotData.slot.id, parseInt(e.target.value))}
                        className="w-full h-2 bg-[#EFE9DE] rounded-lg appearance-none cursor-pointer accent-[#8C6D37]"
                      />
                    </div>

                    {/* Vertical Y Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#736B60]">
                        <span>Vertical (Eje Y)</span>
                        <span className="font-mono font-bold text-[#1F1C18]">
                          {selectedSlotData.slot.customPosition?.y || 0} px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-150"
                        max="150"
                        step="2"
                        value={selectedSlotData.slot.customPosition?.y || 0}
                        onChange={(e) => handleSlotSetPositionY(selectedSlotData.slot.id, parseInt(e.target.value))}
                        className="w-full h-2 bg-[#EFE9DE] rounded-lg appearance-none cursor-pointer accent-[#8C6D37]"
                      />
                    </div>

                    <p className="text-[10px] text-[#736B60] italic bg-[#FAF6EF] p-1.5 rounded-lg border border-[#E8E0D2] flex items-center gap-1.5">
                      <span className="text-xs">✋</span>
                      <span>También puedes arrastrar directamente con el ratón sobre la foto.</span>
                    </p>
                  </div>

                  {/* 3. CONTROL DESLIZANTE: BORDE & PASSEPARTOUT */}
                  <div className="space-y-2 pt-1 border-t border-[#E8E2D5]">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#595248] flex items-center gap-1.5">
                        <Crop className="w-3.5 h-3.5 text-[#8C6D37]" />
                        <span>Borde & Passepartout</span>
                      </label>
                      <span className="font-mono font-bold text-xs text-[#1F1C18]">
                        {selectedSlotData.slot.borderWidth || 0} px
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={selectedSlotData.slot.borderWidth || 0}
                      onChange={(e) =>
                        handleSlotBorder(
                          selectedSlotData.slot.id,
                          parseInt(e.target.value),
                          selectedSlotData.slot.borderColor || '#FFFFFF'
                        )
                      }
                      className="w-full h-2 bg-[#EFE9DE] rounded-lg appearance-none cursor-pointer accent-[#8C6D37]"
                    />

                    {/* Border Color Swatches */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-[#736B60]">Color del Borde:</span>
                      <div className="flex items-center gap-1.5">
                        {[
                          { color: '#FFFFFF', name: 'Blanco' },
                          { color: '#C5A059', name: 'Oro Fine Art' },
                          { color: '#1F1C18', name: 'Negro Carbón' },
                          { color: '#EFE9DE', name: 'Marfil' },
                          { color: '#D6CEBE', name: 'Lino' },
                        ].map((c) => (
                          <button
                            key={c.color}
                            type="button"
                            onClick={() =>
                              handleSlotBorder(
                                selectedSlotData.slot.id,
                                (selectedSlotData.slot.borderWidth || 0) > 0 ? selectedSlotData.slot.borderWidth! : 4,
                                c.color
                              )
                            }
                            className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 shadow-xs ${
                              selectedSlotData.slot.borderColor === c.color && (selectedSlotData.slot.borderWidth || 0) > 0
                                ? 'ring-2 ring-[#8C6D37] scale-110'
                                : 'border-[#D6CEBE]'
                            }`}
                            style={{ backgroundColor: c.color }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 4. MODO DE RELLENO (FIT / COVER) */}
                  <div className="space-y-1.5 pt-1 border-t border-[#E8E2D5]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#595248] block">
                      Ajuste de Proporción
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedSlotData.slot.fitMode === 'contain') {
                            handleSlotFitMode(selectedSlotData.slot.id);
                          }
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                          selectedSlotData.slot.fitMode !== 'contain'
                            ? 'bg-[#1F1C18] text-[#FDFCF9] border-[#1F1C18] shadow-xs'
                            : 'bg-white text-[#736B60] border-[#D6CEBE] hover:text-[#1F1C18]'
                        }`}
                      >
                        Llenar Marco
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedSlotData.slot.fitMode !== 'contain') {
                            handleSlotFitMode(selectedSlotData.slot.id);
                          }
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                          selectedSlotData.slot.fitMode === 'contain'
                            ? 'bg-[#1F1C18] text-[#FDFCF9] border-[#1F1C18] shadow-xs'
                            : 'bg-white text-[#736B60] border-[#D6CEBE] hover:text-[#1F1C18]'
                        }`}
                      >
                        Foto Completa
                      </button>
                    </div>
                  </div>

                  {/* 5. ROTACIÓN Y REFLEJO */}
                  <div className="space-y-2 pt-1 border-t border-[#E8E2D5]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#595248] block">
                        Rotación & Ángulo
                      </span>
                      <span className="font-mono font-bold text-xs text-[#1F1C18]">
                        {selectedSlotData.slot.rotation || 0}°
                      </span>
                    </div>

                    {/* Rotation Slider */}
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={selectedSlotData.slot.rotation || 0}
                      onChange={(e) =>
                        handleSlotSetRotation(selectedSlotData.slot.id, parseInt(e.target.value))
                      }
                      className="w-full h-2 bg-[#EFE9DE] rounded-lg appearance-none cursor-pointer accent-[#8C6D37]"
                    />

                    <div className="grid grid-cols-4 gap-1">
                      {[0, 90, 180, 270].map((deg) => (
                        <button
                          key={deg}
                          type="button"
                          onClick={() => handleSlotSetRotation(selectedSlotData.slot.id, deg)}
                          className={`py-1 rounded text-[10px] font-bold transition-all border ${
                            (selectedSlotData.slot.rotation || 0) === deg
                              ? 'bg-[#8C6D37] text-white border-[#8C6D37]'
                              : 'bg-white text-[#595248] border-[#D6CEBE] hover:bg-[#EFE9DE]'
                          }`}
                        >
                          {deg}°
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSlotRotate(selectedSlotData.slot.id)}
                        className="py-1.5 px-2 rounded-lg bg-white border border-[#D6CEBE] hover:bg-[#EFE9DE] text-[#1F1C18] text-[10px] font-bold flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Girar +90°</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSlotFlipH(selectedSlotData.slot.id)}
                        className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1.5 shadow-xs ${
                          selectedSlotData.slot.flipH
                            ? 'bg-[#8C6D37] text-white border-[#8C6D37]'
                            : 'bg-white border-[#D6CEBE] hover:bg-[#EFE9DE] text-[#1F1C18]'
                        }`}
                      >
                        <FlipHorizontal className="w-3.5 h-3.5" />
                        <span>Reflejo Espejo</span>
                      </button>
                    </div>
                  </div>

                  {/* 6. TAMAÑO Y POSICIÓN DEL MARCO (NODOS & REDIMENSIÓN) */}
                  <div className="space-y-3 pt-2 border-t border-[#E8E2D5]">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#595248] flex items-center gap-1.5">
                        <Move className="w-3.5 h-3.5 text-[#0091FF]" />
                        <span>Tamaño y Nodos del Marco</span>
                      </label>
                      {Boolean(
                        selectedSlotData.slot.frameWidthDelta ||
                        selectedSlotData.slot.frameHeightDelta ||
                        selectedSlotData.slot.frameOffsetX ||
                        selectedSlotData.slot.frameOffsetY
                      ) && (
                        <button
                          type="button"
                          onClick={() => handleResetFrameDimensions(selectedSlotData.slot.id)}
                          className="text-[10px] font-bold text-[#8C6D37] hover:underline"
                        >
                          Restablecer
                        </button>
                      )}
                    </div>

                    {/* Width Delta Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#736B60]">
                        <span>Ancho del Marco</span>
                        <span className="font-mono font-bold text-[#1F1C18]">
                          {(selectedSlotData.slot.frameWidthDelta || 0) >= 0 ? `+${selectedSlotData.slot.frameWidthDelta || 0}` : selectedSlotData.slot.frameWidthDelta} px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-150"
                        max="300"
                        step="5"
                        value={selectedSlotData.slot.frameWidthDelta || 0}
                        onChange={(e) => handleSlotSetFrameWidth(selectedSlotData.slot.id, parseInt(e.target.value))}
                        className="w-full h-2 bg-[#EFE9DE] rounded-lg appearance-none cursor-pointer accent-[#0091FF]"
                      />
                    </div>

                    {/* Height Delta Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#736B60]">
                        <span>Alto del Marco</span>
                        <span className="font-mono font-bold text-[#1F1C18]">
                          {(selectedSlotData.slot.frameHeightDelta || 0) >= 0 ? `+${selectedSlotData.slot.frameHeightDelta || 0}` : selectedSlotData.slot.frameHeightDelta} px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-150"
                        max="300"
                        step="5"
                        value={selectedSlotData.slot.frameHeightDelta || 0}
                        onChange={(e) => handleSlotSetFrameHeight(selectedSlotData.slot.id, parseInt(e.target.value))}
                        className="w-full h-2 bg-[#EFE9DE] rounded-lg appearance-none cursor-pointer accent-[#0091FF]"
                      />
                    </div>

                    {/* Frame Position on Page (Offsets) */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-[#736B60]">
                          <span>Posición X</span>
                          <span className="font-mono font-bold text-[#1F1C18]">
                            {selectedSlotData.slot.frameOffsetX || 0}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-150"
                          max="150"
                          step="5"
                          value={selectedSlotData.slot.frameOffsetX || 0}
                          onChange={(e) => handleSlotSetFrameOffsetX(selectedSlotData.slot.id, parseInt(e.target.value))}
                          className="w-full h-2 bg-[#EFE9DE] rounded-lg appearance-none cursor-pointer accent-[#0091FF]"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-[#736B60]">
                          <span>Posición Y</span>
                          <span className="font-mono font-bold text-[#1F1C18]">
                            {selectedSlotData.slot.frameOffsetY || 0}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-150"
                          max="150"
                          step="5"
                          value={selectedSlotData.slot.frameOffsetY || 0}
                          onChange={(e) => handleSlotSetFrameOffsetY(selectedSlotData.slot.id, parseInt(e.target.value))}
                          className="w-full h-2 bg-[#EFE9DE] rounded-lg appearance-none cursor-pointer accent-[#0091FF]"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-[#736B60] italic bg-[#EBF5FF] p-2 rounded-lg border border-[#BDE0FE] flex items-center gap-1.5">
                      <span className="text-xs">✨</span>
                      <span>Arrastra cualquiera de los 8 nodos azules de las esquinas y lados para redimensionar libremente.</span>
                    </p>
                  </div>

                  {/* 7. FILTROS FINE ART */}
                  <div className="space-y-1.5 pt-1 border-t border-[#E8E2D5]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#595248] block">
                      Filtros Fine Art Emulsión
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'none', label: 'Original' },
                        { id: 'fine-art-bw', label: 'B&N Fine Art' },
                        { id: 'warm-vintage', label: 'Warm Vintage' },
                        { id: 'high-contrast', label: 'Alto Contraste' },
                        { id: 'fuji-film', label: 'Fuji Astia' },
                        { id: 'kodak-chrome', label: 'Kodak Portra' },
                        { id: 'matte-portrait', label: 'Matte Portrait' },
                      ].map((f) => {
                        const isCurrent = (selectedSlotData.slot.filter || 'none') === f.id;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => handleSlotFilter(selectedSlotData.slot.id, f.id as any)}
                            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all text-left truncate border ${
                              isCurrent
                                ? 'bg-[#8C6D37] text-white border-[#8C6D37] shadow-xs'
                                : 'bg-white text-[#595248] border-[#D6CEBE] hover:bg-[#EFE9DE]'
                            }`}
                          >
                            {f.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 8. DESELECCIONAR */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSlotId(null)}
                      className="w-full py-2 rounded-xl bg-[#EFE9DE] hover:bg-[#E2D8C7] text-[#595248] text-xs font-bold transition-colors"
                    >
                      Cerrar Ajustes de Foto
                    </button>
                  </div>
                </div>
              ) : (
                /* Mode 2 - General Spread Controls */
                <div className="p-4 space-y-5">
                  {/* Active Spread Info Card */}
                  <div className="p-3 rounded-xl border border-[#D6CEBE] bg-[#F4EFE6]/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#1F1C18] block">
                        Pliego {activeSpreadIndex + 1} de {spreads.length}
                      </span>
                      <span className="text-[10px] text-[#736B60]">
                        Páginas {activeSpreadIndex * 2 + 1} y {activeSpreadIndex * 2 + 2}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#8C6D37] uppercase bg-[#8C6D37]/10 px-2 py-0.5 rounded-full">
                      Activo
                    </span>
                  </div>

                  {/* Interactive Tip Banner */}
                  <div className="p-3 rounded-xl border border-[#C5A059]/40 bg-[#FAF6EF] space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#8C6D37]">
                      <MousePointerClick className="w-4 h-4" />
                      <span>Controles Deslizantes de Foto</span>
                    </div>
                    <p className="text-[11px] text-[#595248] leading-relaxed">
                      Haz clic en cualquier fotografía o marco del pliego para abrir los deslizadores de <strong>Zoom</strong>, <strong>Encuadre X/Y</strong>, <strong>Filtros</strong> y <strong>Passepartout</strong>.
                    </p>
                  </div>

                  {/* CONTROL DESLIZANTE: SEPARACIÓN ENTRE FOTOS (GAP) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#595248] flex items-center gap-1.5">
                        <Grid className="w-3.5 h-3.5 text-[#8C6D37]" />
                        <span>Separación entre Fotos (Gap)</span>
                      </label>
                      <span className="font-mono font-bold text-xs text-[#8C6D37] bg-[#8C6D37]/10 px-2 py-0.5 rounded-md">
                        {spreadPhotoGap} px
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="32"
                      step="2"
                      value={spreadPhotoGap}
                      onChange={(e) => setSpreadPhotoGap(Number(e.target.value))}
                      className="w-full h-2 bg-[#EFE9DE] rounded-lg appearance-none cursor-pointer accent-[#8C6D37]"
                    />

                    <div className="grid grid-cols-4 gap-1 pt-0.5">
                      {[
                        { val: 0, label: '0px' },
                        { val: 8, label: '8px' },
                        { val: 16, label: '16px' },
                        { val: 24, label: '24px' },
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => setSpreadPhotoGap(preset.val)}
                          className={`py-1 rounded text-[10px] font-bold transition-all ${
                            spreadPhotoGap === preset.val
                              ? 'bg-[#8C6D37] text-white shadow-xs'
                              : 'bg-[#EFE9DE] hover:bg-[#E2D8C7] text-[#595248]'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* FONDOS FINE ART PARA EL PLIEGO */}
                  <div className="space-y-2 pt-1 border-t border-[#E8E2D5]">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#595248] flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[#8C6D37]" />
                      <span>Fondo de Papel del Pliego</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {[
                        { color: '#FFFFFF', name: 'Blanco Puro' },
                        { color: '#FDFCFA', name: 'Lino Cálido' },
                        { color: '#FAF6EF', name: 'Marfil Algodón' },
                        { color: '#F2F4F0', name: 'Salvia Editorial' },
                        { color: '#2B2B2B', name: 'Gris Carbón' },
                      ].map((bg) => (
                        <button
                          key={bg.color}
                          type="button"
                          onClick={() => {
                            setSpreads((prev) =>
                              prev.map((s, i) =>
                                i === activeSpreadIndex
                                  ? {
                                      ...s,
                                      leftPage: { ...s.leftPage, backgroundColor: bg.color },
                                      rightPage: { ...s.rightPage, backgroundColor: bg.color },
                                    }
                                  : s
                              )
                            );
                          }}
                          className="w-7 h-7 rounded-full border-2 border-[#D6CEBE] hover:scale-110 transition-transform shadow-xs flex items-center justify-center"
                          style={{ backgroundColor: bg.color }}
                          title={bg.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* HERRAMIENTAS DE COMPOSICIÓN */}
                  <div className="space-y-2 pt-1 border-t border-[#E8E2D5]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#595248] block">
                      Composición del Pliego
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAddPhotoSlotToPage('left')}
                        className="p-2 rounded-xl bg-white border border-[#D6CEBE] hover:bg-[#EFE9DE] text-[#1F1C18] text-[11px] font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#8C6D37]" />
                        <span>+ Marco Izq</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddPhotoSlotToPage('right')}
                        className="p-2 rounded-xl bg-white border border-[#D6CEBE] hover:bg-[#EFE9DE] text-[#1F1C18] text-[11px] font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#8C6D37]" />
                        <span>+ Marco Der</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleFlipSpreadSides}
                      className="w-full p-2 rounded-xl bg-white border border-[#D6CEBE] hover:bg-[#EFE9DE] text-[#1F1C18] text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-[#8C6D37]" />
                      <span>Invertir Pliego (Swap Izq / Der)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAutoLayout}
                      className="w-full p-2.5 rounded-xl bg-[#8C6D37] text-white hover:bg-[#73582A] text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Fill Inteligente</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: 3D FLIP PREVIEW & FINAL SUMMARY */}
        {currentStep === 'preview' && (
          <div className="w-full flex-1 overflow-y-auto min-h-0">
            <div className="max-w-4xl mx-auto p-6 sm:p-10 pb-24 flex flex-col items-center">
              <div className="text-center mb-8">
                <span className="text-xs font-bold tracking-widest text-[#8C6D37] uppercase">Paso 5 de 5</span>
                <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#1F1C18] mt-1">
                  Hojeado Digital & Revisión Final
                </h2>
                <p className="text-xs sm:text-sm text-[#595248] mt-2">
                  Revisa cada pliego antes de enviar tu fotolibro a impresión artesanal.
                </p>
              </div>

              {/* Flip Book Showcase */}
              <div className="w-full aspect-[16/10] bg-[#FDFCFA] rounded-2xl shadow-2xl border border-[#D6CEBE] overflow-hidden flex relative mb-6 paper-texture">
                <div className="absolute inset-y-0 left-1/2 -ml-4 w-8 book-gutter-shadow pointer-events-none z-20" />
                
                {activeSpread.isFullSpreadBleed ? (
                  <div className="w-full h-full">
                    {activeSpread.fullSpreadPhotoId && uploadedPhotos.find((p) => p.id === activeSpread.fullSpreadPhotoId) ? (
                      <img
                        src={uploadedPhotos.find((p) => p.id === activeSpread.fullSpreadPhotoId)?.url}
                        alt="Foto Panorámica"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#EFE9DE] flex items-center justify-center text-xs text-[#736B60]">
                        Pliego Panorámico
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-1/2 h-full p-6 sm:p-8 border-r border-[#E8E2D5] flex flex-col justify-center items-center">
                      {uploadedPhotos.find((p) => p.id === activeSpread.leftPage.slots[0]?.photoId) ? (
                        <img
                          src={uploadedPhotos.find((p) => p.id === activeSpread.leftPage.slots[0]?.photoId)?.url}
                          alt="Foto Izq"
                          className="w-full h-full object-cover rounded shadow"
                        />
                      ) : activeSpread.leftPage.layout === 'editorial-text-photo' ? (
                        <div className="text-center p-4">
                          <h4 className="font-serif-luxury text-xl font-bold text-[#1F1C18]">{activeSpread.leftPage.customTextHeading || 'Capítulo'}</h4>
                          <p className="text-xs italic text-[#595248] mt-2">{activeSpread.leftPage.customTextBody || ''}</p>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-[#EFE9DE] rounded flex items-center justify-center text-xs text-[#736B60]">
                          Página {activeSpreadIndex * 2 + 1}
                        </div>
                      )}
                    </div>
                    <div className="w-1/2 h-full p-6 sm:p-8 flex flex-col justify-center items-center">
                      {uploadedPhotos.find((p) => p.id === activeSpread.rightPage.slots[0]?.photoId) ? (
                        <img
                          src={uploadedPhotos.find((p) => p.id === activeSpread.rightPage.slots[0]?.photoId)?.url}
                          alt="Foto Der"
                          className="w-full h-full object-cover rounded shadow"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#EFE9DE] rounded flex items-center justify-center text-xs text-[#736B60]">
                          Página {activeSpreadIndex * 2 + 2}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Stepper controls */}
              <div className="flex items-center gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => setActiveSpreadIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activeSpreadIndex === 0}
                  className="px-4 py-2 rounded-full border border-[#D6CEBE] bg-[#FDFCF9] text-xs font-semibold text-[#1F1C18] disabled:opacity-30"
                >
                  ← Pliego Anterior
                </button>
                <span className="font-serif-luxury text-base font-bold text-[#1F1C18]">
                  Pliego {activeSpreadIndex + 1} de {spreads.length}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSpreadIndex((prev) => Math.min(spreads.length - 1, prev + 1))}
                  disabled={activeSpreadIndex === spreads.length - 1}
                  className="px-4 py-2 rounded-full border border-[#D6CEBE] bg-[#FDFCF9] text-xs font-semibold text-[#1F1C18] disabled:opacity-30"
                >
                  Siguiente Pliego →
                </button>
              </div>

              {/* Final Order Confirmation Card */}
              <div className="w-full rounded-2xl border border-[#8C6D37] bg-[#FDFCF9] p-6 shadow-xl text-left space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-4">
                  <div>
                    <h3 className="font-serif-luxury text-xl font-bold text-[#1F1C18]">{foilTitleText}</h3>
                    <p className="text-xs text-[#736B60]">{currentFormat.name} · {currentCover.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-serif-luxury text-2xl font-bold text-[#1F1C18]">
                      {formatPriceARS(totalPrice)} ARS
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#595248]">
                  <div>
                    <span className="block text-[#736B60] font-medium">Papel:</span>
                    <span className="font-semibold text-[#1F1C18]">{currentPaper.name}</span>
                  </div>
                  <div>
                    <span className="block text-[#736B60] font-medium">Páginas:</span>
                    <span className="font-semibold text-[#1F1C18]">{totalPages} páginas ({spreads.length} pliegos)</span>
                  </div>
                  <div>
                    <span className="block text-[#736B60] font-medium">Grabado:</span>
                    <span className="font-semibold text-[#1F1C18]">Hot Stamping {foilColor.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="block text-[#736B60] font-medium">Cofre de Regalo:</span>
                    <span className="font-semibold text-[#1F1C18]">{giftBoxIncluded ? 'Incluido' : 'No'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFinishAndOrder}
                  className="w-full py-4 rounded-full bg-[#1F1C18] text-[#FDFCF9] text-xs uppercase tracking-widest font-bold hover:bg-[#3D352E] shadow-xl flex items-center justify-center gap-2 mt-4"
                >
                  <BookOpen className="w-4 h-4 text-[#ECC880]" />
                  <span>Confirmar y Enviar a Fabricación</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fine Art Quality Modal Inspector */}
        {inspectedPhotoForQuality && (
          <FineArtQualityModal
            photo={inspectedPhotoForQuality}
            onClose={() => setInspectedPhotoForQuality(null)}
          />
        )}
      </div>
    </div>
  );
};
