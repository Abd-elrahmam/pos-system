import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { assetUrl } from "../utils/assetUrl";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const res = await api.post("/auth/login", { email, password });
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
          <h1 className="text-2xl font-bold text-ink font-heading">{settings?.storeName || "محل الحديد والعدة"}</h1>
          <p className="text-muted text-sm mt-1">سجل دخولك عشان تكمل شغلك</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded p-6 space-y-4">
          {error && (
            <div className="bg-danger-light text-danger text-sm rounded px-4 py-3">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">الإيميل</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="example@shop.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded transition-colors disabled:opacity-60"
          >
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
