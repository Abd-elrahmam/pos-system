import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI غير موجود في ملف .env");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri);

  console.log(`✅ متصل بقاعدة البيانات: ${mongoose.connection.name}`);

  mongoose.connection.on("error", (err) => {
    console.error("❌ خطأ في اتصال قاعدة البيانات:", err.message);
  });
}
