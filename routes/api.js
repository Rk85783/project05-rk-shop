import { Router } from "express";
import { login, register } from "../controllers/AuthController.js";
import { addProduct, deleteProduct, editProduct, listProduct, viewProduct } from "../controllers/ProductController.js";
import checkToken from "../middlewares/AuthMiddleware.js";
import { mediaAdd } from "../controllers/MediaController.js";
const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Api is working"
  });
});

router.post("/login", login);
router.post("/register", register);

// Product Routes
router.post("/product", checkToken, addProduct);
router.get("/product", checkToken, listProduct);
router.get("/product/:productId", checkToken, viewProduct);
router.put("/product/:productId", checkToken, editProduct);
router.delete("/product/:productId", checkToken, deleteProduct);

router.post("/media", checkToken, mediaAdd);

export default router;
