// import express from "express";
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";
// import { protect, adminOnly } from "../middleware/auth.js";

// const router = express.Router();

// function signToken(user) {
//   return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN || "7d",
//   });
// }

// function sanitize(user) {
//   return {
//     id: user._id,
//     name: user.name,
//     email: user.email,
//     role: user.role,
//     active: user.active,
//   };
// }

// // تسجيل دخول
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ message: "اكتب الإيميل والباسورد" });
//     }

//     const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
//     if (!user || !user.active) {
//       return res.status(401).json({ message: "بيانات الدخول غلط" });
//     }

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "بيانات الدخول غلط" });
//     }

//     const token = signToken(user);
//     res.json({ token, user: sanitize(user) });
//   } catch (err) {
//     res.status(500).json({ message: "حصل خطأ أثناء تسجيل الدخول", error: err.message });
//   }
// });

// // أول أدمن للنظام (يشتغل بس لو مفيش يوزرز خالص)
// router.post("/bootstrap-admin", async (req, res) => {
//   try {
//     const count = await User.countDocuments();
//     if (count > 0) {
//       return res.status(403).json({ message: "النظام فيه يوزرز بالفعل، استخدم صفحة إدارة المستخدمين" });
//     }
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "اكتب الاسم والإيميل والباسورد" });
//     }
//     const user = await User.create({ name, email, password, role: "admin" });
//     const token = signToken(user);
//     res.status(201).json({ token, user: sanitize(user) });
//   } catch (err) {
//     res.status(500).json({ message: "حصل خطأ", error: err.message });
//   }
// });

// // بيانات المستخدم الحالي
// router.get("/me", protect, async (req, res) => {
//   res.json({ user: sanitize(req.user) });
// });

// import express from "express";
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";
// import { protect, adminOnly } from "../middleware/auth.js";

// const router = express.Router();

// function signToken(user) {
//   return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN || "7d",
//   });
// }

// function sanitize(user) {
//   return {
//     id: user._id,
//     name: user.name,
//     email: user.email,
//     role: user.role,
//     active: user.active,
//   };
// }

// // تسجيل دخول
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ message: "اكتب الإيميل والباسورد" });
//     }

//     const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
//     if (!user || !user.active) {
//       return res.status(401).json({ message: "بيانات الدخول غلط" });
//     }

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "بيانات الدخول غلط" });
//     }

//     const token = signToken(user);
//     res.json({ token, user: sanitize(user) });
//   } catch (err) {
//     res.status(500).json({ message: "حصل خطأ أثناء تسجيل الدخول", error: err.message });
//   }
// });

// // أول أدمن للنظام (يشتغل بس لو مفيش يوزرز خالص)
// router.post("/bootstrap-admin", async (req, res) => {
//   try {
//     const count = await User.countDocuments();
//     if (count > 0) {
//       return res.status(403).json({ message: "النظام فيه يوزرز بالفعل، استخدم صفحة إدارة المستخدمين" });
//     }
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "اكتب الاسم والإيميل والباسورد" });
//     }
//     const user = await User.create({ name, email, password, role: "admin" });
//     const token = signToken(user);
//     res.status(201).json({ token, user: sanitize(user) });
//   } catch (err) {
//     res.status(500).json({ message: "حصل خطأ", error: err.message });
//   }
// });

// // بيانات المستخدم الحالي
// router.get("/me", protect, async (req, res) => {
//   res.json({ user: sanitize(req.user) });
// });



// export default router;


import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function sanitize(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
  };
}

// تسجيل دخول
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "اكتب الإيميل والباسورد" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !user.active) {
      return res.status(401).json({ message: "بيانات الدخول غلط" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "بيانات الدخول غلط" });
    }

    const token = signToken(user);
    res.json({ token, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: "حصل خطأ أثناء تسجيل الدخول", error: err.message });
  }
});

// أول أدمن للنظام (يشتغل بس لو مفيش يوزرز خالص)
router.post("/bootstrap-admin", async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      return res.status(403).json({ message: "النظام فيه يوزرز بالفعل، استخدم صفحة إدارة المستخدمين" });
    }
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "اكتب الاسم والإيميل والباسورد" });
    }
    const user = await User.create({ name, email, password, role: "admin" });
    const token = signToken(user);
    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: "حصل خطأ", error: err.message });
  }
});

// هل النظام محتاج إعداد أول أدمن؟
router.get("/check-setup", async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ needsSetup: count === 0 });
  } catch (err) {
    res.status(500).json({ message: "حصل خطأ", error: err.message });
  }
});

// بيانات المستخدم الحالي
router.get("/me", protect, async (req, res) => {
  res.json({ user: sanitize(req.user) });
});

export default router;