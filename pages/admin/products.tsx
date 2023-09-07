import { AdminLayout } from '@/components/layout'
import { AddOutlined, CategoryOutlined } from '@mui/icons-material'
import useSWR from 'swr';
import Link from 'next/link';
import { IProduct } from '@/interfaces';
import { Box, Button, CardMedia, Grid, Link as MUILink } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';


const columns: GridColDef[] = [
    {
        field: 'img',
        headerName: 'Foto',
        renderCell: ({ row }: GridRenderCellParams) => {
            return (
                <a
                    href={`/product/${row.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        width: '100%',
                    }}>
                    <CardMedia
                        component="img"
                        className="fadeIn"
                        alt={row.title}
                        image={row.img}
                        sx={{
                            height: '100%',
                            objectFit: 'contain',
                        }}
                    />
                </a>
            )
        }
    },
    {
        field: 'titulo',
        headerName: 'Nombre',
        width: 250,
        renderCell: ({ row }: GridRenderCellParams) => {
            return (
                <Link href={`/admin/products/${row.slug}`} passHref legacyBehavior>
                    <MUILink underline="always">
                        {row.titulo}
                    </MUILink>
                </Link>
            )
        }
    },
    { field: 'gender', headerName: 'Genero' },
    { field: 'type', headerName: 'Tipo' },
    { field: 'inStock', headerName: 'Inventario' },
    { field: 'precio', headerName: 'Precio' },
    { field: 'sizes', headerName: 'Tallas', width: 250 },
]


const ProductsPage = () => {

    const { data, error } = useSWR<IProduct[]>('/api/admin/products');

    if (!data && !error) return (<></>);

    const rows = data!.map(product => ({
        id: product._id,
        img: product.images[0],
        titulo: product.title,
        gender: product.gender,
        type: product.type,
        inStock: product.inStock,
        precio: product.price,
        sizes: product.sizes.join(', '),
        slug: product.slug,
    }))


    return (
        <AdminLayout
            title={`Productos (${data?.length})`}
            subtitle={'Mantenimiento de productos'}
            icon={<CategoryOutlined />}
        >

            <Box display='flex' justifyContent='end' sx={{ mb: 2 }}>
                <Button
                    startIcon={<AddOutlined />}
                    color='secondary'
                    href='/admin/products/new'
                >
                    Crear Producto
                </Button>
            </Box>

            <Grid container className='fadeIn'>
                <Grid item xs={12} sx={{ height: '100%', width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 10 }
                            },
                        }}
                        pageSizeOptions={[5, 10, 25]}
                    />
                </Grid>
            </Grid>
        </AdminLayout>
    )
}

export default ProductsPage

// TODO: Validar usuario admin