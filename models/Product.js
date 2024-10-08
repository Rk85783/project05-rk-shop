import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"]
  },
  code: {
    type: String,
    required: [true, "Code is required"]
  },
  color: {
    type: String,
    required: [true, "Color is required"]
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: [true, "Price is required"]
  },
  image: {
    public_id: {
      type: String
    },
    secure_url: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
const ProductModel = mongoose.model("Product", ProductSchema);
export default ProductModel;
