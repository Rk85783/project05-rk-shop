import Joi from "joi";
import errorMessages from "../utils/error.messages.js";
import { formatMessage } from "../utils/common.js";
import ProductModel from "../models/Product.js";
import mongoose from "mongoose";

/**
 * This function creating a new product.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @author Rohit Kumar Mahor
 */
export const addProduct = async (req, res) => {
  console.info("addProduct(): req.body:", req.body);

  const productSchema = Joi.object().keys({
    productName: Joi.string().required(),
    productCode: Joi.string().required(),
    productColor: Joi.string().required(),
    productDescription: Joi.string().allow(null),
    productPrice: Joi.number().integer().required(),
    productImage: Joi.string().required()
  });
  const { error } = productSchema.validate(req.body, { convert: true, abortEarly: false });

  if (error) {
    console.error("addProduct(): validation error: ", errorMessages.VALIDATION_FAILED);

    const validationErrors = error.details.map(({ path, message }) => ({
      field: path.join("."),
      message: formatMessage(message.replace(/"/g, ""))
    }));

    return res.status(200).json({
      success: false,
      message: errorMessages.VALIDATION_FAILED,
      error: validationErrors
    });
  }

  const createValues = {
    name: req.body.productName,
    code: req.body.productCode,
    color: req.body.productColor,
    description: req.body.productDescription || "",
    price: req.body.productPrice,
    image: req.body.productImage
  };
  ProductModel.create(createValues).then(result => {
    res.status(200).json({
      success: true,
      message: "Product successfully added"
    });
  }).catch(err => {
    console.error("addProduct(): ProductModel.create(): error : ", err);
    res.status(500).json({
      success: false,
      message: errorMessages.INTERNAL_SERVER_ERROR
    });
  });
};

/**
 * This function returns all products with pagination.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @author Rohit Kumar Mahor
 */
export const listProduct = async (req, res) => {
  const productSchema = Joi.object({
    page: Joi.number().integer().greater(0).required(),
    limit: Joi.number().integer().greater(0).required()
  });

  // Validate request query
  const { error } = productSchema.validate(req.query, { convert: true, abortEarly: false });

  if (error) {
    console.error("listProduct(): validation error: ", errorMessages.VALIDATION_FAILED);

    const validationErrors = error.details.map(({ path, message }) => ({
      field: path.join("."),
      message: formatMessage(message.replace(/"/g, ""))
    }));

    return res.status(400).json({
      success: false,
      message: errorMessages.VALIDATION_FAILED,
      errors: validationErrors
    });
  }

  const { page, limit } = req.query;

  try {
    // Execute both database calls in parallel
    const [products, productsCount] = await Promise.all([
      ProductModel.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ProductModel.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      message: "Products found",
      data: products,
      totalCount: productsCount,
      page,
      limit
    });
  } catch (err) {
    console.error("listProduct(): catch error: ", err);
    return res.status(500).json({
      success: false,
      message: errorMessages.INTERNAL_SERVER_ERROR
    });
  }
};

/**
 * This function returns all products with pagination.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @author Rohit Kumar Mahor
 */
export const viewProduct = async (req, res) => {
  // ---------- Validation Code : Start
  const productSchema = Joi.object({
    productId: Joi.string().custom((value, helpers) => mongoose.Types.ObjectId.isValid(value) ? value : helpers.error("any.invalid"), "ObjectId validation").required()
  });

  // Validate request params
  const { error } = productSchema.validate({
    productId: req.params.productId
  }, { convert: true, abortEarly: false });

  if (error) {
    console.error("viewProduct(): validation error: ", errorMessages.VALIDATION_FAILED);

    const validationErrors = error.details.map(({ path, message }) => ({
      field: path.join("."),
      message: formatMessage(message.replace(/"/g, ""))
    }));

    return res.status(400).json({
      success: false,
      message: errorMessages.VALIDATION_FAILED,
      errors: validationErrors
    });
  }
  // ---------- Validation Code : End

  try {
    const product = await ProductModel.findById(req.params.productId);
    if (!product) {
      console.error("viewProduct(): ProductModel.findById(): error : ", errorMessages.PRODUCT_NOT_FOUND);
      return res.status(400).json({
        success: false,
        message: errorMessages.PRODUCT_NOT_FOUND
      });
    }
    res.status(200).json({
      success: true,
      message: "Product found",
      data: product
    });
  } catch (err) {
    console.error("viewProduct(): catch(): error : ", err);
    res.status(500).json({
      success: false,
      message: errorMessages.INTERNAL_SERVER_ERROR
    });
  }
};

/**
 * This function is used to update a product.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @author Rohit Kumar Mahor
 */
export const editProduct = async (req, res) => {
  // ---------- Validation Code : Start
  const productSchema = Joi.object({
    productId: Joi.string().custom((value, helpers) =>
      mongoose.Types.ObjectId.isValid(value) ? value : helpers.error("any.invalid"), "ObjectId validation"
    ).required(),
    productName: Joi.string().required(),
    productCode: Joi.string().required(),
    productColor: Joi.string().required(),
    productDescription: Joi.string().allow(null),
    productPrice: Joi.number().integer().required(),
    productImage: Joi.string().allow(null)
  });

  // Validate request params
  const { error } = productSchema.validate({
    productId: req.params.productId,
    productName: req.body.productName,
    productCode: req.body.productCode,
    productColor: req.body.productColor,
    productDescription: req.body.productDescription,
    productPrice: req.body.productPrice,
    productImage: req.body.productImage
  }, { convert: true, abortEarly: false });

  if (error) {
    console.error("editProduct(): validation error: ", errorMessages.VALIDATION_FAILED);

    const validationErrors = error.details.map(({ path, message }) => ({
      field: path.join("."), // Keep the field names as they are
      message: formatMessage(message.replace(/"/g, "")) // Format message
    }));

    return res.status(400).json({
      success: false,
      message: errorMessages.VALIDATION_FAILED,
      errors: validationErrors
    });
  }
  // ---------- Validation Code : End

  // -----> Main Code
  try {
    const updatedProduct = await ProductModel.findByIdAndUpdate(req.params.productId, {
      name: req.body.productName,
      code: req.body.productCode,
      color: req.body.productColor,
      description: req.body.productDescription || "",
      price: req.body.productPrice,
      image: req.body.productImage
    });
    if (!updatedProduct) {
      console.error("editProduct(): ProductModel.findByIdAndUpdate(): error : ", errorMessages.PRODUCT_NOT_FOUND);
      return res.status(400).json({
        success: false,
        message: errorMessages.PRODUCT_NOT_FOUND
      });
    }
    res.status(200).json({
      success: true,
      message: "Product updated successfully"
    });
  } catch (error) {
    console.error("editProduct(): catch(): error : ", error);
    res.status(500).json({
      success: false,
      message: errorMessages.INTERNAL_SERVER_ERROR
    });
  }
};

/**
 * This function is used to delete a product from the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @author Rohit Kumar Mahor
 */
export const deleteProduct = async (req, res) => {
  // ---------- Validation Code : Start
  const productSchema = Joi.object({
    productId: Joi.string().custom((value, helpers) =>
      mongoose.Types.ObjectId.isValid(value) ? value : helpers.error("any.invalid"), "ObjectId validation"
    ).required()
  });

  // Validate request params
  const { error } = productSchema.validate({
    productId: req.params.productId
  }, { convert: true, abortEarly: false });

  if (error) {
    console.error("deleteProduct(): validation error: ", errorMessages.VALIDATION_FAILED);

    const validationErrors = error.details.map(({ path, message }) => ({
      field: path.join("."),
      message: formatMessage(message.replace(/"/g, ""))
    }));

    return res.status(400).json({
      success: false,
      message: errorMessages.VALIDATION_FAILED,
      errors: validationErrors
    });
  }
  // ---------- Validation Code : End

  // -----> Main Code
  try {
    const deletedProduct = await ProductModel.findByIdAndDelete(req.params.productId);
    if (!deletedProduct) {
      console.error("deleteProduct(): ProductModel.findByIdAndDelete(): error : ", errorMessages.PRODUCT_NOT_FOUND);
      return res.status(400).json({
        success: false,
        message: errorMessages.PRODUCT_NOT_FOUND
      });
    }
    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("deleteProduct(): catch error: ", error);
    res.status(500).json({
      success: false,
      message: errorMessages.INTERNAL_SERVER_ERROR
    });
  }
};
