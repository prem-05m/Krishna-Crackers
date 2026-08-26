import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOwner extends Document {
  email: string;
  passwordHash: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OwnerSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: false },
}, { timestamps: true });

const Owner: Model<IOwner> = mongoose.models.Owner || mongoose.model<IOwner>('Owner', OwnerSchema);
export default Owner;
