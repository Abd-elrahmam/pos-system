import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { assetUrl } from "../utils/assetUrl";

const navItems = [
  { to: "/", label: "لوحة التحكم", end: true },
  { to: "/products", label: "المنتجات" },
  { to: "/inventory", label: "المخزون" },
  { to: "/sales", label: "المبيعات" },
  { to: "/purchases", label: "المشتريات" },
  { to: "/reports", label: "التقارير" },
];

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function Sidebar({ open, onClose }) {
  const { user, isAdmin, logout } = useAuth();
  const { settings } = useSettings();

  return (
    <>
      {/* الخلفية الشفافة على الموبايل لما السايد بار مفتوح */}
      {open && (
        <div
          className="fixed inset-0 bg-ink/40 z-30 sm:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`w-64 shrink-0 bg-surface border-l border-border h-screen flex flex-col
          fixed sm:sticky top-0 z-40 transition-transform duration-200
          ${open ? "translate-x-0" : "translate-x-full sm:translate-x-0"}
        `}
      >
        <div className="px-6 py-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {settings?.storeLogo ? (
              <img
                src={assetUrl(settings.storeLogo)}
                alt="لوجو المحل"
                className="w-9 h-9 rounded object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded bg-primary flex items-center justify-center text-white font-bold text-sm font-heading shrink-0">
                حد
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-ink leading-tight font-heading truncate">
                {settings?.storeName || "محل الحديد والعدة"}
              </p>
              <p className="text-xs text-muted " >نظام الإدارة</p>
            </div>
          </div>
          <button onClick={onClose} className="sm:hidden text-muted hover:text-ink shrink-0">
            <CloseIcon />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-light text-primary-dark"
                    : "text-ink/70 hover:bg-paper hover:text-ink"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="pt-4 pb-1 px-4 text-xs text-muted radius-4 bg-accent-light">إدارة النظام</div>
              <NavLink
                to="/admin/settings"
                onClick={onClose}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-light text-primary-dark"
                      : "text-ink/70 hover:bg-paper hover:text-ink"
                  }`
                }
              >
                إعدادات المحل
              </NavLink>
              <NavLink
                to="/admin/users"
                onClick={onClose}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-light text-primary-dark"
                      : "text-ink/70 hover:bg-paper hover:text-ink"
                  }`
                }
              >
                المستخدمين
              </NavLink>
            </>
          )}
        </nav>

        <div className="px-4 py-4 border-t border-border flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
            <p className="text-xs text-muted">{user?.role === "admin" ? "أدمن" : "كاشير"}</p>
          </div>
          <button
            onClick={logout}
            title="تسجيل خروج"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded text-muted hover:text-danger hover:bg-danger-light transition-colors"
          >
            <LogoutIcon />
          </button>
        </div>
      </aside>
    </>
  );
}
