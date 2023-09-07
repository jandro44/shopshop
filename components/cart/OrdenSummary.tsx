import { CartContext } from "@/context";
import { currency } from "@/utils";
import { Grid, Typography } from "@mui/material"
import { FC, useContext } from 'react';


interface Props {
    orderValues?: {
        numberOfItems: number;
        subTotal: number;
        total: number;
        impuesto: number
    }
}

export const OrdenSummary: FC<Props> = ({ orderValues }) => {

    const { numberOfItems, subTotal, total, impuesto } = useContext(CartContext)

    const summaryValues = orderValues ? orderValues : { numberOfItems, subTotal, total, impuesto };

    return (
        <Grid container>
            <Grid item xs={6}>
                <Typography>No. Productos</Typography>
            </Grid>
            <Grid item xs={6} display='flex' justifyContent='end'>
                <Typography>{summaryValues.numberOfItems} {summaryValues.numberOfItems > 1 ? 'productos' : 'producto'}</Typography>
            </Grid>

            <Grid item xs={6}>
                <Typography>Subtotal</Typography>
            </Grid>
            <Grid item xs={6} display='flex' justifyContent='end'>
                <Typography>{currency.format(summaryValues.subTotal)}</Typography>
            </Grid>

            <Grid item xs={6}>
                <Typography>Impuesto ({Number(process.env.NEXT_PUBLIC_TAX_RATE) * 100}%)</Typography>
            </Grid>
            <Grid item xs={6} display='flex' justifyContent='end'>
                <Typography>{currency.format(summaryValues.impuesto)}</Typography>
            </Grid>

            <Grid item xs={6} sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Total:</Typography>
            </Grid>
            <Grid item xs={6} display='flex' justifyContent='end' sx={{ mt: 2 }}>
                <Typography variant="subtitle1">{currency.format(summaryValues.total)}</Typography>
            </Grid>
        </Grid>
    )
}
