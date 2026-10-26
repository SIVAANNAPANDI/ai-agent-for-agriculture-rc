import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import type { UserBasic, LoginData, SignupData, UserProfile } from "../services/authService";

interface AuthContextType {
  user: UserBasic | null;
  profile: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("agriassist_token"));
  const [user, setUser] = useState<UserBasic | null>(() => {
    const saved = localStorage.getItem("agriassist_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("agriassist_token");
      if (storedToken) {
        try {
          const profileData = await authService.getCurrentUser();
          setProfile(profileData);
          setUser({
            id: profileData.id,
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            preferred_language: profileData.profile?.preferred_language || "en",
            location: profileData.profile?.location_name,
            created_at: profileData.created_at,
          });
        } catch {
          // Stale token, clear
          localStorage.removeItem("agriassist_token");
          localStorage.removeItem("agriassist_user");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginData) => {
    const res = await authService.login(data);
    localStorage.setItem("agriassist_token", res.access_token);
    setToken(res.access_token);
    try {
      const fullProfile = await authService.getCurrentUser();
      setProfile(fullProfile);
      const loc = fullProfile.profile?.location_name || res.user.location || "";
      const updatedUser: UserBasic = {
        ...res.user,
        location: loc,
        preferred_language: fullProfile.profile?.preferred_language || res.user.preferred_language,
      };
      setUser(updatedUser);
      localStorage.setItem("agriassist_user", JSON.stringify(updatedUser));
    } catch {
      setUser(res.user);
      localStorage.setItem("agriassist_user", JSON.stringify(res.user));
    }
  };

  const signup = async (data: SignupData) => {
    const res = await authService.signup(data);
    localStorage.setItem("agriassist_token", res.access_token);
    setToken(res.access_token);
    try {
      const fullProfile = await authService.getCurrentUser();
      setProfile(fullProfile);
      const loc = fullProfile.profile?.location_name || data.location || res.user.location || "";
      const updatedUser: UserBasic = {
        ...res.user,
        location: loc,
        preferred_language: fullProfile.profile?.preferred_language || res.user.preferred_language,
      };
      setUser(updatedUser);
      localStorage.setItem("agriassist_user", JSON.stringify(updatedUser));
    } catch {
      setUser(res.user);
      localStorage.setItem("agriassist_user", JSON.stringify(res.user));
    }
  };

  const logout = () => {
    localStorage.removeItem("agriassist_token");
    localStorage.removeItem("agriassist_user");
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (token) {
      try {
        const fullProfile = await authService.getCurrentUser();
        setProfile(fullProfile);
        setUser((prev) => {
          if (!prev) return null;
          const updated: UserBasic = {
            ...prev,
            name: fullProfile.name,
            phone: fullProfile.phone,
            location: fullProfile.profile?.location_name || prev.location,
            preferred_language: fullProfile.profile?.preferred_language || prev.preferred_language,
          };
          localStorage.setItem("agriassist_user", JSON.stringify(updated));
          return updated;
        });
      } catch {
        // Ignored
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        signup,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
