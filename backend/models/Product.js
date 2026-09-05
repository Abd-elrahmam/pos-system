import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true }, // بيتولد أوتوماتيك بترتيب الإضافة
    name: { type: String, required: true, trim: true },
    image: { type: String, default: "" }, // مسار صورة المنتج (اختياري)
    category: {
      type: String,
      required: true,
      enum: ["مسامير", "بويات", "حديد", "أدوات زراعية", "أدوات بناء", "أخرى"],
    },
    unit: { type: String, required: true, default: "قطعة" }, // قطعة، كيلو، متر، عبوة...
    costPrice: { type: Number, required: true, min: 0 }, // سعر الشراء
    sellPrice: { type: Number, required: true, min: 0 }, // سعر البيع
    openingStock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", code: "text" });

export default mongoose.model("Product", productSchema);
