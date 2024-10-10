import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  parentId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    default: null
  },
  name: {
    type: String,
    required: [true, "Category Name is required"]
  },
  url: {
    type: String,
    required: [true, "Category Url is required"]
  },
  description: {
    type: String,
    required: false
  },
  status: {
    type: Number,
    default: 1,
    min: 0,
    max: 255
  }
}, { timestamps: true });

// Define a virtual for child categories
CategorySchema.virtual("subCategories", {
  ref: "Category", // The model to use
  localField: "_id", // Find subCategories where `parentId` is equal to this field
  foreignField: "parentId" // The field in the child model
});

// Ensure virtuals are included when converting to JSON
CategorySchema.set("toObject", { virtuals: true });
CategorySchema.set("toJSON", { virtuals: true });

const CategoryModel = mongoose.model("Category", CategorySchema);
export default CategoryModel;
