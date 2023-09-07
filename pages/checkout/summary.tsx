import Link from 'next/link'
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { CartList, OrdenSummary } from "@/components/cart"
import { ShopLayout } from "@/components/layout"
import { CartContext } from "@/context";
import { Box, Button, Card, CardContent, Divider, Grid, Typography, Link as MUILink, Chip } from "@mui/material"
import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';

const SummaryPage = () => {

    const router = useRouter()
    const { shippingAddress, numberOfItems, createOrder } = useContext(CartContext)

    const [isPosting, setIsPosting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!Cookies.get('firstName')) {
            router.push('/checkout/address')
        }
    }, [router]);

    const onCreateOrder = async () => {
        setIsPosting(true)
        const { hasError, message } = await createOrder(); //TODO: depende del resultado debo navegar ono

        if (hasError) {
            setIsPosting(false)
            setErrorMessage(message)
            return
        }

        router.replace(`/orders/${message}`)
    }

    if (!shippingAddress) {
        return <></>;
    }

    const { firstName, lastName, address, address2, city, country, phone, zip } = shippingAddress

    return (
        <ShopLayout title="Resumen de orden" pageDescription="Resumen de la orden">
            <Typography variant="h1" component='h1' sx={{ mb: 5 }}>Resumen de la Orden</Typography>

            <Grid container spacing={3}>
                <Grid item sm={12} md={7}>
                    <CartList />
                </Grid>
                <Grid item sm={12} md={5}>
                    <Card className="summary-card">
                        <CardContent>
                            <Typography variant="h2">Resumen ({numberOfItems} {numberOfItems === 1 ? 'producto' : 'productos'})</Typography>
                            <Divider sx={{ my: 1 }} />

                            <Box display='flex' justifyContent='space-between'>
                                <Typography variant="subtitle1">Dirección de entrega</Typography>
                                <Link href='/checkout/address' passHref legacyBehavior>
                                    <MUILink underline="always">
                                        Editar
                                    </MUILink>
                                </Link>
                            </Box>

                            <Typography>{firstName} {lastName}</Typography>
                            <Typography>{address}{address2 ? `, ${address2}` : ''}</Typography>
                            <Typography>{city}, {zip}</Typography>
                            <Typography>{country}</Typography>
                            <Typography>{phone}</Typography>

                            <Divider sx={{ my: 1 }} />

                            <Box display='flex' justifyContent='end'>
                                <Link href='/cart' passHref legacyBehavior>
                                    <MUILink underline="always">
                                        Editar
                                    </MUILink>
                                </Link>
                            </Box>

                            <OrdenSummary />

                            <Box sx={{ mt: 3 }} display='flex' flexDirection='column'>
                                <Button
                                    onClick={onCreateOrder}
                                    color='secondary'
                                    className="circular-btn"
                                    fullWidth
                                    disabled={isPosting}
                                >
                                    Confirmar Orden
                                </Button>

                                <Chip
                                    color='error'
                                    label={errorMessage}
                                    sx={{ display: errorMessage ? 'flex' : 'none', mt: 2 }}
                                />

                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </ShopLayout>
    )
}

// export const getServerSideProps: GetServerSideProps = async ({ req }) => {
//     const { token = '' } = await req.cookies;
//     let isValidToken = false;

//     try {
//         await jwt.isValidToken(token);
//         isValidToken = true
//     } catch (error) {
//         isValidToken = false
//     }

//     if (!isValidToken) {
//         return {
//             redirect: {
//                 destination: '/auth/login?p=/checkout/summary',
//                 permanent: false,
//             }
//         }
//     }

//     return {
//         props: {

//         }
//     }
// }

export default SummaryPage