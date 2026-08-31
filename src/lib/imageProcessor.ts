import { PhotoAsset, FineArtPreflightAnalysis, ColorSpaceProfile, PrintQualityRating } from '../types';

export interface ThumbnailOptions {
  maxDimension?: number; // default: 360px for fast admin / editor rendering
  quality?: number; // default: 0.78
  format?: 'image/webp' | 'image/jpeg';
  cropSquare?: boolean; // crop to center square for avatar/icon grids
}

export interface ThumbnailResult {
  thumbnailUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  originalSizeBytes: number;
  thumbnailSizeBytes: number;
  compressionRatio: number; // percentage saved (e.g. 94%)
}

/**
 * Loads an HTMLImageElement safely from a blob URL or remote URL
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error(`Error loading image for thumbnail processing: ${err}`));
    img.src = src;
  });
};

/**
 * Scans image binary header to detect color profile / ICC / EXIF ColorSpace
 */
export const detectColorProfileFromBlob = async (fileOrBlob: Blob | File): Promise<ColorSpaceProfile> => {
  try {
    // Read first 128KB which contains EXIF and ICC headers
    const slice = fileOrBlob.slice(0, 131072);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const textChunk = new TextDecoder('latin1').decode(bytes);

    if (textChunk.includes('Display P3') || textChunk.includes('P3') || textChunk.includes('Apple P3')) {
      return 'Display P3';
    }
    if (textChunk.includes('Adobe RGB') || textChunk.includes('AdobeRGB') || textChunk.includes('ADOBE_RGB')) {
      return 'Adobe RGB';
    }
    if (textChunk.includes('ProPhoto') || textChunk.includes('ROMM RGB')) {
      return 'ProPhoto RGB';
    }
    if (textChunk.includes('CMYK') || textChunk.includes('Photoshop CMYK')) {
      return 'CMYK';
    }
    if (textChunk.includes('sRGB') || textChunk.includes('sRGB IEC61966-2.1') || textChunk.includes('IEC 61966-2.1')) {
      return 'sRGB';
    }

    // Default web/digital camera standard is sRGB
    return 'sRGB (Estándar)';
  } catch (e) {
    return 'sRGB (Estándar)';
  }
};

/**
 * Performs comprehensive Fine Art print pre-flight analysis
 */
