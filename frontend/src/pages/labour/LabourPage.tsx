import React, { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { useAuth } from "../../contexts/AuthContext";
import {
  labourService,
  type Labour,
  type LabourCreate,
  type LabourUpdate,
} from "../../services/labourService";
import {
  Users,
  Plus,
  Search,
  Phone,
  MessageCircle,
  MapPin,
  Briefcase,
  CheckCircle2,
  Trash2,
  Edit3,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export const LabourPage: React.FC = () => {
  const { user, profile } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<"find" | "my_listings">("find");
  const [labours, setLabours] = useState<Labour[]>([]);
  const [myLabours, setMyLabours] = useState<Labour[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedSkill, setSelectedSkill] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState<"en" | "ta">("en");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedLabour, setSelectedLabour] = useState<Labour | null>(null);

  const availableSkills = [
    { id: "Planting & Transplanting", en: "Planting / Transplanting", ta: "நாற்று நடுதல்" },
    { id: "Harvesting", en: "Harvesting", ta: "அறுவடை" },
    { id: "Weeding", en: "Weeding & Cleaning", ta: "களை எடுத்தல்" },
    { id: "Spraying", en: "Spraying & Pesticides", ta: "மருந்து தெளித்தல்" },
    { id: "Irrigation", en: "Irrigation & Water", ta: "பாசனம்" },
    { id: "Ploughing", en: "Ploughing & Tillage", ta: "உழவு பணி" },
    { id: "Machinery", en: "Tractor & Machinery", ta: "டிராக்டர் / இயந்திரம்" },
  ];

  // Create Form State
  const [formData, setFormData] = useState<LabourCreate>({
    worker_name: "",
    phone: user?.phone || "",
    skills: ["Harvesting", "Planting & Transplanting"],
    experience_years: 5,
    daily_wage: 650,
    location_name: profile?.profile?.location_name || "Tamil Nadu",
    latitude: 11.1085,
    longitude: 77.3411,
    description: "",
  });

  // Fetch Labour Data
  const fetchLabourData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [allList, mine] = await Promise.all([
        labourService.getLabours({
          skill: selectedSkill === "All" ? undefined : selectedSkill,
          search: searchQuery.trim() || undefined,
          status: "AVAILABLE",
        }),
        labourService.getMyLabours(),
      ]);
      setLabours(allList);
      setMyLabours(mine);
    } catch (err: any) {
      setError(err.message || "Failed to load farm labour listings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLabourData();
  }, [selectedSkill, searchQuery]);

  // Skill Selection in Create Form
  const toggleSkillSelection = (skillId: string) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skillId);
      const nextSkills = exists
        ? prev.skills.filter((s) => s !== skillId)
        : [...prev.skills, skillId];
      return { ...prev, skills: nextSkills.length > 0 ? nextSkills : [skillId] };
    });
  };

  // Submit Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.worker_name.trim() || !formData.phone.trim()) return;

    setIsLoading(true);
    try {
      await labourService.createLabour(formData);
      setIsCreateModalOpen(false);
      setFormData({
        worker_name: "",
        phone: user?.phone || "",
        skills: ["Harvesting", "Planting & Transplanting"],
        experience_years: 5,
        daily_wage: 650,
        location_name: profile?.profile?.location_name || "Tamil Nadu",
        latitude: 11.1085,
        longitude: 77.3411,
        description: "",
      });
      await fetchLabourData();
    } catch (err: any) {
      setError(err.message || "Failed to register worker profile.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabour) return;

    setIsLoading(true);
    try {
      await labourService.updateLabour(selectedLabour.id, {
        worker_name: selectedLabour.worker_name,
        phone: selectedLabour.phone,
        skills: selectedLabour.skills,
        experience_years: selectedLabour.experience_years,
        daily_wage: selectedLabour.daily_wage,
        location_name: selectedLabour.location_name,
        description: selectedLabour.description,
      });
      setIsEditModalOpen(false);
      setSelectedLabour(null);
      await fetchLabourData();
    } catch (err: any) {
      setError(err.message || "Failed to update worker profile.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Availability (AVAILABLE / BUSY)
  const handleToggleAvailability = async (labour: Labour) => {
    const nextStatus = labour.availability_status === "AVAILABLE" ? "BUSY" : "AVAILABLE";
    try {
      await labourService.updateAvailability(labour.id, nextStatus);
      await fetchLabourData();
    } catch (err: any) {
      setError(err.message || "Failed to update availability status.");
    }
  };

  // Delete Labour
  const handleDeleteLabour = async (labourId: number) => {
    if (
      !window.confirm(
        language === "ta"
          ? "இந்த தொழிலாளர் பதிவை நிச்சயமாக நீக்க விரும்புகிறீர்களா?"
          : "Are you sure you want to delete this worker profile?"
      )
    ) {
      return;
    }

    try {
      await labourService.deleteLabour(labourId);
      await fetchLabourData();
    } catch (err: any) {
      setError(err.message || "Failed to delete worker profile.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-agri-text">
              {language === "ta" ? "விவசாய தொழிலாளர் அங்காடி" : "Farm Labour Marketplace"}
            </h1>
            <Badge variant="primary" className="text-xs">
              Direct Hire
            </Badge>
          </div>
          <p className="text-sm text-agri-muted">
            {language === "ta"
              ? "நாற்று நடுதல், அறுவடை, களை எடுத்தல் மற்றும் டிராக்டர் பணிகளுக்கு அனுபவமிக்க தொழிலாளர்களை உடனடியாக அணுகுங்கள்."
              : "Directly connect with verified agricultural workers, skilled harvesting gangs, and tractor operators for timely field operations."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs font-semibold border border-agri-border">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                language === "en" ? "bg-white text-agri-text shadow-sm" : "text-agri-muted"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("ta")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                language === "ta" ? "bg-white text-agri-text shadow-sm" : "text-agri-muted"
              }`}
            >
              தமிழ்
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="font-bold shadow-sm"
          >
            {language === "ta" ? "+ ஆட்கள் பதிவு" : "+ Register Worker"}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-agri-border text-sm font-semibold">
        <button
          onClick={() => setActiveTab("find")}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "find"
              ? "border-agri-primary text-agri-primary font-bold"
              : "border-transparent text-agri-muted hover:text-agri-text"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{language === "ta" ? "வேலைக்கு ஆட்கள் தேடு" : "Find Farm Labour"}</span>
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
            {labours.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("my_listings")}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "my_listings"
              ? "border-agri-primary text-agri-primary font-bold"
              : "border-transparent text-agri-muted hover:text-agri-text"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{language === "ta" ? "எனது தொழிலாளர் பதிவுகள்" : "My Worker Listings"}</span>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
            {myLabours.length}
          </span>
        </button>
      </div>

      {/* Search Bar & Skill Chips (only on find tab) */}
      {activeTab === "find" && (
        <div className="space-y-3">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                language === "ta"
                  ? "தொழிலாளர் பெயர், ஊர் அல்லது பணி வாரியாக தேடுங்கள்..."
                  : "Search workers by name, skills, crew leader, or village..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-agri-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-agri-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Skill Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedSkill("All")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedSkill === "All"
                  ? "bg-agri-primary text-white border-agri-primary shadow-xs"
                  : "bg-white text-agri-text border-agri-border hover:bg-slate-50"
              }`}
            >
              {language === "ta" ? "அனைத்து பணிகள்" : "All Skills"}
            </button>
            {availableSkills.map((sk) => (
              <button
                key={sk.id}
                onClick={() => setSelectedSkill(sk.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedSkill === sk.id
                    ? "bg-agri-primary text-white border-agri-primary shadow-xs"
                    : "bg-white text-agri-text border-agri-border hover:bg-slate-50"
                }`}
              >
                {language === "ta" ? sk.ta : sk.en}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Find Labour Tab */}
      {activeTab === "find" && (
        <>
          {labours.length === 0 ? (
            <Card variant="surface" className="p-12 text-center space-y-3 border-dashed border-2 border-slate-300">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-agri-primary flex items-center justify-center mx-auto">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-agri-text">
                {language === "ta" ? "தொழிலாளர்கள் விவரம் எதுவும் இல்லை" : "No Farm Workers Found"}
              </h3>
              <p className="text-xs text-agri-muted max-w-sm mx-auto leading-relaxed">
                {searchQuery || selectedSkill !== "All"
                  ? language === "ta"
                    ? "தேர்ந்தெடுக்கப்பட்ட பணிக்கு ஆட்கள் இல்லை. பிற பிரிவுகளை தேர்வு செய்து பார்க்கவும்."
                    : "No workers match your current skill or search filter. Try resetting filters."
                  : language === "ta"
                  ? "உங்கள் பகுதியில் உள்ள தொழிலாளர் குழுவை பதிவு செய்து விவசாய தேவைகளை பூர்த்தி செய்யுங்கள்."
                  : "Be the first to list available agricultural labor crews in your district."}
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCreateModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                className="mt-2"
              >
                {language === "ta" ? "ஆட்கள் விவரம் பதிவு செய்" : "Register Worker Profile"}
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {labours.map((l) => (
                <Card
                  key={l.id}
                  variant="surface"
                  className="p-5 flex flex-col justify-between hover:shadow-card transition-all border-agri-border group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {l.experience_years} yrs exp.
                      </span>
                      <Badge
                        variant={l.availability_status === "AVAILABLE" ? "success" : "neutral"}
                        className="text-[11px]"
                      >
                        {l.availability_status}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-lg text-agri-text group-hover:text-agri-primary transition-colors">
                        {l.worker_name}
                      </h3>
                      {l.description && (
                        <p className="text-xs text-agri-muted line-clamp-2 mt-1 leading-relaxed">
                          {l.description}
                        </p>
                      )}
                    </div>

                    {/* Wage badge */}
                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-baseline justify-between">
                      <span className="text-xs font-bold text-emerald-900">
                        {language === "ta" ? "தினக்கூலி விகிதம்:" : "Daily Wage Rate:"}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-agri-primary">
                          ₹{l.daily_wage}
                        </span>
                        <span className="text-xs text-agri-muted font-semibold">/ day</span>
                      </div>
                    </div>

                    {/* Skills badges */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-agri-muted uppercase tracking-wider block">
                        Skills & Specialties:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {l.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="text-xs text-agri-muted flex items-center gap-1.5 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{l.location_name}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-agri-border flex items-center justify-between gap-2">
                    {l.is_owner ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        Your Listing
                      </span>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedLabour(l);
                          setIsContactModalOpen(true);
                        }}
                        leftIcon={<Phone className="w-3.5 h-3.5" />}
                        className="w-full justify-center text-xs font-bold"
                      >
                        {language === "ta" ? "ஆட்களை அழைக்கவும்" : "Contact Worker"}
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Main Grid: My Listings Tab */}
      {activeTab === "my_listings" && (
        <>
          {myLabours.length === 0 ? (
            <Card variant="surface" className="p-12 text-center space-y-3 border-dashed border-2 border-slate-300">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-agri-text">
                {language === "ta" ? "நீங்கள் தொழிலாளர்கள் பதிவு செய்யவில்லை" : "No Worker Listings Yet"}
              </h3>
              <p className="text-xs text-agri-muted max-w-sm mx-auto leading-relaxed">
                {language === "ta"
                  ? "உங்கள் தொழிலாளர் குழுவை பதிவு செய்து அருகிலுள்ள விவசாயிகளிடம் வேலை வாய்ப்புகளை பெறுங்கள்."
                  : "List farm labor crews, harvest workers, or tractor drivers you represent to receive hiring inquiries."}
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCreateModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                className="mt-2"
              >
                {language === "ta" ? "+ தொழிலாளர் பதிவு" : "+ Create First Worker Profile"}
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myLabours.map((l) => (
                <Card
                  key={l.id}
                  variant="surface"
                  className="p-5 flex flex-col justify-between border-agri-border space-y-3"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {l.experience_years} yrs exp.
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(l)}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                          l.availability_status === "AVAILABLE"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                        }`}
                        title="Click to toggle availability"
                      >
                        {l.availability_status === "AVAILABLE" ? "✓ AVAILABLE" : "• BUSY / ON FIELD"}
                      </button>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-agri-text">{l.worker_name}</h3>
                      <p className="text-xs text-agri-muted line-clamp-2 mt-0.5">
                        {l.description || "No description provided."}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between font-bold text-agri-text">
                      <span>Daily Wage:</span>
                      <span className="text-agri-primary">₹{l.daily_wage} / day</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {l.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="text-xs text-agri-muted flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-agri-primary shrink-0" />
                      <span className="truncate">{l.location_name}</span>
                    </div>
                  </div>

                  {/* Actions for Owner */}
                  <div className="pt-3 border-t border-agri-border flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleAvailability(l)}
                      className="text-xs font-semibold"
                    >
                      {l.availability_status === "AVAILABLE" ? "Mark Busy" : "Mark Available"}
                    </Button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLabour(l);
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 text-slate-500 hover:text-agri-primary hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Listing"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteLabour(l.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* CREATE WORKER MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={language === "ta" ? "விவசாய தொழிலாளர் / குழு பதிவு" : "Register Farm Worker Profile"}
        description={
          language === "ta"
            ? "தொழிலாளர் பெயர், திறன்கள் மற்றும் தினக்கூலி விவரங்களை உள்ளிடவும்."
            : "Publish labor availability for agricultural field operations like harvesting, spraying, or planting."
        }
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-agri-text block">
                {language === "ta" ? "தொழிலாளர் / குழு தலைவர் பெயர் *" : "Worker / Crew Leader Name *"}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Murugan Team (5 members), Selvam Tractor Works"
                value={formData.worker_name}
                onChange={(e) => setFormData({ ...formData, worker_name: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl border border-agri-border bg-agri-bg text-sm focus:ring-2 focus:ring-agri-primary focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-agri-text block">
                {language === "ta" ? "தொடர்பு தொலைபேசி எண் *" : "Contact Phone Number *"}
              </label>
              <input
                type="tel"
                required
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl border border-agri-border bg-agri-bg text-sm focus:ring-2 focus:ring-agri-primary focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-agri-text block">
                {language === "ta" ? "தினக்கூலி (₹/நாள்) *" : "Daily Wage Rate (₹ / day) *"}
              </label>
              <input
                type="number"
                min="100"
                step="50"
                required
                value={formData.daily_wage}
                onChange={(e) =>
                  setFormData({ ...formData, daily_wage: parseFloat(e.target.value) || 0 })
                }
                className="w-full h-11 px-3.5 rounded-xl border border-agri-border bg-agri-bg text-sm focus:ring-2 focus:ring-agri-primary focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-agri-text block">
                {language === "ta" ? "அனுபவம் (ஆண்டுகள்)" : "Experience (Years)"}
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.experience_years}
                onChange={(e) =>
                  setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })
                }
                className="w-full h-11 px-3.5 rounded-xl border border-agri-border bg-agri-bg text-sm focus:ring-2 focus:ring-agri-primary focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-agri-text block">
                {language === "ta" ? "பகுதி / கிராமம் / ஊர் *" : "Town / Village Location *"}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kumbakonam, Thanjavur"
                value={formData.location_name}
                onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl border border-agri-border bg-agri-bg text-sm focus:ring-2 focus:ring-agri-primary focus:bg-white"
              />
            </div>

            {/* Skills Multi-Selection */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-agri-text block">
                {language === "ta" ? "திறன்கள் & பணிகள் தேர்வுசெய் *" : "Select Agricultural Skills *"}
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSkills.map((sk) => {
                  const isChecked = formData.skills.includes(sk.id);
                  return (
                    <button
                      key={sk.id}
                      type="button"
                      onClick={() => toggleSkillSelection(sk.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                        isChecked
                          ? "bg-agri-primary text-white border-agri-primary shadow-xs"
                          : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${isChecked ? "opacity-100" : "opacity-30"}`}
                      />
                      <span>{language === "ta" ? sk.ta : sk.en}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-agri-text block">
                {language === "ta" ? "கூடுதல் விவரங்கள்" : "Description / Team Details"}
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Gang of 6 female transplanting workers, provides own knapsack sprayers, specialized in paddy & sugarcane..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 rounded-xl border border-agri-border bg-agri-bg text-sm focus:ring-2 focus:ring-agri-primary focus:bg-white resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-agri-border">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
              Publish Worker Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT WORKER MODAL */}
      {selectedLabour && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedLabour(null);
          }}
          title={language === "ta" ? "தொழிலாளர் பதிவை திருத்து" : "Edit Worker Profile"}
          description="Update daily wage rate, contact phone, or location."
          maxWidth="lg"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-agri-text block">Worker Name</label>
                <input
                  type="text"
                  required
                  value={selectedLabour.worker_name}
                  onChange={(e) =>
                    setSelectedLabour({ ...selectedLabour, worker_name: e.target.value })
                  }
                  className="w-full h-11 px-3.5 rounded-xl border border-agri-border bg-agri-bg text-sm focus:ring-2 focus:ring-agri-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-agri-text block">Daily Wage (₹)</label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  required
                  value={selectedLabour.daily_wage}
                  onChange={(e) =>
                    setSelectedLabour({
                      ...selectedLabour,
                      daily_wage: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full h-11 px-3.5 rounded-xl border border-agri-border bg-agri-bg text-sm focus:ring-2 focus:ring-agri-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-agri-text block">Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={selectedLabour.phone}
                  onChange={(e) =>
                    setSelectedLabour({ ...selectedLabour, phone: e.target.value })
                  }
                  className="w-full h-11 px-3.5 rounded-xl border border-agri-border bg-agri-bg text-sm focus:ring-2 focus:ring-agri-primary"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-agri-text block">Location</label>
                <input
                  type="text"
                  required
                  value={selectedLabour.location_name}
                  onChange={(e) =>
                    setSelectedLabour({ ...selectedLabour, location_name: e.target.value })
                  }
                  className="w-full h-11 px-3.5 rounded-xl border border-agri-border bg-agri-bg text-sm focus:ring-2 focus:ring-agri-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-agri-border">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedLabour(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* DIRECT CONTACT MODAL */}
      {selectedLabour && (
        <Modal
          isOpen={isContactModalOpen}
          onClose={() => {
            setIsContactModalOpen(false);
            setSelectedLabour(null);
          }}
          title={language === "ta" ? "தொழிலாளர் தொடர்பு விவரங்கள்" : "Direct Worker Contact"}
          description={
            language === "ta"
              ? "தொழிலாளர் அல்லது குழு தலைவரை நேரடியாக தொடர்பு கொண்டு வேலை நேரங்களை உறுதி செய்யவும்."
              : "Call or message the worker directly to schedule farm operations and verify arrival times."
          }
          maxWidth="md"
        >
          <div className="space-y-5 py-2">
            {/* Worker summary banner */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  {selectedLabour.experience_years} Years Experience
                </span>
                <Badge variant="success">AVAILABLE</Badge>
              </div>
              <h4 className="font-extrabold text-lg text-agri-text">
                {selectedLabour.worker_name}
              </h4>
              <div className="flex items-baseline gap-1 text-sm font-bold text-agri-primary">
                <span>₹{selectedLabour.daily_wage}</span>
                <span className="text-xs text-agri-muted">/ standard workday</span>
              </div>
            </div>

            {/* Skills & Contact details */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-agri-muted uppercase tracking-wider block">
                  Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLabour.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold bg-white text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {selectedLabour.location_name && (
                <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{selectedLabour.location_name}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-agri-muted uppercase tracking-wider block">
                  Contact Mobile:
                </span>
                <span className="text-lg font-black text-agri-primary tracking-wide">
                  {selectedLabour.phone}
                </span>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={`tel:${selectedLabour.phone}`}
                className="inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-agri-primary text-white font-bold text-sm shadow-md hover:bg-agri-primaryDark transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>{language === "ta" ? "அழைக்க (Call)" : "Call Worker"}</span>
              </a>

              <a
                href={`https://wa.me/91${selectedLabour.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `வணக்கம் ${selectedLabour.worker_name}, நான் AgriAssist மூலம் உங்கள் விவசாய கூலி பணிக்காக தொடர்பு கொள்கிறேன்.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
