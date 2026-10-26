import React, { createContext, useContext, useState, useEffect } from "react";

export type SupportedLanguage = "en" | "ta";

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Navigation
    home: "Home",
    farm: "My Farm",
    calendar: "Calendar",
    aiAgent: "AI Agent",
    disease: "Disease Analysis",
    market: "Local Shop",
    labours: "Labours",
    rentals: "Rentals",
    notifications: "Notifications",
    settings: "Settings",
    voiceAssistant: "Voice Assistant",

    // Common Actions
    save: "Save Changes",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    viewDetails: "View Details",
    loading: "Loading...",
    filter: "Filter",
    search: "Search",
    all: "All",
    status: "Status",
    active: "Active",
    completed: "Completed",
    pending: "Pending",
    close: "Close",
    logout: "Log Out",

    // Dashboard
    smartDecisions: "Your Farm. Your Data. Smarter Decisions.",
    activeSeason: "Active Season",
    quickActions: "Quick Actions",
    farmOverview: "Farm Overview",
    weatherAdvisory: "Weather Advisory",
    cultivationProgress: "Cultivation Progress",

    // Marketplaces
    produceMarketplace: "Local Produce Marketplace",
    labourMarketplace: "Farm Labour Marketplace",
    rentalMarketplace: "Farmland & Equipment Rentals",
    contactOwner: "Contact Owner",
    contactWorker: "Contact Worker",
    contactSeller: "Contact Seller",

    // Voice & AI
    listening: "Listening...",
    processing: "Processing...",
    speakNow: "Tap and speak your agriculture question",
    askAnything: "Ask about crops, weather, diseases or soil...",
  },
  ta: {
    // Navigation
    home: "முகப்பு",
    farm: "எனது பண்ணை",
    calendar: "சாகுபடி நாள்காட்டி",
    aiAgent: "AI உதவியாளர்",
    disease: "நோய் கண்டறிதல்",
    market: "விளைபொருள் அங்காடி",
    labours: "தொழிலாளர்கள்",
    rentals: "நில வாடகை",
    notifications: "அறிவிப்புகள்",
    settings: "அமைப்புகள்",
    voiceAssistant: "குரல் உதவியாளர்",

    // Common Actions
    save: "சேமிக்கவும்",
    cancel: "ரத்து செய்",
    delete: "நீக்கு",
    edit: "திருத்து",
    create: "உருவாக்கு",
    viewDetails: "விவரங்களை பார்",
    loading: "ஏற்றுகிறது...",
    filter: "வடிகட்டு",
    search: "தேடுக",
    all: "அனைத்தும்",
    status: "நிலை",
    active: "செயலில்",
    completed: "முடிந்தது",
    pending: "நிலுவையில்",
    close: "மூடு",
    logout: "வெளியேறு",

    // Dashboard
    smartDecisions: "உங்கள் பண்ணை. உங்கள் தரவு. சிறந்த முடிவுகள்.",
    activeSeason: "செயலில் உள்ள பருவம்",
    quickActions: "விரைவு சேவைகள்",
    farmOverview: "பண்ணை மேலோட்டம்",
    weatherAdvisory: "வானிலை ஆலோசனை",
    cultivationProgress: "சாகுபடி முன்னேற்றம்",

    // Marketplaces
    produceMarketplace: "உள்ளூர் விளைபொருள் அங்காடி",
    labourMarketplace: "விவசாய தொழிலாளர் சந்தை",
    rentalMarketplace: "விவசாய நில வாடகை தளம்",
    contactOwner: "உரிமையாளரை தொடர்பு கொள்ள",
    contactWorker: "தொழிலாளரை தொடர்பு கொள்ள",
    contactSeller: "விற்பனையாளரை தொடர்பு கொள்ள",

    // Voice & AI
    listening: "கேட்கிறது...",
    processing: "செயலாக்குகிறது...",
    speakNow: "மைக் தொட்டு விவசாய கேள்வியை பேசவும்",
    askAnything: "பயிர்கள், வானிலை, நோய்கள் அல்லது மண் பற்றி கேளுங்கள்...",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem("agriassist_language");
    return saved === "ta" ? "ta" : "en";
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("agriassist_language", lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === "en" ? "ta" : "en";
    setLanguage(nextLang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
