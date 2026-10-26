import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout, Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../contexts/AuthContext";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      await login({
        email_or_username: emailOrPhone,
        password: password,
        remember_me: rememberMe,
      });
      navigate("/");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-agri-bg">
      {/* Left Column: Agriculture Visual & Tagline (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-agri-primary overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-agri-primary via-emerald-800 to-agri-primaryDark opacity-95" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-agri-primaryLight/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-lg text-white space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-hero">
            <Sprout className="w-10 h-10 text-agri-primaryLight" />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-300">
              The Modern Agricultural OS
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Smarter decisions for every acre.
            </h1>
            <p className="text-base text-emerald-100 font-normal leading-relaxed">
              AgriAssist combines farm data, soil profiles, real-time weather intelligence, deep learning crop health, and community marketplaces to help you farm with absolute confidence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/15">
            <div>
              <span className="text-2xl font-black text-white">93%+</span>
              <p className="text-xs text-emerald-200 mt-0.5">Leaf disease accuracy</p>
            </div>
            <div>
              <span className="text-2xl font-black text-white">24/7</span>
              <p className="text-xs text-emerald-200 mt-0.5">Voice assistance in தமிழ்</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Clean Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-agri-primary flex items-center justify-center text-white shadow-sm">
              <Sprout className="w-6 h-6 text-agri-primaryLight" />
            </div>
            <span className="font-extrabold text-xl text-agri-text tracking-tight">
              AgriAssist
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-agri-text tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-agri-muted mt-1">
              Sign in to access your farm metrics, calendar, and intelligence.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-agri-danger animate-in fade-in duration-150">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email or Mobile Phone"
              type="text"
              required
              placeholder="e.g. testfarmer@agriassist.com"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 hover:text-agri-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-agri-border text-agri-primary focus:ring-agri-primary"
                />
                <span className="text-sm text-agri-text">Remember me</span>
              </label>
              <a href="#" className="font-semibold text-agri-primary hover:underline text-xs">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="touch"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full mt-2"
            >
              Sign In to Farm
            </Button>
          </form>

          <div className="pt-4 text-center text-sm text-agri-muted border-t border-agri-border">
            <span>Don't have an account? </span>
            <Link to="/signup" className="font-bold text-agri-primary hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
