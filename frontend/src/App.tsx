import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Layout } from "./components/layout/Layout";

// Code Splitting & Lazy Loaded Routes
const HomePage = lazy(() =>
  import("./pages/home/HomePage").then((m) => ({ default: m.HomePage }))
);
const FarmPage = lazy(() =>
  import("./pages/farm/FarmPage").then((m) => ({ default: m.FarmPage }))
);
const RecommendationPage = lazy(() =>
  import("./pages/crop/RecommendationPage").then((m) => ({ default: m.RecommendationPage }))
);
const CalendarPage = lazy(() =>
  import("./pages/calendar/CalendarPage").then((m) => ({ default: m.CalendarPage }))
);
const AIAgentPage = lazy(() =>
  import("./pages/ai/AIAgentPage").then((m) => ({ default: m.AIAgentPage }))
);
const DiseasePage = lazy(() =>
  import("./pages/disease/DiseasePage").then((m) => ({ default: m.DiseasePage }))
);
const MarketPage = lazy(() =>
  import("./pages/marketplace/MarketPage").then((m) => ({ default: m.MarketPage }))
);
const LabourPage = lazy(() =>
  import("./pages/labour/LabourPage").then((m) => ({ default: m.LabourPage }))
);
const RentalPage = lazy(() =>
  import("./pages/rental/RentalPage").then((m) => ({ default: m.RentalPage }))
);
const NotificationsPage = lazy(() =>
  import("./pages/notifications/NotificationsPage").then((m) => ({ default: m.NotificationsPage }))
);
const SettingsPage = lazy(() =>
  import("./pages/settings/SettingsPage").then((m) => ({ default: m.SettingsPage }))
);
const LoginPage = lazy(() =>
  import("./pages/auth/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const SignupPage = lazy(() =>
  import("./pages/auth/SignupPage").then((m) => ({ default: m.SignupPage }))
);

// Loading Fallback Component
const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4">
    <div className="relative">
      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-agri-primary flex items-center justify-center animate-bounce shadow-md">
        <span className="text-2xl">🌱</span>
      </div>
      <div className="w-8 h-2 bg-slate-200 rounded-full mx-auto mt-2 blur-xs animate-pulse" />
    </div>
    <div className="text-center space-y-1">
      <p className="text-sm font-bold text-agri-text">Loading AgriAssist...</p>
      <p className="text-xs text-agri-muted">Preparing agricultural decision intelligence</p>
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected Application Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="farm" element={<FarmPage />} />
                <Route path="recommendations" element={<RecommendationPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="ai-agent" element={<AIAgentPage />} />
                <Route path="disease" element={<DiseasePage />} />
                <Route path="market" element={<MarketPage />} />
                <Route path="labours" element={<LabourPage />} />
                <Route path="rentals" element={<RentalPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
