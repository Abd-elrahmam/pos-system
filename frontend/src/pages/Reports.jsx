import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../api/axios";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";

function lastSixMonths() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

export default function Reports() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const months = lastSixMonths();
    Promise.all(months.map((m) => api.get("/dashboard/summary", { params: { month: m } })))
      .then((results) => {
        const data = results.map((res, i) => ({
          month: months[i],
          المبيعات: res.data.totalSales,
          الربح: res.data.totalProfit,
        }));
        setChartData(data);
        setTopProducts(results[results.length - 1].data.topProducts);
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "name", label: "المنتج" },
    { key: "qty", label: "الكمية" },
    { key: "revenue", label: "الإيراد", render: (r) => `${r.revenue.toLocaleString()} ج.م` },
    { key: "profit", label: "الربح", render: (r) => `${r.profit.toLocaleString()} ج.م` },
  ];

  return (
    <Layout title="التقارير">
      <p className="text-muted text-sm mb-6">أداء آخر 6 شهور، مبيعات وأرباح</p>

      {loading ? (
        <div className="text-muted text-sm">جاري التحميل...</div>
      ) : (
        <>
          <div className="bg-surface border border-border rounded p-6 mb-8" style={{ height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1E3C6" />
                <XAxis dataKey="month" stroke="#8A8275" fontSize={12} />
                <YAxis stroke="#8A8275" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #F1E3C6", fontFamily: "Almarai" }}
                />
                <Bar dataKey="المبيعات" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="الربح" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h2 className="font-bold text-ink mb-3">أكتر المنتجات مبيعًا هذا الشهر</h2>
          <DataTable columns={columns} rows={topProducts} emptyMessage="مفيش بيانات كفاية بعد" />
        </>
      )}
    </Layout>
  );
}
