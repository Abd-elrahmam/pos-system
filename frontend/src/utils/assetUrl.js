// عنوان السيرفر الأساسي (من غير /api) عشان نبني منه روابط الصور المرفوعة
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const SERVER_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

export function assetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${SERVER_ORIGIN}${path}`;
}
