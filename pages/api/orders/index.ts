

import type { NextApiRequest, NextApiResponse } from 'next'
import { IOrder } from '@/interfaces'
import { db } from '@/database';
import { Order, Product } from '@/models';
import { isValidToken } from '@/utils/jwt';

type Data =
    | { message: string }
    | IOrder;

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'POST':
            return createOrder(req, res)

        default:
            return res.status(400).json({ message: 'Bad Request' })
    }

}

const createOrder = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const { orderItems, total } = req.body as IOrder;
    // Esta parte verifica la session del usuario y es para que las personas que no ester auntenticadas no puedan generar ordenes 

    const authToken = req.cookies.token;

    let decodedToken;

    if (authToken) {
        decodedToken = isValidToken(authToken)
    }


    // Crear un arreglo con los productos que la persona quiere
    const productsIds = orderItems.map(product => product._id);
    await db.connect();

    // Esto genera un arreglo con todos los productos que tengo en la bd que cohinciden con los productos que la persona lleva
    const dbProducts = await Product.find({ _id: { $in: productsIds } });

    try {

        const subTotal = orderItems.reduce((prev, current) => {
            const currentPrice = dbProducts.find(prod => prod.id === current._id)?.price;
            if (!currentPrice) {
                throw new Error('Verifique el carrito de nuevo, producto no existe');
            }

            return (currentPrice * current.quantity) + prev
        }, 0);

        const impuesto = Number(process.env.NEXT_PUBLIC_TAX_RATE || 0);
        const backendTotal = subTotal * (impuesto + 1);

        if (total !== backendTotal) {
            throw new Error('El total no cuadra con el monto');
        }

        const newOrderData = { ...req.body, isPaid: false };

        if (decodedToken) {
            const resolvedToken = await decodedToken;
            newOrderData.user = resolvedToken.toString();
        }

        const newOrder = new Order(newOrderData);

        newOrder.total = Math.round(newOrder.total * 100) / 100;

        await newOrder.save()
        await db.disconnect()

        return res.status(201).json(newOrder);

    } catch (error: any) {
        await db.disconnect();
        console.log(error)
        res.status(400).json({ message: error.message || ' Revise logs del servidor' })
    }


    // return res.status(201).json(req.body)
}

