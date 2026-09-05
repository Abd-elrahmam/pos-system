import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import purchaseRoutes from "./routes/purchases.js";
import saleRoutes from "./routes/sales.js";
import dashboardRoutes from "./routes/dashboard.js";
import settingsRoutes from "./routes/settings.js";
import userRoutes from "./routes/users.js";
import searchRoutes from "./routes/search.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

// خدمة الصور المرفوعة (صور المنتجات ولوجو المحل)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);

// معالج أخطاء عام
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "حصل خطأ في السيرفر" });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 السيرفر شغال على بورت ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ فشل الاتصال بقاعدة البيانات:", err.message);
    process.exit(1);
  });
