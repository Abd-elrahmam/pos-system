import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { assetUrl } from "../utils/assetUrl";

export default function Setup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/bootstrap-admin", form);
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ، جرب تاني");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded bg-primary flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 overflow-hidden">
            {settings?.storeLogo ? (
              <img src={assetUrl(settings.storeLogo)} alt="لوجو" className="w-full h-full object-cover" />
            ) : (
              "حد"
            )}
          </div>
          <h1 className="text-2xl font-bold text-ink font-heading">أول تشغيل للنظام</h1>
          <p className="text-muted text-sm mt-1">هنعمل حساب الأدمن الرئيسي بتاع المحل</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded p-6 space-y-4">
          {error && (
            <div className="bg-danger-light text-danger text-sm rounded px-4 py-3">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">اسمك</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">الإيميل</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2.5 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">كلمة المرور</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2.5 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded transition-colors disabled:opacity-60"
          >
            {loading ? "جاري الإنشاء..." : "إنشاء حساب الأدمن"}
          </button>

          <p className="text-center text-xs text-muted">
            عندك حساب بالفعل؟{" "}
            <Link to="/login" className="text-primary hover:underline">
              سجل دخول
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
