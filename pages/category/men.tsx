import { ShopLayout } from "@/components/layout"
import { Typography } from "@mui/material"
import { FullScreenLoading } from "@/components/ui"
import { ProductList } from "@/components/products"
import { NextPage } from "next"
import { useProducts } from "@/hooks";


const MenPage: NextPage = () => {

    const { products, isLoading } = useProducts('/products?gender=men');

    return (
        <ShopLayout title={"Teslo-Shop - Men"} pageDescription={"Encuentra los mejores productos de teslo para hombre"}>
            <Typography variant='h1' component="h1">Hombres</Typography>
            <Typography variant='h2' sx={{ mb: 1 }}>Productos para hombre</Typography>

            {
                isLoading
                    ? <FullScreenLoading />
                    : <ProductList
                        products={products}
                    />
            }

        </ShopLayout>
    )
}

export default MenPage