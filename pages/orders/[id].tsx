import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next'
import { PayPalButtons } from "@paypal/react-paypal-js";
import { CartList, OrdenSummary } from "@/components/cart"
import { ShopLayout } from "@/components/layout"
import { CreditCardOffOutlined, CreditScoreOutlined } from "@mui/icons-material"
import { Box, Card, CardContent, Divider, Grid, Typography, Chip, CircularProgress } from "@mui/material"
import { dbOrders } from '@/database'
import { IOrder } from '@/interfaces'
import { isValidToken } from '@/utils/jwt'
import { shopApi } from '@/api';
import { useRouter } from 'next/router';


export type OrderResponseBody = {
    id: string;
    status:
    | "COMPLETED"
    | "CREATED"
    | "SAVED"
    | "APPROVED"
    | "VOIDED"
    | "PAYER_ACTION_REQUIRED";
};

interface Props {
    order: IOrder;
}

const OrderPage: NextPage<Props> = ({ order }) => {

    const router = useRouter();
    const { _id, isPaid, numberOfItems, shippingAddress, orderItems } = order
    const { firstName, lastName, address, address2, city, zip, country, phone } = shippingAddress

    const [isPaying, setIsPaying] = useState(false);

    const onOrderCompleted = async (details: OrderResponseBody) => {

        if (details.status !== 'COMPLETED') {
            return alert('No hay pago en paypal')
        }

        setIsPaying(true)

        try {
            // Este procedimiento paga la orden
            const { data } = await shopApi.post(`/orders/pay`, {
                transactionId: details.id,
                orderId: order._id
            })

            router.reload();

        } catch (error) {
            setIsPaying(false)
            console.log(error)
            alert('Error')
        }
    }

    return (
        <ShopLayout title="Resumen de la orden" pageDescription="Resumen de la orden">
            <Typography variant="h1" component='h1'>Orden: {_id}</Typography>
            {
                isPaid
                    ? (
                        <Chip
                            sx={{ my: 2 }}
                            label="Orden ya fue pagada"
                            variant="outlined"
                            color="success"
                            icon={<CreditScoreOutlined />}
                        />
                    ) : (
                        <Chip
                            sx={{ my: 2 }}
                            label="Pendiente de pago"
                            variant="outlined"
                            color="error"
                            icon={<CreditCardOffOutlined />}
                        />
                    )
            }

            <Grid container spacing={3} className='fadeIn'>
                <Grid item sm={12} md={7}>
                    <CartList products={orderItems} />
                </Grid>
                <Grid item sm={12} md={5}>
                    <Card className="summary-card">
                        <CardContent>
                            <Typography variant="h2">Resumen ({numberOfItems} {numberOfItems > 1 ? 'productos' : 'producto'})</Typography>
                            <Divider sx={{ my: 1 }} />

                            <Box display='flex' justifyContent='space-between'>
                                <Typography variant="subtitle1">Dirección de entrega</Typography>
                            </Box>

                            <Typography>{firstName} {lastName}</Typography>
                            <Typography>{address}{address2 ? `, ${address2}` : ''}</Typography>
                            <Typography>{city} {zip}</Typography>
                            <Typography>{country}</Typography>
                            <Typography>{phone}</Typography>

                            <Divider sx={{ my: 1 }} />

                            <OrdenSummary orderValues={{
                                numberOfItems: numberOfItems,
                                subTotal: order.subTotal,
                                total: order.total,
                                impuesto: order.impuesto,
                            }}
                            />

                            <Box sx={{ mt: 3 }} display='flex' flexDirection='column'>
                                <Box
                                    display='flex'
                                    justifyContent='center'
                                    className='fadeIn'
                                    sx={{ display: isPaying ? 'flex' : 'none' }}
                                >
                                    <CircularProgress />
                                </Box>
                                <Box flexDirection='column' sx={{ display: isPaying ? 'none' : 'flex', flex: 1 }} >
                                    {
                                        isPaid
                                            ? (
                                                <Chip
                                                    sx={{ my: 2 }}
                                                    label="Orden ya fue pagada"
                                                    variant="outlined"
                                                    color="success"
                                                    icon={<CreditScoreOutlined />}
                                                />
                                            ) : (
                                                <PayPalButtons
                                                    createOrder={
                                                        (data, actions) => {
                                                            return actions.order.create({
                                                                purchase_units: [
                                                                    {
                                                                        amount: {
                                                                            value: `${order.total}`
                                                                        },
                                                                    },
                                                                ],
                                                            });
                                                        }
                                                    }
                                                    onApprove={(data, actions) => {
                                                        return actions.order!.capture().then(details => {
                                                            onOrderCompleted(details);
                                                            // console.log(details)
                                                            // const name = details.payer.name?.given_name;
                                                            // alert(`Transaction completed by ${name}`)
                                                        })
                                                    }}
                                                />
                                            )
                                    }
                                </Box>

                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </ShopLayout>
    )
}

// Para validar en el backend si existe la orden
// Si esta pantalla se muestra voy a tener una orden que viene del lado del servidor
export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
    const { id = '' } = query;

    const order = await dbOrders.getOrderById(id.toString());

    const authToken = req.cookies.token;
    let userId; // Almacenará el ID del usuario si está autenticado

    if (authToken) {
        const decodedToken = await isValidToken(authToken); // Asegurarse de esperar a la resolución de la Promise
        userId = decodedToken.toString(); // Convertir a cadena el ID del usuario autenticado
        // console.log('ID del usuario autenticado:', userId);
    }

    if (!order) {
        return {
            redirect: {
                destination: '/orders/history',
                permanent: false,
            }
        };
    }

    // Si no hay usuario autenticado, permitir el acceso a la orden
    if (!userId) {
        return {
            props: {
                order
            }
            // redirect: {
            //     destination: `/auth/login?p=/orders/${id}`,
            //     permanent: false,
            // }
        };
    }

    // Si hay usuario autenticado, verificar si el usuario creador coincide con el usuario autenticado
    if (order.user !== userId) {
        return {
            redirect: {
                destination: '/orders/history',
                permanent: false,
            }
        };
    }

    // Si el usuario autenticado es el creador de la orden, permitir el acceso
    return {
        props: {
            order
        }
    };
}

export default OrderPage