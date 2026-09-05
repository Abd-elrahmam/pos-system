import GlobalSearch from "./GlobalSearch";

function formatDate() {
  const now = new Date();
  return now.toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export default function Topbar({ title, onMenuClick }) {
  return (
    <header className="border-b border-border bg-paper px-4 sm:px-8 py-4 sm:py-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="sm:hidden text-ink shrink-0 w-9 h-9 flex items-center justify-center rounded hover:bg-surface"
          >
            <MenuIcon />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-ink font-heading truncate">{title}</h1>
        </div>

        <div className="hidden sm:block flex-1 max-w-sm">
          <GlobalSearch />
        </div>

        <p className="text-sm text-muted shrink-0 hidden md:block">{formatDate()}</p>
      </div>

      <div className="mt-3 sm:hidden">
        <GlobalSearch />
      </div>
    </header>
  );
}
