import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import { useSettings } from "../context/SettingsContext";
import { printInvoice } from "../utils/print";

const emptyForm = {
  product: "",
  quantity: "",
  unitCost: "",
  supplierName: "",
};

export default function Purchases() {
  const { settings } = useSettings();
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    Promise.all([api.get("/purchases", { params: search ? { search } : {} }), api.get("/products")])
      .then(([purchasesRes, productsRes]) => {
        setPurchases(purchasesRes.data);
        setProducts(productsRes.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [search]);

  function openAdd() {
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function onProductChange(id) {
    const p = products.find((x) => x._id === id);
    setForm({ ...form, product: id, unitCost: p ? p.costPrice : "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/purchases", form);
      setModalOpen(false);
      load();
      if (confirm("تم تسجيل عملية الشراء. عايز تطبع الفاتورة؟")) {
        printInvoice({ type: "purchase", record: res.data, settings });
      }
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ");
    }
  }

  async function handleDelete(id) {
    if (!confirm("متأكد إنك عايز تحذف عملية الشراء دي؟")) return;
    await api.delete(`/purchases/${id}`);
    load();
  }

  const columns = [
    { key: "date", label: "التاريخ", render: (r) => new Date(r.date).toLocaleDateString("ar-EG") },
    { key: "product", label: "المنتج", render: (r) => r.product?.name },
    { key: "quantity", label: "الكمية" },
    { key: "unitCost", label: "سعر الوحدة", render: (r) => `${r.unitCost} ج.م` },
    { key: "total", label: "الإجمالي", render: (r) => `${r.total.toLocaleString()} ج.م` },
    { key: "supplierName", label: "المورد" },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div className="flex gap-3">
          <button
            onClick={() => printInvoice({ type: "purchase", record: r, settings })}
            className="text-secondary-dark hover:underline"
          >
            طباعة
          </button>
          <button onClick={() => handleDelete(r._id)} className="text-danger hover:underline">
            حذف
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout title="المشتريات">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="ابحث بالمنتج أو اسم المورد..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
        />
        <button
          onClick={openAdd}
          className="bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2.5 rounded transition-colors shrink-0"
        >
          + تسجيل عملية شراء
        </button>
      </div>

      {loading ? (
        <div className="text-muted text-sm">جاري التحميل...</div>
      ) : (
        <DataTable columns={columns} rows={purchases} emptyMessage="لسه مفيش مشتريات مسجلة" />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="تسجيل عملية شراء">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-danger-light text-danger text-sm rounded px-4 py-3">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">المنتج</label>
            <select
              required
              value={form.product}
              onChange={(e) => onProductChange(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
            >
              <option value="">اختر منتج</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">الكمية</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">سعر الوحدة</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.unitCost}
                onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">اسم المورد (اختياري)</label>
            <input
              value={form.supplierName}
              onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded transition-colors"
          >
            تسجيل العملية
          </button>
        </form>
      </Modal>
    </Layout>
  );
}
