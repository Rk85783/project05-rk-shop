import Joi from "joi";
import { form as joiToForms } from 'joi-errors-for-forms';
import errorMessages from "../utils/error.messages.js";
import { formatErrorMessage } from "../utils/common.js";
import ProductModel from "../models/Product.js";

export const addProduct = async (req, res) => {
  console.info("addProduct(): req.body:", req.body);

  const productSchema = Joi.object().keys({
    productName: Joi.string().required(),
    productCode: Joi.string().required(),
    productColor: Joi.string().required(),
    productDescription: Joi.string().required(),
    productPrice: Joi.number().integer().required(),
    productImage: Joi.string().required(),
  });
  const { error } = productSchema.validate(req.body, { convert: true, abortEarly: false });
  
  if (error) {
    console.error("addProduct(): validation error: ", errorMessages.VALIDATION_FAILED)

    // Format the validation errors to be more user-friendly
    const validationErrors = error.details.map(err => ({
      field: err.path.join('.'),
      message: formatErrorMessage(err.context.label)
    }));

    return res.status(200).json({
      success: false,
      message: errorMessages.VALIDATION_FAILED,
      error: validationErrors
    })
  }

  const createValues = {
    name: req.body.productName,
    code: req.body.productCode,
    color: req.body.productColor,
    description: req.body.productDescription,
    price: req.body.productPrice,
    image: req.body.productImage
  }
  ProductModel.create(createValues).then(result => {
    res.status(200).json({
      success: true,
      message: "Product successfully added",
    });
  }).catch(err => {
    console.error("addProduct(): ProductModel.create(): error creating product: ", err)
    return res.status(500).json({
      success: false,
      message: errorMessages.INTERNAL_SERVER_ERROR
    });
  });
};

export const listProduct = (req, res) => {
  res.send("Ok");
};
export const viewProduct = (req, res) => {
  res.send("Ok");
};
export const editProduct = (req, res) => {
  res.send("Ok");
};
export const deleteProduct = (req, res) => {
  res.send("Ok");
};
