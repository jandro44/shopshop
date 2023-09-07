import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next';
import useSWR from 'swr';
import { PeopleOutline } from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Grid, MenuItem, Select } from '@mui/material';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { IUser } from '@/interfaces';
import { shopApi } from '@/api';
import { decode } from 'jsonwebtoken';
import { dbUsers } from '@/database';
import { jwt } from '@/utils';

const UsersPage = () => {
    // La configuracion del data grid se hara dentro del componente porque necesito cambiar el estado cuando algo se actualice 

    const { data, error } = useSWR<IUser[]>('/api/admin/users')
    const [users, setUsers] = useState<IUser[]>([]);

    useEffect(() => {
        if (data) {
            setUsers(data)
        }
    }, [data]);

    if (!data && !error) return (<></>)

    const onRoleUpdated = async (userId: string, newRole: string) => {
        // Por si hay algun error al cambiar el rol en el frontend
        const previosUsers = users.map(user => ({ ...user }));

        // Para actualizar el usuario del lado del frontend en tiempo real
        const updatedUsers = users.map(user => ({
            ...user,
            role: userId === user._id ? newRole : user.role
        }))
        setUsers(updatedUsers);
        // Para actualizar el usuario del lado del backend
        try {
            await shopApi.put('/admin/users', { userId, role: newRole });
        } catch (error) {
            setUsers(previosUsers);
            console.log(error)
            alert('No se ppudo actualizar el rol del usuario')
        }
    }

    const columns: GridColDef[] = [
        { field: 'email', headerName: 'Correo', width: 250 },
        { field: 'name', headerName: 'Nombre completo', width: 300 },
        {
            field: 'role',
            headerName: 'Rol',
            width: 300,
            renderCell: ({ row }: GridRenderCellParams) => {
                return (
                    <Select
                        value={row.role}
                        label='Rol'
                        onChange={({ target }) => onRoleUpdated(row.id, target.value)}
                        sx={{ width: '300px' }}
                    >
                        <MenuItem value='admin'>Admin</MenuItem>
                        <MenuItem value='client'>Client</MenuItem>
                    </Select >
                )
            }
        },
    ];

    const rows = users.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
    }))


    return (
        <AdminLayout
            title={'Usuarios'}
            subtitle={'Mantenimiento de usuarios'}
            icon={<PeopleOutline />}
        >
            <Grid container className='fadeIn'>
                <Grid item xs={12} sx={{ height: 650, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 5 }
                            },
                        }}
                        pageSizeOptions={[5, 10, 25]}
                    />
                </Grid>
            </Grid>
        </AdminLayout>
    )
}

// Para validar la sesion y sea admin
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    // proceso para validar token 
    const { token = '' } = req.cookies;
    let isValidToken = false;

    try {
        await jwt.isValidToken(token);
        isValidToken = true
    } catch (error) {
        isValidToken = false
    }

    if (!isValidToken) {

        return {
            redirect: {
                destination: '/auth/login?p=/admin',
                permanent: false,
            },
        }
    }

    const usuario = decode(token)
    const { _id }: any = usuario
    const user = await dbUsers.getUserById(_id.toString());
    const role = user!.role;

    const validRoles = ['admin', 'super-user', 'SEO'];
    if (!validRoles.includes(role!)) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    return {
        props: {

        }
    }
}

export default UsersPage

