import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
  notificationService,
  type Notification,
} from "../../services/notificationService";
import {
  Bell,
  CloudRain,
  Sprout,
  Store,
  Bot,
  Wheat,
  CheckCheck,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
} from "lucide-react";

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [language, setLanguage] = useState<"en" | "ta">("en");

  const typeCategories = [
    { id: "all", en: "All Alerts", ta: "அனைத்தும்", icon: Bell },
    { id: "weather", en: "Weather", ta: "வானிலை", icon: CloudRain },
    { id: "cultivation", en: "Cultivation", ta: "பயிர் சாகுபடி", icon: Sprout },
    { id: "harvest", en: "Harvest", ta: "அறுவடை", icon: Wheat },
    { id: "marketplace", en: "Marketplace", ta: "அங்காடி", icon: Store },
    { id: "ai", en: "AI Advisor", ta: "AI வழிகாட்டி", icon: Bot },
  ];

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications({
        unread_only: activeTab === "unread",
      });
      setNotifications(data.items);
      setUnreadCount(data.unread_count);
      setTotalCount(data.total);
    } catch (err: any) {
      console.error("Failed to load notifications:", err);
      setError("Unable to load notifications. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotalCount((t) => Math.max(0, t - 1));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "weather":
        return <CloudRain className="w-5 h-5 text-blue-600" />;
      case "cultivation":
        return <Sprout className="w-5 h-5 text-emerald-600" />;
      case "harvest":
        return <Wheat className="w-5 h-5 text-amber-600" />;
      case "marketplace":
        return <Store className="w-5 h-5 text-purple-600" />;
      case "ai":
        return <Bot className="w-5 h-5 text-teal-600" />;
      default:
        return <Bell className="w-5 h-5 text-agri-primary" />;
    }
  };

  const getCategoryBg = (type: string) => {
    switch (type.toLowerCase()) {
      case "weather":
        return "bg-blue-50 border-blue-100";
      case "cultivation":
        return "bg-emerald-50 border-emerald-100";
      case "harvest":
        return "bg-amber-50 border-amber-100";
      case "marketplace":
        return "bg-purple-50 border-purple-100";
      case "ai":
        return "bg-teal-50 border-teal-100";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (selectedType === "all") return true;
    return item.type.toLowerCase() === selectedType.toLowerCase();
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-agri-text">
              {language === "ta" ? "அறிவிப்பு மையம்" : "Agricultural Notification Center"}
            </h1>
            {unreadCount > 0 && (
              <Badge variant="danger" className="text-xs px-2 py-0.5 animate-pulse">
                {unreadCount} {language === "ta" ? "புதியவை" : "New"}
              </Badge>
            )}
          </div>
          <p className="text-sm text-agri-muted mt-1">
            {language === "ta"
              ? "முக்கியமான வானிலை எச்சரிக்கைகள், பயிர் வளர்ச்சி பணிகள் மற்றும் அங்காடி அறிவிப்புகள்."
              : "Live microclimate weather alerts, phenology stage tasks, and marketplace inquiries."}
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

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CheckCheck className="w-4 h-4" />}
              onClick={handleMarkAllAsRead}
            >
              {language === "ta" ? "அனைத்தையும் படித்ததாக குறி" : "Mark All as Read"}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-agri-border bg-white rounded-t-xl px-4 pt-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition -mb-[2px] ${
            activeTab === "all"
              ? "border-agri-primary text-agri-primary"
              : "border-transparent text-agri-muted hover:text-agri-text"
          }`}
        >
          <Bell className="w-4 h-4" />
          {language === "ta" ? "அனைத்து அறிவிப்புகள்" : "All Alerts"}
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
            {totalCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("unread")}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition -mb-[2px] ${
            activeTab === "unread"
              ? "border-agri-primary text-agri-primary"
              : "border-transparent text-agri-muted hover:text-agri-text"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          {language === "ta" ? "படிக்காதவை" : "Unread Only"}
          {unreadCount > 0 && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-agri-muted font-semibold flex items-center gap-1 pl-1">
          <Filter className="w-3.5 h-3.5" />
        </span>
        {typeCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedType(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedType === cat.id
                  ? "bg-agri-primary text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {language === "ta" ? cat.ta : cat.en}
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center text-agri-muted space-y-3">
          <div className="w-8 h-8 border-3 border-agri-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">
            {language === "ta" ? "அறிவிப்புகள் ஏற்றப்படுகின்றன..." : "Loading notifications..."}
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <Card variant="surface" className="p-6 text-center border border-red-200 bg-red-50 text-red-700">
          <AlertCircle className="w-8 h-8 mx-auto text-red-600 mb-2" />
          <p className="font-semibold">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchNotifications} className="mt-3">
            {language === "ta" ? "மீண்டும் முயற்சி செய்" : "Try Again"}
          </Button>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredNotifications.length === 0 && (
        <Card variant="surface" className="p-10 text-center border-dashed border-2 border-slate-200 bg-slate-50/50">
          <div className="w-16 h-16 bg-emerald-50 text-agri-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-agri-text">
            {language === "ta" ? "புதிய அறிவிப்புகள் எதுவும் இல்லை" : "All Caught Up!"}
          </h3>
          <p className="text-sm text-agri-muted max-w-md mx-auto mt-2">
            {activeTab === "unread"
              ? language === "ta"
                ? "நீங்கள் அனைத்து எச்சரிக்கைகளையும் படித்துவிட்டீர்கள். 'அனைத்து அறிவிப்புகள்' தாவலை கிளிக் செய்து பழைய விபரங்களை பார்க்கலாம்."
                : "You have reviewed all urgent notifications. Switch to 'All Alerts' to review historical farming updates."
              : language === "ta"
              ? "இந்த பிரிவில் எந்த அறிவிப்பும் இல்லை."
              : "There are no notifications matching the selected alert category."}
          </p>
        </Card>
      )}

      {/* Notifications List */}
      {!isLoading && !error && filteredNotifications.length > 0 && (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <Card
              key={notif.id}
              variant="surface"
              className={`p-4 transition border ${
                notif.is_read
                  ? "bg-white border-slate-200"
                  : "bg-emerald-50/30 border-emerald-200/80 shadow-xs"
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Icon Badge */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${getCategoryBg(
                    notif.type
                  )}`}
                >
                  {getNotificationIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm sm:text-base font-bold text-agri-text ${
                          !notif.is_read ? "font-extrabold" : ""
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-agri-primary shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-agri-muted mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  {/* Actions Bar */}
                  <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div>
                      {notif.action_url && (
                        <Link
                          to={notif.action_url}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-agri-primary hover:text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 transition"
                        >
                          <span>{language === "ta" ? "விபரத்தை பார்க்க" : "View Advisory"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!notif.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-xs text-slate-500 hover:text-agri-primary font-medium px-2 py-1 rounded hover:bg-slate-100 transition"
                        >
                          {language === "ta" ? "படித்ததாக குறி" : "Mark as read"}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                        title={language === "ta" ? "நீக்க" : "Delete notification"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
export default NotificationsPage;
