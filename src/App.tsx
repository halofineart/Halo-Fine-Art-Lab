import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StorytellingBanner } from './components/StorytellingBanner';
import { ProductCatalog } from './components/ProductCatalog';
import { QualityShowcase } from './components/QualityShowcase';
import { ReviewsAndFAQ } from './components/ReviewsAndFAQ';
import { Footer } from './components/Footer';
import { PhotobookBuilder } from './components/PhotobookBuilder';
import { ConciergeDesignModal } from './components/ConciergeDesignModal';
import { CartCheckoutModal, CartItem } from './components/CartCheckoutModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { OrderTrackerSection } from './components/OrderTrackerSection';
import { EmailNotificationToast } from './components/EmailNotificationToast';
import { EmailViewerModal } from './components/EmailViewerModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AdminWorkshopModal } from './components/AdminWorkshopModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  BookFormatId, 
  PhotobookProject, 
  DesignServiceRequest, 
  TrackedOrder, 
  OrderStatusStage,
  EmailNotification 
} from './types';
import { SAMPLE_ORDERS } from './data/mockData';
import { generateStatusEmail } from './lib/emailNotificationService';
import { Sparkles, MessageCircle, BookOpen, Package, Mail } from 'lucide-react';

function MainAppContent() {
  const { user, profile, isLoggedIn } = useAuth();

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderInitialProject, setBuilderInitialProject] = useState<PhotobookProject | null>(null);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminWorkshopOpen, setIsAdminWorkshopOpen] = useState(false);

  const [selectedTrackerOrderId, setSelectedTrackerOrderId] = useState<string>('');
  const [activeSection, setActiveSection] = useState('hero');

  // Tracked Orders State
  const [trackedOrders, setTrackedOrders] = useState<TrackedOrder[]>(SAMPLE_ORDERS);

  // Email Notification Modal & Toast States
  const [activeToastNotification, setActiveToastNotification] = useState<EmailNotification | null>(null);
  const [selectedEmailModal, setSelectedEmailModal] = useState<{
    notification: EmailNotification;
    order?: TrackedOrder;
  } | null>(null);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'demo-item-1',
      type: 'custom-album',
      title: 'Fotolibro Gran Cuadrado Fine Art (30x30 cm)',
      details: 'Tapa Lino Natural · Grabado Hot Stamping Oro · 20 páginas Layflat 180°',
      price: 145000,
    }
  ]);

  const handleNavigateSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (sectionId === 'tracker') {
      const elem = document.getElementById('tracker');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
        return;
      } else {
        setIsTrackerOpen(true);
        return;
      }
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenBuilderWithProject = (project?: PhotobookProject) => {
    setBuilderInitialProject(project || null);
    setIsBuilderOpen(true);
  };

  const handleAddProjectToCart = (project: PhotobookProject, totalPrice: number) => {
    const newItem: CartItem = {
      id: `cart-${Date.now()}`,
      type: 'custom-album',
      title: `${project.title} (${project.formatId})`,
      details: `Tapa ${project.coverMaterialId} · Grabado ${project.foilColor.toUpperCase()} · ${project.spreads.length * 2} páginas`,
      price: totalPrice,
      project,
    };
    setCartItems((prev) => [newItem, ...prev]);
    setIsBuilderOpen(false);
    setIsCartOpen(true);
  };

  const handleAddConciergeRequest = (request: DesignServiceRequest) => {
    const newItem: CartItem = {
      id: `cart-req-${Date.now()}`,
      type: 'concierge-request',
      title: `Servicio Concierge: ${request.coverTitle}`,
      details: `Formato ${request.bookFormatId} · Tapa ${request.coverMaterialId} · ${request.estimatedPages} páginas estimadas`,
      price: request.estimatedTotal,
      request,
    };
    setCartItems((prev) => [newItem, ...prev]);
  };

  const handleOrderPlaced = (newOrder: TrackedOrder) => {
    // Generate initial order confirmation email
    const initialEmail = generateStatusEmail(newOrder, 'en_diseno');
    const orderWithEmail: TrackedOrder = {
      ...newOrder,
      emailNotificationsEnabled: true,
      emailHistory: [initialEmail],
    };

    setTrackedOrders((prev) => [orderWithEmail, ...prev]);
    setSelectedTrackerOrderId(newOrder.id);
    
    // Trigger toast notification
    setActiveToastNotification(initialEmail);
  };

  const handleOpenTrackerForOrder = (orderId?: string) => {
    if (orderId) {
      setSelectedTrackerOrderId(orderId);
    }
    setIsTrackerOpen(true);
  };

  const handleUpdateOrderStatus = (orderId: string, newStage: OrderStatusStage) => {
    setTrackedOrders((prev) => {
      let updatedOrderForToast: TrackedOrder | null = null;
      let generatedEmailForToast: EmailNotification | null = null;

      const newOrders = prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        
        // Update timeline steps dynamically
        const updatedTimeline = ord.timeline.map((step) => {
          if (newStage === 'en_diseno') {
            return {
              ...step,
              completed: false,
              current: step.stage === 'en_diseno',
            };
          } else if (newStage === 'en_impresion') {
            return {
              ...step,
              completed: step.stage === 'en_diseno',
              current: step.stage === 'en_impresion',
            };
          } else if (newStage === 'enviado') {
            return {
              ...step,
              completed: step.stage === 'en_diseno' || step.stage === 'en_impresion',
              current: step.stage === 'enviado',
            };
          } else {
            return {
              ...step,
              completed: true,
              current: false,
            };
          }
        });

        // Generate automated email for status change
        const email = generateStatusEmail({ ...ord, status: newStage }, newStage);
        const existingHistory = ord.emailHistory || [];
        
        const updatedOrder: TrackedOrder = {
          ...ord,
          status: newStage,
          timeline: updatedTimeline,
          emailHistory: [...existingHistory, email],
        };

        updatedOrderForToast = updatedOrder;
        generatedEmailForToast = email;

        return updatedOrder;
      });

      if (generatedEmailForToast) {
        setActiveToastNotification(generatedEmailForToast);
      }

      return newOrders;
    });
  };

  const handleViewEmail = (notification: EmailNotification, order?: TrackedOrder) => {
    const matchedOrder = order || trackedOrders.find((o) => o.orderNumber === notification.orderNumber);
    setSelectedEmailModal({
      notification,
      order: matchedOrder,
    });
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1F1C18] selection:bg-[#ECC880]/30 selection:text-[#1F1C18] flex flex-col font-sans">
      {/* Ephemeral Toast Notification for Automated Emails */}
      <EmailNotificationToast
        notification={activeToastNotification}
        onClose={() => setActiveToastNotification(null)}
        onViewEmail={(notif) => {
          handleViewEmail(notif);
          setActiveToastNotification(null);
        }}
      />

      {/* Top Main Navigation with User Profile Integration */}
      <Navbar
        onOpenBuilder={() => handleOpenBuilderWithProject()}
        onOpenConcierge={() => setIsConciergeOpen(true)}
        onOpenTracker={() => handleOpenTrackerForOrder()}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        activeSection={activeSection}
        onNavigateSection={handleNavigateSection}
      />

      {/* Main Page Layout */}
      <main className="flex-1">
        {/* 1. Hero Section matching user's uploaded visual flow */}
        <HeroSection
          onOpenBuilder={() => handleOpenBuilderWithProject()}
          onOpenConcierge={() => setIsConciergeOpen(true)}
          onExploreCatalog={() => handleNavigateSection('catalog')}
        />

        {/* 2. Emotional Storytelling Banner */}
        <StorytellingBanner
          onOpenBuilder={() => handleOpenBuilderWithProject()}
          onOpenConcierge={() => setIsConciergeOpen(true)}
        />

        {/* 3. Products & Formats Catalog */}
        <ProductCatalog
          onSelectFormatToBuild={(formatId) => {
            handleOpenBuilderWithProject();
          }}
          onOpenConcierge={(formatId) => {
            setIsConciergeOpen(true);
          }}
        />

        {/* 4. Quality & Photographic Paper Deep Dive */}
        <QualityShowcase />

        {/* 5. Live Order Tracker Section with 4-6 Business Days Status & Email Preview */}
        <OrderTrackerSection
          orders={trackedOrders}
          onOpenTrackerModal={handleOpenTrackerForOrder}
          onViewEmailNotification={(notif, ord) => handleViewEmail(notif, ord)}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />

        {/* 6. Customer Reviews & FAQ */}
        <ReviewsAndFAQ />
      </main>

      {/* Footer */}
      <Footer
        onOpenBuilder={() => handleOpenBuilderWithProject()}
        onOpenConcierge={() => setIsConciergeOpen(true)}
        onNavigateSection={handleNavigateSection}
        onOpenAdminWorkshop={() => setIsAdminWorkshopOpen(true)}
      />

      {/* Floating Action Buttons for Tracker & WhatsApp Concierge */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2.5">
        <button
          type="button"
          onClick={() => handleOpenTrackerForOrder()}
          className="px-4 py-2.5 rounded-full bg-[#FDFCF9] text-[#1F1C18] text-xs font-semibold shadow-lg hover:bg-[#F4EFE6] flex items-center gap-2 border border-[#D6CEBE] hover:scale-105 transition-all"
        >
          <Package className="w-4 h-4 text-[#8C6D37]" />
          <span>Tracker de Pedido (4-6 días)</span>
        </button>

        <button
          type="button"
          onClick={() => setIsConciergeOpen(true)}
          className="px-5 py-3 rounded-full bg-[#1F1C18] text-[#FDFCF9] text-xs uppercase tracking-wider font-semibold shadow-2xl hover:bg-[#3D352E] flex items-center gap-2 border border-[#C5A059]/40 hover:scale-105 transition-all"
        >
          <Sparkles className="w-4 h-4 text-[#ECC880]" />
          <span className="hidden sm:inline">¿Dudas? Nosotros lo Diseñamos</span>
          <span className="sm:hidden">Diseño Asistido</span>
        </button>
      </div>

      {/* Interactive Photobook Builder Modal */}
      {isBuilderOpen && (
        <PhotobookBuilder
          initialProject={builderInitialProject}
          onClose={() => {
            setIsBuilderOpen(false);
            setBuilderInitialProject(null);
          }}
          onAddToCart={handleAddProjectToCart}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* Concierge "Nosotros lo Diseñamos" Modal */}
      {isConciergeOpen && (
        <ConciergeDesignModal
          onClose={() => setIsConciergeOpen(false)}
          onSubmitRequest={handleAddConciergeRequest}
          onOrderPlaced={handleOrderPlaced}
          onOpenTracker={handleOpenTrackerForOrder}
        />
      )}

      {/* Shopping Cart & Checkout Modal */}
      {isCartOpen && (
        <CartCheckoutModal
          cartItems={cartItems}
          onClose={() => setIsCartOpen(false)}
          onRemoveItem={handleRemoveCartItem}
          onClearCart={handleClearCart}
          onOrderPlaced={handleOrderPlaced}
          onOpenTracker={handleOpenTrackerForOrder}
        />
      )}

      {/* Order Tracker & History Modal */}
      {isTrackerOpen && (
        <OrderTrackerModal
          orders={trackedOrders}
          selectedOrderId={selectedTrackerOrderId}
          onClose={() => setIsTrackerOpen(false)}
          onSelectOrder={(id) => setSelectedTrackerOrderId(id)}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
      )}

      {/* Full Email Notification Viewer Modal */}
      {selectedEmailModal && (
        <EmailViewerModal
          notification={selectedEmailModal.notification}
          order={selectedEmailModal.order}
          emailHistory={selectedEmailModal.order?.emailHistory || [selectedEmailModal.notification]}
          onClose={() => setSelectedEmailModal(null)}
          onSelectHistoricalEmail={(histEmail) => {
            setSelectedEmailModal({
              ...selectedEmailModal,
              notification: histEmail,
            });
          }}
          onOpenTracker={(ordId) => {
            setSelectedEmailModal(null);
            handleOpenTrackerForOrder(ordId);
          }}
        />
      )}

      {/* User Auth Modal (Login / Sign Up / Forgot Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setIsProfileModalOpen(true);
        }}
      />

      {/* User Profile & Projects Account Portal Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onOpenTrackerForOrder={(orderCode) => {
          handleOpenTrackerForOrder(orderCode);
        }}
        onResumeProject={(project) => {
          handleOpenBuilderWithProject(project);
        }}
        onOpenAuth={() => {
          setIsProfileModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Admin Workshop & Production Orders Portal */}
      <AdminWorkshopModal
        isOpen={isAdminWorkshopOpen}
        onClose={() => setIsAdminWorkshopOpen(false)}
        onViewOrderInTracker={(orderCode) => {
          setIsAdminWorkshopOpen(false);
          handleOpenTrackerForOrder(orderCode);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

