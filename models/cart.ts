import mongoose, { Schema, model } from "mongoose";

const cartSchema = new Schema({
    details: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: { type: Number, default: 0 },
        }
    ],
    total: { type: Number, default: 0 },
});

const Cart = model("Cart", cartSchema);
export default Cart;
