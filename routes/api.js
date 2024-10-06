import { Router } from "express";
import { login, register } from "../controllers/AuthController.js";
import { addProduct, deleteProduct, editProduct, listProduct, viewProduct } from "../controllers/ProductController.js";
import checkToken from "../middlewares/AuthMiddleware.js";
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
router.get("/product/:id", checkToken, viewProduct);
router.put("/product/:id", checkToken, editProduct);
router.delete("/product/:id", checkToken, deleteProduct);

export default router;
