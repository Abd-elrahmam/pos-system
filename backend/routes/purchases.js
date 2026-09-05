import express from "express";
import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// جلب سجل المشتريات (فلتر بتاريخ أو بحث)
router.get("/", async (req, res) => {
  try {
    const { from, to, product, search } = req.query;
    const filter = {};
    if (product) filter.product = product;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    if (search) {
      const regex = new RegExp(search, "i");
      const matchingProducts = await Product.find({
        $or: [{ name: regex }, { code: regex }],
      }).select("_id");
      filter.$or = [
        { supplierName: regex },
        { product: { $in: matchingProducts.map((p) => p._id) } },
      ];
    }

    const purchases = await Purchase.find(filter)
      .populate("product", "name code unit")
      .sort({ date: -1 });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: "حصل خطأ", error: err.message });
  }
});

// تسجيل عملية شراء جديدة (بتزود المخزون تلقائي)
router.post("/", async (req, res) => {
  try {
    const { product, quantity, unitCost, supplierName, date, note } = req.body;

    const productDoc = await Product.findById(product);
    if (!productDoc) return res.status(404).json({ message: "المنتج مش موجود" });

    const total = Number(quantity) * Number(unitCost);

    const purchase = await Purchase.create({
      product,
      quantity,
      unitCost,
      total,
      supplierName,
      date: date || Date.now(),
      note,
      createdBy: req.user._id,
    });

    // تحديث سعر الشراء الحالي للمنتج اختياريًا لو اتغير
    if (Number(unitCost) !== productDoc.costPrice) {
      productDoc.costPrice = unitCost;
      await productDoc.save();
    }

    const populated = await purchase.populate("product", "name code unit");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: "بيانات غير صحيحة", error: err.message });
  }
});

// حذف عملية شراء (تصحيح خطأ إدخال)
router.delete("/:id", async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!purchase) return res.status(404).json({ message: "العملية مش موجودة" });
    res.json({ message: "تم حذف العملية" });
  } catch (err) {
    res.status(500).json({ message: "حصل خطأ", error: err.message });
  }
});

export default router;
