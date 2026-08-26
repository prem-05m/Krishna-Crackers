import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  categoryId: mongoose.Types.ObjectId;
  description?: string;
  price: number;
  unit: string;
  unitCount?: number;
  images: { publicId: string; url: string; }[];
  isAvailable: boolean;
  stock?: number;
  safetyNotice?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String, required: false },
  price: { type: Number, required: true },
  unit: { type: String, required: true },
  unitCount: { type: Number, default: 1 },
  images: [{ publicId: { type: String, required: true }, url: { type: String, required: true } }],
  isAvailable: { type: Boolean, default: true },
  stock: { type: Number, required: false },
  safetyNotice: { type: String, required: false },
}, { timestamps: true });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export default Product;