import bcrypt from 'bcryptjs';
import { User } from "@/models";
import { db } from "."
import { IUser } from '@/interfaces';
import { isValidObjectId } from 'mongoose';


export const checkUserEmailPassword = async (email: string, password: string) => {

    await db.connect();
    const user = await User.findOne({ email });
    await db.disconnect()

    if (!user) {
        return null;
    }

    if (!bcrypt.compareSync(password, user.password!)) {
        return null;
    }

    const { name, role, _id } = user;

    return {
        id: _id,
        email: email.toLowerCase(),
        role,
        name,
    }

}

// Esta funcion crea o verifica el usuario mediante de Oauth
export const oAuthDbUser = async (oAuthEmail: string, oAuthName: string) => {

    await db.connect();
    const user = await User.findOne({ email: oAuthEmail })

    if (user) {
        await db.disconnect();
        const { _id, name, email, role } = user;
        return { _id, name, email, role }
    }

    const newUser = new User({ email: oAuthEmail, name: oAuthName, password: '@', role: 'client' })
    await newUser.save();
    await db.disconnect();

    const { _id, name, email, role } = newUser;
    return { _id, name, email, role }

}

export const getUserById = async (id: string): Promise<IUser | null> => {

    // Verifica si es un objeto valido de mongo
    if (!isValidObjectId(id)) {
        return null;
    }

    await db.connect();
    const user = await User.findById(id).lean()
    await db.disconnect();

    if (!user) {
        return null;
    }

    return JSON.parse(JSON.stringify(user));
}