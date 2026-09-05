import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlyLow, setOnlyLow] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  }, []);

  const rows = onlyLow ? products.filter((p) => p.lowStock) : products;

  const columns = [
    { key: "code", label: "الكود" },
    { key: "name", label: "الاسم" },
    { key: "category", label: "الفئة" },
    {
      key: "currentStock",
      label: "الرصيد الحالي",
      render: (r) => (
        <span className={r.lowStock ? "text-danger font-semibold" : "text-ink"}>
          {r.currentStock} {r.unit}
        </span>
      ),
    },
    { key: "lowStockThreshold", label: "حد التنبيه" },
    {
      key: "value",
      label: "قيمة الرصيد (بسعر التكلفة)",
      render: (r) => `${(r.currentStock * r.costPrice).toLocaleString()} ج.م`,
    },
    {
      key: "status",
      label: "الحالة",
      render: (r) =>
        r.lowStock ? (
          <span className="bg-danger-light text-danger text-xs font-medium px-2.5 py-1 rounded">
            قرب يخلص
          </span>
        ) : (
          <span className="bg-primary-light text-primary-dark text-xs font-medium px-2.5 py-1 rounded">
            متوفر
          </span>
        ),
    },
  ];

  return (
    <Layout title="المخزون">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <p className="text-muted text-sm">رصيد كل صنف بيتحدث تلقائي مع كل عملية بيع أو شراء</p>
        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
          <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} />
          الأصناف اللي قربت تخلص بس
        </label>
      </div>

      {loading ? (
        <div className="text-muted text-sm">جاري التحميل...</div>
      ) : (
        <DataTable columns={columns} rows={rows} emptyMessage="لا توجد أصناف مطابقة" />
      )}
    </Layout>
  );
}
