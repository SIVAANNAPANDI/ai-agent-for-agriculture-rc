import React, { useState, useEffect, useMemo } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { useAuth } from "../../contexts/AuthContext";
import {
  marketService,
  type MarketProduct,
  type MarketProductCreate,
  type MarketProductUpdate,
} from "../../services/marketService";
import {
  Store,
  Plus,
  Search,
  MapPin,
  Phone,
  MessageCircle,
  Tag,
  CheckCircle2,
  Trash2,
  Edit3,
  RotateCcw,
  AlertCircle,
  Package,
  Layers,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

export const MarketPage: React.FC = () => {
  const { user, profile } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<"browse" | "my_listings">("browse");
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [myProducts, setMyProducts] = useState<MarketProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState<"en" | "ta">("en");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MarketProduct | null>(null);

  // Create Form State
  const [formData, setFormData] = useState<MarketProductCreate>({
    name: "",
    category: "Vegetables",
    quantity: 100,
    unit: "kg",
    price_per_unit: 30,
    description: "",
    seller_phone: user?.phone || "",
    location_name: profile?.profile?.location_name || "Tamil Nadu",
    latitude: 11.1085,
    longitude: 77.3411,
  });

  const categories = [
    { id: "All", en: "All Produce", ta: "அனைத்தும்" },
    { id: "Vegetables", en: "Vegetables", ta: "காய்கறிகள்" },
    { id: "Fruits", en: "Fruits", ta: "பழங்கள்" },
    { id: "Grains & Cereals", en: "Grains & Cereals", ta: "தானியங்கள்" },
    { id: "Pulses & Oilseeds", en: "Pulses & Oilseeds", ta: "பயறு & எண்ணெய்" },
    { id: "Dairy & Poultry", en: "Dairy & Poultry", ta: "பால் & கோழி" },
    { id: "Organic Inputs / Seeds", en: "Seeds & Bio-Inputs", ta: "விதைகள் & உரங்கள்" },
  ];

  // Fetch products
  const fetchMarketData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [allProds, mine] = await Promise.all([
        marketService.getProducts({
          category: selectedCategory === "All" ? undefined : selectedCategory,
          search: searchQuery.trim() || undefined,
          status: "AVAILABLE",
        }),
        marketService.getMyProducts(),
      ]);
      setProducts(allProds);
      setMyProducts(mine);
    } catch (err: any) {
      setError(err.message || "Failed to load marketplace listings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [selectedCategory, searchQuery]);

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.seller_phone.trim()) return;

    setIsLoading(true);
    try {
      await marketService.createProduct(formData);
      setIsCreateModalOpen(false);
      // Reset form
      setFormData({
        name: "",
        category: "Vegetables",
        quantity: 100,
        unit: "kg",
        price_per_unit: 30,
        description: "",
        seller_phone: user?.phone || "",
        location_name: profile?.profile?.location_name || "Tamil Nadu",
        latitude: 11.1085,
        longitude: 77.3411,
      });
      await fetchMarketData();
    } catch (err: any) {
      setError(err.message || "Failed to create listing.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsLoading(true);
    try {
      await marketService.updateProduct(selectedProduct.id, {
        name: selectedProduct.name,
        category: selectedProduct.category,
        quantity: selectedProduct.quantity,
        unit: selectedProduct.unit,
        price_per_unit: selectedProduct.price_per_unit,
        description: selectedProduct.description,
        seller_phone: selectedProduct.seller_phone,
        location_name: selectedProduct.location_name || undefined,
      });
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      await fetchMarketData();
    } catch (err: any) {
      setError(err.message || "Failed to update listing.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Status (AVAILABLE / SOLD)
  const handleToggleStatus = async (product: MarketProduct) => {
    const nextStatus = product.status === "AVAILABLE" ? "SOLD" : "AVAILABLE";
    try {
      await marketService.updateProductStatus(product.id, nextStatus);
      await fetchMarketData();
    } catch (err: any) {
      setError(err.message || "Failed to update product status.");
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: number) => {
    if (
      !window.confirm(
        language === "ta"
          ? "இந்த விற்பனை பதிவை நிச்சயமாக நீக்க விரும்புகிறீர்களா?"
          : "Are you sure you want to delete this listing?"
      )
    ) {
      return;
    }

    try {
      await marketService.deleteProduct(productId);
      await fetchMarketData();
    } catch (err: any) {
      setError(err.message || "Failed to delete listing.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-agri-text">
              {language === "ta" ? "விவசாயிகள் நேரடி அங்காடி" : "Local Produce Marketplace"}
            </h1>
            <Badge variant="primary" className="text-xs">
              Farmer Direct
            </Badge>
          </div>
          <p className="text-sm text-agri-muted">
            {language === "ta"
              ? "இடைத்தரகர்கள் இன்றி விவசாயிகளிடமிருந்து நேரடியாக காய்கறி, பழங்கள், தானியங்களை வாங்கவும் விற்கவும்."
              : "Buy and sell farm-fresh harvests directly between local farmers without intermediary commissions."}
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
            {language === "ta" ? "+ புதிய விற்பனை" : "+ List Produce"}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs: Browse Produce vs My Listings */}
      <div className="flex border-b border-agri-border text-sm font-semibold">
        <button
          onClick={() => setActiveTab("browse")}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "browse"
              ? "border-agri-primary text-agri-primary font-bold"
              : "border-transparent text-agri-muted hover:text-agri-text"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>{language === "ta" ? "பொது அங்காடி" : "Browse Produce"}</span>
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
            {products.length}
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
          <Package className="w-4 h-4" />
          <span>{language === "ta" ? "எனது விற்பனை பதிவுகள்" : "My Listings"}</span>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
            {myProducts.length}
          </span>
        </button>
      </div>

      {/* Search Bar & Category Chips (only on browse tab) */}
      {activeTab === "browse" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  language === "ta"
                    ? "பயிர்களை தேடுங்கள் (எ.கா. தக்காளி, உருளை, நெல்)..."
                    : "Search produce by name, crop variety, or keywords..."
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
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? "bg-agri-primary text-white border-agri-primary shadow-xs"
                    : "bg-white text-agri-text border-agri-border hover:bg-slate-50"
                }`}
              >
                {language === "ta" ? cat.ta : cat.en}
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

      {/* Main Grid: Browse Tab */}
      {activeTab === "browse" && (
        <>
          {products.length === 0 ? (
            <Card variant="surface" className="p-12 text-center space-y-3 border-dashed border-2 border-slate-300">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-agri-primary flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-agri-text">
                {language === "ta" ? "விற்பனை பதிவுகள் எதுவும் இல்லை" : "No Produce Listed Yet"}
              </h3>
              <p className="text-xs text-agri-muted max-w-sm mx-auto leading-relaxed">
                {searchQuery || selectedCategory !== "All"
                  ? language === "ta"
                    ? "தேர்ந்தெடுக்கப்பட்ட பிரிவில் பொருட்கள் எதுவும் இல்லை. பிற பிரிவுகளை பார்க்கவும்."
                    : "No produce matches your current filter criteria. Try resetting filters."
                  : language === "ta"
                  ? "உங்கள் பகுதியில் முதல் விளைச்சலை விற்பனைக்கு பதிவேற்றி வாங்குபவர்களை ஈர்க்கவும்."
                  : "Be the first farmer in your area to list freshly harvested crops for direct local purchase."}
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCreateModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                className="mt-2"
              >
                {language === "ta" ? "விளைச்சலை பட்டியலிடு" : "List Your Produce"}
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => (
                <Card
                  key={p.id}
                  variant="surface"
                  className="p-5 flex flex-col justify-between hover:shadow-card transition-all border-agri-border group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="primary" className="text-[11px]">
                        {p.category}
                      </Badge>
                      <Badge
                        variant={p.status === "AVAILABLE" ? "success" : "neutral"}
                        className="text-[11px]"
                      >
                        {p.status}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-lg text-agri-text group-hover:text-agri-primary transition-colors">
                        {p.name}
                      </h3>
                      {p.description && (
                        <p className="text-xs text-agri-muted line-clamp-2 mt-1 leading-relaxed">
                          {p.description}
                        </p>
                      )}
                    </div>

                    {/* Price and Quantity */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-agri-primary">
                            ₹{p.price_per_unit}
                          </span>
                          <span className="text-xs text-agri-muted font-semibold">
                            / {p.unit}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {p.quantity} {p.unit} avail.
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        Estimated Lot Value: ₹{p.total_value.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Seller & Location Info */}
                    <div className="text-xs text-agri-muted space-y-1 pt-1">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Store className="w-3.5 h-3.5 text-agri-primary" />
                        <span>Seller: {p.seller_name}</span>
                      </div>
                      {p.location_name && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{p.location_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-4 pt-3 border-t border-agri-border flex items-center justify-between gap-2">
                    {p.is_owner ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                        Your Listing
                      </span>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(p);
                          setIsContactModalOpen(true);
                        }}
                        leftIcon={<Phone className="w-3.5 h-3.5" />}
                        className="w-full justify-center text-xs font-bold"
                      >
                        {language === "ta" ? "விவசாயியை தொடர்பு கொள்" : "Contact Farmer"}
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
          {myProducts.length === 0 ? (
            <Card variant="surface" className="p-12 text-center space-y-3 border-dashed border-2 border-slate-300">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-agri-text">
                {language === "ta" ? "நீங்கள் இன்னும் எந்த விளைச்சலையும் பட்டியலிடவில்லை" : "No Personal Listings Yet"}
              </h3>
              <p className="text-xs text-agri-muted max-w-sm mx-auto leading-relaxed">
                {language === "ta"
                  ? "உங்கள் பயிர் விளைச்சலை பதிவேற்றி உள்ளூர் கொள்முதல் செய்பவர்களிடம் நேரடி விலை பெறுங்கள்."
                  : "List your surplus harvests, seeds, or organic farm inputs to sell directly to neighboring farmers."}
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCreateModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                className="mt-2"
              >
                {language === "ta" ? "+ விளைச்சலை பட்டியலிடு" : "+ Create First Listing"}
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myProducts.map((p) => (
                <Card
                  key={p.id}
                  variant="surface"
                  className="p-5 flex flex-col justify-between border-agri-border space-y-3"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="primary" className="text-[11px]">
                        {p.category}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(p)}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                          p.status === "AVAILABLE"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                        }`}
                        title="Click to toggle status"
                      >
                        {p.status === "AVAILABLE" ? "✓ AVAILABLE" : "• SOLD OUT"}
                      </button>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-agri-text">{p.name}</h3>
                      <p className="text-xs text-agri-muted line-clamp-2 mt-0.5">
                        {p.description || "No description provided."}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-agri-text">
                        <span>Price: ₹{p.price_per_unit} / {p.unit}</span>
                        <span>Qty: {p.quantity} {p.unit}</span>
                      </div>
                      <span className="text-[11px] text-agri-primary font-bold block">
                        Total: ₹{p.total_value.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="text-xs text-agri-muted flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-agri-primary shrink-0" />
                      <span className="truncate">{p.location_name || "Farm Location"}</span>
                    </div>
                  </div>

                  {/* Actions for Owner */}
                  <div className="pt-3 border-t border-agri-border flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(p)}
                      className="text-xs font-semibold"
                    >
                      {p.status === "AVAILABLE" ? "Mark Sold" : "Re-List"}
                    </Button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(p);
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 text-slate-500 hover:text-agri-primary hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Listing"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id)}
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

      {/* CREATE LISTING MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={language === "ta" ? "புதிய விளைச்சலை விற்பனைக்கு பதிவேற்று" : "List Farm Produce for Sale"}
        description={
          language === "ta"
            ? "உங்கள் பயிர் வகை, அளவு, விலை மற்றும் தொடர்பு எண்ணை உள்ளிடவும்."
            : "Fill in commodity details, available harvest quantity, and unit price to publish on the local marketplace."
        }
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-agri-text block">
                {language === "ta" ? "விளைச்சல் / பயிர் பெயர் *" : "Produce / Crop Name *"}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Country Tomatoes (நாட்டு தக்காளி), Turmeric, Paddy"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl border border-agri-border bg-agri-bg text-sm focus:outline-none focus:ring-2 focus:ring-agri-primary focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-agri-text block">
                {language === "ta" ? "பிரிவு (Category) *" : "Category *"}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-11 px-3 rounded-xl border border-agri-border bg-agri-bg text-sm focus:outline-none focus:ring-2 focus:ring-agri-primary focus:bg-white"
              >
                <option value="Vegetables">Vegetables (காய்கறிகள்)</option>
                <option value="Fruits">Fruits (பழங்கள்)</option>
                <option value="Grains & Cereals">Grains & Cereals (தானியங்கள்)</option>
                <option value="Pulses & Oilseeds">Pulses & Oilseeds (பயறு & எண்ணெய்)</option>
                <option value="Dairy & Poultry">Dairy & Poultry (பால் & கோழி)</option>
                <option value="Organic Inputs / Seeds">Organic Inputs / Seeds (உரம் & விதைகள்)</option>
                <option value="Other">Other Commodities (பிற)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-agri-text block">
                {language === "ta" ? "விற்பனை தொடர்பு எண் *" : "Seller Phone *"}
              </label>
              <input
                type="tel"
                required
                placeholder="10-digit mobile number"
                value={formData.seller_phone}
                onChange={(e) => setFormData({ ...formData, seller_phone: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl border border-agri-border bg-agri-bg text-sm focus:outline-none focus:ring-2 focus:ring-agri-primary focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-agri-text block">
                {language === "ta" ? "அளவு (Quantity) *" : "Available Quantity *"}
              </label>
              <input
                type="number"
                min="0.5"
                step="any"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full h-11 px-3.5 rounded-xl border border-agri-border bg-agri-bg text-sm focus:outline-none focus:ring-2 focus:ring-agri-primary focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-agri-text block">
                {language === "ta" ? "அளவீடு (Unit) *" : "Unit *"}
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full h-11 px-3 rounded-xl border border-agri-border bg-agri-bg text-sm focus:outline-none focus:ring-2 focus:ring-agri-primary focus:bg-white"
              >
                <option value="kg">kg (கிலோ)</option>
                <option value="quintal">quintal (100 kg)</option>
                <option value="ton">ton (1000 kg)</option>
                <option value="bag">bag (சாக்கு மூட்டை)</option>
                <option value="crate">crate (பெட்டி)</option>
                <option value="bunch">bunch (தார் / கொத்து)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-agri-text block">
                {language === "ta" ? "ஒரு யூனிட் விலை (₹) *" : "Price per Unit (₹) *"}
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={formData.price_per_unit}
                onChange={(e) => setFormData({ ...formData, price_per_unit: parseFloat(e.target.value) || 0 })}
                className="w-full h-11 px-3.5 rounded-xl border border-agri-border bg-agri-bg text-sm focus:outline-none focus:ring-2 focus:ring-agri-primary focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-agri-text block">
                {language === "ta" ? "கொள்முதல் இடம் / ஊர்" : "Pickup Location / Town"}
              </label>
              <input
                type="text"
                placeholder="e.g. Bhavani, Erode / Ottanchathiram"
                value={formData.location_name || ""}
                onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl border border-agri-border bg-agri-bg text-sm focus:outline-none focus:ring-2 focus:ring-agri-primary focus:bg-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-agri-text block">
                {language === "ta" ? "கூடுதல் விவரங்கள்" : "Description & Quality Notes"}
              </label>
              <textarea
                rows={2}
                placeholder="Organic certified, freshly harvested this morning, Grade-A quality, transport available..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 rounded-xl border border-agri-border bg-agri-bg text-sm focus:outline-none focus:ring-2 focus:ring-agri-primary focus:bg-white resize-none"
              />
            </div>
          </div>

          {/* Calculated Value Preview */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-800">
              {language === "ta" ? "மொத்த விளைச்சல் மதிப்பு:" : "Total Lot Value:"}
            </span>
            <span className="text-sm font-black text-agri-primary">
              ₹{(formData.quantity * formData.price_per_unit).toLocaleString("en-IN")}
            </span>
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
              Publish Listing
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT LISTING MODAL */}
      {selectedProduct && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          title={language === "ta" ? "பதிவை திருத்து" : "Edit Produce Listing"}
          description="Update pricing, available quantity, or contact details."
          maxWidth="lg"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-agri-text block">Produce Name</label>
                <input
                  type="text"
                  required
                  value={selectedProduct.name}
                  onChange={(e) =>
                    setSelectedProduct({ ...selectedProduct, name: e.target.value })
                  }
                  className="w-full h-11 px-3.5 rounded-xl border border-agri-border bg-agri-bg text-sm focus:ring-2 focus:ring-agri-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-agri-text block">Available Quantity</label>
                <input
                  type="number"
                  min="0.5"
                  step="any"
                  required
                  value={selectedProduct.quantity}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      quantity: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full h-11 px-3.5 rounded-xl border border-agri-border bg-agri-bg text-sm focus:ring-2 focus:ring-agri-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-agri-text block">Price per Unit (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={selectedProduct.price_per_unit}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      price_per_unit: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full h-11 px-3.5 rounded-xl border border-agri-border bg-agri-bg text-sm focus:ring-2 focus:ring-agri-primary"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-agri-text block">Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={selectedProduct.seller_phone}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      seller_phone: e.target.value,
                    })
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
                  setSelectedProduct(null);
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

      {/* CONTACT SELLER MODAL */}
      {selectedProduct && (
        <Modal
          isOpen={isContactModalOpen}
          onClose={() => {
            setIsContactModalOpen(false);
            setSelectedProduct(null);
          }}
          title={language === "ta" ? "விவசாயி தொடர்பு விவரங்கள்" : "Direct Farmer Contact"}
          description={
            language === "ta"
              ? "விவசாயியிடம் நேரடியாக பேசி கொள்முதல் விலையை உறுதி செய்யவும்."
              : "Connect directly with the grower to discuss logistics, volume pricing, and pickup schedules."
          }
          maxWidth="md"
        >
          <div className="space-y-5 py-2">
            {/* Product summary banner */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                {selectedProduct.category}
              </span>
              <h4 className="font-extrabold text-lg text-agri-text">{selectedProduct.name}</h4>
              <div className="flex items-center justify-between text-xs text-slate-700 pt-1">
                <span>
                  Price: <strong>₹{selectedProduct.price_per_unit} / {selectedProduct.unit}</strong>
                </span>
                <span>
                  Available: <strong>{selectedProduct.quantity} {selectedProduct.unit}</strong>
                </span>
              </div>
            </div>

            {/* Seller profile */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-agri-muted uppercase tracking-wider block">
                    Seller Name:
                  </span>
                  <span className="text-base font-bold text-agri-text">
                    {selectedProduct.seller_name}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-agri-primary text-white flex items-center justify-center font-bold">
                  {selectedProduct.seller_name.charAt(0)}
                </div>
              </div>

              {selectedProduct.location_name && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{selectedProduct.location_name}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-agri-muted uppercase tracking-wider block">
                  Registered Mobile:
                </span>
                <span className="text-lg font-black text-agri-primary tracking-wide">
                  {selectedProduct.seller_phone}
                </span>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={`tel:${selectedProduct.seller_phone}`}
                className="inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-agri-primary text-white font-bold text-sm shadow-md hover:bg-agri-primaryDark transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>{language === "ta" ? "அழைக்க (Call)" : "Call Farmer"}</span>
              </a>

              <a
                href={`https://wa.me/91${selectedProduct.seller_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `வணக்கம் ${selectedProduct.seller_name}, நான் AgriAssist மூலம் உங்கள் ${selectedProduct.name} (${selectedProduct.quantity} ${selectedProduct.unit}) கொள்முதல் பற்றி பேச விரும்புகிறேன்.`
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
