import { useContext } from 'react';

import { AppBar, Toolbar, Typography, Link as MUILink, Box, Button } from '@mui/material';
import Link from 'next/link'
import { UiContext } from '@/context';

export const AdminNavbar = () => {

    const { toggleSideMenu } = useContext(UiContext)


    const inputRef = (input: any) => {
        if (input) {
            setTimeout(() => {
                { input.focus() }
            }, 100);
        }
    }

    return (
        <AppBar>
            <Toolbar>
                <Link href='/' passHref legacyBehavior>
                    <MUILink display='flex' alignItems='center'>
                        <Typography variant='h6'>Teslo |</Typography>
                        <Typography sx={{ ml: 0.5 }}>Shop</Typography>
                    </MUILink>
                </Link>

                {/* Box es como un div que nos ofrece tener acceso al tema principal de la aplicacion */}
                <Box flex={1} />

                <Button onClick={toggleSideMenu}>
                    Menú
                </Button>

            </Toolbar>
        </AppBar >
    )
}
