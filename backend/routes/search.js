import express from "express";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import Purchase from "../models/Purchase.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// بحث سريع شامل يستخدم في شريط البحث العلوي
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ products: [], sales: [], purchases: [] });
    }
    const regex = new RegExp(q.trim(), "i");

    const products = await Product.find({ $or: [{ name: regex }, { code: regex }] })
      .limit(5)
      .lean();

    const matchingProductIds = products.map((p) => p._id);

    const sales = await Sale.find({
      $or: [{ customerName: regex }, { product: { $in: matchingProductIds } }],
    })
      .populate("product", "name code")
      .sort({ date: -1 })
      .limit(5);

    const purchases = await Purchase.find({
      $or: [{ supplierName: regex }, { product: { $in: matchingProductIds } }],
    })
      .populate("product", "name code")
      .sort({ date: -1 })
      .limit(5);

    res.json({ products, sales, purchases });
  } catch (err) {
    res.status(500).json({ message: "حصل خطأ في البحث", error: err.message });
  }
});

export default router;
