import { db } from '@/database'
import { User } from '@/models'
import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs';
import { jwt } from '@/utils';

// Los tipos de respuesta que se pueden dar
type Data =
    | { message: string }
    | {
        token: string;
        user: {
            email: string;
            name: string;
            role: string | undefined;
        }
    }

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'POST':
            return loginUser(req, res)

        default:
            res.status(400).json({
                message: 'Bad request'
            })
    }
}

const loginUser = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const { email = '', password = '' } = req.body;

    await db.connect();
    const user = await User.findOne({ email });
    await db.disconnect();

    if (!user) {
        return res.status(400).json({ message: 'Correo o contraseña no válidos - EMAIL' })
    }

    // user.password! , quiere decir que siempre estara el password
    if (!bcrypt.compareSync(password, user.password!)) {
        return res.status(400).json({ message: 'Correo o contraseña no válidos - Password' })
    }

    // Si pasa las 2 validaciones se extrae la informacion del usuario
    const { role, name, _id } = user;

    const token = jwt.signToken(_id, email);

    return res.status(200).json({
        token, // JWT
        user: {
            email, name, role
        }
    })

}
