import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 0.01 },
    unitCost: { type: Number, required: true, min: 0 }, // سعر الشراء وقت العملية
    total: { type: Number, required: true, min: 0 },
    supplierName: { type: String, trim: true },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

purchaseSchema.index({ date: 1 });

export default mongoose.model("Purchase", purchaseSchema);
