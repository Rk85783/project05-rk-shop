import jwt from "jsonwebtoken";
import errorMessages from "../utils/error.messages.js";

const checkToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    // Check if token is present
    if (!token) {
      return res.status(401).json({
        success: false,
        message: errorMessages.UNAUTHORIZED
      });
    }

    // Remove the "Bearer " keyword from the token
    const actualToken = token.replace("Bearer ", "");

    // Verify the token
    const decoded = await jwt.verify(actualToken, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    // Catch any unexpected errors and return a 500 error
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: errorMessages.TOKEN_EXPIRED
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: errorMessages.INVALID_TOKEN
      });
    } else {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR
      });
    }
  }
};
export default checkToken;
