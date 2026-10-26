import React from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { VoiceAssistantModal } from "../voice/VoiceAssistantModal";
import { notificationService } from "../../services/notificationService";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, isLoading, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [unreadCount, setUnreadCount] = React.useState<number>(0);
  const [isVoiceOpen, setIsVoiceOpen] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      notificationService
        .getUnreadCount()
        .then((count) => setUnreadCount(count))
        .catch((err) => console.error("Could not fetch unread notifications count:", err));
    }
  }, [isAuthenticated]);

  // If loading session, show subtle loading shell
  if (isLoading) {
    return (
      <div className="min-h-screen bg-agri-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-agri-primary text-white flex items-center justify-center animate-pulse">
            <span className="text-xl">🌱</span>
          </div>
          <span className="text-sm font-semibold text-agri-muted">Loading AgriAssist...</span>
        </div>
      </div>
    );
  }

  // Redirect to /login if unauthenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const desiredLoc = localStorage.getItem("agriassist_desired_location");
  const farmDisplayName = desiredLoc
    ? `Farm • ${desiredLoc}`
    : profile?.profile?.location_name
    ? `Farm • ${profile.profile.location_name}`
    : "My Farm";

  return (
    <div className="flex min-h-screen bg-agri-bg text-agri-text">
      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <Header
          userName={user?.name || "Farmer"}
          farmName={farmDisplayName}
          preferredLanguage={language}
          onToggleLanguage={toggleLanguage}
          unreadNotifications={unreadCount}
          onLogout={logout}
          onOpenVoice={() => setIsVoiceOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>

      {/* Global Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onOpenFullChat={() => {
          setIsVoiceOpen(false);
          navigate("/ai-agent");
        }}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
