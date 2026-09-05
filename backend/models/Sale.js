import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 0.01 },
    unitPrice: { type: Number, required: true, min: 0 }, // سعر البيع وقت العملية
    unitCost: { type: Number, required: true, min: 0 }, // سعر التكلفة وقت العملية (لحساب الربح بدقة)
    total: { type: Number, required: true, min: 0 },
    profit: { type: Number, required: true }, // (unitPrice - unitCost) * quantity
    customerName: { type: String, trim: true },
    paymentMethod: {
      type: String,
      enum: ["كاش", "فيزا", "آجل"],
      default: "كاش",
    },
    date: { type: Date, required: true, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

saleSchema.index({ date: 1 });

export default mongoose.model("Sale", saleSchema);
