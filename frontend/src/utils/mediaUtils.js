export const getAbsoluteMediaUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  const backendUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace("/api", "")
    : "http://localhost:5000";
  return `${backendUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};
