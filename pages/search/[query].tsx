import { ShopLayout } from "@/components/layout";
import { Box, Typography } from "@mui/material";

import { ProductList } from "@/components/products";
import { GetServerSideProps, NextPage } from "next";
import { dbProducts } from "@/database";
import { IProduct } from "@/interfaces";


interface Props {
    products: IProduct[];
    foundProducts: boolean;
    query: string;
}

const SearchPage: NextPage<Props> = ({ products, foundProducts, query }) => {

    return (
        <ShopLayout title={"Teslo-Shop - Search"} pageDescription={"Encuentra los mejores productos de teslo aqui"}>
            <Typography variant='h1' component="h1">Buscar producto</Typography>

            {
                foundProducts
                    ? <Typography variant='h2' sx={{ mb: 1 }} textTransform='capitalize'>Busqueda: {query}</Typography>
                    : (
                        <Box display='flex'>
                            <Typography variant='h2' sx={{ mb: 1 }}>No se encontraron productos relacionados a</Typography>
                            <Typography variant='h2' sx={{ ml: 1 }} color='secondary' textTransform='capitalize'>{`'${query}'`}</Typography>
                        </Box>
                    )
            }

            <ProductList products={products} />

        </ShopLayout>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {

    const { query = '' } = params as { query: string };

    if (query.length === 0) {
        return {
            redirect: {
                destination: '/',
                permanent: true
            }
        }
    }

    // No hay productos
    let products = await dbProducts.getProductsByTerm(query);
    const foundProducts = products.length > 0

    // TODO: retornar otros productos
    if (!foundProducts) {
        // products = await dbProducts.getAllProducts()
        products = await dbProducts.getProductsByTerm('shirt');
    }

    return {
        props: {
            products,
            foundProducts,
            query
        }
    }
}


export default SearchPage