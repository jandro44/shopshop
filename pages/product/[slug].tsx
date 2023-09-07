import { useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps, GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { ShopLayout } from '@/components/layout'
import { ProductSlideshow, SizeSelector } from '@/components/products'
import { ItemCounter } from '@/components/ui'
import { ICartProduct, IProduct, ISize } from '@/interfaces'
import { Box, Button, Chip, Grid, Typography } from '@mui/material'
import { dbProducts } from '@/database'
import { CartContext } from '@/context'


interface Props {
    product: IProduct
}

const ProductPage: NextPage<Props> = ({ product }) => {

    // El problema de esta manera es que no hay SEO
    // const { products: product, isLoading } = useProducts(`/products/${router.query.slug}`)
    const router = useRouter();
    const { addProductToCart } = useContext(CartContext);

    const [tempCartProduct, setTempCartProduct] = useState<ICartProduct>({
        _id: product._id,
        image: product.images[0],
        price: product.price,
        size: undefined,
        slug: product.slug,
        title: product.title,
        gender: product.gender,
        quantity: 1,
    });

    const selectedSize = (size: ISize) => {
        setTempCartProduct(currentProduct => ({
            ...currentProduct,
            size,
        }))
    }

    const onUpdateQuantity = (quantity: number) => {
        setTempCartProduct(currentProduct => ({
            ...currentProduct,
            quantity,
        }))
    }

    const onAddProduct = () => {
        if (!tempCartProduct.size) return;

        addProductToCart(tempCartProduct)
        router.push('/cart')
    }

    return (
        <ShopLayout title={product.title} pageDescription={product.description}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={7}>
                    <ProductSlideshow
                        images={product.images}
                    />
                </Grid>
                <Grid item xs={12} sm={5}>
                    <Box display='flex' flexDirection='column'>
                        {/* Titulos */}
                        <Typography variant='h1' component='h1'>{product.title}</Typography>
                        <Typography variant='subtitle1' component='h2'>${product.price}</Typography>

                        {/* Cantidad */}
                        <Box sx={{ my: 2 }}>
                            <Typography variant='subtitle2'>Cantidad</Typography>
                            <ItemCounter
                                currentValue={tempCartProduct.quantity}
                                updateQuantity={onUpdateQuantity}
                                maxValue={product.inStock > 5 ? 5 : product.inStock}
                            />
                            <SizeSelector
                                sizes={product.sizes}
                                selectedSize={tempCartProduct.size}
                                onSelectedSize={selectedSize}
                            />
                        </Box>

                        {/* Agregar al Carrito */}
                        {
                            (product.inStock > 0)
                                ? (
                                    <Button
                                        color='secondary'
                                        className='circular-btn'
                                        disabled={tempCartProduct.size ? false : true}
                                        onClick={onAddProduct}
                                    >
                                        {
                                            tempCartProduct.size
                                                ? 'Agregar al Carrito'
                                                : 'Seleccione una talla'
                                        }
                                    </Button>
                                ) : (
                                    <Chip label='No hay disponibles' color='error' variant='outlined' />
                                )
                        }

                        {/* Descripción */}
                        <Box sx={{ mt: 3 }}>
                            <Typography variant='subtitle2'>Descripción</Typography>
                            <Typography variant='body2'>{product.description}</Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </ShopLayout>
    )
}

// Se debe usar getServerSideProps cuando
// Solo si necesita renderizar previamente una página cuyos datos deben obtenerse en el momento de la solicitud
// * No usar esto (SSR)...
// export const getServerSideProps: GetServerSideProps = async ({ params }) => {

//     const { slug = '' } = params as { slug: string };
//     const product = await dbProducts.getProductBySlug(slug);

//     if (!product) {
//         return {
//             redirect: {
//                 destination: '/',
//                 permanent: false
//             }
//         }
//     }

//     return {
//         props: {
//             product
//         }
//     }
// }


// getStaticPaths
export const getStaticPaths: GetStaticPaths = async (ctc) => {

    const productSlugs = await dbProducts.getAllProductSlugs();

    return {
        paths: productSlugs.map(({ slug }) => ({
            params: {
                slug
            }
        })),
        fallback: "blocking"
    }
}

// getStaticProps, es quien manda el producto al parametro
export const getStaticProps: GetStaticProps = async ({ params }) => {

    const { slug = '' } = params as { slug: string };
    const product = await dbProducts.getProductBySlug(slug);

    if (!product) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    return {
        props: {
            product
        },
        revalidate: 86400
    }
}

export default ProductPage