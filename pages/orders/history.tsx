import { GetServerSideProps, NextPage } from 'next'
import { ShopLayout } from '@/components/layout'
import { Typography, Grid, Chip, Link as MUILink } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import Link from 'next/link';
import { isValidToken } from '@/utils/jwt';
import { dbOrders } from '@/database';
import { IOrder } from '@/interfaces';


const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'fullName', headerName: 'Nombre Completo', width: 300 },

    {
        field: 'paid',
        headerName: 'Pagada',
        description: 'Muestra información si está pagada la orden o no',
        width: 200,
        renderCell: (params: GridRenderCellParams) => {
            return (
                params.row.paid
                    ? <Chip color='success' label='Pagada' variant='outlined' />
                    : <Chip color='error' label='No pagada' variant='outlined' />
            )
        }
    },

    {
        field: 'orden',
        headerName: 'Ver Orden',
        width: 200,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => {
            return (
                <Link href={`/orders/${params.row.orderId}`} passHref legacyBehavior>
                    <MUILink underline="always">
                        Ver orden
                    </MUILink>
                </Link>
            )
        }
    },

]

interface Props {
    orders: IOrder[];
}


const HistoryPage: NextPage<Props> = ({ orders }) => {

    const rows = orders.map((order, indice) => ({
        id: indice + 1,
        paid: order.isPaid,
        fullName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        orderId: order._id
    }))

    return (
        <ShopLayout title='Historial de Ordenes' pageDescription='Historial de ordenes del cliente'>
            <Typography variant='h1' component='h1'>Historial de Ordenes</Typography>
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
        </ShopLayout>
    )
}


// Lo que devuelva viene desde el servidor

export const getServerSideProps: GetServerSideProps = async ({ req }) => {

    const authToken = req.cookies.token;
    let session; // Almacenará la sesión del usuario si está autenticado

    if (authToken) {
        try {
            // Decodifica el token usando tu clave secreta
            const decodedToken = await isValidToken(authToken)
            session = decodedToken.toString();
        } catch (error) {
            console.error('Error al decodificar el token:', error);
        }
    }

    if (!session) {
        return {
            redirect: {
                destination: '/auth/login?p=/orders/history',
                permanent: false
            }
        }
    }

    const orders = await dbOrders.getOrdersByUser(session);


    return {
        props: {
            orders
        }
    }
}

export default HistoryPage