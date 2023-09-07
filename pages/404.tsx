import { ShopLayout } from "@/components/layout"
import { Box, Typography } from "@mui/material"

const Custom404 = () => {
    return (
        <ShopLayout title="Page not found" pageDescription="No hay nada que mostrar aqui">
            <Box
                display='flex'
                justifyContent='center'
                alignItems='center'
                height='calc(100vh - 200px)'
                sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
            >
                <Typography variant="h1" component='h1' fontSize={80} fontWeight={200}>404 |</Typography>
                <Typography marginLeft={2}>No encontramos ninguna página aqui</Typography>
            </Box>
        </ShopLayout>
    )
}

export default Custom404

// calc(100vh - 200px) -> 100vh view hight es todo el alto de la pagina se le restan 200px