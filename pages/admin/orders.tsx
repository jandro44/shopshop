import { AdminLayout } from '@/components/layout'
import { ConfirmationNumberOutlined } from '@mui/icons-material'
import useSWR from 'swr';
import Link from 'next/link';
import { IOrder, IUser } from '@/interfaces';
import { Chip, Grid, Link as MUILink } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';


const columns: GridColDef[] = [
    { field: 'id', headerName: 'Nro. Orden', width: 250 },
    { field: 'email', headerName: 'Correo', width: 250 },
    { field: 'name', headerName: 'Nombre completo', width: 300 },
    { field: 'total', headerName: 'Monto total', width: 200 },
    {
        field: 'isPaid',
        headerName: 'Pagada',
        renderCell: ({ row }: GridRenderCellParams) => {
            return row.isPaid
                ? (<Chip variant='outlined' label='Pagada' color='success' />)
                : (<Chip variant='outlined' label='Pendiente' color='error' />)
        }
    },
    { field: 'noProducts', headerName: 'No.Productos', align: 'center', width: 160 },
    {
        field: 'check',
        headerName: 'Ver Orden',
        renderCell: ({ row }: GridRenderCellParams) => {
            return (
                <Link href={`/admin/orders/${row.id}`} target='_blank' passHref legacyBehavior>
                    <MUILink underline="always">
                        Ver orden
                    </MUILink>
                </Link>
            )
        }
    },
    { field: 'createdAt', headerName: 'Creada el', width: 250 },
]


const OrdersPage = () => {

    const { data, error } = useSWR<IOrder[]>('/api/admin/orders');

    if (!data && !error) return (<></>);

    const rows = data!.map(order => ({
        id: order._id,
        email: (order.user as IUser).email,
        name: (order.user as IUser).name,
        total: order.total,
        isPaid: order.isPaid,
        noProducts: order.numberOfItems,
        createdAt: order.createdAt,
    }))


    return (
        <AdminLayout
            title={'Ordenes'}
            subtitle={'Mantenimiento de ordenes'}
            icon={<ConfirmationNumberOutlined />}
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

export default OrdersPage

// TODO: Validar usuario admin