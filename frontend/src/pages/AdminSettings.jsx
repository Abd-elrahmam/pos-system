import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { useSettings } from "../context/SettingsContext";
import { assetUrl } from "../utils/assetUrl";

export default function AdminSettings() {
  const { reload } = useSettings();
  const [form, setForm] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [categoryInput, setCategoryInput] = useState("");

  useEffect(() => {
    api.get("/settings").then((res) => {
      setForm(res.data);
      setLogoPreview(res.data.storeLogo ? assetUrl(res.data.storeLogo) : "");
    });
  }, []);

  function onLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "categories") {
          data.append(key, JSON.stringify(value));
        } else if (key !== "storeLogo") {
          data.append(key, value ?? "");
        }
      });
      if (logoFile) data.append("logo", logoFile);

      const res = await api.put("/settings", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm(res.data);
      reload();
      setMessage("تم حفظ الإعدادات بنجاح");
    } catch (err) {
      setMessage(err.response?.data?.message || "حصل خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  function addCategory() {
    if (!categoryInput.trim()) return;
    if (form.categories.includes(categoryInput.trim())) return;
    setForm({ ...form, categories: [...form.categories, categoryInput.trim()] });
    setCategoryInput("");
  }

  function removeCategory(cat) {
    setForm({ ...form, categories: form.categories.filter((c) => c !== cat) });
  }

  if (!form) {
    return (
      <Layout title="إعدادات المحل">
        <div className="text-muted text-sm">جاري التحميل...</div>
      </Layout>
    );
  }

  return (
    <Layout title="إعدادات المحل">
      <p className="text-muted text-sm mb-6">الإعدادات دي بتتحكم في النظام كله، للأدمن بس</p>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {message && (
          <div className="bg-primary-light text-primary-dark text-sm rounded px-4 py-3">{message}</div>
        )}

        <section className="bg-surface border border-border rounded p-6">
          <h2 className="font-bold text-ink mb-4 font-heading">لوجو المحل</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded bg-paper border border-border flex items-center justify-center overflow-hidden shrink-0">
              {logoPreview ? (
                <img src={logoPreview} alt="لوجو" className="w-full h-full object-cover" />
              ) : (
                <span className="text-muted text-xs">لوجو</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={onLogoChange} className="text-sm" />
          </div>
        </section>

        <section className="bg-surface border border-border rounded p-6">
          <h2 className="font-bold text-ink mb-4 font-heading">بيانات المحل</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">اسم المحل</label>
              <input
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">رقم التليفون</label>
                <input
                  value={form.storePhone}
                  onChange={(e) => setForm({ ...form, storePhone: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                />
                <p className="text-xs text-muted mt-1">الرقم ده هيظهر تحت اسم المحل في الفواتير المطبوعة</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">العملة</label>
                <input
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">العنوان</label>
              <input
                value={form.storeAddress}
                onChange={(e) => setForm({ ...form, storeAddress: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
          </div>
        </section>

        <section className="bg-surface border border-border rounded p-6">
          <h2 className="font-bold text-ink mb-4 font-heading">فئات المنتجات</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {form.categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-2 bg-paper border border-border text-sm px-3 py-1.5 rounded"
              >
                {cat}
                <button
                  type="button"
                  onClick={() => removeCategory(cat)}
                  className="text-muted hover:text-danger"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              placeholder="اسم فئة جديدة"
              className="flex-1 px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
            />
            <button
              type="button"
              onClick={addCategory}
              className="px-4 py-2 border border-border rounded text-sm hover:bg-paper"
            >
              إضافة
            </button>
          </div>
        </section>

        <section className="bg-surface border border-border rounded p-6">
          <h2 className="font-bold text-ink mb-4 font-heading">إعدادات المخزون</h2>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              الحد الأدنى الافتراضي للتنبيه بنقص المخزون
            </label>
            <input
              type="number"
              value={form.defaultLowStockThreshold}
              onChange={(e) =>
                setForm({ ...form, defaultLowStockThreshold: Number(e.target.value) })
              }
              className="w-full max-w-[200px] px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
            />
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2.5 rounded transition-colors disabled:opacity-60"
        >
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </form>
    </Layout>
  );
}
