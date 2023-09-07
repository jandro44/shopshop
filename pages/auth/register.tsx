import { useContext, useState } from 'react';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { getSession, signIn } from 'next-auth/react';
import { AuthLayout } from '@/components/layout'
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Box, Grid, TextField, Typography, Button, Link as MUILink, Chip } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';
import { validations } from '@/utils';
import { AuthContext } from '@/context';

type FormData = {
    name: string;
    email: string;
    password: string;
}

const RegisterPage = () => {

    const router = useRouter();
    const { registerUser } = useContext(AuthContext)

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const onRegisterForm = async ({ name, email, password }: FormData) => {
        setShowError(false)
        const { hasError, message } = await registerUser(name, email, password);

        if (hasError) {
            setShowError(true)
            setErrorMessage(message!)
            setTimeout(() => setShowError(false), 3000);
            return;
        }

        const destino = router.query.p?.toString() || '/'
        router.replace(destino)
    }

    return (
        <AuthLayout title='Ingresar'>
            <form onSubmit={handleSubmit(onRegisterForm)} noValidate>
                <Box sx={{ width: 350, padding: '10px 20px' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} display='flex' justifyContent='center' flexDirection='column' alignItems='center' sx={{ mb: 2 }}>
                            <Typography variant='h1' component='h1'>Crear Cuenta</Typography>
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
                                label='Nombre Completo'
                                variant='filled'
                                fullWidth
                                {...register('name', {
                                    required: 'Este campo es requerido',
                                    minLength: { value: 2, message: 'Minimo 2 caracteres' }
                                })}
                                error={!!errors.name}
                                helperText={errors.name?.message}
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
                            <Link href={router.query.p ? `/auth/login?p=${router.query.p}` : '/auth/login'} passHref legacyBehavior>
                                <MUILink underline='always'>
                                    ¿Ya tienes cuenta?
                                </MUILink>
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </form>
        </AuthLayout>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {

    const session = await getSession({ req });

    const { p = '/' } = query;

    if (session) {
        return {
            redirect: {
                destination: p.toString(),
                permanent: false
            }
        }
    }

    return {
        props: {}
    }
}


export default RegisterPage