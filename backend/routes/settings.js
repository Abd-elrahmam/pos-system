import express from "express";
import Settings from "../models/Settings.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// جلب إعدادات المحل - متاحة من غير تسجيل دخول عشان صفحة اللوجين تعرض اسم ولوجو المحل
router.get("/", async (req, res) => {
  try {
    const settings = await Settings.getSingleton();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "حصل خطأ", error: err.message });
  }
});

// تعديل إعدادات المحل (أدمن بس) - بيقبل لوجو كصورة
router.put("/", protect, adminOnly, upload.single("logo"), async (req, res) => {
  try {
    const settings = await Settings.getSingleton();
    const data = { ...req.body };

    // الفئات ممكن توصل كـ JSON string لو الفورم multipart
    if (typeof data.categories === "string") {
      try {
        data.categories = JSON.parse(data.categories);
      } catch {
        data.categories = settings.categories;
      }
    }

    Object.assign(settings, data);
    if (req.file) {
      settings.storeLogo = `/uploads/${req.file.filename}`;
    }
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(400).json({ message: "بيانات غير صحيحة", error: err.message });
  }
});

export default router;
