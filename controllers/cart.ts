import { Request, Response } from "express";
import Cart from "../models/cart";
import Product from "../models/product"


export const cartController = {

    add: async (req: Request, res: Response) => {

        try {
            const newCart = new Cart({});
            var cart = await newCart.save();
            res.send(cart);
        } catch (error) {
            res.status(500).send(error)
        }
    },

    get: async (req: Request, res: Response) => {

        try {
            var cart = await Cart.findOne({ _id: req.params.idCart })
                .populate('details.product');
            res.send(cart);

        } catch (error) {
            res.status(500).send(error);
        }
    },

    getAll: async (req: Request, res: Response) => {
        try {
            var cart = await Cart.find({}).populate('details.product');
            res.send(cart);

        } catch (error) {
            res.status(500).send(error);
        }

    },

    addProduct: async (req: Request, res: Response) => {
        try {
            var cart = await Cart.findById(req.body.cartId).populate('details.product');

            if (!cart) {
                return res.status(404).send()
            } else {
                var productObj = await Product.findById(req.body.productId);

                if (productObj != null) {
                    var existantProduct = cart.details.find(x => x.product?._id == req.body.productId);

                    if (existantProduct === undefined) {
                        const newProduct = {
                            "product": req.body.productId,
                            "quantity": 1
                        }
                        cart.details.push(newProduct);
                    } else {
                        existantProduct.quantity++;
                    }
                    await cart.save();

                    productObj.stock--;

                    await productObj.save();

                    await cartController.updateTotal();

                    res.send(cart);

                } else {
                    return res.status(404).send()
                }
            }

        } catch (error) {
            res.status(500).send(error);
        }
    },

    deleteProduct: async (req: Request, res: Response) => {

        try {
            var cart = await Cart.findById(req.body.cartId).populate('details.product');

            if (!cart) {
                return res.status(404).send()
            } else {

                var existantProduct = cart.details.find(x => x.product?._id == req.body.productId);

                if (existantProduct === undefined) {
                    return res.status(404).send()
                } else {
                    if (existantProduct.quantity == 1) {
                        var indice = cart.details.indexOf(existantProduct);
                        cart.details.splice(indice, 1);
                    } else {
                        existantProduct.quantity--;
                    }
                    await cart.save();

                    var productObj = await Product.findById(req.body.productId);

                    if (productObj != undefined) {
                        productObj.stock++;
                        await productObj?.save();
                    }
                }

                await cartController.updateTotal();

                res.send(cart);
            }
        } catch (error) {
            res.status(500).send(error);
        }
    },

    async updateTotal() {
        var carts = await Cart.find({}).populate('details.product');

        carts.forEach(async cart => {
            let total = 0;
            cart.details.forEach(detail => {
                // @ts-ignore: Object is possibly 'null'.
                total = total + detail.product?.price * detail.quantity;
            });
            cart.total = total;
            await cart.save();
        })
    }

};