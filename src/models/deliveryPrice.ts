import mongoose, { Document, Schema } from 'mongoose';

export interface IDeliveryPrice extends Document {
  price: number;
}

const DeliveryPriceSchema: Schema = new Schema({
  price: { type: Number, required: true }
});

export default mongoose.model<IDeliveryPrice>('DeliveryPrice', DeliveryPriceSchema);