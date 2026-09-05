/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F3F7FD", // أبيض مزرق فاتح جدًا
        surface: "#FFFFFF",
        ink: "#16324F", // كحلي غامق بدل الأسود
        muted: "#6B7A90",
        border: "#DCE7F5",
        primary: {
          DEFAULT: "#2563EB", // أزرق حيوي
          dark: "#1D4ED8",
          light: "#DBEAFE",
        },
        secondary: {
          DEFAULT: "#0EA5E9", // أزرق سماوي
          dark: "#0284C7",
          light: "#E0F2FE",
        },
        accent: {
          DEFAULT: "#0891B2", // سيان (تركواز مزرق) للمسات مميزة
          dark: "#0E7490",
          light: "#CFFAFE",
        },
        danger: {
          DEFAULT: "#E5484D", // أحمر للتنبيهات فقط
          light: "#FBE3E3",
        },
      },
      fontFamily: {
        heading: ["Baloo Bhaijaan 2", "Cairo", "sans-serif"],
        sans: ["Almarai", "Tahoma", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "10px",
      },
    },
  },
  plugins: [],
};
