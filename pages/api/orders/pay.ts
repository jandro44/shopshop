

import { db } from '@/database';
import { IPaypal } from '@/interfaces';
import { Order } from '@/models';
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
    message: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'POST':
            return payOrder(req, res);

        default:
            res.status(400).json({ message: 'Bad request' })
    }
}

// Funcion para generar el token de paypal
// Si regresa un null significa que dio un error y no se continuara
const getPaypalBearerToken = async (): Promise<string | null> => {
    // Credenciales para generar el token 
    const PAYPAL_CLIENT = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

    const base64Token = Buffer.from(`${PAYPAL_CLIENT}:${PAYPAL_SECRET}`, 'utf-8').toString('base64')
    const body = new URLSearchParams('grant_type=client_credentials');

    try {
        // PAYPAL_OAUTH_URL es la url para generar el token
        const { data } = await axios.post(process.env.PAYPAL_OAUTH_URL || '', body, {
            headers: {
                'Authorization': `Basic ${base64Token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })

        // Se devuelve un token de acceso 
        return data.access_token;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.response?.data)
        } else {
            console.log(error)
        }

        return null
    }
}

const payOrder = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    // TODO: validar session del usuario
    // TODO: validar mongoID

    // Se obtiene el token de validacion desde nuestro backend
    const paypalBearerToken = await getPaypalBearerToken();

    if (!paypalBearerToken) {
        return res.status(400).json({ message: 'No se pudo confirmar el token de paypal' })
    }

    // Se toma los valores que vienen desde el request
    const { transactionId = '', orderId = '' } = req.body;

    // Se hace la peticion a paypal para confirmar que el orderId esta pagado
    const { data } = await axios.get<IPaypal.PaypalOrderStatusResponse>(`${process.env.PAYPAL_ORDERS_URL}/${transactionId}`, {
        headers: {
            'Authorization': `Bearer ${paypalBearerToken}`
        }

    });

    // Si no esta pagado no se hace nada mas
    if (data.status !== 'COMPLETED') {
        res.status(401).json({ message: 'Orden no reconocida' })
    }

    // Si esta pagado me conecto a la bd, busco la orden que cohincide por el id que mande
    await db.connect();
    const ordenBD = await Order.findById(orderId);

    // Si no existe la orden no se hace nada, no existe la orden para marcar como pagada
    if (!ordenBD) {
        await db.disconnect()
        res.status(400).json({ message: 'Orden no existe en la base de datos' })
    }

    // Compara los montos del total de la orden con los montos de paypal
    if (ordenBD!.total !== Number(data.purchase_units[0].amount.value)) {
        await db.disconnect()
        res.status(400).json({ message: 'Los montos de Paypal y la orden no son iguales' })
    }

    ordenBD!.transactionId = transactionId;
    ordenBD!.isPaid = true;
    await ordenBD!.save();

    await db.disconnect();

    return res.status(200).json({ message: 'Orden pagada' })
}