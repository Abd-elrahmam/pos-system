import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    const timeout = setTimeout(() => {
      api.get("/search", { params: { q: query } }).then((res) => {
        setResults(res.data);
        setOpen(true);
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const hasResults =
    results && (results.products.length || results.sales.length || results.purchases.length);

  return (
    <div ref={boxRef} className="relative w-full max-w-sm">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim().length >= 2 && setOpen(true)}
        placeholder="ابحث عن منتج، عميل، أو مورد..."
        className="w-full px-4 py-2.5 border border-border rounded-full text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
      />

      {open && query.trim().length >= 2 && (
        <div className="absolute z-40 mt-2 w-full bg-surface border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {!hasResults && (
            <p className="px-4 py-3 text-sm text-muted">مفيش نتائج مطابقة</p>
          )}

          {results?.products?.length > 0 && (
            <div className="py-2">
              <p className="px-4 py-1 text-xs text-muted">منتجات</p>
              {results.products.map((p) => (
                <button
                  key={p._id}
                  onClick={() => {
                    setOpen(false);
                    navigate(`/products?search=${encodeURIComponent(p.name)}`);
                  }}
                  className="w-full text-right px-4 py-2 text-sm hover:bg-paper flex justify-between"
                >
                  <span>{p.name}</span>
                  <span className="text-muted">{p.code}</span>
                </button>
              ))}
            </div>
          )}

          {results?.sales?.length > 0 && (
            <div className="py-2 border-t border-border">
              <p className="px-4 py-1 text-xs text-muted">مبيعات</p>
              {results.sales.map((s) => (
                <button
                  key={s._id}
                  onClick={() => {
                    setOpen(false);
                    navigate("/sales");
                  }}
                  className="w-full text-right px-4 py-2 text-sm hover:bg-paper flex justify-between"
                >
                  <span>{s.product?.name}{s.customerName ? ` — ${s.customerName}` : ""}</span>
                  <span className="text-muted">{s.total} ج.م</span>
                </button>
              ))}
            </div>
          )}

          {results?.purchases?.length > 0 && (
            <div className="py-2 border-t border-border">
              <p className="px-4 py-1 text-xs text-muted">مشتريات</p>
              {results.purchases.map((p) => (
                <button
                  key={p._id}
                  onClick={() => {
                    setOpen(false);
                    navigate("/purchases");
                  }}
                  className="w-full text-right px-4 py-2 text-sm hover:bg-paper flex justify-between"
                >
                  <span>{p.product?.name}{p.supplierName ? ` — ${p.supplierName}` : ""}</span>
                  <span className="text-muted">{p.total} ج.م</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
