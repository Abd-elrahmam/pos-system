import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import { assetUrl } from "../utils/assetUrl";

const CATEGORIES = ["مسامير", "بويات", "حديد", "أدوات زراعية", "أدوات بناء", "أخرى"];
const UNITS = ["قطعة", "كيلو", "متر", "عبوة", "لفة", "شيكارة"];

const emptyForm = {
  name: "",
  category: CATEGORIES[0],
  unit: UNITS[0],
  costPrice: "",
  sellPrice: "",
  openingStock: "",
  lowStockThreshold: 5,
};

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api
      .get("/products", { params: search ? { search } : {} })
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, [search]);

  useEffect(() => {
    setSearchParams(search ? { search } : {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview("");
    setError("");
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      name: product.name,
      category: product.category,
      unit: product.unit,
      costPrice: product.costPrice,
      sellPrice: product.sellPrice,
      openingStock: product.openingStock,
      lowStockThreshold: product.lowStockThreshold,
    });
    setImageFile(null);
    setImagePreview(product.image ? assetUrl(product.image) : "");
    setError("");
    setModalOpen(true);
  }

  function onImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (imageFile) data.append("image", imageFile);

      if (editing) {
        await api.put(`/products/${editing._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/products", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ");
    }
  }

  async function handleDelete(id) {
    if (!confirm("متأكد إنك عايز تحذف المنتج ده؟")) return;
    await api.delete(`/products/${id}`);
    load();
  }

  const columns = [
    {
      key: "image",
      label: "",
      render: (r) =>
        r.image ? (
          <img src={assetUrl(r.image)} alt={r.name} className="w-10 h-10 rounded object-cover" />
        ) : (
          <div className="w-10 h-10 rounded bg-paper border border-border flex items-center justify-center text-muted text-xs">
            —
          </div>
        ),
    },
    { key: "code", label: "الكود" },
    { key: "name", label: "الاسم" },
    { key: "category", label: "الفئة" },
    { key: "unit", label: "الوحدة" },
    { key: "costPrice", label: "سعر الشراء", render: (r) => `${r.costPrice} ج.م` },
    { key: "sellPrice", label: "سعر البيع", render: (r) => `${r.sellPrice} ج.م` },
    {
      key: "currentStock",
      label: "الرصيد الحالي",
      render: (r) => (
        <span className={r.lowStock ? "text-danger font-semibold" : "text-ink"}>
          {r.currentStock} {r.unit}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div className="flex gap-3">
          <button onClick={() => openEdit(r)} className="text-secondary-dark hover:underline">
            تعديل
          </button>
          <button onClick={() => handleDelete(r._id)} className="text-danger hover:underline">
            حذف
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout title="المنتجات">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="ابحث بالاسم أو الكود..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
        />
        <button
          onClick={openAdd}
          className="bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2.5 rounded transition-colors"
        >
          + إضافة منتج
        </button>
      </div>

      {loading ? (
        <div className="text-muted text-sm">جاري التحميل...</div>
      ) : (
        <DataTable columns={columns} rows={products} emptyMessage="لسه مفيش منتجات، ابدأ ضيف أول صنف" />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "تعديل منتج" : "إضافة منتج جديد"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-danger-light text-danger text-sm rounded px-4 py-3">{error}</div>}

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded bg-paper border border-border flex items-center justify-center overflow-hidden shrink-0">
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-muted text-xs">صورة</span>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-ink mb-1.5">صورة المنتج (اختياري)</label>
              <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="w-full text-sm"
              />
            </div>
          </div>

          {editing && (
            <p className="text-xs text-muted -mt-2">كود المنتج: {editing.code} (ثابت ومايتغيرش)</p>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">الاسم</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">الفئة</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">الوحدة</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">سعر الشراء</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">سعر البيع</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.sellPrice}
                onChange={(e) => setForm({ ...form, sellPrice: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                {editing ? "الرصيد الافتتاحي (لا يتغير بعد الإنشاء)" : "الرصيد الافتتاحي"}
              </label>
              <input
                type="number"
                step="0.01"
                required
                disabled={!!editing}
                value={form.openingStock}
                onChange={(e) => setForm({ ...form, openingStock: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 disabled:bg-paper disabled:text-muted"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">حد التنبيه بنقص المخزون</label>
              <input
                type="number"
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded transition-colors"
          >
            {editing ? "حفظ التعديلات" : "إضافة المنتج"}
          </button>
        </form>
      </Modal>
    </Layout>
  );
}
