import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Package, 
  BookOpen, 
  LogOut, 
  Save, 
  Clock, 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  Trash2, 
  ArrowRight,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  fetchUserOrders, 
  fetchUserProjects, 
  deleteUserProject, 
  DbOrder 
} from '../lib/supabase';
import { SavedProject, PhotobookProject } from '../types';
import { formatPriceARS } from '../data/mockData';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTrackerForOrder: (orderCode: string) => void;
  onResumeProject: (project: PhotobookProject) => void;
  onOpenAuth: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenTrackerForOrder,
  onResumeProject,
  onOpenAuth,
}) => {
  const { user, profile, isLoggedIn, signOut, updateProfileData, isSupabaseLive } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'projects' | 'profile'>('orders');

  // Orders State
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Projects State
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Form State for Profile
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setCity(profile.city || '');
      setPostalCode(profile.postalCode || '');
    }
  }, [profile]);

  useEffect(() => {
    if (isOpen && isLoggedIn) {
      loadOrders();
      loadProjects();
    }
  }, [isOpen, isLoggedIn, user, profile]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await fetchUserOrders(user?.id, profile?.email || user?.email);
      setOrders(data || []);
    } catch (err) {
      console.warn('Error al cargar órdenes:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const currentId = user?.id || profile?.id || 'local-user';
      const { data } = await fetchUserProjects(currentId);
      setProjects(data || []);
    } catch (err) {
      console.warn('Error al cargar proyectos:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('¿Deseas eliminar este borrador de fotolibro?')) return;

    await deleteUserProject(projectId, user?.id);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);
    setProfileError(null);

    const res = await updateProfileData({
      fullName,
      phone,
      address,
      city,
      postalCode,
    });

    setSavingProfile(false);
    if (res.error) {
      setProfileError(res.error);
    } else {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#FDFCF9] rounded-3xl border border-[#D6CEBE] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-[#2B2621] text-white p-6 sm:p-7 flex items-center justify-between border-b border-[#52493F]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#C5A059] text-white font-serif text-xl flex items-center justify-center font-semibold shadow-inner">
              {(profile?.fullName || user?.email || 'H').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#FDFCF9]">
                  {profile?.fullName || 'Mi Taller HALO'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#C5A059]/20 text-[#ECC880] text-[10px] font-semibold tracking-wider uppercase border border-[#C5A059]/30">
                  Cliente Fine Art
                </span>
              </div>
              <p className="text-xs text-[#C7BFB1] flex items-center gap-2 mt-0.5">
                <span>{profile?.email || user?.email || 'Modo Local'}</span>
                {isSupabaseLive && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Supabase Sync
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await signOut();
                onClose();
              }}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-white/20 text-xs text-[#E8E2D5] hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1.5"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-[#A89F91] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#EFE9DE] px-6 border-b border-[#D6CEBE] flex items-center gap-2 sm:gap-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-semibold tracking-wide border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-[#8C6D37] text-[#1F1C18]'
                : 'border-transparent text-[#6B6358] hover:text-[#1F1C18]'
            }`}
          >
            <Package className="w-4 h-4 text-[#8C6D37]" />
            <span>Mis Pedidos & Tracking</span>
            {orders.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#1F1C18] text-[#FDFCF9] text-[10px] font-bold">
                {orders.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-semibold tracking-wide border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'projects'
                ? 'border-[#8C6D37] text-[#1F1C18]'
                : 'border-transparent text-[#6B6358] hover:text-[#1F1C18]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#8C6D37]" />
            <span>Borradores & Proyectos</span>
            {projects.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#C5A059] text-white text-[10px] font-bold">
                {projects.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-semibold tracking-wide border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[#8C6D37] text-[#1F1C18]'
                : 'border-transparent text-[#6B6358] hover:text-[#1F1C18]'
            }`}
          >
            <User className="w-4 h-4 text-[#8C6D37]" />
            <span>Datos Personales & Envío</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-[#FDFCF9]">
          {/* 1. ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-serif text-lg text-[#1F1C18]">Historial de Pedidos</h4>
                  <p className="text-xs text-[#6B6358]">Fabricación artesanal en Pilar (4 a 6 días hábiles)</p>
                </div>
                <button
                  type="button"
                  onClick={loadOrders}
                  className="text-xs text-[#8C6D37] hover:underline flex items-center gap-1 font-medium"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Actualizar lista</span>
                </button>
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center text-xs text-[#8C8275] flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
                  <span>Consultando tus pedidos en Supabase...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 px-6 rounded-2xl border border-dashed border-[#D6CEBE] bg-[#F7F3EB]/50 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#EFE9DE] mx-auto flex items-center justify-center text-[#8C8275]">
                    <Package className="w-6 h-6" />
                  </div>
                  <h5 className="font-serif text-base text-[#2B2621]">Aún no tienes pedidos registrados</h5>
                  <p className="text-xs text-[#6B6358] max-w-sm mx-auto">
                    Cuando confirmes tu fotolibro o solicites el diseño asistido, podrás seguir el avance artesanal en vivo aquí.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id || ord.order_code}
                      className="p-5 rounded-2xl border border-[#D6CEBE] bg-[#F7F3EB]/40 hover:bg-[#F7F3EB] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-[#1F1C18] bg-[#EFE9DE] px-2 py-0.5 rounded-md border border-[#D6CEBE]">
                            {ord.order_code}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            ord.status === 'entregado'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'enviado'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status === 'enviado' ? 'En Tránsito' : ord.status === 'entregado' ? 'Entregado' : 'En Taller'}
                          </span>
                        </div>

                        <h5 className="font-medium text-sm text-[#1F1C18]">{ord.format_title}</h5>
                        <p className="text-xs text-[#6B6358]">
                          Tapa: {ord.cover_type || 'Lino'} · Papel: {ord.paper_type || 'Fuji Lustre HD'}
                        </p>
                        <p className="text-xs text-[#8C8275]">
                          Fecha: {ord.created_at ? new Date(ord.created_at).toLocaleDateString('es-AR') : 'Reciente'}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#D6CEBE]/60">
                        <span className="font-serif text-base font-semibold text-[#1F1C18]">
                          {formatPriceARS(ord.total_price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenTrackerForOrder(ord.order_code);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#1F1C18] text-[#FDFCF9] text-xs font-semibold hover:bg-[#3D352E] transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Truck className="w-3.5 h-3.5 text-[#ECC880]" />
                          <span>Rastrear Pedido</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. SAVED PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-serif text-lg text-[#1F1C18]">Tus Fotolibros en Curso</h4>
                  <p className="text-xs text-[#6B6358]">Guarda tus avances y continúa diseñando en cualquier momento</p>
                </div>
                <button
                  type="button"
                  onClick={loadProjects}
                  className="text-xs text-[#8C6D37] hover:underline flex items-center gap-1 font-medium"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Actualizar borradores</span>
                </button>
              </div>

              {loadingProjects ? (
                <div className="py-12 text-center text-xs text-[#8C8275] flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
                  <span>Cargando tus proyectos guardados...</span>
                </div>
              ) : projects.length === 0 ? (
                <div className="py-12 px-6 rounded-2xl border border-dashed border-[#D6CEBE] bg-[#F7F3EB]/50 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#EFE9DE] mx-auto flex items-center justify-center text-[#8C8275]">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h5 className="font-serif text-base text-[#2B2621]">No tienes proyectos guardados aún</h5>
                  <p className="text-xs text-[#6B6358] max-w-sm mx-auto">
                    Cuando estés en el editor de fotolibros, haz clic en <strong>"Guardar en mi cuenta"</strong> para sincronizar tu álbum.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-5 rounded-2xl border border-[#D6CEBE] bg-[#F7F3EB]/50 hover:border-[#8C6D37] transition-all flex flex-col justify-between space-y-4 group shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EFE9DE] text-[#595248] uppercase tracking-wider">
                            {proj.formatId}
                          </span>
                          <h5 className="font-serif text-base text-[#1F1C18] mt-1 font-medium group-hover:text-[#8C6D37] transition-colors">
                            {proj.title}
                          </h5>
                          <p className="text-xs text-[#6B6358] mt-0.5">
                            {proj.totalPages} páginas · Tapa {proj.coverMaterialId} · Foil {proj.foilColor}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteProject(proj.id, e)}
                          className="p-1.5 rounded-lg text-[#A89F91] hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar borrador"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="pt-3 border-t border-[#D6CEBE]/60 flex items-center justify-between">
                        <span className="text-xs text-[#8C8275]">
                          Modificado: {new Date(proj.updatedAt).toLocaleDateString('es-AR')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onResumeProject(proj.projectData);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#1F1C18] text-[#FDFCF9] text-xs font-semibold hover:bg-[#3D352E] transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#ECC880]" />
                          <span>Abrir Editor</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. PROFILE FORM TAB */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
              <div>
                <h4 className="font-serif text-lg text-[#1F1C18]">Tus Datos de Envío y Facturación</h4>
                <p className="text-xs text-[#6B6358]">
                  Completa tu dirección para agilizar tus compras y envíos directos sin cargo en Pilar.
                </p>
              </div>

              {profileSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tus datos han sido actualizados con éxito.</span>
                </div>
              )}

              {profileError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#595248] mb-1.5">
                    Nombre y Apellido
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8C8275] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej: Carolina Rossi"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F7F3EB] border border-[#D6CEBE] rounded-xl text-sm text-[#1F1C18] focus:ring-2 focus:ring-[#C5A059] focus:bg-[#FDFCF9] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#595248] mb-1.5">
                    Correo Electrónico (No modificable)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8C8275] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="email"
                      disabled
                      value={profile?.email || user?.email || ''}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#EFE9DE] border border-[#D6CEBE] rounded-xl text-sm text-[#8C8275] cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#595248] mb-1.5">
                    Teléfono / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8C8275] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+54 9 11 2862-5916"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F7F3EB] border border-[#D6CEBE] rounded-xl text-sm text-[#1F1C18] focus:ring-2 focus:ring-[#C5A059] focus:bg-[#FDFCF9] outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#595248] mb-1.5">
                    Dirección de Entrega (Calle, Número, Piso/Depto)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#8C8275] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ej: Los Laureles 450, Barrio La Cañada"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F7F3EB] border border-[#D6CEBE] rounded-xl text-sm text-[#1F1C18] focus:ring-2 focus:ring-[#C5A059] focus:bg-[#FDFCF9] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#595248] mb-1.5">
                    Ciudad / Localidad
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Pilar, Bs. As."
                    className="w-full px-4 py-2.5 bg-[#F7F3EB] border border-[#D6CEBE] rounded-xl text-sm text-[#1F1C18] focus:ring-2 focus:ring-[#C5A059] focus:bg-[#FDFCF9] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#595248] mb-1.5">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="1629"
                    className="w-full px-4 py-2.5 bg-[#F7F3EB] border border-[#D6CEBE] rounded-xl text-sm text-[#1F1C18] focus:ring-2 focus:ring-[#C5A059] focus:bg-[#FDFCF9] outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#D6CEBE] flex items-center justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl bg-[#1F1C18] text-[#FDFCF9] text-xs uppercase tracking-widest font-semibold hover:bg-[#3D352E] shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {savingProfile ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-[#ECC880]" />
                      <span>Guardar Datos</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
