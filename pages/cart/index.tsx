import { useContext, useEffect } from 'react';
import { Box, Button, Card, CardContent, Divider, Grid, Typography } from "@mui/material"
import { CartList, OrdenSummary } from "@/components/cart"
import { CartContext } from "@/context";
import { ShopLayout } from "@/components/layout"
import { useRouter } from 'next/router';
import Cookies from 'js-cookie'


const CartPage = () => {

    const { isLoaded, cart } = useContext(CartContext)
    const router = useRouter()

    useEffect(() => {
        if (isLoaded && cart.length === 0) {
            Cookies.remove('cart')
            router.replace('/cart/empty')
        }
    }, [isLoaded, cart, router]);

    if (!isLoaded) {
        return (<></>);
    }
    if (isLoaded && cart.length === 0) {
        Cookies.remove('cart')
        router.replace("/cart/empty");
        return null;
    }

    return (
        <ShopLayout title="Carrito - 3" pageDescription="Carrito de compras de la tienda">
            <Typography variant="h1" component='h1'>Carrito</Typography>

            <Grid container spacing={3}>
                <Grid item sm={12} md={7}>
                    <CartList editable />
                </Grid>
                <Grid item sm={12} md={5}>
                    <Card className="summary-card">
                        <CardContent>
                            <Typography variant="h2">Orden</Typography>
                            <Divider sx={{ my: 1 }} />

                            <OrdenSummary />

                            <Box sx={{ mt: 3 }}>
                                <Button
                                    color='secondary'
                                    className="circular-btn"
                                    fullWidth
                                    href='/checkout/address'
                                >
                                    Checkout
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </ShopLayout>
    )
}

export default CartPage