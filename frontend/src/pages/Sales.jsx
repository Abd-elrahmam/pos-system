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
  unitPrice: "",
  customerName: "",
  paymentMethod: "كاش",
};

export default function Sales() {
  const { settings } = useSettings();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    Promise.all([api.get("/sales", { params: search ? { search } : {} }), api.get("/products")])
      .then(([salesRes, productsRes]) => {
        setSales(salesRes.data);
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
    setForm({ ...form, product: id, unitPrice: p ? p.sellPrice : "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/sales", form);
      setModalOpen(false);
      load();
      if (confirm("تم تسجيل عملية البيع. عايز تطبع الفاتورة؟")) {
        printInvoice({ type: "sale", record: res.data, settings });
      }
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ");
    }
  }

  async function handleDelete(id) {
    if (!confirm("متأكد إنك عايز تحذف عملية البيع دي؟")) return;
    await api.delete(`/sales/${id}`);
    load();
  }

  const columns = [
    { key: "date", label: "التاريخ", render: (r) => new Date(r.date).toLocaleDateString("ar-EG") },
    { key: "product", label: "المنتج", render: (r) => r.product?.name },
    { key: "quantity", label: "الكمية" },
    { key: "unitPrice", label: "سعر الوحدة", render: (r) => `${r.unitPrice} ج.م` },
    { key: "total", label: "الإجمالي", render: (r) => `${r.total.toLocaleString()} ج.م` },
    { key: "profit", label: "الربح", render: (r) => `${r.profit.toLocaleString()} ج.م` },
    { key: "paymentMethod", label: "طريقة الدفع" },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div className="flex gap-3">
          <button
            onClick={() => printInvoice({ type: "sale", record: r, settings })}
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
    <Layout title="المبيعات">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="ابحث بالمنتج أو اسم العميل..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
        />
        <button
          onClick={openAdd}
          className="bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2.5 rounded transition-colors shrink-0"
        >
          + تسجيل عملية بيع
        </button>
      </div>

      {loading ? (
        <div className="text-muted text-sm">جاري التحميل...</div>
      ) : (
        <DataTable columns={columns} rows={sales} emptyMessage="لسه مفيش مبيعات مسجلة" />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="تسجيل عملية بيع">
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
                  {p.name} — متاح: {p.currentStock} {p.unit}
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
                value={form.unitPrice}
                onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">اسم العميل (اختياري)</label>
              <input
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">طريقة الدفع</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              >
                <option value="كاش">كاش</option>
                <option value="فيزا">فيزا</option>
                <option value="آجل">آجل</option>
              </select>
            </div>
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
