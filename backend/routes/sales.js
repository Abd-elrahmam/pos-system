import express from "express";
import Sale from "../models/Sale.js";
import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// جلب سجل المبيعات (فلتر بتاريخ أو بحث)
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
        { customerName: regex },
        { product: { $in: matchingProducts.map((p) => p._id) } },
      ];
    }

    const sales = await Sale.find(filter)
      .populate("product", "name code unit")
      .sort({ date: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: "حصل خطأ", error: err.message });
  }
});

// تسجيل عملية بيع جديدة (بتقلل المخزون تلقائي وتحسب الربح)
router.post("/", async (req, res) => {
  try {
    const { product, quantity, unitPrice, customerName, paymentMethod, date } = req.body;

    const productDoc = await Product.findById(product);
    if (!productDoc) return res.status(404).json({ message: "المنتج مش موجود" });

    // التأكد إن فيه رصيد كفاية
    const purchaseAgg = await Purchase.aggregate([
      { $match: { product: productDoc._id } },
      { $group: { _id: null, qty: { $sum: "$quantity" } } },
    ]);
    const saleAgg = await Sale.aggregate([
      { $match: { product: productDoc._id } },
      { $group: { _id: null, qty: { $sum: "$quantity" } } },
    ]);
    const purchased = purchaseAgg[0]?.qty || 0;
    const sold = saleAgg[0]?.qty || 0;
    const currentStock = productDoc.openingStock + purchased - sold;

    if (Number(quantity) > currentStock) {
      return res.status(400).json({
        message: `الكمية المطلوبة أكبر من المتاح في المخزون (المتاح: ${currentStock})`,
      });
    }

    const finalPrice = unitPrice ?? productDoc.sellPrice;
    const unitCost = productDoc.costPrice;
    const total = Number(quantity) * Number(finalPrice);
    const profit = (Number(finalPrice) - Number(unitCost)) * Number(quantity);

    const sale = await Sale.create({
      product,
      quantity,
      unitPrice: finalPrice,
      unitCost,
      total,
      profit,
      customerName,
      paymentMethod,
      date: date || Date.now(),
      createdBy: req.user._id,
    });

    const populated = await sale.populate("product", "name code unit");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: "بيانات غير صحيحة", error: err.message });
  }
});

// حذف عملية بيع (تصحيح خطأ إدخال)
router.delete("/:id", async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ message: "العملية مش موجودة" });
    res.json({ message: "تم حذف العملية" });
  } catch (err) {
    res.status(500).json({ message: "حصل خطأ", error: err.message });
  }
});

export default router;
