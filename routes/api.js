import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Api is working"
  });
});

export default router;