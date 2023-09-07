import useSWR from 'swr';
import { AccessTimeOutlined, AttachMoneyOutlined, CancelPresentationOutlined, CategoryOutlined, CreditCardOffOutlined, CreditCardOutlined, DashboardOutlined, GroupOutlined, ProductionQuantityLimitsOutlined } from '@mui/icons-material'
import { AdminLayout } from '@/components/layout'
import { Grid, Typography } from '@mui/material'
import SummaryTile from '@/components/admin/SummaryTile'
import { DashboardSummaryResponse } from '@/interfaces';
import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { jwt } from '@/utils';
import { decode } from 'jsonwebtoken';
import { dbUsers } from '@/database';

const DashboardPage = () => {

    const { data, error } = useSWR<DashboardSummaryResponse>('/api/admin/dashboard', {
        refreshInterval: 30 * 1000 // 30 segundos
    })

    const [refreshIn, setRefreshIn] = useState(30);

    useEffect(() => {

        const interval = setInterval(() => {
            console.log('tick')
            setRefreshIn(refreshIn => refreshIn > 0 ? refreshIn - 1 : 30)
        }, 1000)

        return () => clearInterval(interval)

    }, []);

    if (!error && !data) {
        return <></>
    }

    if (error) {
        console.log(error)
        return <Typography>Error al cargar la informacion</Typography>
    }

    const {
        numberOfOrders,
        paidOrders,
        numberOfClients,
        numberOfProducts,
        productsWithNoInventory,
        lowInventory,
        notPaidOrders,
    } = data!; // se le coloca el '!' porque se piensa que en este punto la data es undefined, pero con el simbolo se le dice que siempr eva a tener la informacion en ese punto

    return (
        <AdminLayout
            title='Dashboard'
            subtitle='Estadisticas generales'
            icon={<DashboardOutlined />}
        >

            <Grid container spacing={2} >
                <SummaryTile
                    title={numberOfOrders}
                    subtitle={'Ordenes totales'}
                    icon={<CreditCardOutlined color='secondary' sx={{ fontSize: 40 }} />}
                />
                <SummaryTile
                    title={paidOrders}
                    subtitle={'Ordenes pagadas'}
                    icon={<AttachMoneyOutlined color='success' sx={{ fontSize: 40 }} />}
                />
                <SummaryTile
                    title={notPaidOrders}
                    subtitle={'Ordenes pendientes'}
                    icon={<CreditCardOffOutlined color='secondary' sx={{ fontSize: 40 }} />}
                />
                <SummaryTile
                    title={numberOfClients}
                    subtitle={'Clientes'}
                    icon={<GroupOutlined color='primary' sx={{ fontSize: 40 }} />}
                />
                <SummaryTile
                    title={numberOfProducts}
                    subtitle={'Productos'}
                    icon={<CategoryOutlined color='warning' sx={{ fontSize: 40 }} />}
                />
                <SummaryTile
                    title={productsWithNoInventory}
                    subtitle={'Sin existencias (Productos)'}
                    icon={<CancelPresentationOutlined color='error' sx={{ fontSize: 40 }} />}
                />
                <SummaryTile
                    title={lowInventory}
                    subtitle={'Bajo inventario (Productos)'}
                    icon={<ProductionQuantityLimitsOutlined color='warning' sx={{ fontSize: 40 }} />}
                />
                <SummaryTile
                    title={refreshIn}
                    subtitle={'Actualización en:'}
                    icon={<AccessTimeOutlined color='secondary' sx={{ fontSize: 40 }} />}
                />
            </Grid>
        </AdminLayout>
    )
}


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


export default DashboardPage