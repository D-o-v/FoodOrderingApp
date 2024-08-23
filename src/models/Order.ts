import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  products: Array<{
    product: mongoose.Types.ObjectId;
    quantity: number;
  }>;
  total: number;
  date: Date;
}

const OrderSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

export default mongoose.model<IOrder>('Order', OrderSchema);