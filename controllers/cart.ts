import { Request, Response } from "express";
import { get } from "http";
import { resolve } from "path";
import Cart from "../models/cart";
import Product from "../models/product"


export const cartController = {

    // add 1 carrito
    add: async (req: Request, res: Response) => {

        const newCart = new Cart({ ...req.body })
        await newCart.save()
            .then((cart) => {
                if (!cart) {
                    return res.status(404).send()
                }
                res.send(cart)
            }).catch((err) => {
                res.status(500).send(err)
            })
    },

    // get un solo carrito
    get: async (req: Request, res: Response) => {

        await cartController.updateTotal();

        Cart.findOne({ _id: req.params.idCart })
            .populate('details.product')
            .then(async (cart) => {
                // cart es un objeto porque hace el findOne
                res.send(cart);
            }).catch((err) => {
                res.status(500).send(err)
            })
    },

    // get lista de todos los carritos
    getAll: async (req: Request, res: Response) => {

        Cart.find({}).populate('details.product').then(async (cart) => {
            // Al hacer un find({}) pasandole un objeto vacio,trae toda la lista de carts
            res.send(cart)
        }).catch((err) => {
            res.status(500).send(err)
        })
    },

    // agrego el producto al carrito
    addProduct: async (req: Request, res: Response) => {
        Cart.findById(req.body.cartId)
            .populate('details.product')
            .then(async (cart) => {
                if (!cart) {
                    return res.status(404).send()
                } else {
                    //busco producto en la base de datos
                    var productObj = await Product.findById(req.body.productId);
                    // verifico si existe el producto en la base

                    if (productObj != null) {
                        // existe el producto

                        // busco si el producto fue previamente agregado
                        var existantProduct = cart.details.find(x => x.product?._id == req.body.productId);

                        // valido si fue agregado
                        if (existantProduct === undefined) {
                            // no fue agregado
                            // entonces lo creo con los datos que envie desde postman, y lo pusheo a la lista de detalles
                            const newProduct = {
                                "product": req.body.productId,
                                "quantity": 1
                            }
                            //aca hago el push
                            cart.details.push(newProduct);
                        } else {
                            // fue agregado, por lo tanto le incremento la cantidad por 1
                            existantProduct.quantity++;
                        }
                        // guardo cart
                        await cart.save();

                        //modifico el stock del producto
                        productObj.stock--;

                        //guardo producto
                        await productObj.save();

                        //calculo el total y hago update
                        await cartController.updateTotal();

                        res.send(cart);

                    } else {
                        // no existe el producto
                        return res.status(404).send()
                    }

                }

            }).catch((err) => {
                res.status(500).send(err)
            })
    },

    // elimino el producto del carrito
    deleteProduct: async (req: Request, res: Response) => {
        Cart.findById(req.body.cartId)
            .populate('details.product')
            .then(async (cart) => {
                if (!cart) {
                    // no existe el cart
                    return res.status(404).send()
                } else {

                    // busco si el producto existe en el cart
                    var existantProduct = cart.details.find(x => x.product?._id == req.body.productId);

                    // valido si fue agregado
                    if (existantProduct === undefined) {
                        // no existe, no hay nada que eliminar
                        return res.status(404).send()
                    } else {
                        // existe el producto dentro del cart
                        // valido cuantos hay, y si la cantidad es 1, directamente lo elimino de la lista, sino le resto 1 a la cantidad
                        if (existantProduct.quantity == 1) {
                            // hay 1 solo entonces lo elimino del cart
                            // indice tiene el index del objeto dentro del array que quiero eliminar
                            var indice = cart.details.indexOf(existantProduct);
                            cart.details.splice(indice, 1);
                        } else {
                            // hay mas de 1 entonces le resto 1 de cantidad
                            existantProduct.quantity--;
                        }
                        // guardo cart
                        await cart.save();

                        // busco el producto que se elimino del cart ya sea el producto entero o 1 sola unidad de cantidad
                        // y actualizo en la "tabla" productos su stock. Le agrego 1 unidad al stock
                        var productObj = await Product.findById(req.body.productId);
                        // verifico que el prod no sea undefined y le agrego 1 unidad al mismo
                        if (productObj != undefined) {
                            productObj.stock++;
                            await productObj?.save();
                        }
                    }

                    //calculo el total y hago update
                    await cartController.updateTotal();

                    res.send(cart);
                }

            }).catch((err) => {
                res.status(500).send(err)
            })
    },

    async updateTotal() {
        Cart.find({}).populate('details.product').then(async (carts) => {
            carts.forEach(async cart => {
                // hago un foreach de cada carrito, despues un foreach de cada detalle de cada carrito
                // y voy acumulando el total
                let total = 0;
                cart.details.forEach(detail => {
                    // tsignore para que no me tire el erro de que price es undefined
                    // @ts-ignore: Object is possibly 'null'.
                    total = total + detail.product?.price * detail.quantity;
                });
                cart.total = total;
                //guardo el total y actualiza la bd
                await cart.save();
            })
        })
    }

};