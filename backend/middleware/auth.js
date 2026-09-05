import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "لازم تسجل دخول الأول" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || !user.active) {
      return res.status(401).json({ message: "الحساب غير موجود أو موقوف" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "جلسة الدخول غير صالحة، سجل دخول تاني" });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "الصفحة دي للأدمن بس" });
  }
  next();
}
