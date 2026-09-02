import { PhotobookProject, SavedProject, PhotoAsset } from '../types';

const DB_NAME = 'halo_fineart_db';
const DB_VERSION = 1;
const STORE_PROJECTS = 'saved_projects';
const STORE_DRAFTS = 'active_drafts';
const STORE_PHOTOS = 'cached_photos';

const LOCAL_STORAGE_PROJECTS_KEY = 'halo_saved_projects';
const LOCAL_STORAGE_ACTIVE_DRAFT_KEY = 'halo_active_draft_project';

/**
 * Open or initialize IndexedDB instance
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
        db.createObjectStore(STORE_DRAFTS, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        db.createObjectStore(STORE_PHOTOS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

/**
 * Validates and safely resolves photo display URL, preventing empty slots from dead blob or truncated URLs
 */
export function getPhotoDisplayUrl(photo?: PhotoAsset | null): string {
  if (!photo) return '';
  // 1. Prefer original URL if valid and not truncated
  if (photo.url && typeof photo.url === 'string' && photo.url.length > 5 && !photo.url.endsWith('...')) {
    return photo.url;
  }
  // 2. Fallback to thumbnail URL if available and not truncated
  if (photo.thumbnailUrl && typeof photo.thumbnailUrl === 'string' && photo.thumbnailUrl.length > 5 && !photo.thumbnailUrl.endsWith('...')) {
    return photo.thumbnailUrl;
  }
  return photo.url || photo.thumbnailUrl || '';
}

/**
 * Sanitizes a project for safe persistent storage, ensuring dead blob URLs are converted
 * to their persistent base64/thumbnail data so they survive browser restarts.
 */
export function sanitizeProjectForPersistence(project: PhotobookProject): PhotobookProject {
  const sanitizedPhotos: PhotoAsset[] = (project.photos || []).map((p) => {
    // If the original URL is a temporary blob URL, replace it with the persistent thumbnailUrl (base64 WebP)
    // so it doesn't become broken when the session ends or browser is closed.
    const isBlob = p.url && p.url.startsWith('blob:');
    const safeUrl = isBlob && p.thumbnailUrl && !p.thumbnailUrl.endsWith('...') ? p.thumbnailUrl : p.url;

    return {
      ...p,
      url: safeUrl,
    };
  });

  return {
    ...project,
    photos: sanitizedPhotos,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Saves a project locally to IndexedDB with multi-layer LocalStorage fallback
 */
export async function persistProjectLocally(
  project: PhotobookProject,
  totalPrice: number,
  userId: string = 'local-user'
): Promise<SavedProject> {
  const sanitizedProject = sanitizeProjectForPersistence(project);

  const savedItem: SavedProject = {
    id: sanitizedProject.id || `proj-${Date.now()}`,
    userId,
    title: sanitizedProject.title || 'Mi Fotolibro Fine Art',
    formatId: sanitizedProject.formatId,
    coverMaterialId: sanitizedProject.coverMaterialId,
    foilColor: sanitizedProject.foilColor,
    totalPages: (sanitizedProject.spreads || []).length * 2,
    totalPrice: totalPrice || 0,
    projectData: sanitizedProject,
    createdAt: sanitizedProject.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Save to IndexedDB (virtually unlimited capacity, handles all spreads & photos)
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_PROJECTS, STORE_DRAFTS], 'readwrite');
      const projectsStore = tx.objectStore(STORE_PROJECTS);
      const draftsStore = tx.objectStore(STORE_DRAFTS);

      projectsStore.put(savedItem);
      draftsStore.put({ key: 'active_draft', project: sanitizedProject, savedItem, updatedAt: Date.now() });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[ProjectStorage] IndexedDB save warning:', err);
  }

  // 2. Multi-tier LocalStorage backup (with quota protection)
  try {
    // Save active draft indicator
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_DRAFT_KEY, JSON.stringify({
      id: savedItem.id,
      title: savedItem.title,
      updatedAt: savedItem.updatedAt,
      totalPages: savedItem.totalPages,
      formatId: savedItem.formatId,
    }));

    // Save project list
    const existingRaw = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
    let list: SavedProject[] = existingRaw ? JSON.parse(existingRaw) : [];
    const idx = list.findIndex((p) => p.id === savedItem.id);
    if (idx >= 0) {
      list[idx] = savedItem;
    } else {
      list.unshift(savedItem);
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(list));
    } catch (quotaErr) {
      // If quota exceeded, store lightweight list without heavy photo base64s in localStorage
      // while IndexedDB keeps full high-res data safely.
      const lightweightList = list.map((p) => ({
        ...p,
        projectData: {
          ...p.projectData,
          photos: (p.projectData?.photos || []).map((ph) => ({
            id: ph.id,
            name: ph.name,
            width: ph.width,
            height: ph.height,
            aspectRatio: ph.aspectRatio,
            // Only keep clean remote/sample URLs; IndexedDB retains full high-res base64 data
            url: ph.url?.startsWith('data:') ? '' : ph.url,
            thumbnailUrl: ph.thumbnailUrl?.startsWith('data:') && ph.thumbnailUrl.length < 20000 ? ph.thumbnailUrl : '',
          })),
        },
      }));
      localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(lightweightList));
    }
  } catch (err) {
    console.warn('[ProjectStorage] LocalStorage save warning:', err);
  }

  return savedItem;
}

