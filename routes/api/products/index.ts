import { Router } from "express";
import { productController } from '../../../controllers/product';

const router = Router();

router.post("/add", productController.add);

router.get("/getAll", productController.getAll);

router.delete("/delete", productController.delete);

export default router;