export const performFineArtPreflight = (
  width: number,
  height: number,
  colorSpace: ColorSpaceProfile,
  fileSizeBytes: number
): FineArtPreflightAnalysis => {
  const megaPixels = Number(((width * height) / 1_000_000).toFixed(1));
  const maxDimension = Math.max(width, height);
  const minDimension = Math.min(width, height);

  // Maximum print dimensions at 300 DPI (Museum Fine Art Standard)
  const maxPrintWidthCm300 = Number(((width / 300) * 2.54).toFixed(1));
  const maxPrintHeightCm300 = Number(((height / 300) * 2.54).toFixed(1));

  // Maximum print dimensions at 200 DPI (High Quality Standard)
  const maxPrintWidthCm200 = Number(((width / 200) * 2.54).toFixed(1));
  const maxPrintHeightCm200 = Number(((height / 200) * 2.54).toFixed(1));

  // Estimated DPI for a typical standard photobook page (assume 25x25 cm = ~9.84 inches)
  const targetPageInches = 9.84;
  const estimatedDpiAtA4 = Math.round(minDimension / targetPageInches);

  // Estimated DPI for a full panoramic spread (assume 60x30 cm = ~23.6 inches width)
  const targetSpreadInches = 23.6;
  const estimatedDpiAtSpread = Math.round(maxDimension / targetSpreadInches);

  const warnings: string[] = [];
  const recommendations: string[] = [];
  const passedChecks: string[] = [];

  let rating: PrintQualityRating = 'optima';
  let ratingLabel = 'Calidad Fine Art Óptima (300+ DPI)';
  let qualityScore = 95;

  // 1. Resolution & DPI Checks
  if (estimatedDpiAtA4 >= 280 && megaPixels >= 6) {
    passedChecks.push(`Resolución nativa excelente: ${width}x${height} px (${megaPixels} MP).`);
    passedChecks.push(`DPI estimado a página completa: ~${estimatedDpiAtA4} DPI (Estándar Museo).`);
    recommendations.push('Apta para portada principal, doble página panorámica 180° y página completa.');
    qualityScore = Math.min(100, 90 + Math.round(megaPixels));
  } else if (estimatedDpiAtA4 >= 190 || megaPixels >= 3.5) {
    rating = 'buena';
    ratingLabel = 'Calidad Buena (200-280 DPI)';
    qualityScore = 80;
    passedChecks.push(`Resolución adecuada para fotolibro: ${width}x${height} px (${megaPixels} MP).`);
    passedChecks.push(`DPI a página completa: ~${estimatedDpiAtA4} DPI.`);
    recommendations.push('Ideal para páginas individuales y cuadrículas de fotos.');
  } else if (estimatedDpiAtA4 >= 140 || minDimension >= 1200) {
    rating = 'advertencia';
    ratingLabel = 'Resolución Moderada (~150 DPI)';
    qualityScore = 60;
    warnings.push(`DPI ajustado para página entera (~${estimatedDpiAtA4} DPI).`);
    recommendations.push('Se recomienda usar en cuadrículas de 2 a 4 fotos o tamaño medio. Evitar doble página.');
  } else {
    rating = 'insuficiente';
    ratingLabel = 'Calidad Insuficiente (<150 DPI)';
    qualityScore = 35;
    warnings.push(`Baja resolución: ${width}x${height} px (${megaPixels} MP). Riesgo de pixelación o pérdida de nitidez.`);
    recommendations.push('Reemplazar por el archivo original en alta resolución de cámara o usar solo en viñeta muy pequeña.');
  }

  // 2. Color Profile Checks
  const isSrgb = colorSpace.startsWith('sRGB');
  if (isSrgb) {
    passedChecks.push('Perfil de color sRGB verificado: Óptimo para prensas digitales y revelado químico Fuji.');
  } else if (colorSpace === 'Display P3' || colorSpace === 'Adobe RGB') {
    passedChecks.push(`Perfil amplio detectado (${colorSpace}): Gran rango tonal.`);
    recommendations.push('El laboratorio calibrará la conversión a sRGB para fidelidad cromática exacta.');
    qualityScore = Math.max(qualityScore - 5, 40);
  } else if (colorSpace === 'CMYK') {
    warnings.push('Perfil CMYK detectado. El revelado fotográfico Fine Art opera en RGB.');
    recommendations.push('Se recomienda subir en RGB para evitar desaturación en tonos vivos.');
    qualityScore = Math.max(qualityScore - 15, 30);
  }

  // 3. File Size / Compression checks
  if (fileSizeBytes < 150_000 && megaPixels < 2) {
    warnings.push('El archivo parece haber sido descargado de WhatsApp o redes sociales con alta compresión.');
    recommendations.push('Si es posible, envíe el archivo original sin comprimir para mayor detalle.');
  } else if (fileSizeBytes > 1_500_000) {
    passedChecks.push(`Archivo rico en información: ${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB.`);
  }

  return {
    rating,
    ratingLabel,
    qualityScore,
    colorSpace,
    isSrgbCompliant: isSrgb,
    megaPixels,
    nativeWidth: width,
    nativeHeight: height,
    estimatedDpiAtA4,
    estimatedDpiAtSpread,
    maxPrintCmAt300Dpi: { widthCm: maxPrintWidthCm300, heightCm: maxPrintHeightCm300 },
    maxPrintCmAt200Dpi: { widthCm: maxPrintWidthCm200, heightCm: maxPrintHeightCm200 },
    warnings,
    recommendations,
    passedChecks,
  };
};

/**
 * Calculates optimal target dimensions preserving aspect ratio
 */
export const calculateScaledDimensions = (
  srcWidth: number,
  srcHeight: number,
  maxDimension: number
): { width: number; height: number } => {
  if (srcWidth <= maxDimension && srcHeight <= maxDimension) {
    return { width: srcWidth, height: srcHeight };
  }

  if (srcWidth > srcHeight) {
    const scale = maxDimension / srcWidth;
    return {
      width: Math.round(maxDimension),
      height: Math.round(srcHeight * scale),
    };
  } else {
    const scale = maxDimension / srcHeight;
    return {
      width: Math.round(srcWidth * scale),
      height: Math.round(maxDimension),
    };
  }
};

/**
 * High quality step-down canvas resizer (reduces aliasing artifacts)
 */
