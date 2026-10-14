import { Router } from "express";
import { ProductController } from "../../src/controller/ProductController";
import { asyncHandler } from "../middlewares/asyncHandler";
import { authMiddleware, adminOnly } from "../middlewares/authMiddleware";

const router = Router();
const controller = new ProductController();

router.get("/", asyncHandler(controller.list));
router.post("/", authMiddleware, adminOnly, asyncHandler(controller.create));
router.delete("/:id", authMiddleware, adminOnly, asyncHandler(controller.remove));

export default router;
