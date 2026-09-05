import { useSettings } from "../context/SettingsContext";

// رقم المطور موجود هنا في الكود فقط، ومش متكتوب كنص ظاهر في الصفحة
const DEVELOPER_PHONE = "01021330018";
const DEVELOPER_WHATSAPP_LINK = `https://wa.me/2${DEVELOPER_PHONE}`;

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.7.44 3.36 1.28 4.82L2 22l5.4-1.36a9.9 9.9 0 0 0 4.64 1.18h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0 0 12.04 2Zm0 1.67c2.19 0 4.25.85 5.8 2.4a8.2 8.2 0 0 1 2.4 5.82c0 4.53-3.69 8.22-8.22 8.22a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.2.81.85-3.12-.2-.32a8.15 8.15 0 0 1-1.25-4.36c0-4.53 3.69-8.22 8.31-8.12Zm-4.53 4.6c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.03 0 1.2.87 2.35 1 2.51.12.16 1.7 2.65 4.19 3.62 2.07.8 2.49.64 2.94.6.45-.04 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.34-.76-1.83-.2-.48-.4-.42-.55-.42Z" />
    </svg>
  );
}

export default function Footer() {
  const { settings } = useSettings();
  const year = new Date().getFullYear();
  const storeName = settings?.storeName || "المحل";

  return (
    <footer className="border-t border-border bg-paper px-8 py-5 mt-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
        <p>
          © {year} {storeName} — جميع الحقوق محفوظة
        </p>
        <a
          href={DEVELOPER_WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-secondary-dark hover:text-secondary transition-colors"
        >
          <WhatsAppIcon />
          تم التصميم بواسطة عبدالرحمن فضل
        </a>
      </div>
    </footer>
  );
}
