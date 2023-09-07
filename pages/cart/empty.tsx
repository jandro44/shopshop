import Link from "next/link"
import { ShopLayout } from "@/components/layout"
import { RemoveShoppingCartOutlined } from "@mui/icons-material"
import { Box, Typography, Link as MUILink } from "@mui/material"


const EmptyPage = () => {
    return (
        <ShopLayout title="Carrito vacio" pageDescription="No hay articulos en el carrito de compras">
            <Box
                display='flex'
                justifyContent='center'
                alignItems='center'
                height='calc(100vh - 200px)'
                sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
            >
                <RemoveShoppingCartOutlined sx={{ fontSize: 100 }} />
                <Box display='flex' flexDirection='column' alignItems='center'>
                    <Typography marginLeft={2}>Su carrito está vacio</Typography>
                    <Link href='/' passHref legacyBehavior>
                        <MUILink typography='h4' color='secondary'>
                            Regresar
                        </MUILink>
                    </Link>
                </Box>
            </Box>
        </ShopLayout>
    )
}

export default EmptyPage