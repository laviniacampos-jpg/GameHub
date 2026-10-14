import { Router } from "express";
import { ProductController } from "../../src/controller/ProductController";
import { asyncHandler } from "../middlewares/asyncHandler";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const controller = new ProductController();

router.get("/", authMiddleware, asyncHandler(controller.dashboard));

export default router;
