import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout, User, Mail, Phone, Lock, MapPin, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { useAuth } from "../../contexts/AuthContext";

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    location: "Erode, Tamil Nadu",
    preferredLanguage: "en",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please verify both password fields.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        location: formData.location,
        preferred_language: formData.preferredLanguage,
      });
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to create farmer account. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-agri-bg flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-modal border border-agri-border p-6 sm:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-agri-primary flex items-center justify-center text-white shadow-sm">
            <Sprout className="w-7 h-7 text-agri-primaryLight" />
          </div>
          <div>
            <span className="font-extrabold text-xl text-agri-text tracking-tight block">
              AgriAssist
            </span>
            <span className="text-xs text-agri-muted block">Farmer Onboarding</span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-agri-text tracking-tight">
            Create your AgriAssist account
          </h2>
          <p className="text-sm text-agri-muted mt-1">
            Manage your farm, understand your crops, and make smarter decisions.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 text-agri-danger rounded-2xl flex items-start gap-3 text-sm font-medium animate-in fade-in duration-150">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Farmer Name"
            type="text"
            required
            placeholder="e.g. Siva Kumar"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            leftIcon={<User className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="farmer@agriassist.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <Input
              label="Mobile Phone"
              type="tel"
              required
              placeholder="9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              leftIcon={<Phone className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              leftIcon={<Lock className="w-4 h-4" />}
            />
            <Input
              label="Confirm Password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              leftIcon={<Lock className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Farm Location / District"
              type="text"
              required
              placeholder="e.g. Erode, Tamil Nadu"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              leftIcon={<MapPin className="w-4 h-4" />}
            />
            <Select
              label="Preferred Language"
              options={[
                { value: "en", label: "English", sublabel: "English" },
                { value: "ta", label: "தமிழ்", sublabel: "Tamil" },
              ]}
              value={formData.preferredLanguage}
              onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="touch"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full mt-4"
          >
            Create Farmer Account
          </Button>
        </form>

        <div className="pt-5 mt-6 text-center text-sm text-agri-muted border-t border-agri-border">
          <span>Already have an account? </span>
          <Link to="/login" className="font-bold text-agri-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
