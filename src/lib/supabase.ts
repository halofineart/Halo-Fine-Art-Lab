import { createClient, User } from '@supabase/supabase-js';
import { UserProfile, SavedProject, PhotobookProject, TrackedOrder } from '../types';
import {
  persistProjectLocally,
  loadAllLocalProjects,
  deleteLocalProjectFromStorage,
  sanitizeProjectForPersistence
} from './projectStorage';

const supabaseUrl = ((import.meta as unknown as { env: Record<string, string | undefined> }).env?.VITE_SUPABASE_URL) || '';
const supabaseAnonKey = ((import.meta as unknown as { env: Record<string, string | undefined> }).env?.VITE_SUPABASE_ANON_KEY) || '';

// Inicializar cliente si las variables existen
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabase);
};

export interface DbOrderItem {
  title: string;
  format: string;
  cover: string;
  foil: string;
  pages: number;
  price: number;
  previewUrl?: string;
  hasGiftBox?: boolean;
}

export interface DbOrder {
  id?: string;
  user_id?: string;
  order_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: string;
  city?: string;
  format_title: string;
  cover_type?: string;
  paper_type?: string;
  total_price: number;
  status?: string;
  tracking_number?: string;
  created_at?: string;
  // Mercado Pago / payment tracking
  payment_status?: string;
  payment_provider?: string;
  mp_preference_id?: string;
  mp_payment_id?: string;
  mp_payment_method?: string;
  mp_installments?: number;
  mp_status_detail?: string;
  items_json?: DbOrderItem[];
  subtotal?: number;
  shipping_cost?: number;
  discount_amount?: number;
  shipping_method?: string;
  lab_notes?: string;
}

export interface DbConciergeRequest {
  id?: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  occasion?: string;
  estimated_photos?: number;
  special_notes?: string;
  status?: string;
  created_at?: string;
}

