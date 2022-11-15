import { Request, Response } from "express";
import Product from "../models/product"


export const productController = {
    add: async (req: Request, res: Response) => {
        try {
            const newProd = new Product({ ...req.body })
            var prod = await newProd.save();
            res.send(prod);
        } catch (error) {
            res.status(500).send(error);
        }
    },

    delete: async (req: Request, res: Response) => {

        try {
            var product = await Product.findOneAndDelete({ _id: req.body.productId });
            res.send(product);
        } catch (error) {
            res.status(500).send(error);
        }
    },

    getAll: async (req: Request, res: Response) => {
        try {
            var prod = await Product.find({});
            res.send(prod);
        } catch (error) {
            res.status(500).send(error)
        }

    },
};