import { GetServerSideProps, NextPage } from 'next'
import { CartList, OrdenSummary } from "@/components/cart"
import { AdminLayout } from "@/components/layout"
import { AirplaneTicket, CreditCardOffOutlined, CreditScoreOutlined } from "@mui/icons-material"
import { Box, Card, CardContent, Divider, Grid, Typography, Chip } from "@mui/material"
import { dbOrders } from '@/database'
import { IOrder } from '@/interfaces'




interface Props {
    order: IOrder;
}

const OrderPage: NextPage<Props> = ({ order }) => {

    const { _id, isPaid, numberOfItems, shippingAddress, orderItems } = order
    const { firstName, lastName, address, address2, city, zip, country, phone } = shippingAddress


    return (
        <AdminLayout
            title="Resumen de la orden"
            subtitle={`Orden: ${order._id}`}
            icon={<AirplaneTicket />}
        >
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

                                <Box display='flex' flexDirection='column' >
                                    {
                                        isPaid
                                            ? (
                                                <Chip
                                                    sx={{ my: 2, flex: 1 }}
                                                    label="Orden ya fue pagada"
                                                    variant="outlined"
                                                    color="success"
                                                    icon={<CreditScoreOutlined />}
                                                />
                                            ) : (
                                                <Chip
                                                    sx={{ my: 2, flex: 1 }}
                                                    label="Pendiente de pago"
                                                    variant="outlined"
                                                    color="error"
                                                    icon={<CreditCardOffOutlined />}
                                                />
                                            )
                                    }
                                </Box>

                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </AdminLayout>
    )
}

// Para validar en el backend si existe la orden
// Si esta pantalla se muestra voy a tener una orden que viene del lado del servidor
export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
    const { id = '' } = query;

    const order = await dbOrders.getOrderById(id.toString());

    if (!order) {
        return {
            redirect: {
                destination: '/admin/orders',
                permanent: false,
            }
        };
    }

    return {
        props: {
            order
        }
    };
}

export default OrderPage