// ==========================================
// 1. SUPABASE AUTH METHODS
// ==========================================

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  if (!supabase) {
    // Fallback local para demo inmediata
    const mockUser: User = {
      id: `local-user-${Date.now()}`,
      email,
      app_metadata: {},
      user_metadata: { full_name: fullName },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    saveLocalProfile({
      id: mockUser.id,
      email,
      fullName,
      createdAt: mockUser.created_at,
    });
    return { data: { user: mockUser, session: null }, error: null };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) return { data: null, error: error.message };

    // Crear perfil en tabla profiles
    if (data.user) {
      await upsertProfile({
        id: data.user.id,
        email: data.user.email || email,
        fullName: fullName || email.split('@')[0],
      });
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error en registro' };
  }
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) {
    // Demo login fallback
    const localProfile = getLocalProfile();
    const mockUser: User = {
      id: localProfile?.id || `local-user-${Date.now()}`,
      email,
      app_metadata: {},
      user_metadata: { full_name: localProfile?.fullName || 'Cliente HALO' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    return { data: { user: mockUser, session: null }, error: null };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error en inicio de sesión' };
  }
}

export async function signOutUser() {
  if (!supabase) {
    localStorage.removeItem('halo_demo_user');
    return { error: null };
  }
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function resetPasswordForEmail(email: string) {
  if (!supabase) {
    return { data: null, error: null, message: 'Enlace de recuperación simulado enviado.' };
  }
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) return { data: null, error: error.message };
    return { data, error: null, message: 'Se ha enviado un correo con instrucciones para restablecer tu contraseña.' };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

// ==========================================
// 2. USER PROFILE METHODS
// ==========================================

export async function fetchUserProfile(userId: string): Promise<{ data: UserProfile | null; error: string | null }> {
  if (!supabase) {
    return { data: getLocalProfile(), error: null };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { data: null, error: error.message };
    }

    if (data) {
      return {
        data: {
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postal_code,
          createdAt: data.created_at,
          isAdmin: Boolean(data.is_admin),
        },
        error: null,
      };
    }

    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function upsertProfile(profile: Partial<UserProfile> & { id: string; email: string }) {
  if (!supabase) {
    saveLocalProfile(profile as UserProfile);
    return { data: profile, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: profile.id,
        email: profile.email,
        full_name: profile.fullName,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        postal_code: profile.postalCode,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.warn('Error al guardar perfil en Supabase:', error.message);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

// ==========================================
// 3. USER SAVED PROJECTS & DRAFTS
// ==========================================

export async function fetchUserProjects(userId: string): Promise<{ data: SavedProject[]; error: string | null }> {
  // Always load from local persistence (IndexedDB + LocalStorage) first to ensure immediate access
  const localProjects = await loadAllLocalProjects();

  if (!supabase) {
    return { data: localProjects, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('saved_projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('Aviso: cargando desde almacenamiento local:', error.message);
      return { data: localProjects, error: error.message };
    }

    const remoteProjects: SavedProject[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      formatId: row.format_id,
      coverMaterialId: row.cover_material_id,
      foilColor: row.foil_color,
      totalPages: row.total_pages || 20,
      totalPrice: Number(row.total_price || 0),
      projectData: row.project_data,
      thumbnailUrl: row.thumbnail_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    // Merge remote and local without duplicate IDs, picking the newest updatedAt
    const mergedMap = new Map<string, SavedProject>();
    localProjects.forEach((p) => mergedMap.set(p.id, p));
    remoteProjects.forEach((p) => {
      const existing = mergedMap.get(p.id);
      if (!existing || new Date(p.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
        mergedMap.set(p.id, p);
      }
    });

    const mergedList = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return { data: mergedList, error: null };
  } catch (err: any) {
    return { data: localProjects, error: err.message };
  }
}

export async function saveUserProject(
  userId: string,
  project: PhotobookProject,
  estimatedPrice: number
): Promise<{ data: SavedProject | null; error: string | null }> {
  // 1. Persist locally to IndexedDB & multi-tier storage immediately (failsafe)
  const savedItem = await persistProjectLocally(project, estimatedPrice, userId);

  if (!supabase) {
    return { data: savedItem, error: null };
  }

  try {
    const sanitizedData = sanitizeProjectForPersistence(project);
    const { data, error } = await supabase
      .from('saved_projects')
      .upsert({
        id: savedItem.id,
        user_id: userId,
        title: savedItem.title,
        format_id: savedItem.formatId,
        cover_material_id: savedItem.coverMaterialId,
        foil_color: savedItem.foilColor,
        total_pages: savedItem.totalPages,
        total_price: savedItem.totalPrice,
        project_data: sanitizedData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.warn('Aviso: Proyecto asegurado localmente (aviso Supabase):', error.message);
      return { data: savedItem, error: null };
    }

    return { data: savedItem, error: null };
  } catch (err: any) {
    console.warn('Aviso: Proyecto asegurado localmente:', err.message);
    return { data: savedItem, error: null };
  }
}

export async function deleteUserProject(projectId: string, userId?: string) {
  await deleteLocalProjectFromStorage(projectId);

  if (!supabase || !userId) {
    return { error: null };
  }

  try {
    const { error } = await supabase
      .from('saved_projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);

    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ==========================================
// 4. USER ORDERS & ORDER HISTORY
// ==========================================

export async function fetchUserOrders(userId?: string, userEmail?: string): Promise<{ data: DbOrder[]; error: string | null }> {
  if (!supabase) {
    return { data: [], error: null };
  }

  try {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (userId) {
      query = query.or(`user_id.eq.${userId},customer_email.eq.${userEmail || ''}`);
    } else if (userEmail) {
      query = query.eq('customer_email', userEmail);
    }

    const { data, error } = await query;

    if (error) return { data: [], error: error.message };
    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}

export async function saveOrderToDatabase(order: DbOrder) {
  if (!supabase) {
    console.warn('Supabase no está configurado aún. Guardando en modo local.');
    return { data: order, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    if (error) {
      console.error('Error al guardar en Supabase:', error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error inesperado al guardar en Supabase:', err);
    return { data: null, error: err };
  }
}

export async function fetchOrderByCode(orderCode: string) {
  if (!supabase) {
    return { data: null, error: 'NO_SUPABASE' };
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_code', orderCode.trim().toUpperCase())
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: 'ERROR_CONEXION' };
  }
}

// ==========================================
// 4b. ADMIN: FULL ORDER & REQUEST LISTS
// (relies on the `orders_select_owner_or_admin` / `concierge_select_admin_only`
// RLS policies, which only let a signed-in user with profiles.is_admin = true
// through — see supabase/migrations. Returns [] for anyone else.)
// ==========================================

export async function fetchAllOrders(): Promise<{ data: DbOrder[]; error: string | null }> {
  if (!supabase) return { data: [], error: null };
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: error.message };
    return { data: (data as DbOrder[]) || [], error: null };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}

export async function fetchAllConciergeRequests(): Promise<{ data: DbConciergeRequest[]; error: string | null }> {
  if (!supabase) return { data: [], error: null };
  try {
    const { data, error } = await supabase
      .from('concierge_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: error.message };
    return { data: (data as DbConciergeRequest[]) || [], error: null };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}

export async function saveConciergeRequestToDatabase(reqData: DbConciergeRequest) {
  if (!supabase) {
    console.warn('Supabase no está configurado aún. Guardando en modo local.');
    return { data: reqData, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('concierge_requests')
      .insert([reqData])
      .select()
      .single();

    if (error) {
      console.error('Error al guardar solicitud en Supabase:', error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error inesperado al guardar solicitud en Supabase:', err);
    return { data: null, error: err };
  }
}

// ==========================================
// LOCAL STORAGE HELPERS (OFFLINE / BACKUP)
// ==========================================

function getLocalProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem('halo_user_profile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalProfile(profile: UserProfile) {
  try {
    localStorage.setItem('halo_user_profile', JSON.stringify(profile));
  } catch {}
}

function getLocalProjects(): SavedProject[] {
  try {
    const raw = localStorage.getItem('halo_saved_projects');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalProject(project: SavedProject) {
  try {
    const list = getLocalProjects();
    const idx = list.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      list[idx] = project;
    } else {
      list.unshift(project);
    }
    localStorage.setItem('halo_saved_projects', JSON.stringify(list));
  } catch {}
}

function deleteLocalProject(projectId: string) {
  try {
    const list = getLocalProjects().filter((p) => p.id !== projectId);
    localStorage.setItem('halo_saved_projects', JSON.stringify(list));
  } catch {}
}
