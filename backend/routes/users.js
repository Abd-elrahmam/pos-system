import express from "express";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();
router.use(protect, adminOnly); // كل صفحة اليوزرز للأدمن بس

router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "حصل خطأ", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "الإيميل ده مستخدم قبل كده" });
    }
    res.status(400).json({ message: "بيانات غير صحيحة", error: err.message });
  }
});

// تعديل صلاحية/حالة مستخدم
router.put("/:id", async (req, res) => {
  try {
    const { role, active, name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, active, name },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: "المستخدم مش موجود" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "بيانات غير صحيحة", error: err.message });
  }
});

// حذف مستخدم
router.delete("/:id", async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "متقدرش تحذف حسابك انت شخصيًا" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "المستخدم مش موجود" });
    res.json({ message: "تم حذف المستخدم" });
  } catch (err) {
    res.status(500).json({ message: "حصل خطأ", error: err.message });
  }
});

export default router;
