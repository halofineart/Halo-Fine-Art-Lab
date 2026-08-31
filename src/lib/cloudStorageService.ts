import { TrackedOrder } from '../types';
import { getAdminOrders, saveAdminOrders } from './adminService';

export type CloudStorageProvider = 'google_drive' | 'mega_nz' | 'both';

export interface WorkshopCloudConfig {
  activeProvider: CloudStorageProvider;
  googleDriveRootUrl: string;
  googleDriveFolderName: string;
  megaFileDropUrl: string;
  megaMasterFolderUrl: string;
  autoCreateOnNewOrder: boolean;
  enableDirectClientDrop: boolean;
}

export interface OrderCloudFolder {
  provider: 'google_drive' | 'mega_nz' | 'both' | 'custom';
  folderName: string; // e.g. "HALO-849201 - Santiago Morales"
  googleDriveUrl?: string;
  megaUrl?: string;
  customUrl?: string;
  status: 'pending_upload' | 'photos_received' | 'downloaded_to_lab';
  uploadedPhotosCount?: number;
  uploadedAt?: string;
  notes?: string;
}

const CLOUD_CONFIG_KEY = 'halo_workshop_cloud_config';

// Default initial config for HALO Lab
export const DEFAULT_CLOUD_CONFIG: WorkshopCloudConfig = {
  activeProvider: 'both',
  googleDriveRootUrl: 'https://drive.google.com/drive/folders/1HALO_FineArt_Pilar_MasterRoot?usp=sharing',
  googleDriveFolderName: 'HALO Fine Art Lab - Recepción de Pedidos',
  megaFileDropUrl: 'https://mega.nz/filerequest/HALO-LAB-PILAR-DROP',
  megaMasterFolderUrl: 'https://mega.nz/folder/HALO_Master_Workshop_2026#LaboratorioPilar',
  autoCreateOnNewOrder: true,
  enableDirectClientDrop: true,
};

/**
 * Gets the current workshop cloud configuration.
 */
export function getWorkshopCloudConfig(): WorkshopCloudConfig {
  try {
    const raw = localStorage.getItem(CLOUD_CONFIG_KEY);
    if (raw) {
      return { ...DEFAULT_CLOUD_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error reading workshop cloud config', e);
  }
  return DEFAULT_CLOUD_CONFIG;
}

/**
 * Saves updated cloud config for the workshop.
 */
export function saveWorkshopCloudConfig(config: WorkshopCloudConfig): void {
  try {
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving workshop cloud config', e);
  }
}

/**
 * Generates automated Google Drive & MEGA.NZ folder data for a specific order.
 */
export function generateAutomatedCloudFolder(order: TrackedOrder): OrderCloudFolder {
  const config = getWorkshopCloudConfig();
  const cleanOrderNum = order.orderNumber.replace(/[^a-zA-Z0-9-]/g, '');
  const cleanCustomerName = order.customerName.trim().replace(/[\/\\?%*:|"<>]/g, '');
  const folderName = `${cleanOrderNum}_${cleanCustomerName.replace(/\s+/g, '_')}`;

  // 1. Google Drive Automated URL
  // If root URL is defined, generate search/folder target intent or deep link
  const gDriveSearchQuery = encodeURIComponent(`"${cleanOrderNum}"`);
  const googleDriveUrl = config.googleDriveRootUrl 
    ? `${config.googleDriveRootUrl.split('?')[0]}?search=${gDriveSearchQuery}&name=${encodeURIComponent(folderName)}`
    : `https://drive.google.com/drive/u/0/search?q=${gDriveSearchQuery}`;

  // 2. MEGA.NZ Automated URL
  // Uses the MEGA FileDrop request or MEGA folder parameterized with order folder name
  const megaUrl = config.megaFileDropUrl 
    ? `${config.megaFileDropUrl}#order=${encodeURIComponent(cleanOrderNum)}&name=${encodeURIComponent(cleanCustomerName)}`
    : `https://mega.nz/folder/HALO_${cleanOrderNum}#${encodeURIComponent(folderName)}`;

  return {
    provider: config.activeProvider,
    folderName,
    googleDriveUrl,
    megaUrl,
    status: 'pending_upload',
    uploadedPhotosCount: order.items?.reduce((sum, item) => sum + (item.pages || 20), 0) || 0,
    uploadedAt: new Date().toLocaleDateString('es-AR'),
  };
}

/**
 * Formats a ready-to-send WhatsApp / Email message for the customer with their assigned upload links.
 */
export function generateClientPhotoRequestMessage(
  order: TrackedOrder, 
  preferredProvider: 'google_drive' | 'mega_nz' | 'both' = 'both'
): string {
  const cloudFolder = generateAutomatedCloudFolder(order);

  let linksText = '';
  if (preferredProvider === 'google_drive' || preferredProvider === 'both') {
    linksText += `\n📁 *Carpeta Google Drive:* ${cloudFolder.googleDriveUrl}`;
  }
  if (preferredProvider === 'mega_nz' || preferredProvider === 'both') {
    linksText += `\n⚡ *Carga Rápida MEGA.NZ:* ${cloudFolder.megaUrl}`;
  }

  return (
    `¡Hola ${order.customerName}! 📸 Te escribimos desde el taller de *HALO Fine Art Lab* (Pilar) respecto a tu pedido *#${order.orderNumber}*.\n\n` +
    `Hemos habilitado tu carpeta automatizada de alta resolución para que puedas subir todas las fotos de tu fotolibro sin pérdida de calidad (JPG o RAW):\n` +
    `${linksText}\n\n` +
    `✨ *Identificador de Carpeta:* ${cloudFolder.folderName}\n` +
    `👉 Simplemente arrastra tus fotos a la carpeta o enlace. Apenas las recibamos, nuestro equipo iniciará el revelado químico y encuadernación.`
  );
}

/**
 * Updates or sets the cloud folder info on a specific order.
 */
export function updateOrderCloudFolder(
  orderId: string, 
  cloudFolderData: Partial<OrderCloudFolder>
): TrackedOrder | null {
  const orders = getAdminOrders();
  const orderIdx = orders.findIndex(o => o.id === orderId || o.orderNumber === orderId);

  if (orderIdx === -1) return null;

  const order = { ...orders[orderIdx] };
  const currentCloud = (order as any).cloudFolder || generateAutomatedCloudFolder(order);

  const updatedCloud: OrderCloudFolder = {
    ...currentCloud,
    ...cloudFolderData,
  };

  (order as any).cloudFolder = updatedCloud;
  orders[orderIdx] = order;
  saveAdminOrders(orders);

  return order;
}
