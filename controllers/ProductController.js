import Joi from "joi";
import { formatMessage } from "../utils/common.js";
import ProductModel from "../models/Product.js";
import mongoose from "mongoose";
import { successMessages, errorMessages } from "../utils/messages.js";

/**
 * This function creating a new product.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @author Rohit Kumar Mahor
 */
export const addProduct = async (req, res) => {
  console.info("addProduct(): req.body:", req.body);

  // Define the schema for validation
  const productSchema = Joi.object({
    productName: Joi.string().required(),
    productCode: Joi.string().required(),
    productColor: Joi.string().required(),
    productDescription: Joi.string().allow(null, ""), // Allow null or empty string
    productPrice: Joi.number().integer().required(),
    productImage: Joi.object({
      publicId: Joi.string().required(),
      secureUrl: Joi.string().uri().required()
    }).required(),
    categoryId: Joi.string().custom((value, helpers) =>
      mongoose.Types.ObjectId.isValid(value) ? value : helpers.error("any.invalid"), "ObjectId validation"
    ).required()
  });

  // Validate the request body
  const { error } = productSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const validationErrors = error.details.map(({ path, message }) => ({
      field: path.join("."),
      message: message.replace(/"/g, "")
    }));

    return res.status(400).json({
      success: false,
      message: errorMessages.VALIDATION_FAILED,
      error: validationErrors
    });
  }

  // Prepare the create values
  const createValues = {
    name: req.body.productName,
    code: req.body.productCode,
    color: req.body.productColor,
    description: req.body.productDescription || "",
    price: req.body.productPrice,
    image: req.body.productImage,
    categoryId: req.body.categoryId
  };

  try {
    await ProductModel.create(createValues);
    return res.status(201).json({
      success: true,
      message: successMessages.PRODUCT_ADDED
    });
  } catch (err) {
    console.error("addProduct(): ProductModel.create(): error:", err);
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
        .populate('categoryId')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ProductModel.countDocuments()
    ]);

    // Map to rename categoryId to category
    const formattedProducts = products.map(product => ({
      ...product._doc,
      category: product.categoryId,
      categoryId: undefined
    }));

    res.status(200).json({
      success: true,
      message: successMessages.PRODUCT_FOUND,
      data: formattedProducts,
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
    const product = await ProductModel.findById(req.params.productId).populate('categoryId');
    if (!product) {
      console.error("viewProduct(): ProductModel.findById(): error : ", errorMessages.PRODUCT_NOT_FOUND);
      return res.status(400).json({
        success: false,
        message: errorMessages.PRODUCT_NOT_FOUND
      });
    }

    // Map to rename categoryId to category
    const formattedProduct = {
      ...product._doc,
      category: product.categoryId,
      categoryId: undefined
    };

    res.status(200).json({
      success: true,
      message: successMessages.PRODUCT_FOUND,
      data: formattedProduct
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
    productDescription: Joi.string().allow(null, ""), // Allow null or empty string
    productPrice: Joi.number().integer().required(),
    productImage: Joi.object({
      public_id: Joi.string().required(),
      secure_url: Joi.string().uri().required()
    }).required(),
    categoryId: Joi.string().custom((value, helpers) =>
      mongoose.Types.ObjectId.isValid(value) ? value : helpers.error("any.invalid"), "ObjectId validation"
    ).required()
  });

  // Validate request params
  const { error } = productSchema.validate({
    productId: req.params.productId,
    productName: req.body.productName,
    productCode: req.body.productCode,
    productColor: req.body.productColor,
    productDescription: req.body.productDescription,
    productPrice: req.body.productPrice,
    productImage: req.body.productImage,
    categoryId: req.body.categoryId
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
      image: req.body.productImage,
      categoryId: req.body.categoryId
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
      message: successMessages.PRODUCT_UPDATED
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
      message: successMessages.PRODUCT_DELETED
    });
  } catch (error) {
    console.error("deleteProduct(): catch error: ", error);
    res.status(500).json({
      success: false,
      message: errorMessages.INTERNAL_SERVER_ERROR
    });
  }
};
