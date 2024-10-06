import { Router } from "express";
import { login, register } from "../controllers/AuthController.js";
import { addProduct } from "../controllers/ProjectController.js";
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

router.post("/product", checkToken, addProduct);

export default router;
