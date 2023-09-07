import { db } from '@/database';
import { Order, Product, User } from '@/models';
import type { NextApiRequest, NextApiResponse } from 'next'
import { isValidToken } from '@/utils/jwt';
import { decode } from 'jsonwebtoken';
import { jwt } from '@/utils';

type Data =
    | { message: string }
    | {
        numberOfOrders: number;
        paidOrders: number; // isPaid true
        notPaidOrders: number;
        numberOfClients: number; // role Client
        numberOfProducts: number;
        productsWithNoInventory: number; // 0
        lowInventory: number; // productos con 10 o menos
    }

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'GET':
            return getInfoDashboard(req, res)

        default:
            return res.status(400).json({
                message: 'Bad request'
            })
    }
}

const getInfoDashboard = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const { token = '' } = req.cookies;
    let isValidToken = false;

    try {
        await jwt.isValidToken(token);
        isValidToken = true
    } catch (error) {
        isValidToken = false
    }

    if (!isValidToken) {
        return res.status(401).json({ message: 'No autorizado' })
    }

    const usuario = decode(token)
    const { _id }: any = usuario
    await db.connect();
    const user = await User.findById(_id.toString());
    const validRoles = ['admin', 'super-user', 'SEO'];
    if (!validRoles.includes(user?.role!)) {
        return res.status(401).json({ message: 'No autorizado' })
    }

    const [
        numberOfOrders,
        paidOrders,
        numberOfClients,
        numberOfProducts,
        productsWithNoInventory,
        lowInventory,
    ] = await Promise.all([
        Order.count(),
        Order.find({ isPaid: true }).count(),
        User.find({ role: 'client' }).count(),
        Product.count(),
        Product.find({ inStock: 0 }).count(),
        Product.find({ inStock: { $lte: 10 } }).count(), // less than or equals - menor o igual que 
    ])
    await db.disconnect();
    res.status(200).json({
        numberOfOrders,
        paidOrders,
        numberOfClients,
        numberOfProducts,
        productsWithNoInventory,
        lowInventory,
        notPaidOrders: numberOfOrders - paidOrders,
    })

}