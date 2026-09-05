import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

const emptyForm = { name: "", email: "", password: "", role: "cashier" };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const { user: currentUser } = useAuth();

  function load() {
    setLoading(true);
    api
      .get("/users")
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openAdd() {
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/users", form);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ");
    }
  }

  async function toggleActive(u) {
    await api.put(`/users/${u._id}`, { active: !u.active, role: u.role, name: u.name });
    load();
  }

  async function toggleRole(u) {
    const newRole = u.role === "admin" ? "cashier" : "admin";
    await api.put(`/users/${u._id}`, { role: newRole, active: u.active, name: u.name });
    load();
  }

  async function handleDelete(id) {
    if (!confirm("متأكد إنك عايز تحذف المستخدم ده؟")) return;
    await api.delete(`/users/${id}`);
    load();
  }

  const columns = [
    { key: "name", label: "الاسم" },
    { key: "email", label: "الإيميل" },
    {
      key: "role",
      label: "الصلاحية",
      render: (u) => (
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded ${
            u.role === "admin" ? "bg-accent-light text-accent-dark" : "bg-paper text-ink/70 border border-border"
          }`}
        >
          {u.role === "admin" ? "أدمن" : "كاشير"}
        </span>
      ),
    },
    {
      key: "active",
      label: "الحالة",
      render: (u) => (
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded ${
            u.active ? "bg-primary-light text-primary-dark" : "bg-danger-light text-danger"
          }`}
        >
          {u.active ? "مفعّل" : "موقوف"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (u) => (
        <div className="flex gap-3 text-sm">
          <button onClick={() => toggleRole(u)} className="text-primary hover:underline">
            {u.role === "admin" ? "خليه كاشير" : "خليه أدمن"}
          </button>
          <button onClick={() => toggleActive(u)} className="text-accent-dark hover:underline">
            {u.active ? "إيقاف" : "تفعيل"}
          </button>
          {u._id !== currentUser?.id && (
            <button onClick={() => handleDelete(u._id)} className="text-danger hover:underline">
              حذف
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout title="المستخدمين">
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted text-sm">تحكم في مين يقدر يدخل النظام وبأي صلاحية</p>
        <button
          onClick={openAdd}
          className="bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2.5 rounded transition-colors"
        >
          + إضافة مستخدم
        </button>
      </div>

      {loading ? (
        <div className="text-muted text-sm">جاري التحميل...</div>
      ) : (
        <DataTable columns={columns} rows={users} emptyMessage="لا يوجد مستخدمين" />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="إضافة مستخدم جديد">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-danger-light text-danger text-sm rounded px-4 py-3">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">الاسم</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">الإيميل</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
              className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">الصلاحية</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="cashier">كاشير</option>
              <option value="admin">أدمن</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded transition-colors"
          >
            إضافة المستخدم
          </button>
        </form>
      </Modal>
    </Layout>
  );
}
