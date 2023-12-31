import { ShopLayout } from "@/components/layout"
import { Typography } from "@mui/material"
import { FullScreenLoading } from "@/components/ui"
import { ProductList } from "@/components/products"
import { NextPage } from "next"
import { useProducts } from "@/hooks";


const KidPage: NextPage = () => {

    const { products, isLoading } = useProducts('/products?gender=kid');

    return (
        <ShopLayout title={"Teslo-Shop - Kids"} pageDescription={"Encuentra los mejores productos de teslo para niños"}>
            <Typography variant='h1' component="h1">Niños</Typography>
            <Typography variant='h2' sx={{ mb: 1 }}>Productos para niños</Typography>

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

export default KidPage