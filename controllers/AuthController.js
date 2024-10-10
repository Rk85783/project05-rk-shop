import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";
import { successMessages, errorMessages } from "../utils/messages.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: errorMessages.INVALID_REQUEST
      });
    }

    // Authenticate user
    const existUser = await UserModel.findOne({ email });

    const isValidPassword = await bcrypt.compare(password, existUser.password);
    if (!existUser || !isValidPassword) {
      res.status(401).json({
        success: false,
        message: errorMessages.INVALID_CREDENTIALS
      });
    }

    const accessToken = jwt.sign(
      {
        id: existUser._id,
        name: existUser.name,
        email: existUser.email
      }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

    // Login successful, return user data
    res.status(200).json({
      success: true,
      message: successMessages.LOGIN_SUCCESS,
      data: {
        name: existUser.name,
        email: existUser.email,
        accessToken
      }
    });
  } catch (error) {
    console.error("login(): catch(): error: ", error);
    res.status(500).json({
      success: false,
      message: errorMessages.INTERNAL_SERVER_ERROR
    });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: errorMessages.INVALID_REQUEST
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: errorMessages.EMAIL_ALREADY_EXISTS
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    await UserModel.create({
      name,
      email,
      password: hashPassword
    });
    res.status(200).json({
      success: true,
      message: successMessages.REGISTRATION_SUCCESS
    });
  } catch (error) {
    console.error("register(): catch(): error : ", error);
    res.status(500).json({
      success: false,
      message: errorMessages.INTERNAL_SERVER_ERROR
    });
  }
};
