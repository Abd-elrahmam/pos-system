import express from "express";
import Sale from "../models/Sale.js";
import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

function monthRange(monthStr) {
  // monthStr بصيغة "YYYY-MM"، لو مش موجودة بناخد الشهر الحالي
  const now = new Date();
  const [y, m] = (monthStr || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`)
    .split("-")
    .map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);
  return { start, end };
}

// ملخص لوحة التحكم لشهر معين
router.get("/summary", async (req, res) => {
  try {
    const { month } = req.query; // "2026-09"
    const { start, end } = monthRange(month);

    const salesAgg = await Sale.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$total" },
          totalProfit: { $sum: "$profit" },
          totalQuantity: { $sum: "$quantity" },
          ordersCount: { $sum: 1 },
        },
      },
    ]);

    const purchasesAgg = await Purchase.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      { $group: { _id: null, totalPurchases: { $sum: "$total" } } },
    ]);

    const topProducts = await Sale.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: "$product",
          qty: { $sum: "$quantity" },
          revenue: { $sum: "$total" },
          profit: { $sum: "$profit" },
        },
      },
      { $sort: { qty: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          name: "$product.name",
          code: "$product.code",
          qty: 1,
          revenue: 1,
          profit: 1,
        },
      },
    ]);

    // قيمة المخزون الحالي (بسعر التكلفة) على مستوى المحل كله
    const products = await Product.find().lean();
    const purchaseTotals = await Purchase.aggregate([
      { $group: { _id: "$product", qty: { $sum: "$quantity" } } },
    ]);
    const saleTotals = await Sale.aggregate([
      { $group: { _id: "$product", qty: { $sum: "$quantity" } } },
    ]);
    const purchaseMap = Object.fromEntries(purchaseTotals.map((p) => [p._id.toString(), p.qty]));
    const saleMap = Object.fromEntries(saleTotals.map((s) => [s._id.toString(), s.qty]));

    let inventoryValue = 0;
    let lowStockCount = 0;
    for (const p of products) {
      const purchased = purchaseMap[p._id.toString()] || 0;
      const sold = saleMap[p._id.toString()] || 0;
      const stock = p.openingStock + purchased - sold;
      inventoryValue += stock * p.costPrice;
      if (stock <= p.lowStockThreshold) lowStockCount += 1;
    }

    res.json({
      month: month || `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
      totalSales: salesAgg[0]?.totalSales || 0,
      totalProfit: salesAgg[0]?.totalProfit || 0,
      totalQuantitySold: salesAgg[0]?.totalQuantity || 0,
      ordersCount: salesAgg[0]?.ordersCount || 0,
      totalPurchases: purchasesAgg[0]?.totalPurchases || 0,
      inventoryValue,
      lowStockCount,
      productsCount: products.length,
      topProducts,
    });
  } catch (err) {
    res.status(500).json({ message: "حصل خطأ في تجهيز التقرير", error: err.message });
  }
});

// المنتجات اللي وصلت للحد الأدنى
router.get("/low-stock", async (req, res) => {
  try {
    const products = await Product.find().lean();
    const purchaseTotals = await Purchase.aggregate([
      { $group: { _id: "$product", qty: { $sum: "$quantity" } } },
    ]);
    const saleTotals = await Sale.aggregate([
      { $group: { _id: "$product", qty: { $sum: "$quantity" } } },
    ]);
    const purchaseMap = Object.fromEntries(purchaseTotals.map((p) => [p._id.toString(), p.qty]));
    const saleMap = Object.fromEntries(saleTotals.map((s) => [s._id.toString(), s.qty]));

    const lowStock = products
      .map((p) => {
        const purchased = purchaseMap[p._id.toString()] || 0;
        const sold = saleMap[p._id.toString()] || 0;
        const currentStock = p.openingStock + purchased - sold;
        return { ...p, currentStock };
      })
      .filter((p) => p.currentStock <= p.lowStockThreshold);

    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ message: "حصل خطأ", error: err.message });
  }
});

export default router;
