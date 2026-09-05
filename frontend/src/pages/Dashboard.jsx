import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import { useAuth } from "../context/AuthContext";

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "صباح الخير", emoji: "☀️" };
  if (hour < 17) return { text: "نهارك سعيد", emoji: "🌤️" };
  return { text: "مساء الخير", emoji: "🌙" };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonth());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const greeting = timeGreeting();

  useEffect(() => {
    setLoading(true);
    api
      .get("/dashboard/summary", { params: { month } })
      .then((res) => setSummary(res.data))
      .finally(() => setLoading(false));
  }, [month]);

  const columns = [
    { key: "name", label: "المنتج" },
    { key: "qty", label: "الكمية المباعة" },
    {
      key: "revenue",
      label: "الإيراد",
      render: (row) => `${row.revenue.toLocaleString()} ج.م`,
    },
    {
      key: "profit",
      label: "الربح",
      render: (row) => `${row.profit.toLocaleString()} ج.م`,
    },
  ];

  return (
    <Layout title="لوحة التحكم">
      <div className="bg-gradient-to-l from-primary to-secondary rounded-lg p-6 mb-6 text-white">
        <p className="text-2xl font-heading font-bold">
          {greeting.text} يا {user?.name || "صاحبي"} {greeting.emoji}
        </p>
        <p className="text-white/90 text-sm mt-1">نتمنالك يوم شغل موفق ومبيعات كتير</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <p className="text-muted text-sm">نظرة سريعة على أداء المحل</p>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {loading || !summary ? (
        <div className="text-muted text-sm">جاري تحميل البيانات...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="إجمالي المبيعات هذا الشهر"
              value={`${summary.totalSales.toLocaleString()} ج.م`}
              tone="primary"
            />
            <StatCard
              label="صافي الربح"
              value={`${summary.totalProfit.toLocaleString()} ج.م`}
              tone="accent"
              sub={`${summary.ordersCount} عملية بيع`}
            />
            <StatCard
              label="عدد القطع المباعة"
              value={summary.totalQuantitySold.toLocaleString()}
            />
            <StatCard
              label="قيمة المخزون الحالي"
              value={`${summary.inventoryValue.toLocaleString()} ج.م`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <StatCard
              label="أصناف قربت تخلص"
              value={summary.lowStockCount}
              tone={summary.lowStockCount > 0 ? "danger" : "default"}
              sub={`من إجمالي ${summary.productsCount} صنف`}
            />
            <StatCard
              label="إجمالي المشتريات هذا الشهر"
              value={`${summary.totalPurchases.toLocaleString()} ج.م`}
            />
          </div>

          <h2 className="font-bold text-ink mb-3">أكتر المنتجات مبيعًا هذا الشهر</h2>
          <DataTable columns={columns} rows={summary.topProducts} emptyMessage="مفيش مبيعات مسجلة الشهر ده" />
        </>
      )}
    </Layout>
  );
}
