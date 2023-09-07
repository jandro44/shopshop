import { db } from '@/database'
import { IUser } from '@/interfaces'
import { User } from '@/models'
import { isValidObjectId } from 'mongoose'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data =
    | { message: string }
    | IUser[]

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'GET':
            return getUsers(req, res)

        case 'PUT':
            return updateUsers(req, res)

        default:
            return res.status(400).json({
                message: 'Bad request'
            })
    }
}

const getUsers = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    await db.connect();
    const users = await User.find().select('-password').lean()
    await db.disconnect();

    return res.status(200).json(users) // si sale error aqui es porque solo tiene la Data como tipo de retorno y para solucionarlo hay que pasarle los users al type Data
}



const updateUsers = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const { userId = '', role = '' } = req.body;

    // Ahora validacion sin base de datos
    if (!isValidObjectId(userId)) {
        return res.status(400).json({ message: 'No existe usuario por ese id' })
    }

    const validRoles = ['admin', 'super-user', 'SEO', 'client'];
    if (!validRoles.includes(role)) {
        return res.status(401).json({ message: 'Rol no permitido ' + validRoles.join(', ') })
    }

    // Ahora validacion con base de datos
    await db.connect()

    const user = await User.findById(userId);
    if (!user) {
        await db.disconnect()
        return res.status(400).json({ message: 'Usuario no encontrado ' + userId })
    }

    // Si tenemos un usuario, se actualiza el rol que va a ser igual al rol que se esta recibiendo como argumento 
    user.role = role
    await user.save()

    await db.disconnect()

    return res.status(200).json({ message: 'Usuario actualizado' })
}

