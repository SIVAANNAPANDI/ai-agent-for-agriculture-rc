import React, { useState, useEffect, useMemo } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { useAuth } from "../../contexts/AuthContext";
import { MapPicker } from "../../components/farm/MapPicker";
import {
  rentalService,
  type RentalProperty,
  type RentalPropertyCreate,
  type RentalPropertyUpdate,
} from "../../services/rentalService";
import {
  Building,
  Plus,
  Search,
  MapPin,
  Phone,
  MessageCircle,
  Droplets,
  Layers,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit3,
  RotateCcw,
  AlertCircle,
  Compass,
  ArrowRight,
  Maximize2,
  ShieldCheck,
  Zap,
} from "lucide-react";

export const RentalPage: React.FC = () => {
  const { user, profile } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<"browse" | "my_listings">("browse");
  const [rentals, setRentals] = useState<RentalProperty[]>([]);
  const [myRentals, setMyRentals] = useState<RentalProperty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedWater, setSelectedWater] = useState<string>("All");
  const [selectedSoil, setSelectedSoil] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxRentFilter, setMaxRentFilter] = useState<number | "all">("all");
  const [language, setLanguage] = useState<"en" | "ta">("en");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<RentalProperty | null>(null);

  // Form State
  const defaultCreateState: RentalPropertyCreate = {
    title: "",
    owner_name: user?.name || "",
    phone: user?.phone || "",
    land_area: 2.5,
    area_unit: "acres",
    monthly_rent: 10000,
    location_name: profile?.profile?.location_name || "Tamil Nadu",
    latitude: 11.1085,
    longitude: 77.3411,
    available_from: new Date().toISOString().split("T")[0],
    available_until: "",
    water_source: "Borewell",
    soil_type: "Red Soil",
    description: "",
    images: [],
  };

  const [formData, setFormData] = useState<RentalPropertyCreate>(defaultCreateState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const waterOptions = [
    { id: "All", en: "All Water Sources", ta: "அனைத்து நீர் ஆதாரங்கள்" },
    { id: "Borewell", en: "Borewell", ta: "போர்வெல்" },
    { id: "Canal", en: "Canal Irrigation", ta: "கால்வாய் பாசனம்" },
    { id: "River", en: "River Bed", ta: "ஆற்றுப்படுகை" },
    { id: "Open Well", en: "Open Well", ta: "திறந்த கிணறு" },
    { id: "Rainfed", en: "Rainfed", ta: "மானாவாரி" },
  ];

  const soilOptions = [
    { id: "All", en: "All Soil Types", ta: "அனைத்து மண் வகைகள்" },
    { id: "Red Soil", en: "Red Soil", ta: "செம்மண்" },
    { id: "Black Soil", en: "Black Soil", ta: "கரிசல் மண்" },
    { id: "Clay Loam", en: "Clay Loam", ta: "களிமண் வண்டல்" },
    { id: "Sandy Loam", en: "Sandy Loam", ta: "மணல் வண்டல்" },
    { id: "Alluvial", en: "Alluvial Soil", ta: "வண்டல் மண்" },
  ];

  // Fetch rentals
  const fetchRentalData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [allRentals, mine] = await Promise.all([
        rentalService.getRentals({
          water_source: selectedWater === "All" ? undefined : selectedWater,
          soil_type: selectedSoil === "All" ? undefined : selectedSoil,
          search: searchQuery.trim() || undefined,
          max_rent: maxRentFilter === "all" ? undefined : maxRentFilter,
          status: "AVAILABLE",
        }),
        rentalService.getMyRentals(),
      ]);
      setRentals(allRentals);
      setMyRentals(mine);
    } catch (err: any) {
      console.error("Error loading farmland rentals:", err);
      setError("Unable to load rental listings. Please check connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalData();
  }, [selectedWater, selectedSoil, maxRentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRentalData();
  };

  // Create Property
  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError(language === "ta" ? "தயவுசெய்து தலைப்பை உள்ளிடவும்." : "Please enter a property title.");
      return;
    }
    if (!formData.owner_name.trim()) {
      setFormError(language === "ta" ? "நில உரிமையாளர் பெயரை உள்ளிடவும்." : "Please enter owner name.");
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setFormError(language === "ta" ? "செல்லுபடியாகும் அலைபேசி எண்ணை உள்ளிடவும்." : "Please enter a valid phone number (at least 10 digits).");
      return;
    }
    if (formData.land_area <= 0) {
      setFormError(language === "ta" ? "நிலப்பரப்பு 0-க்கு மேல் இருக்க வேண்டும்." : "Land area must be greater than 0.");
      return;
    }
    if (formData.monthly_rent <= 0) {
      setFormError(language === "ta" ? "மாத வாடகை 0-க்கு மேல் இருக்க வேண்டும்." : "Monthly rent must be greater than 0.");
      return;
    }
    if (!formData.available_from) {
      setFormError(language === "ta" ? "கிடைக்கும் தேதியை தேர்ந்தெடுக்கவும்." : "Please specify available from date.");
      return;
    }

    setIsSubmitting(true);
    try {
      await rentalService.createRental({
        ...formData,
        available_until: formData.available_until || undefined,
      });
      setIsCreateModalOpen(false);
      setFormData(defaultCreateState);
      await fetchRentalData();
    } catch (err: any) {
      console.error("Failed to list property:", err);
      setFormError(err.response?.data?.message || "Failed to create rental listing. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (property: RentalProperty) => {
    setSelectedProperty(property);
    setFormData({
      title: property.title,
      owner_name: property.owner_name,
      phone: property.phone,
      land_area: property.land_area,
      area_unit: property.area_unit,
      monthly_rent: property.monthly_rent,
      location_name: property.location_name,
      latitude: property.latitude || 11.1085,
      longitude: property.longitude || 77.3411,
      available_from: property.available_from,
      available_until: property.available_until || "",
      water_source: property.water_source || "Borewell",
      soil_type: property.soil_type || "Red Soil",
      description: property.description || "",
      images: property.images || [],
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  // Update Property
  const handleUpdateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;
    setFormError(null);

    setIsSubmitting(true);
    try {
      await rentalService.updateRental(selectedProperty.id, {
        ...formData,
        available_until: formData.available_until || undefined,
      });
      setIsEditModalOpen(false);
      setSelectedProperty(null);
      await fetchRentalData();
    } catch (err: any) {
      console.error("Failed to update property:", err);
      setFormError(err.response?.data?.message || "Failed to update property. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (property: RentalProperty) => {
    const newStatus = property.status === "AVAILABLE" ? "RENTED" : "AVAILABLE";
    try {
      await rentalService.updateStatus(property.id, newStatus);
      await fetchRentalData();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Delete Property
  const handleDeleteProperty = async (propertyId: number) => {
    const confirmMsg =
      language === "ta"
        ? "இந்த நில வாடகை பதிவை நிச்சயம் நீக்க விரும்புகிறீர்களா?"
        : "Are you sure you want to delete this farmland listing?";
    if (!window.confirm(confirmMsg)) return;

    try {
      await rentalService.deleteRental(propertyId);
      await fetchRentalData();
    } catch (err) {
      console.error("Failed to delete property:", err);
    }
  };

  // Open Contact Modal
  const handleOpenContact = (property: RentalProperty) => {
    setSelectedProperty(property);
    setIsContactModalOpen(true);
  };

  // Open Map Modal
  const handleOpenMap = (property: RentalProperty) => {
    setSelectedProperty(property);
    setIsMapModalOpen(true);
  };

  const displayedList = activeTab === "browse" ? rentals : myRentals;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-agri-text">
              {language === "ta" ? "விவசாய நில & உபகரண வாடகை" : "Farmland & Property Rentals"}
            </h1>
            <Badge variant="primary" className="text-xs px-2 py-0.5">
              Verified
            </Badge>
          </div>
          <p className="text-sm text-agri-muted mt-1">
            {language === "ta"
              ? "விவசாயம் செய்ய வளமான நிலங்கள், தோப்புகள் மற்றும் பண்ணை வசதிகளை வாடகைக்கு எடுக்கவும் & குத்தகைக்கு விடவும்."
              : "Lease cultivable agricultural land parcels, orchards, and farm infrastructure directly from landowners."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switch */}
          <button
            onClick={() => setLanguage(language === "en" ? "ta" : "en")}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-agri-border bg-white text-agri-text hover:bg-slate-50 transition shadow-sm"
          >
            {language === "en" ? "தமிழ்" : "English"}
          </button>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setFormData({
                ...defaultCreateState,
                owner_name: user?.name || "",
                phone: user?.phone || "",
                location_name: profile?.profile?.location_name || "Tamil Nadu",
              });
              setFormError(null);
              setIsCreateModalOpen(true);
            }}
          >
            {language === "ta" ? "+ நிலத்தை பட்டியலிடுங்கள்" : "+ List Farmland"}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-agri-border bg-white rounded-t-xl px-4 pt-2">
        <button
          onClick={() => setActiveTab("browse")}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition -mb-[2px] ${
            activeTab === "browse"
              ? "border-agri-primary text-agri-primary"
              : "border-transparent text-agri-muted hover:text-agri-text"
          }`}
        >
          <Building className="w-4 h-4" />
          {language === "ta" ? "நில வாடகை தேடல்" : "Browse Farmland"}
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
            {rentals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("my_listings")}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition -mb-[2px] ${
            activeTab === "my_listings"
              ? "border-agri-primary text-agri-primary"
              : "border-transparent text-agri-muted hover:text-agri-text"
          }`}
        >
          <Layers className="w-4 h-4" />
          {language === "ta" ? "எனது நில பதிவுகள்" : "My Property Listings"}
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
            {myRentals.length}
          </span>
        </button>
      </div>

      {/* Search & Filter Bar (Only active in Browse tab) */}
      {activeTab === "browse" && (
        <Card variant="surface" className="p-4 space-y-3 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 text-agri-muted absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === "ta"
                    ? "இடம், மாவட்டம், நில வகை அல்லது தலைப்பு மூலம் தேடுங்கள்..."
                    : "Search by village, district, water source, or land title..."
                }
                className="w-full pl-9 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agri-primary focus:bg-white transition"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-agri-primary text-white text-xs font-semibold rounded-md hover:bg-emerald-700 transition"
              >
                {language === "ta" ? "தேடு" : "Search"}
              </button>
            </form>

            {/* Max Rent Filter */}
            <div className="sm:w-56 flex items-center gap-2">
              <span className="text-xs text-agri-muted whitespace-nowrap">
                {language === "ta" ? "அதிகபட்ச வாடகை:" : "Max Rent:"}
              </span>
              <select
                value={maxRentFilter}
                onChange={(e) =>
                  setMaxRentFilter(e.target.value === "all" ? "all" : Number(e.target.value))
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs py-2 px-2.5 font-medium focus:ring-2 focus:ring-agri-primary outline-none"
              >
                <option value="all">{language === "ta" ? "எந்த வரம்பும் இல்லை" : "Any Budget"}</option>
                <option value="5000">≤ ₹5,000 / mo</option>
                <option value="10000">≤ ₹10,000 / mo</option>
                <option value="20000">≤ ₹20,000 / mo</option>
                <option value="35000">≤ ₹35,000 / mo</option>
                <option value="50000">≤ ₹50,000 / mo</option>
              </select>
            </div>
          </div>

          {/* Water Source Filter Chips */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-agri-muted flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              {language === "ta" ? "நீர் ஆதாரம்:" : "Water Availability:"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {waterOptions.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setSelectedWater(w.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    selectedWater === w.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {language === "ta" ? w.ta : w.en}
                </button>
              ))}
            </div>
          </div>

          {/* Soil Type Filter Chips */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-agri-muted flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-700" />
              {language === "ta" ? "மண் வகை:" : "Soil Type:"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {soilOptions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSoil(s.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    selectedSoil === s.id
                      ? "bg-amber-800 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {language === "ta" ? s.ta : s.en}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Loading & Error States */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center text-agri-muted space-y-3">
          <div className="w-8 h-8 border-3 border-agri-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">
            {language === "ta" ? "நில விபரங்கள் ஏற்றப்படுகின்றன..." : "Loading farmland listings..."}
          </p>
        </div>
      )}

      {error && !isLoading && (
        <Card variant="surface" className="p-6 text-center border border-red-200 bg-red-50 text-red-700">
          <AlertCircle className="w-8 h-8 mx-auto text-red-600 mb-2" />
          <p className="font-semibold">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchRentalData} className="mt-3">
            {language === "ta" ? "மீண்டும் முயற்சி செய்" : "Try Again"}
          </Button>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && displayedList.length === 0 && (
        <Card variant="surface" className="p-10 text-center border-dashed border-2 border-slate-200 bg-slate-50/50">
          <div className="w-16 h-16 bg-emerald-50 text-agri-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Building className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-agri-text">
            {activeTab === "browse"
              ? language === "ta"
                ? "பொருந்தும் நிலங்கள் எதுவும் கிடைக்கவில்லை"
                : "No Farmland Listings Found"
              : language === "ta"
              ? "நீங்கள் இன்னும் எந்த நிலத்தையும் பட்டியலிடவில்லை"
              : "No Land Listings Created Yet"}
          </h3>
          <p className="text-sm text-agri-muted max-w-md mx-auto mt-2">
            {activeTab === "browse"
              ? language === "ta"
                ? "நீங்கள் தேர்ந்தெடுத்த வடிகட்டிகளுக்கு ஏற்ப நிலங்கள் இல்லை. பிற நீர் அல்லது மண் வகைகளை தேர்வு செய்து பார்க்கவும்."
                : "No agricultural properties match your specific filter criteria. Try resetting water source, soil type, or search terms."
              : language === "ta"
              ? "உங்களிடம் பயிரிடப்படாத விவசாய நிலம் உள்ளதா? அதனை குத்தகைக்கு விட்டு வருமானம் ஈட்டுங்கள்."
              : "Have idle cultivable land or orchards? List your parcel to connect with trustworthy local farmers seeking leasehold land."}
          </p>
          {activeTab === "browse" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedWater("All");
                setSelectedSoil("All");
                setMaxRentFilter("all");
                setSearchQuery("");
                fetchRentalData();
              }}
              className="mt-4"
            >
              {language === "ta" ? "வடிகட்டிகளை மீட்டமை" : "Reset Filters"}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setFormData(defaultCreateState);
                setIsCreateModalOpen(true);
              }}
              className="mt-4"
            >
              {language === "ta" ? "+ நிலத்தை பட்டியலிடுங்கள்" : "+ List Your First Property"}
            </Button>
          )}
        </Card>
      )}

      {/* Farmland Grid */}
      {!isLoading && !error && displayedList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedList.map((property) => (
            <Card
              key={property.id}
              variant="surface"
              className="p-5 flex flex-col justify-between hover:shadow-md transition border border-slate-200"
            >
              <div>
                {/* Visual Banner */}
                <div className="relative h-44 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-emerald-800 via-green-900 to-amber-950 flex flex-col justify-between p-4 text-white shadow-inner">
                  <div className="flex items-center justify-between z-10">
                    <Badge
                      variant={property.status === "AVAILABLE" ? "success" : "warning"}
                      className="text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow"
                    >
                      {property.status === "AVAILABLE"
                        ? language === "ta"
                          ? "வாடகைக்கு தயார்"
                          : "AVAILABLE"
                        : language === "ta"
                        ? "வாடகைக்கு விடப்பட்டது"
                        : "RENTED"}
                    </Badge>

                    <div className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-amber-300 border border-amber-300/30 flex items-center gap-1">
                      <Maximize2 className="w-3 h-3" />
                      {property.land_area} {property.area_unit}
                    </div>
                  </div>

                  <div className="z-10">
                    <span className="text-2xl font-black text-white drop-shadow-md">
                      ₹{property.monthly_rent.toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-emerald-200"> / month</span>
                    </span>
                    <p className="text-xs text-emerald-100 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {property.location_name}
                    </p>
                  </div>

                  {/* Decorative background grid pattern */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                </div>

                {/* Listing Title & Description */}
                <h3 className="font-bold text-base text-agri-text line-clamp-1">
                  {property.title}
                </h3>
                {property.description && (
                  <p className="text-xs text-agri-muted mt-1.5 line-clamp-2 leading-relaxed">
                    {property.description}
                  </p>
                )}

                {/* Key Attributes Tags */}
                <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                  {property.water_source && (
                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 p-2 rounded-lg font-medium border border-blue-100">
                      <Droplets className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="truncate">{property.water_source}</span>
                    </div>
                  )}

                  {property.soil_type && (
                    <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 p-2 rounded-lg font-medium border border-amber-100">
                      <Layers className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                      <span className="truncate">{property.soil_type}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 bg-slate-50 text-slate-700 p-2 rounded-lg font-medium border border-slate-200 col-span-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">
                      {language === "ta" ? "கிடைக்கும் தேதி:" : "Available from:"}{" "}
                      {new Date(property.available_from).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Owner info */}
                <div className="mt-3 pt-2 text-xs text-agri-muted flex items-center justify-between">
                  <span>
                    {language === "ta" ? "உரிமையாளர்:" : "Owner:"}{" "}
                    <strong className="text-agri-text font-semibold">{property.owner_name}</strong>
                  </span>
                  {property.latitude && property.longitude && (
                    <button
                      onClick={() => handleOpenMap(property)}
                      className="text-agri-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      <Compass className="w-3 h-3" />
                      {language === "ta" ? "வரைபடம்" : "View Map"}
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-agri-border">
                {activeTab === "browse" ? (
                  <div className="flex items-center gap-2">
                    {property.latitude && property.longitude && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenMap(property)}
                        className="px-2.5"
                        title={language === "ta" ? "வரைபடத்தில் பார்க்க" : "View on Map"}
                      >
                        <MapPin className="w-4 h-4 text-emerald-600" />
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Phone className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenContact(property)}
                      className="flex-1"
                    >
                      {language === "ta" ? "தொடர்பு கொள்ள" : "Contact Owner"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(property)}
                      className="text-xs px-2 py-1 h-8 flex-1"
                    >
                      {property.status === "AVAILABLE" ? (
                        language === "ta" ? "வாடகை முடிந்தது" : "Mark Rented"
                      ) : (
                        language === "ta" ? "மீண்டும் பதிவிட" : "Re-List"
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(property)}
                      className="p-1.5 h-8 text-slate-600 hover:text-agri-primary"
                      title={language === "ta" ? "திருத்த" : "Edit Listing"}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProperty(property.id)}
                      className="p-1.5 h-8 text-slate-400 hover:text-red-600"
                      title={language === "ta" ? "நீக்க" : "Delete Listing"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* List Farmland Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={language === "ta" ? "புதிய விவசாய நிலத்தை பட்டியலிடுங்கள்" : "List Agricultural Land for Lease"}
      >
        <form onSubmit={handleCreateProperty} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-agri-text mb-1">
              {language === "ta" ? "நிலத்தின் தலைப்பு *" : "Property Title *"}
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 5 Acres Fertile Black Soil with 7.5HP Borewell"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-agri-text mb-1">
                {language === "ta" ? "உரிமையாளர் பெயர் *" : "Landowner Name *"}
              </label>
              <input
                type="text"
                required
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                placeholder="e.g. Velusamy Gounder"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-agri-text mb-1">
                {language === "ta" ? "தொடர்பு எண் *" : "Contact Phone *"}
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="10-digit mobile number"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-agri-text mb-1">
                {language === "ta" ? "நிலப்பரப்பு *" : "Land Area *"}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={formData.land_area}
                onChange={(e) => setFormData({ ...formData, land_area: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-agri-text mb-1">
                {language === "ta" ? "அளவீடு" : "Unit"}
              </label>
              <select
                value={formData.area_unit}
                onChange={(e) => setFormData({ ...formData, area_unit: e.target.value })}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none font-medium"
              >
                <option value="acres">Acres</option>
                <option value="cents">Cents</option>
                <option value="hectares">Hectares</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-agri-text mb-1">
                {language === "ta" ? "மாத வாடகை (₹) *" : "Monthly Rent (₹) *"}
              </label>
              <input
                type="number"
                step="500"
                min="500"
                required
                value={formData.monthly_rent}
                onChange={(e) =>
                  setFormData({ ...formData, monthly_rent: parseFloat(e.target.value) || 0 })
                }
                placeholder="10000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-agri-text mb-1">
                {language === "ta" ? "கிடைக்கும் தொடக்க தேதி *" : "Available From *"}
              </label>
              <input
                type="date"
                required
                value={formData.available_from}
                onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-agri-text mb-1">
                {language === "ta" ? "நீர் ஆதாரம்" : "Water Source"}
              </label>
              <select
                value={formData.water_source || "Borewell"}
                onChange={(e) => setFormData({ ...formData, water_source: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none font-medium"
              >
                <option value="Borewell">Borewell (போர்வெல்)</option>
                <option value="Canal">Canal Irrigation (கால்வாய் பாசனம்)</option>
                <option value="River">River Bed (ஆற்றுப்படுகை)</option>
                <option value="Open Well">Open Well (திறந்த கிணறு)</option>
                <option value="Rainfed">Rainfed (மானாவாரி)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-agri-text mb-1">
                {language === "ta" ? "மண் வகை" : "Soil Type"}
              </label>
              <select
                value={formData.soil_type || "Red Soil"}
                onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none font-medium"
              >
                <option value="Red Soil">Red Soil (செம்மண்)</option>
                <option value="Black Soil">Black Soil (கரிசல் மண்)</option>
                <option value="Clay Loam">Clay Loam (களிமண் வண்டல்)</option>
                <option value="Sandy Loam">Sandy Loam (மணல் வண்டல்)</option>
                <option value="Alluvial">Alluvial Soil (வண்டல் மண்)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-agri-text mb-1">
              {language === "ta" ? "இடம் / கிராமம் / மாவட்டம் *" : "Location / Village / District *"}
            </label>
            <input
              type="text"
              required
              value={formData.location_name}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              placeholder="e.g. Sathyamangalam, Erode, Tamil Nadu"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none"
            />
          </div>

          {/* Leaflet Map Picker for Land Parcel Pin Drop */}
          <div>
            <label className="block text-xs font-bold text-agri-text mb-1 flex items-center justify-between">
              <span>{language === "ta" ? "நிலத்தின் இருப்பிடம் (வரைபடம்)" : "Farmland Map Coordinates (Click to Pin)"}</span>
              <span className="text-[11px] font-normal text-agri-muted">
                {formData.latitude?.toFixed(4)}, {formData.longitude?.toFixed(4)}
              </span>
            </label>
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <MapPicker
                latitude={formData.latitude || 11.1085}
                longitude={formData.longitude || 77.3411}
                onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                heightClass="h-44"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-agri-text mb-1">
              {language === "ta" ? "கூடுதல் தகவல்கள்" : "Property Details & Amenities"}
            </label>
            <textarea
              rows={3}
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Fenced parcel, 3-phase free EB electricity connection, 7.5HP motor room, tar road access..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsCreateModalOpen(false)}
            >
              {language === "ta" ? "ரத்து" : "Cancel"}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
            >
              {language === "ta" ? "பதிவேற்று" : "Post Farmland Listing"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Property Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={language === "ta" ? "நில விபரங்களை திருத்துங்கள்" : "Edit Farmland Listing"}
      >
        <form onSubmit={handleUpdateProperty} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-agri-text mb-1">
              {language === "ta" ? "நிலத்தின் தலைப்பு *" : "Property Title *"}
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-agri-text mb-1">
                {language === "ta" ? "மாத வாடகை (₹)" : "Monthly Rent (₹)"}
              </label>
              <input
                type="number"
                required
                value={formData.monthly_rent}
                onChange={(e) =>
                  setFormData({ ...formData, monthly_rent: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-agri-text mb-1">
                {language === "ta" ? "தொடர்பு எண்" : "Contact Phone"}
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-agri-text mb-1">
                {language === "ta" ? "நீர் ஆதாரம்" : "Water Source"}
              </label>
              <select
                value={formData.water_source || "Borewell"}
                onChange={(e) => setFormData({ ...formData, water_source: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none font-medium"
              >
                <option value="Borewell">Borewell</option>
                <option value="Canal">Canal</option>
                <option value="River">River</option>
                <option value="Open Well">Open Well</option>
                <option value="Rainfed">Rainfed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-agri-text mb-1">
                {language === "ta" ? "மண் வகை" : "Soil Type"}
              </label>
              <select
                value={formData.soil_type || "Red Soil"}
                onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none font-medium"
              >
                <option value="Red Soil">Red Soil</option>
                <option value="Black Soil">Black Soil</option>
                <option value="Clay Loam">Clay Loam</option>
                <option value="Sandy Loam">Sandy Loam</option>
                <option value="Alluvial">Alluvial</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-agri-text mb-1">
              {language === "ta" ? "விபரங்கள்" : "Description"}
            </label>
            <textarea
              rows={3}
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-primary outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsEditModalOpen(false)}
            >
              {language === "ta" ? "ரத்து" : "Cancel"}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
            >
              {language === "ta" ? "சேமிக்க" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Direct Landowner Contact Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title={language === "ta" ? "நில உரிமையாளரை தொடர்பு கொள்ள" : "Contact Landowner"}
      >
        {selectedProperty && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-agri-muted uppercase tracking-wider">
                  {language === "ta" ? "நில விபரம்" : "Property Details"}
                </span>
                <span className="text-xs font-bold text-agri-primary bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {selectedProperty.land_area} {selectedProperty.area_unit}
                </span>
              </div>
              <h4 className="font-bold text-base text-agri-text">{selectedProperty.title}</h4>
              <p className="text-xs text-agri-muted flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-agri-primary" />
                {selectedProperty.location_name}
              </p>
              <div className="text-sm font-black text-agri-primary pt-1">
                ₹{selectedProperty.monthly_rent.toLocaleString("en-IN")}{" "}
                <span className="text-xs font-normal text-agri-muted">/ month</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-agri-primary text-white flex items-center justify-center font-bold text-base">
                {selectedProperty.owner_name.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-agri-muted font-medium">
                  {language === "ta" ? "உரிமையாளர்" : "Landowner"}
                </p>
                <p className="text-sm font-bold text-agri-text">{selectedProperty.owner_name}</p>
                <p className="text-xs font-semibold text-agri-primary">{selectedProperty.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={`tel:${selectedProperty.phone}`}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow transition"
              >
                <Phone className="w-4 h-4" />
                {language === "ta" ? "அழைக்க" : "Direct Call"}
              </a>

              <a
                href={`https://wa.me/91${selectedProperty.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `வணக்கம் ${selectedProperty.owner_name}, AgriAssist தளத்தில் உங்கள் நில வாடகை பதிவை (${selectedProperty.title}, ₹${selectedProperty.monthly_rent}/mo) பார்த்தேன். குத்தகைக்கு பேச விரும்புகிறேன்.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow transition"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={() => setIsContactModalOpen(false)}
              className="w-full mt-2"
            >
              {language === "ta" ? "மூடுக" : "Close"}
            </Button>
          </div>
        )}
      </Modal>

      {/* Farmland OpenStreetMap Map Modal */}
      <Modal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        title={language === "ta" ? "நிலத்தின் அமைவிடம் (வரைபடம்)" : "Farmland Location Pin"}
      >
        {selectedProperty && selectedProperty.latitude && selectedProperty.longitude && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-agri-muted">
              <span className="font-semibold text-agri-text">{selectedProperty.title}</span>
              <span>{selectedProperty.location_name}</span>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200">
              <MapPicker
                latitude={selectedProperty.latitude}
                longitude={selectedProperty.longitude}
                readOnly={true}
                heightClass="h-72"
                zoom={14}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-agri-muted">
                GPS: {selectedProperty.latitude.toFixed(6)}, {selectedProperty.longitude.toFixed(6)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMapModalOpen(false)}
              >
                {language === "ta" ? "மூடுக" : "Close Map"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default RentalPage;
