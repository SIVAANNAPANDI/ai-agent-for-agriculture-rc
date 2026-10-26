/**
 * Utility to resolve relative upload paths to full accessible URLs.
 */
export function getImageUrl(url?: string | null): string {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const cleanBase = apiBase.replace(/\/+$/, "");
  const cleanPath = url.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
}
