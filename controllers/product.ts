import { Request, Response } from "express";
import Product from "../models/product"


export const productController = {

    // add producto
    add: async (req: Request, res: Response) => {

        const newProd = new Product({ ...req.body })
        newProd.save()
            .then((cart) => {
                if (!cart) {
                    return res.status(404).send()
                }
                res.send(cart)
            }).catch((err) => {
                res.status(500).send(err)
            })
    },

    // delete producto
    delete: async (req: Request, res: Response) => {

        Product.findOneAndDelete({ _id: req.body.productId }).then((cart) => {
            // Al hacer un find({}) pasandole un objeto vacio,trae toda la lista de carts
            res.send(cart)
        }).catch((err) => {
            res.status(500).send(err)
        })
    },

    // getAll productos
    getAll: async (req: Request, res: Response) => {
        // cuando hago un find con el obj vacio({}) me trae una lista con todos los productos
        Product.find({}).then((cart) => {
            res.send(cart)
        }).catch((err) => {
            res.status(500).send(err)
        })
    },


};