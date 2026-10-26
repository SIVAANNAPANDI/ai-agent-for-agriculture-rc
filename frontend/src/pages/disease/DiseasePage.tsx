import React, { useState, useEffect, useRef } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
  diseaseService,
  type DiseaseDiagnosis,
  type DiseaseHistoryItem,
} from "../../services/diseaseService";
import { getImageUrl } from "../../utils/imageUrl";
import {
  ScanLine,
  Upload,
  Camera,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Leaf,
  FlaskConical,
  ShieldCheck,
  History,
  Activity,
  HelpCircle,
  Eye,
} from "lucide-react";

export const DiseasePage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiseaseDiagnosis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "ta">("en");
  const [activeTab, setActiveTab] = useState<"organic" | "chemical" | "preventive">("organic");

  const [history, setHistory] = useState<DiseaseHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load past scans
  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await diseaseService.getScanHistory(12);
      setHistory(data);
    } catch (err) {
      console.error("Failed to load disease history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (<10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(
        language === "ta"
          ? "படத்தின் அளவு 10MB வரம்பை தாண்டியுள்ளது."
          : "File size exceeds the 10MB limit."
      );
      return;
    }

    setSelectedFile(file);
    setError(null);
    setDiagnosis(null);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Run AI disease classification
  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setError(null);

    try {
      const result = await diseaseService.predictLeafDisease(selectedFile, language);
      setDiagnosis(result);
      loadHistory(); // refresh scan list
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          (language === "ta"
            ? "இலை படத்தை பகுப்பாய்வு செய்வதில் பிழை ஏற்பட்டது."
            : "Failed to analyze leaf image. Please try again.")
      );
    } finally {
      setIsScanning(false);
    }
  };

  // Inspect previous scan
  const handleSelectHistoryItem = async (item: DiseaseHistoryItem) => {
    setError(null);
    setIsScanning(true);
    try {
      const detail = await diseaseService.getScanDetail(item.id, language);
      setDiagnosis(detail);
      setPreviewUrl(getImageUrl(detail.image_url) || null);
      setSelectedFile(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message || "Failed to load prior diagnosis.");
    } finally {
      setIsScanning(false);
    }
  };

  // Reset state
  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setDiagnosis(null);
    setError(null);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "none":
        return <Badge variant="success">Healthy • பூஜ்ஜியம்</Badge>;
      case "low":
        return <Badge variant="neutral">Low Severity • குறைந்த தாக்கம்</Badge>;
      case "medium":
        return <Badge variant="warning">Medium Severity • மிதமான தாக்கம்</Badge>;
      case "high":
        return <Badge variant="danger">High Severity • தீவிர தாக்கம்</Badge>;
      case "critical":
        return <Badge variant="danger">Critical • உடனடி கவனம் தேவை</Badge>;
      default:
        return <Badge variant="primary">{severity}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-agri-text">
              {language === "ta" ? "பயிர் இலை நோய் கண்டறிதல்" : "AI Leaf Disease Diagnostics"}
            </h1>
            <Badge variant="primary" className="text-xs">
              EfficientNetB0
            </Badge>
          </div>
          <p className="text-sm text-agri-muted">
            {language === "ta"
              ? "தக்காளி, உருளைக்கிழங்கு, மற்றும் குடைமிளகாய் இலைகளின் நோய்களை கண்டறிந்து தீர்வுகள் வழங்கும் நுண்ணறிவு அமைப்பு."
              : "Deep neural image classification covering 15 PlantVillage disease classes with organic & chemical treatment plans."}
          </p>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
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
        </div>
      </div>

      {/* Main Grid: Upload Stage + Diagnostic Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Capture & Preview */}
        <div className="lg:col-span-5 space-y-4">
          <Card variant="surface" className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-agri-border pb-3">
              <span className="font-bold text-sm text-agri-text flex items-center gap-2">
                <Leaf className="w-4 h-4 text-agri-primary" />
                {language === "ta" ? "இலை புகைப்படம்" : "Leaf Photograph"}
              </span>
              {previewUrl && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-agri-muted hover:text-agri-danger flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {language === "ta" ? "மாற்று" : "Reset"}
                </button>
              )}
            </div>

            {/* Hidden Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {/* Visualizer Area */}
            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-agri-border aspect-square flex items-center justify-center group shadow-inner">
                <img
                  src={previewUrl}
                  alt="Leaf preview"
                  className="w-full h-full object-cover"
                />

                {/* Animated Scanning Laser when processing */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px]">
                    <div className="w-full h-1 bg-gradient-to-r from-emerald-400 via-agri-primaryLight to-emerald-400 shadow-[0_0_15px_#22c55e] animate-pulse absolute top-1/2 -translate-y-1/2" />
                    <div className="bg-black/75 px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 border border-white/20 shadow-lg">
                      <ScanLine className="w-4 h-4 text-agri-primaryLight animate-spin" />
                      <span>
                        {language === "ta"
                          ? "நுண்ணறிவு பகுப்பாய்வு செய்கிறது..."
                          : "EfficientNetB0 Analyzing Leaf..."}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-agri-primary hover:bg-emerald-50/30 transition-all p-8 flex flex-col items-center justify-center text-center cursor-pointer aspect-square bg-slate-50"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-agri-primary flex items-center justify-center mb-3 shadow-xs">
                  <ScanLine className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-sm text-agri-text mb-1">
                  {language === "ta" ? "இலை படத்தை பதிவேற்றவும்" : "Upload Leaf Image"}
                </h4>
                <p className="text-xs text-agri-muted max-w-xs leading-relaxed">
                  {language === "ta"
                    ? "கேமரா மூலம் படம் எடுக்கவும் அல்லது கேலரியில் இருந்து தேர்வு செய்யவும் (JPG, PNG, WebP)."
                    : "Take a sharp photo or select from gallery. Ensure leaf spots and lesions are in clear focus."}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => cameraInputRef.current?.click()}
                leftIcon={<Camera className="w-4 h-4 text-agri-primary" />}
                className="justify-center text-xs"
              >
                {language === "ta" ? "கேமரா (நேரடி)" : "Take Photo"}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Upload className="w-4 h-4 text-agri-primary" />}
                className="justify-center text-xs"
              >
                {language === "ta" ? "கோப்பை தேர்வுசெய்" : "Choose File"}
              </Button>
            </div>

            {selectedFile && !diagnosis && (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleAnalyze}
                isLoading={isScanning}
                className="w-full justify-center text-sm font-bold shadow-md"
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                {language === "ta" ? "நோயை கண்டறி (Analyze)" : "Diagnose Leaf Disease"}
              </Button>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </Card>

          {/* Diagnostic Guidelines Card */}
          <Card variant="surface" className="p-4 bg-emerald-50/50 border-emerald-200 text-xs space-y-2">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-agri-primary" />
              {language === "ta" ? "துல்லியமான முடிவுகளுக்கான குறிப்புகள்" : "Tips for Accurate Diagnosis"}
            </span>
            <ul className="space-y-1 text-emerald-800 list-disc list-inside">
              <li>{language === "ta" ? "நல்ல சூரிய வெளிச்சத்தில் படம் எடுக்கவும்." : "Capture photo in natural daytime light."}</li>
              <li>{language === "ta" ? "ஒரு குறிப்பிட்ட இலையை மையப்படுத்தி தெளிவாக எடுக்கவும்." : "Center on a single affected leaf with visible spots."}</li>
              <li>{language === "ta" ? "மங்கலான அல்லது நிழல் விழுந்த படங்களை தவிர்க்கவும்." : "Avoid blurry, out-of-focus, or heavily shaded photos."}</li>
            </ul>
          </Card>
        </div>

        {/* Right Column: Diagnostic Report & Agronomic Advisory */}
        <div className="lg:col-span-7">
          {diagnosis ? (
            <div className="space-y-5">
              {/* Primary Diagnostic Banner */}
              <Card
                variant="surface"
                className={`p-5 sm:p-6 border-2 space-y-4 ${
                  diagnosis.is_healthy
                    ? "border-emerald-500 bg-emerald-50/30"
                    : diagnosis.is_low_confidence
                    ? "border-amber-400 bg-amber-50/30"
                    : "border-red-400 bg-red-50/20"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-agri-muted uppercase tracking-wider block">
                      {language === "ta" ? "கண்டறியப்பட்ட பயிர்" : "Identified Crop"}: {diagnosis.crop_name}
                    </span>
                    <h2 className="text-2xl font-black text-agri-text mt-0.5">
                      {diagnosis.disease_name}
                    </h2>
                    {diagnosis.pathogen && (
                      <p className="text-xs italic text-slate-500 mt-0.5">
                        Pathogen: {diagnosis.pathogen}
                      </p>
                    )}
                  </div>
                  <div>{getSeverityBadge(diagnosis.severity)}</div>
                </div>

                {/* Confidence Gauge */}
                <div className="space-y-1.5 pt-2 border-t border-agri-border">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-agri-muted">
                      {language === "ta" ? "கணிப்பு துல்லியம் (Confidence)" : "Model Confidence Score"}
                    </span>
                    <span
                      className={`text-sm ${
                        diagnosis.confidence_pct >= 80
                          ? "text-emerald-700"
                          : diagnosis.confidence_pct >= 60
                          ? "text-amber-700"
                          : "text-red-600"
                      }`}
                    >
                      {diagnosis.confidence_pct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        diagnosis.confidence_pct >= 80
                          ? "bg-emerald-600"
                          : diagnosis.confidence_pct >= 60
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(diagnosis.confidence_pct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Low Confidence Warning */}
                {diagnosis.is_low_confidence && (
                  <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">
                        {language === "ta" ? "கவனம்: குறைவான துல்லியம்" : "Low Confidence Warning"}
                      </span>
                      <span>{diagnosis.warning}</span>
                    </div>
                  </div>
                )}
              </Card>

              {/* Symptoms Card */}
              {diagnosis.symptoms && diagnosis.symptoms.length > 0 && (
                <Card variant="surface" className="p-5 space-y-3">
                  <h3 className="font-bold text-sm text-agri-text flex items-center gap-2">
                    <Eye className="w-4 h-4 text-agri-primary" />
                    {language === "ta" ? "தென்படும் அறிகுறிகள்" : "Observable Leaf Symptoms"}
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {diagnosis.symptoms.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-agri-primary mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Treatment Plans (Tabbed: Organic, Chemical, Preventive) */}
              <Card variant="surface" className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-agri-border pb-3">
                  <h3 className="font-bold text-sm text-agri-text flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-agri-primary" />
                    {language === "ta" ? "பரிந்துரைக்கப்பட்ட விவசாய தீர்வுகள்" : "Agronomic Treatment Plan"}
                  </h3>
                </div>

                {/* Tabs */}
                <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold border border-agri-border">
                  <button
                    onClick={() => setActiveTab("organic")}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === "organic"
                        ? "bg-white text-emerald-800 shadow-xs font-bold"
                        : "text-agri-muted hover:text-agri-text"
                    }`}
                  >
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === "ta" ? "இயற்கை / உயிரியல்" : "Organic Remedies"}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("chemical")}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === "chemical"
                        ? "bg-white text-blue-800 shadow-xs font-bold"
                        : "text-agri-muted hover:text-agri-text"
                    }`}
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language === "ta" ? "ரசாயன சிகிச்சை" : "Chemical Dosage"}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("preventive")}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === "preventive"
                        ? "bg-white text-amber-800 shadow-xs font-bold"
                        : "text-agri-muted hover:text-agri-text"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>{language === "ta" ? "தடுப்பு முறைகள்" : "Prevention"}</span>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="pt-2">
                  {activeTab === "organic" && (
                    <div className="space-y-2.5">
                      {diagnosis.organic_treatment.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "chemical" && (
                    <div className="space-y-2.5">
                      {diagnosis.chemical_treatment.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start gap-2.5"
                        >
                          <FlaskConical className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "preventive" && (
                    <div className="space-y-2.5">
                      {diagnosis.preventive_measures.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2.5"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Top 3 Candidate Differential Diagnosis */}
              {diagnosis.top_candidates && diagnosis.top_candidates.length > 1 && (
                <Card variant="surface" className="p-5 space-y-3">
                  <h3 className="font-bold text-sm text-agri-text flex items-center gap-2">
                    <Activity className="w-4 h-4 text-agri-primary" />
                    {language === "ta" ? "மாற்று கணிப்புகள் (Top Candidates)" : "Differential Probability Distribution"}
                  </h3>
                  <div className="space-y-2.5">
                    {diagnosis.top_candidates.map((cand, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700">
                            {cand.display_name}
                          </span>
                          <span className="font-bold text-slate-800">
                            {cand.confidence_pct}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              idx === 0 ? "bg-agri-primary" : "bg-slate-400"
                            }`}
                            style={{ width: `${Math.min(cand.confidence_pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          ) : (
            /* Idle State: Supported Crops & Information */
            <Card variant="surface" className="p-6 sm:p-8 space-y-6">
              <div className="text-center space-y-2 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-agri-primary flex items-center justify-center mx-auto">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-agri-text">
                  {language === "ta" ? "இலை நோய்களை உடனடியாக கண்டறியுங்கள்" : "Instant Foliar Disease Detection"}
                </h3>
                <p className="text-xs text-agri-muted leading-relaxed">
                  {language === "ta"
                    ? "இடதுபுறம் உள்ள கேமரா அல்லது கோப்பு பட்டனை பயன்படுத்தி இலையின் புகைப்படத்தை சமர்ப்பிக்கவும்."
                    : "Upload or photograph any tomato, potato, or bell pepper leaf to receive instant deep learning diagnosis, severity assessment, and actionable treatments."}
                </p>
              </div>

              {/* Supported Crops Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-agri-border">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1">
                  <span className="text-xs font-bold text-agri-text block">🍅 Tomato (தக்காளி)</span>
                  <p className="text-[11px] text-agri-muted">
                    Early Blight, Late Blight, Bacterial Spot, Leaf Mold, Mosaic Virus, Septoria, Spider Mites.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1">
                  <span className="text-xs font-bold text-agri-text block">🥔 Potato (உருளை)</span>
                  <p className="text-[11px] text-agri-muted">
                    Early Blight, Late Blight (கொடிய கருகல்), and Healthy foliar verification.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1">
                  <span className="text-xs font-bold text-agri-text block">🫑 Bell Pepper (மிளகாய்)</span>
                  <p className="text-[11px] text-agri-muted">
                    Bacterial Spot (பாக்டீரியா இலைப்புள்ளி) and Healthy leaf verification.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Section: Previous Scans History Gallery */}
      <div className="space-y-4 pt-4 border-t border-agri-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-agri-primary" />
            <h3 className="font-extrabold text-base text-agri-text">
              {language === "ta" ? "முந்தைய பரிசோதனைகள்" : "Recent Diagnostic Scans"}
            </h3>
          </div>
          <span className="text-xs text-agri-muted">
            {history.length} {language === "ta" ? "பதிவுகள்" : "Scans saved"}
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-xs text-agri-muted bg-white rounded-2xl border border-agri-border">
            {language === "ta"
              ? "முந்தைய பரிசோதனைகள் எதுவும் இல்லை. உங்கள் முதல் இலையை மேலே ஸ்கேன் செய்யவும்."
              : "No diagnostic scans yet. Capture your first leaf photo above to build your crop health history."}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectHistoryItem(item)}
                className="group p-2.5 rounded-2xl bg-white border border-agri-border hover:border-agri-primary hover:shadow-card cursor-pointer transition-all space-y-2 text-left"
              >
                <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden relative border border-slate-200 flex items-center justify-center">
                  <img
                    src={getImageUrl(item.image_url)}
                    alt={item.disease_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2316a34a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z'/><path d='M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'/></svg>";
                    }}
                  />
                  <div className="absolute top-1.5 right-1.5">
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-md text-white shadow-xs ${
                        item.is_healthy ? "bg-emerald-600" : "bg-red-500"
                      }`}
                    >
                      {item.confidence_pct}%
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-agri-muted block truncate">
                    {item.crop_name}
                  </span>
                  <span className="text-xs font-bold text-agri-text block truncate group-hover:text-agri-primary transition-colors">
                    {item.disease_name}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString([], { month: "short", day: "numeric" }) : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
