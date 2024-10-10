import Joi from "joi";
import { errorMessages, successMessages } from "../utils/messages.js";
import CategoryModel from "../models/Category.js";
import { formatMessage } from "../utils/common.js";

export const addCategory = async (req, res) => {
  try {
    console.info("addCategory(): req.body:", req.body);

    // Define the schema for validation
    const productSchema = Joi.object({
      categoryName: Joi.string().required(),
      categoryParentId: Joi.string().allow(null, ""),
      categoryUrl: Joi.string().required(),
      categoryDescription: Joi.string().allow(null, ""),
      categoryStatus: Joi.number().required().allow(0, 1)
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

    // ---> Main code
    await CategoryModel.create({
      name: req.body.categoryName,
      parentId: req.body.categoryParentId,
      url: req.body.categoryUrl,
      description: req.body.categoryDescription,
      status: req.body.status
    });
    res.status(200).json({
      success: true,
      message: successMessages.CATEGORY_ADDED
    });
  } catch (error) {
    console.log("addCategory(): catch(): error : ", error);
    res.status(500).json({
      success: false,
      message: errorMessages.INTERNAL_SERVER_ERROR
    });
  }
};

/**
 * This function returns all categories with pagination.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @author Rohit Kumar Mahor
 */
export const listCategory = async (req, res) => {
  // const productSchema = Joi.object({
  //   page: Joi.number().integer().greater(0).required(),
  //   limit: Joi.number().integer().greater(0).required()
  // });

  // // Validate request query
  // const { error } = productSchema.validate(req.query, { convert: true, abortEarly: false });

  // if (error) {
  //   console.error("listCategory(): validation error: ", errorMessages.VALIDATION_FAILED);

  //   const validationErrors = error.details.map(({ path, message }) => ({
  //     field: path.join("."),
  //     message: formatMessage(message.replace(/"/g, ""))
  //   }));

  //   return res.status(400).json({
  //     success: false,
  //     message: errorMessages.VALIDATION_FAILED,
  //     errors: validationErrors
  //   });
  // }

  // const { page, limit } = req.query;

  try {
    // Execute both database calls in parallel
    // const [categories, categoriesCount] = await Promise.all([
    //   CategoryModel.find()
    //     .sort({ createdAt: 1 })
    //     .skip((page - 1) * limit)
    //     .limit(limit),
    //   CategoryModel.countDocuments()
    // ]);

    const categories = await CategoryModel.find({ parentId: null }).populate('subCategories');

    res.status(200).json({
      success: true,
      message: successMessages.PRODUCT_FOUND,
      data: categories
      // totalCount: categoriesCount,
      // page,
      // limit
    });
  } catch (err) {
    console.error("listProduct(): catch error: ", err);
    return res.status(500).json({
      success: false,
      message: errorMessages.INTERNAL_SERVER_ERROR
    });
  }
};
