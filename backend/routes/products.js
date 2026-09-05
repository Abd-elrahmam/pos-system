import express from "express";
import Product from "../models/Product.js";
import Purchase from "../models/Purchase.js";
import Sale from "../models/Sale.js";
import { getNextSequence } from "../models/Counter.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();
router.use(protect);

// جلب كل المنتجات + رصيد كل واحد (حساب حي، مش مخزّن)
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ name: regex }, { code: regex }];
    }

    const products = await Product.find(filter).sort({ name: 1 }).lean();

    const purchaseTotals = await Purchase.aggregate([
      { $group: { _id: "$product", qty: { $sum: "$quantity" } } },
    ]);
    const saleTotals = await Sale.aggregate([
      { $group: { _id: "$product", qty: { $sum: "$quantity" } } },
    ]);
    const purchaseMap = Object.fromEntries(purchaseTotals.map((p) => [p._id.toString(), p.qty]));
    const saleMap = Object.fromEntries(saleTotals.map((s) => [s._id.toString(), s.qty]));

    const withStock = products.map((p) => {
      const purchased = purchaseMap[p._id.toString()] || 0;
      const sold = saleMap[p._id.toString()] || 0;
      const currentStock = p.openingStock + purchased - sold;
      return { ...p, currentStock, lowStock: currentStock <= p.lowStockThreshold };
    });

    res.json(withStock);
  } catch (err) {
    res.status(500).json({ message: "حصل خطأ في جلب المنتجات", error: err.message });
  }
});

// إضافة منتج جديد - الكود بيتولد أوتوماتيك بترتيب الإضافة، والصورة اختيارية
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const seq = await getNextSequence("product");
    const code = `P${String(seq).padStart(4, "0")}`;

    const data = { ...req.body, code };
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: "بيانات غير صحيحة", error: err.message });
  }
});

// تعديل منتج (الكود ثابت ومايتغيرش)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const data = { ...req.body };
    delete data.code; // الكود مايتغيرش بعد الإنشاء
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "المنتج مش موجود" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: "بيانات غير صحيحة", error: err.message });
  }
});

// حذف منتج (أدمن بس)
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "المنتج مش موجود" });
    res.json({ message: "تم حذف المنتج" });
  } catch (err) {
    res.status(500).json({ message: "حصل خطأ", error: err.message });
  }
});

export default router;
