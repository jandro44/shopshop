import { db } from '@/database'
import { User } from '@/models'
import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs';
import { jwt, validations } from '@/utils';

// Los tipos de respuesta que se pueden dar
type Data =
    | { message: string }
    | {
        token: string;
        user: {
            email: string;
            name: string;
            role: string;
        }
    }

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'POST':
            return registerUser(req, res)

        default:
            res.status(400).json({
                message: 'Bad request'
            })
    }
}

const registerUser = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const { email = '', password = '', name = '' } = req.body as { email: string, password: string, name: string };

    if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener minimo 6 caracteres' })
    }
    if (name.length < 2) {
        return res.status(400).json({ message: 'El nombre debe ser de minimo 2 caracteres' })
    }
    if (!validations.isValidEmail(email)) {
        return res.status(400).json({ message: 'El correo no tiene formato válido' })
    }

    await db.connect();
    const user = await User.findOne({ email });

    const newUser = new User({
        email: email.toLocaleLowerCase(),
        password: bcrypt.hashSync(password),
        role: 'client',
        name,
    });

    if (user) {
        return res.status(400).json({ message: 'El correo ya esta registrado' })
    }

    try {
        await newUser.save({ validateBeforeSave: true })
        await db.disconnect();
    } catch (error) {
        await db.disconnect();
        return res.status(500).json({ message: 'Revisar logs del servidor' })
    }

    const { _id, role } = newUser;

    const token = jwt.signToken(_id, email);

    return res.status(200).json({
        token, // JWT
        user: {
            email, name, role: 'client'
        }
    })

}
