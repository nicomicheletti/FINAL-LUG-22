import { Router } from "express";
import cartsRoutes from "./carts";
import productsRoutes from "./products";

const router = Router();

router.use("/carts", cartsRoutes);
router.use("/products", productsRoutes);


export default router;
