import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "المحل" },
    storeLogo: { type: String, default: "" }, // مسار لوجو المحل
    storePhone: { type: String, default: "" },
    storeAddress: { type: String, default: "" },
    currency: { type: String, default: "ج.م" },
    defaultLowStockThreshold: { type: Number, default: 5 },
    categories: {
      type: [String],
      default: ["مسامير", "بويات", "حديد", "أدوات زراعية", "أدوات بناء", "أخرى"],
    },
    invoiceFooterNote: { type: String, default: "شكراً لتعاملكم معنا" },
  },
  { timestamps: true }
);

// السيتينجز عبارة عن مستند واحد بس (singleton) لكل المحل
settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model("Settings", settingsSchema);
