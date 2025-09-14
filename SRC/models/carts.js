import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products", // Referencia a la colección 'products'
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
});

const cartSchema = new mongoose.Schema({
  products: {
    type: [cartProductSchema],
    default: [],
  },
});

const cartModel = mongoose.model("carts", cartSchema);

export default cartModel;
