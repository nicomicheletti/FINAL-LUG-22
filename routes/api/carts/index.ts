import { Router } from "express";
import { cartController } from '../../../controllers/cart';

const router = Router();

router.post("/add", cartController.add);

router.get("/get/:idCart", cartController.get);

router.get("/getAll", cartController.getAll);

router.post("/addProduct", cartController.addProduct);

router.delete("/deleteProduct", cartController.deleteProduct);



export default router;