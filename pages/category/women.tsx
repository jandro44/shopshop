import { ShopLayout } from "@/components/layout"
import { Typography } from "@mui/material"
import { FullScreenLoading } from "@/components/ui"
import { ProductList } from "@/components/products"
import { NextPage } from "next"
import { useProducts } from "@/hooks";


const WomenPage: NextPage = () => {

    const { products, isLoading } = useProducts('/products?gender=women');

    return (
        <ShopLayout title={"Teslo-Shop - Women"} pageDescription={"Encuentra los mejores productos de teslo para mujeres"}>
            <Typography variant='h1' component="h1">Mujeres</Typography>
            <Typography variant='h2' sx={{ mb: 1 }}>Productos para ellas</Typography>

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

export default WomenPage