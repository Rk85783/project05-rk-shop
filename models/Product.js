import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: {
    type: String,
    required: [true, "Product Name is required"]
  },
  code: {
    type: String,
    required: [true, "Product Code is required"]
  },
  color: {
    type: String,
    required: [true, "Product Color is required"]
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: [true, "Product Price is required"]
  },
  image: {
    publicId: {
      type: String
    },
    secureUrl: {
      type: String
    }
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true
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
