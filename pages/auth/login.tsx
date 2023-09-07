import { useEffect, useState, useContext } from 'react';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { AuthLayout } from '@/components/layout'
import { Box, Grid, TextField, Typography, Button, Link as MUILink, Chip, Divider } from '@mui/material';
import { useForm } from 'react-hook-form';
import { validations } from '@/utils';
import { ErrorOutline } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { AuthContext } from '@/context';


type FormData = {
    email: string;
    password: string;
}

const LoginPage = () => {

    const router = useRouter()
    const { loginUser } = useContext(AuthContext);
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [showError, setShowError] = useState(false);


    const onLoginUser = async ({ email, password }: FormData) => {

        setShowError(false)

        const isValidLogin = await loginUser(email, password)
        if (!isValidLogin) {
            setShowError(true)
            setTimeout(() => setShowError(false), 3000);
            return;
        }
        const destino = router.query.p?.toString() || '/'
        router.replace(destino)

    }

    return (
        <AuthLayout title='Ingresar'>
            <form onSubmit={handleSubmit(onLoginUser)} noValidate>
                <Box sx={{ width: 350, padding: '10px 20px' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} display='flex' justifyContent='center' flexDirection='column' alignItems='center' sx={{ mb: 2 }}>
                            <Typography variant='h1' component='h1'>Iniciar Sesión</Typography>
                            <Chip
                                label='No se reconoce el usuario / contraseña'
                                color='error'
                                icon={<ErrorOutline />}
                                className='fadeIn'
                                sx={{ mt: 2, display: showError ? 'flex' : 'none' }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                type='email'
                                label='Correo'
                                variant='filled'
                                fullWidth
                                {...register('email', {
                                    required: 'Este campo es requerido',
                                    validate: validations.isEmail
                                })}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label='Contraseña'
                                type='password'
                                variant='filled'
                                fullWidth
                                {...register('password', {
                                    required: 'Este campo es requerido',
                                    minLength: { value: 6, message: 'Minimo 6 caracteres' }
                                })}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type='submit' color='secondary' className='circular-btn' size='large' fullWidth>Ingresar</Button>
                        </Grid>
                        <Grid item xs={12} display='flex' justifyContent='center' sx={{ mt: 2 }}>
                            <Link href={router.query.p ? `/auth/register?p=${router.query.p}` : '/auth/register'} passHref legacyBehavior>
                                <MUILink underline='always'>
                                    ¿No tienes cuenta?
                                </MUILink>
                            </Link>
                        </Grid>

                    </Grid>
                </Box>
            </form>

        </AuthLayout>
    )
}

// export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {

//     const session = await getSession({ req });

//     const { p = '/' } = query;

//     if (session) {
//         return {
//             redirect: {
//                 destination: p.toString(),
//                 permanent: false
//             }
//         }
//     }

//     return {
//         props: {}
//     }
// }


export default LoginPage