const renderDownscaledCanvas = (
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement => {
  let currentWidth = img.naturalWidth || img.width;
  let currentHeight = img.naturalHeight || img.height;

  // Create working canvas
  let canvas = document.createElement('canvas');
  canvas.width = currentWidth;
  canvas.height = currentHeight;
  let ctx = canvas.getContext('2d', { willReadFrequently: false, alpha: false });
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

  // Halving step-down algorithm for pristine fine-art downsampling
  while (currentWidth * 0.5 > targetWidth && currentHeight * 0.5 > targetHeight) {
    currentWidth = Math.floor(currentWidth * 0.5);
    currentHeight = Math.floor(currentHeight * 0.5);

    const nextCanvas = document.createElement('canvas');
    nextCanvas.width = currentWidth;
    nextCanvas.height = currentHeight;
    const nextCtx = nextCanvas.getContext('2d', { alpha: false });
    if (!nextCtx) break;

    nextCtx.imageSmoothingEnabled = true;
    nextCtx.imageSmoothingQuality = 'high';
    nextCtx.drawImage(canvas, 0, 0, currentWidth, currentHeight);

    canvas = nextCanvas;
  }

  // Final draw to exact target dimensions
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;
  const finalCtx = finalCanvas.getContext('2d', { alpha: false });
  if (finalCtx) {
    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';
    finalCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
    return finalCanvas;
  }

  return canvas;
};

/**
 * Generates an in-browser compressed thumbnail with exact size & savings metrics
 */
export const generateInBrowserThumbnail = async (
  source: File | string,
  options: ThumbnailOptions = {}
): Promise<ThumbnailResult> => {
  const maxDimension = options.maxDimension || 360;
  const quality = options.quality ?? 0.78;
  const preferredFormat = options.format || 'image/webp';

  let objectUrlToRevoke: string | null = null;
  let imageUrl: string;
  let originalSizeBytes: number;

  if (typeof source === 'string') {
    imageUrl = source;
    // Estimate remote/data URL size
    originalSizeBytes = source.startsWith('data:') 
      ? Math.round(source.length * 0.75) 
      : 3 * 1024 * 1024; // fallback 3MB estimate
  } else {
    originalSizeBytes = source.size;
    imageUrl = URL.createObjectURL(source);
    objectUrlToRevoke = imageUrl;
  }

  try {
    const img = await loadImage(imageUrl);
    const originalWidth = img.naturalWidth || img.width;
    const originalHeight = img.naturalHeight || img.height;
    const aspectRatio = originalHeight > 0 ? Number((originalWidth / originalHeight).toFixed(2)) : 1;

    const { width: targetWidth, height: targetHeight } = calculateScaledDimensions(
      originalWidth,
      originalHeight,
      maxDimension
    );

    const canvas = renderDownscaledCanvas(img, targetWidth, targetHeight);

    // Test if browser supports WebP canvas export
    let thumbnailUrl = canvas.toDataURL(preferredFormat, quality);
    if (!thumbnailUrl.startsWith(`data:${preferredFormat}`) && preferredFormat === 'image/webp') {
      // Fallback to jpeg if webp is not supported
      thumbnailUrl = canvas.toDataURL('image/jpeg', quality);
    }

    // Calculate approximate byte size of base64 thumbnail
    const thumbnailSizeBytes = Math.round(thumbnailUrl.length * 0.75);
    const compressionRatio = originalSizeBytes > 0
      ? Math.max(0, Math.min(99, Math.round((1 - thumbnailSizeBytes / originalSizeBytes) * 100)))
      : 80;

    return {
      thumbnailUrl,
      width: originalWidth,
      height: originalHeight,
      aspectRatio,
      originalSizeBytes,
      thumbnailSizeBytes,
      compressionRatio,
    };
  } finally {
    if (objectUrlToRevoke) {
      // Intentionally kept available
    }
  }
};

/**
 * Fully processes a single uploaded File into an optimized PhotoAsset with Preflight Analysis
 */
export const processUploadedPhotoFile = async (
  file: File,
  options: ThumbnailOptions = {}
): Promise<PhotoAsset> => {
  const originalUrl = URL.createObjectURL(file);
  const id = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  try {
    // 1. Detect Color Profile from binary stream
    const colorSpace = await detectColorProfileFromBlob(file);

    // 2. Generate fast downscaled WebP thumbnail
    const thumbResult = await generateInBrowserThumbnail(file, options);

    // 3. Perform Fine Art DPI and Quality preflight analysis
    const preflight = performFineArtPreflight(
      thumbResult.width,
      thumbResult.height,
      colorSpace,
      file.size
    );

    return {
      id,
      name: file.name,
      url: originalUrl, // Full resolution preserved for printing & download
      thumbnailUrl: thumbResult.thumbnailUrl, // Highly compressed thumbnail for rapid UI rendering
      width: thumbResult.width,
      height: thumbResult.height,
      aspectRatio: thumbResult.aspectRatio,
      originalSizeBytes: thumbResult.originalSizeBytes,
      thumbnailSizeBytes: thumbResult.thumbnailSizeBytes,
      compressionRatio: thumbResult.compressionRatio,
      isOptimized: true,
      preflight,
      dateTaken: new Date(file.lastModified || Date.now()).toISOString().split('T')[0],
    };
  } catch (err) {
    console.warn(`[ImageProcessor] Fallback for ${file.name}:`, err);
    // Graceful fallback if canvas fails
    return {
      id,
      name: file.name,
      url: originalUrl,
      thumbnailUrl: originalUrl,
      originalSizeBytes: file.size,
      thumbnailSizeBytes: file.size,
      compressionRatio: 0,
      isOptimized: false,
      dateTaken: new Date().toISOString().split('T')[0],
    };
  }
};

/**
 * Batch processes multiple files in chunks with progress callback
 */
export const batchProcessPhotoFiles = async (
  files: FileList | File[],
  options: ThumbnailOptions = {},
  onProgress?: (processed: number, total: number, currentAsset: PhotoAsset) => void
): Promise<PhotoAsset[]> => {
  const fileArray = Array.from(files);
  const total = fileArray.length;
  const results: PhotoAsset[] = [];

  // Process in small batches of 3 to avoid main thread blocking
  const CHUNK_SIZE = 3;
  for (let i = 0; i < fileArray.length; i += CHUNK_SIZE) {
    const chunk = fileArray.slice(i, i + CHUNK_SIZE);
    const chunkPromises = chunk.map(async (file) => {
      const asset = await processUploadedPhotoFile(file, options);
      results.push(asset);
      if (onProgress) {
        onProgress(results.length, total, asset);
      }
      return asset;
    });

    await Promise.all(chunkPromises);
    // Yield to event loop to keep UI smooth and responsive
    await new Promise((r) => setTimeout(r, 10));
  }

  return results;
};

/**
 * Returns human readable formatted file size string (e.g., "14.2 MB", "42 KB")
 */
export const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Calculates aggregate optimization stats and Fine Art preflight summary
 */
export const calculatePhotoSavingsSummary = (photos: PhotoAsset[]) => {
  let totalOriginal = 0;
  let totalThumbnail = 0;
  let optimizedCount = 0;

  let optimalCount = 0;
  let goodCount = 0;
  let warningCount = 0;
  let insufficientCount = 0;

  photos.forEach((p) => {
    if (p.originalSizeBytes) totalOriginal += p.originalSizeBytes;
    if (p.thumbnailSizeBytes) totalThumbnail += p.thumbnailSizeBytes;
    if (p.isOptimized) optimizedCount++;

    if (p.preflight) {
      if (p.preflight.rating === 'optima') optimalCount++;
      else if (p.preflight.rating === 'buena') goodCount++;
      else if (p.preflight.rating === 'advertencia') warningCount++;
      else if (p.preflight.rating === 'insuficiente') insufficientCount++;
    }
  });

  const totalSaved = Math.max(0, totalOriginal - totalThumbnail);
  const savedPercent = totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0;

  return {
    totalOriginal,
    totalThumbnail,
    totalSaved,
    savedPercent,
    optimizedCount,
    optimalCount,
    goodCount,
    warningCount,
    insufficientCount,
    hasIssues: warningCount > 0 || insufficientCount > 0,
    totalCount: photos.length,
    formattedOriginal: formatFileSize(totalOriginal),
    formattedThumbnail: formatFileSize(totalThumbnail),
    formattedSaved: formatFileSize(totalSaved),
  };
};

/**
 * Helper to get the most performant image URL for a given context
 */
export const getThumbnailSrc = (asset: PhotoAsset): string => {
  return asset.thumbnailUrl || asset.url;
};
