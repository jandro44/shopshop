import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { ClearOutlined, SearchOutlined, ShoppingCartOutlined } from '@mui/icons-material';
import { AppBar, Toolbar, Typography, Link as MUILink, Box, Button, IconButton, Badge, Input, InputAdornment } from '@mui/material';
import Link from 'next/link'
import { CartContext, UiContext } from '@/context';

export const Navbar = () => {

    const { asPath, push } = useRouter();
    const { toggleSideMenu } = useContext(UiContext)
    const { numberOfItems } = useContext(CartContext)

    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const onSearchTerm = () => {
        if (searchTerm.trim().length === 0) return;
        push(`/search/${searchTerm}`)
    }

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

                <Box
                    className='fadeIn'
                    sx={{ display: isSearchVisible ? 'none' : { xs: 'none', sm: 'block' } }}
                >
                    <Link href='/category/men' passHref legacyBehavior>
                        <MUILink>
                            <Button color={asPath === '/category/men' ? 'primary' : 'info'}>Hombres</Button>
                        </MUILink>
                    </Link>
                    <Link href='/category/women' passHref legacyBehavior>
                        <MUILink>
                            <Button color={asPath === '/category/women' ? 'primary' : 'info'}>Mujeres</Button>
                        </MUILink>
                    </Link>
                    <Link href='/category/kid' passHref legacyBehavior>
                        <MUILink>
                            <Button color={asPath === '/category/kid' ? 'primary' : 'info'}>Niños</Button>
                        </MUILink>
                    </Link>
                </Box>


                <Box flex={1} />

                {/* Desktop */}
                {
                    isSearchVisible
                        ? (
                            <Input
                                sx={{ display: { xs: 'none', sm: 'flex' } }}
                                className='fadeIn'
                                inputRef={inputRef}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                onKeyUp={e => e.key === 'Enter' ? onSearchTerm() : null}
                                type='text'
                                placeholder="Buscar..."
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setIsSearchVisible(false)}
                                        >
                                            <ClearOutlined />
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        )
                        :
                        (
                            <IconButton
                                onClick={() => setIsSearchVisible(true)}
                                className='fadeIn'
                                sx={{ display: { xs: 'none', sm: 'flex' } }}
                            >
                                <SearchOutlined />
                            </IconButton>
                        )
                }

                {/* Mobil */}
                <IconButton
                    sx={{ display: { xs: 'flex', sm: 'none' } }}
                    onClick={toggleSideMenu}
                >
                    <SearchOutlined />
                </IconButton>

                <Link href='/cart' passHref legacyBehavior>
                    <MUILink>
                        <IconButton>
                            <Badge badgeContent={numberOfItems > 9 ? '+9' : numberOfItems} color='secondary'>
                                <ShoppingCartOutlined />
                            </Badge>
                        </IconButton>
                    </MUILink>
                </Link>

                <Button onClick={toggleSideMenu}>
                    Menú
                </Button>

            </Toolbar>
        </AppBar >
    )
}