/**
 * Loads all saved projects from IndexedDB or LocalStorage
 */
export async function loadAllLocalProjects(): Promise<SavedProject[]> {
  try {
    const db = await openDB();
    const idbProjects = await new Promise<SavedProject[]>((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readonly');
      const store = tx.objectStore(STORE_PROJECTS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    if (idbProjects && idbProjects.length > 0) {
      return idbProjects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
  } catch (err) {
    console.warn('[ProjectStorage] Reading from IndexedDB fallback to LocalStorage:', err);
  }

  // Fallback to LocalStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
    if (raw) {
      const list: SavedProject[] = JSON.parse(raw);
      return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
  } catch {}

  return [];
}

/**
 * Retrieves a single project by ID with full spread and photo data
 */
export async function loadLocalProjectById(projectId: string): Promise<PhotobookProject | null> {
  try {
    const db = await openDB();
    const item = await new Promise<SavedProject | null>((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readonly');
      const store = tx.objectStore(STORE_PROJECTS);
      const request = store.get(projectId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });

    if (item && item.projectData) {
      return sanitizeProjectForPersistence(item.projectData);
    }
  } catch (err) {
    console.warn('[ProjectStorage] loadLocalProjectById IndexedDB error:', err);
  }

  // Fallback to LocalStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
    if (raw) {
      const list: SavedProject[] = JSON.parse(raw);
      const found = list.find((p) => p.id === projectId);
      if (found && found.projectData) {
        return sanitizeProjectForPersistence(found.projectData);
      }
    }
  } catch {}

  return null;
}

/**
 * Retrieves the latest active draft project if available
 */
export async function loadActiveDraftProject(): Promise<PhotobookProject | null> {
  try {
    const db = await openDB();
    const item = await new Promise<{ key: string; project: PhotobookProject } | null>((resolve, reject) => {
      const tx = db.transaction(STORE_DRAFTS, 'readonly');
      const store = tx.objectStore(STORE_DRAFTS);
      const request = store.get('active_draft');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });

    if (item && item.project && item.project.spreads && item.project.spreads.length > 0) {
      return sanitizeProjectForPersistence(item.project);
    }
  } catch (err) {
    console.warn('[ProjectStorage] loadActiveDraftProject IndexedDB error:', err);
  }

  // Check saved projects list for most recent
  const all = await loadAllLocalProjects();
  if (all.length > 0 && all[0].projectData) {
    return sanitizeProjectForPersistence(all[0].projectData);
  }

  return null;
}

/**
 * Removes a project from local storage and IndexedDB
 */
export async function deleteLocalProjectFromStorage(projectId: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_PROJECTS, STORE_DRAFTS], 'readwrite');
      tx.objectStore(STORE_PROJECTS).delete(projectId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[ProjectStorage] Delete from IndexedDB error:', err);
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
    if (raw) {
      const list: SavedProject[] = JSON.parse(raw);
      const filtered = list.filter((p) => p.id !== projectId);
      localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(filtered));
    }
    const draftRaw = localStorage.getItem(LOCAL_STORAGE_ACTIVE_DRAFT_KEY);
    if (draftRaw) {
      const draft = JSON.parse(draftRaw);
      if (draft.id === projectId) {
        localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DRAFT_KEY);
      }
    }
  } catch {}
}
